"""
Message Queue Router - Handles offline message queuing and delivery for Buddy Finder
"""

from fastapi import APIRouter, HTTPException, Depends
from typing import List, Optional
import uuid
from datetime import datetime
import logging

from services.database import get_database
from pydantic import BaseModel

router = APIRouter(prefix="/message-queue", tags=["message-queue"])
logger = logging.getLogger(__name__)


class QueuedMessage(BaseModel):
    recipient_id: str
    message: str
    message_type: str = "buddy_message"  # buddy_message, system_notification, alert
    priority: int = 0  # 0=normal, 1=high, 2=urgent
    metadata: dict = {}


class MessageDeliveryResult(BaseModel):
    message_id: str
    status: str  # delivered, pending, failed
    delivered_at: Optional[datetime] = None


# ==================================
# Message Queue Operations
# ==================================

@router.post("/queue")
async def queue_message(message: QueuedMessage, sender_id: str = "system"):
    """
    Queue a message for delivery to an offline user.
    Messages are stored and delivered when the user comes online.
    """
    db = get_database()
    
    message_data = {
        "id": str(uuid.uuid4()),
        "sender_id": sender_id,
        "recipient_id": message.recipient_id,
        "message": message.message,
        "message_type": message.message_type,
        "priority": message.priority,
        "metadata": message.metadata,
        "status": "queued",
        "created_at": datetime.utcnow(),
        "retry_count": 0,
        "max_retries": 3
    }
    
    await db.message_queue.insert_one(message_data)
    
    # Try immediate delivery if user has push token
    delivered = await attempt_push_delivery(db, message_data)
    
    return {
        "message_id": message_data["id"],
        "status": "delivered" if delivered else "queued",
        "created_at": message_data["created_at"].isoformat()
    }


@router.get("/pending/{user_id}")
async def get_pending_messages(user_id: str):
    """
    Get all pending messages for a user when they come online.
    This endpoint should be called when the app starts or resumes.
    """
    db = get_database()
    
    # Get queued messages for this user
    messages = await db.message_queue.find({
        "recipient_id": user_id,
        "status": {"$in": ["queued", "retry"]}
    }).sort([("priority", -1), ("created_at", 1)]).to_list(100)
    
    # Mark as delivered
    message_ids = [m["id"] for m in messages]
    if message_ids:
        await db.message_queue.update_many(
            {"id": {"$in": message_ids}},
            {"$set": {
                "status": "delivered",
                "delivered_at": datetime.utcnow()
            }}
        )
    
    return {
        "messages": [{
            "id": m["id"],
            "sender_id": m["sender_id"],
            "message": m["message"],
            "message_type": m["message_type"],
            "priority": m["priority"],
            "metadata": m.get("metadata", {}),
            "created_at": m["created_at"].isoformat()
        } for m in messages],
        "count": len(messages)
    }


@router.post("/acknowledge")
async def acknowledge_messages(message_ids: List[str], user_id: str):
    """
    Acknowledge receipt of messages by the client.
    This confirms the messages were successfully displayed.
    """
    db = get_database()
    
    result = await db.message_queue.update_many(
        {
            "id": {"$in": message_ids},
            "recipient_id": user_id
        },
        {"$set": {
            "status": "acknowledged",
            "acknowledged_at": datetime.utcnow()
        }}
    )
    
    return {
        "acknowledged": result.modified_count
    }


@router.get("/status/{message_id}")
async def get_message_status(message_id: str):
    """Get delivery status of a specific message"""
    db = get_database()
    
    message = await db.message_queue.find_one({"id": message_id})
    if not message:
        raise HTTPException(status_code=404, detail="Message not found")
    
    return {
        "message_id": message["id"],
        "status": message["status"],
        "created_at": message["created_at"].isoformat(),
        "delivered_at": message.get("delivered_at", "").isoformat() if message.get("delivered_at") else None,
        "acknowledged_at": message.get("acknowledged_at", "").isoformat() if message.get("acknowledged_at") else None,
        "retry_count": message.get("retry_count", 0)
    }


# ==================================
# User Online Status
# ==================================

@router.post("/online/{user_id}")
async def mark_user_online(user_id: str):
    """
    Mark a user as online and trigger delivery of pending messages.
    Should be called when the app opens or resumes from background.
    """
    db = get_database()
    
    # Update user's last_seen
    await db.users.update_one(
        {"id": user_id},
        {"$set": {"last_seen": datetime.utcnow(), "is_online": True}}
    )
    
    # Get pending message count
    pending = await db.message_queue.count_documents({
        "recipient_id": user_id,
        "status": {"$in": ["queued", "retry"]}
    })
    
    return {
        "status": "online",
        "pending_messages": pending
    }


@router.post("/offline/{user_id}")
async def mark_user_offline(user_id: str):
    """
    Mark a user as offline.
    Should be called when the app closes or goes to background.
    """
    db = get_database()
    
    await db.users.update_one(
        {"id": user_id},
        {"$set": {"last_seen": datetime.utcnow(), "is_online": False}}
    )
    
    return {"status": "offline"}


# ==================================
# Push Notification Delivery
# ==================================

async def attempt_push_delivery(db, message_data: dict) -> bool:
    """
    Attempt to deliver a message via push notification.
    Returns True if delivery was successful.
    """
    try:
        import httpx
        
        # Get recipient's push token
        user = await db.users.find_one({"id": message_data["recipient_id"]})
        push_token = user.get("push_token") if user else None
        
        if not push_token:
            logger.info(f"No push token for user {message_data['recipient_id']}, message queued")
            return False
        
        # Send via Expo Push Notifications
        notification = {
            "to": push_token,
            "sound": "default",
            "title": "New Message",
            "body": message_data["message"][:100],  # Truncate for notification
            "data": {
                "type": message_data["message_type"],
                "message_id": message_data["id"],
                "sender_id": message_data["sender_id"]
            }
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                "https://exp.host/--/api/v2/push/send",
                json=notification,
                headers={"Content-Type": "application/json"},
                timeout=10.0
            )
            
            if response.status_code == 200:
                # Mark as delivered via push
                await db.message_queue.update_one(
                    {"id": message_data["id"]},
                    {"$set": {
                        "status": "push_sent",
                        "push_sent_at": datetime.utcnow()
                    }}
                )
                logger.info(f"Push notification sent for message {message_data['id']}")
                return True
            else:
                logger.error(f"Push notification failed: {response.text}")
                return False
                
    except Exception as e:
        logger.error(f"Failed to send push notification: {e}")
        return False


# ==================================
# Cleanup & Maintenance
# ==================================

@router.delete("/cleanup")
async def cleanup_old_messages(days_old: int = 30):
    """Clean up old delivered/acknowledged messages"""
    db = get_database()
    from datetime import timedelta
    
    cutoff = datetime.utcnow() - timedelta(days=days_old)
    
    result = await db.message_queue.delete_many({
        "status": {"$in": ["delivered", "acknowledged"]},
        "created_at": {"$lt": cutoff}
    })
    
    return {"deleted": result.deleted_count}


@router.get("/stats")
async def get_queue_stats():
    """Get message queue statistics"""
    db = get_database()
    
    total = await db.message_queue.count_documents({})
    queued = await db.message_queue.count_documents({"status": "queued"})
    delivered = await db.message_queue.count_documents({"status": "delivered"})
    acknowledged = await db.message_queue.count_documents({"status": "acknowledged"})
    failed = await db.message_queue.count_documents({"status": "failed"})
    
    return {
        "total": total,
        "queued": queued,
        "delivered": delivered,
        "acknowledged": acknowledged,
        "failed": failed
    }
