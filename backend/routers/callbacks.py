"""
Callbacks Router - Callback request management
"""

from fastapi import APIRouter, HTTPException
from typing import List, Optional
import uuid
from datetime import datetime

from services.database import get_database
from models.schemas import CallbackRequestCreate, CallbackRequest, CallbackStatusUpdate

router = APIRouter(prefix="/callbacks", tags=["callbacks"])


@router.post("/")
async def create_callback_request(callback: CallbackRequestCreate):
    """Create a new callback request"""
    db = get_database()
    
    callback_data = callback.dict()
    callback_data["id"] = str(uuid.uuid4())
    callback_data["status"] = "pending"
    callback_data["created_at"] = datetime.utcnow()
    callback_data["updated_at"] = datetime.utcnow()
    
    await db.callbacks.insert_one(callback_data)
    
    return {**callback_data, "_id": None}


@router.get("/")
async def get_callbacks(status: Optional[str] = None):
    """Get all callback requests, optionally filtered by status"""
    db = get_database()
    
    query = {}
    if status:
        query["status"] = status
    
    callbacks = await db.callbacks.find(query).sort("created_at", -1).to_list(200)
    return [{**c, "id": str(c.get("_id", c.get("id", "")))} for c in callbacks]


@router.get("/{callback_id}")
async def get_callback(callback_id: str):
    """Get a single callback request"""
    db = get_database()
    
    callback = await db.callbacks.find_one({"$or": [{"id": callback_id}, {"_id": callback_id}]})
    if not callback:
        raise HTTPException(status_code=404, detail="Callback not found")
    
    callback["id"] = str(callback.get("_id", callback.get("id", "")))
    return callback


@router.patch("/{callback_id}/take")
async def take_callback(callback_id: str, staff_id: str, staff_name: str = ""):
    """Staff member takes ownership of a callback"""
    db = get_database()
    
    result = await db.callbacks.update_one(
        {"$or": [{"id": callback_id}, {"_id": callback_id}]},
        {"$set": {
            "status": "in_progress",
            "assigned_to": staff_id,
            "assigned_to_name": staff_name,
            "taken_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Callback not found")
    
    return {"success": True}


@router.patch("/{callback_id}/release")
async def release_callback(callback_id: str):
    """Release a callback back to the queue"""
    db = get_database()
    
    result = await db.callbacks.update_one(
        {"$or": [{"id": callback_id}, {"_id": callback_id}]},
        {"$set": {
            "status": "pending",
            "assigned_to": None,
            "assigned_to_name": None,
            "updated_at": datetime.utcnow()
        }}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Callback not found")
    
    return {"success": True}


@router.patch("/{callback_id}/complete")
async def complete_callback(callback_id: str, notes: str = ""):
    """Mark a callback as completed"""
    db = get_database()
    
    result = await db.callbacks.update_one(
        {"$or": [{"id": callback_id}, {"_id": callback_id}]},
        {"$set": {
            "status": "completed",
            "completed_at": datetime.utcnow(),
            "completion_notes": notes,
            "updated_at": datetime.utcnow()
        }}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Callback not found")
    
    return {"success": True}


@router.patch("/{callback_id}/status")
async def update_callback_status(callback_id: str, status_update: CallbackStatusUpdate):
    """Update callback status with notes"""
    db = get_database()
    
    update_data = {
        "status": status_update.status,
        "updated_at": datetime.utcnow()
    }
    if status_update.notes:
        update_data["notes"] = status_update.notes
    
    result = await db.callbacks.update_one(
        {"$or": [{"id": callback_id}, {"_id": callback_id}]},
        {"$set": update_data}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Callback not found")
    
    return {"success": True}


@router.delete("/{callback_id}")
async def delete_callback(callback_id: str):
    """Delete a callback request"""
    db = get_database()
    
    result = await db.callbacks.delete_one({"$or": [{"id": callback_id}, {"_id": callback_id}]})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Callback not found")
    
    return {"deleted": True}


@router.get("/stats/summary")
async def get_callback_stats():
    """Get callback statistics"""
    db = get_database()
    
    total = await db.callbacks.count_documents({})
    pending = await db.callbacks.count_documents({"status": "pending"})
    in_progress = await db.callbacks.count_documents({"status": "in_progress"})
    completed = await db.callbacks.count_documents({"status": "completed"})
    
    return {
        "total": total,
        "pending": pending,
        "in_progress": in_progress,
        "completed": completed
    }
