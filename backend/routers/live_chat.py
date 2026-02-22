"""
Live Chat Router - Real-time chat rooms for staff-veteran communication
"""

from fastapi import APIRouter, HTTPException
from typing import List, Optional
import uuid
from datetime import datetime

from services.database import get_database

router = APIRouter(prefix="/live-chat", tags=["live-chat"])


@router.post("/rooms")
async def create_chat_room(user_name: str = "Anonymous", reason: str = ""):
    """Create a new chat room for a user seeking help"""
    db = get_database()
    
    room_data = {
        "id": str(uuid.uuid4()),
        "user_name": user_name,
        "reason": reason,
        "status": "waiting",  # waiting, active, closed
        "staff_id": None,
        "staff_name": None,
        "message_count": 0,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    
    await db.chat_rooms.insert_one(room_data)
    return {**room_data, "_id": None}


@router.get("/rooms")
async def get_chat_rooms(status: Optional[str] = None):
    """Get all chat rooms, optionally filtered by status"""
    db = get_database()
    
    query = {}
    if status:
        query["status"] = status
    
    rooms = await db.chat_rooms.find(query).sort("created_at", -1).to_list(100)
    return [{**r, "id": str(r.get("_id", r.get("id", "")))} for r in rooms]


@router.get("/rooms/{room_id}")
async def get_chat_room(room_id: str):
    """Get a single chat room"""
    db = get_database()
    
    room = await db.chat_rooms.find_one({"$or": [{"id": room_id}, {"_id": room_id}]})
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")
    
    room["id"] = str(room.get("_id", room.get("id", "")))
    return room


@router.post("/rooms/{room_id}/join")
async def join_chat_room(room_id: str, staff_id: str, staff_name: str = ""):
    """Staff member joins a chat room"""
    db = get_database()
    
    result = await db.chat_rooms.update_one(
        {"$or": [{"id": room_id}, {"_id": room_id}]},
        {"$set": {
            "status": "active",
            "staff_id": staff_id,
            "staff_name": staff_name,
            "joined_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Room not found")
    
    return {"success": True}


@router.post("/rooms/{room_id}/end")
async def end_chat_room(room_id: str, notes: str = ""):
    """End a chat session"""
    db = get_database()
    
    result = await db.chat_rooms.update_one(
        {"$or": [{"id": room_id}, {"_id": room_id}]},
        {"$set": {
            "status": "closed",
            "closed_at": datetime.utcnow(),
            "close_notes": notes,
            "updated_at": datetime.utcnow()
        }}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Room not found")
    
    return {"success": True}


@router.get("/rooms/{room_id}/messages")
async def get_chat_messages(room_id: str):
    """Get all messages in a chat room"""
    db = get_database()
    
    messages = await db.chat_messages.find({"room_id": room_id}).sort("timestamp", 1).to_list(500)
    return [{**m, "id": str(m.get("_id", m.get("id", "")))} for m in messages]


@router.post("/rooms/{room_id}/messages")
async def send_chat_message(room_id: str, content: str, sender_id: str, sender_name: str = "", is_staff: bool = False):
    """Send a message in a chat room"""
    db = get_database()
    
    message_data = {
        "id": str(uuid.uuid4()),
        "room_id": room_id,
        "content": content,
        "sender_id": sender_id,
        "sender_name": sender_name,
        "is_staff": is_staff,
        "timestamp": datetime.utcnow()
    }
    
    await db.chat_messages.insert_one(message_data)
    
    # Update room message count
    await db.chat_rooms.update_one(
        {"$or": [{"id": room_id}, {"_id": room_id}]},
        {"$inc": {"message_count": 1}, "$set": {"updated_at": datetime.utcnow()}}
    )
    
    return {**message_data, "_id": None}


@router.get("/active-rooms")
async def get_active_rooms():
    """Get rooms that are waiting or active"""
    db = get_database()
    
    rooms = await db.chat_rooms.find({
        "status": {"$in": ["waiting", "active"]}
    }).sort("created_at", -1).to_list(50)
    
    return [{**r, "id": str(r.get("_id", r.get("id", "")))} for r in rooms]


@router.delete("/cleanup")
async def cleanup_old_rooms(days_old: int = 30):
    """Clean up old closed chat rooms"""
    db = get_database()
    from datetime import timedelta
    
    cutoff = datetime.utcnow() - timedelta(days=days_old)
    
    result = await db.chat_rooms.delete_many({
        "status": "closed",
        "closed_at": {"$lt": cutoff}
    })
    
    return {"deleted": result.deleted_count}
