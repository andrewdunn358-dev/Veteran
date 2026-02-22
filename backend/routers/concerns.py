"""
Concerns Router - Family/Friends concerns about veterans
"""

from fastapi import APIRouter, HTTPException
from typing import List, Optional
import uuid
from datetime import datetime

from services.database import get_database
from models.schemas import ConcernCreate, Concern

router = APIRouter(prefix="/concerns", tags=["concerns"])


@router.post("/", response_model=Concern)
async def create_concern(concern: ConcernCreate):
    """Submit a concern about a veteran"""
    db = get_database()
    
    concern_data = concern.dict()
    concern_data["id"] = str(uuid.uuid4())
    concern_data["status"] = "open"
    concern_data["created_at"] = datetime.utcnow()
    concern_data["updated_at"] = datetime.utcnow()
    
    await db.concerns.insert_one(concern_data)
    return {**concern_data, "_id": None}


@router.get("/")
async def get_concerns(status: Optional[str] = None, severity: Optional[str] = None):
    """Get all concerns with optional filters"""
    db = get_database()
    
    query = {}
    if status:
        query["status"] = status
    if severity:
        query["severity"] = severity
    
    concerns = await db.concerns.find(query).sort("created_at", -1).to_list(200)
    return [{**c, "id": str(c.get("_id", c.get("id", "")))} for c in concerns]


@router.get("/{concern_id}")
async def get_concern(concern_id: str):
    """Get a single concern"""
    db = get_database()
    
    concern = await db.concerns.find_one({"$or": [{"id": concern_id}, {"_id": concern_id}]})
    if not concern:
        raise HTTPException(status_code=404, detail="Concern not found")
    
    concern["id"] = str(concern.get("_id", concern.get("id", "")))
    return concern


@router.patch("/{concern_id}/status")
async def update_concern_status(concern_id: str, status: str, notes: str = "", assigned_to: str = None):
    """Update concern status"""
    db = get_database()
    
    update_data = {
        "status": status,
        "updated_at": datetime.utcnow()
    }
    
    if notes:
        update_data["resolution_notes"] = notes
    if assigned_to:
        update_data["assigned_to"] = assigned_to
    if status == "resolved":
        update_data["resolved_at"] = datetime.utcnow()
    
    result = await db.concerns.update_one(
        {"$or": [{"id": concern_id}, {"_id": concern_id}]},
        {"$set": update_data}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Concern not found")
    
    return {"success": True}


@router.patch("/{concern_id}/assign")
async def assign_concern(concern_id: str, staff_id: str, staff_name: str = ""):
    """Assign a concern to a staff member"""
    db = get_database()
    
    result = await db.concerns.update_one(
        {"$or": [{"id": concern_id}, {"_id": concern_id}]},
        {"$set": {
            "assigned_to": staff_id,
            "assigned_to_name": staff_name,
            "status": "in_progress" if staff_id else "open",
            "updated_at": datetime.utcnow()
        }}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Concern not found")
    
    return {"success": True}


@router.delete("/{concern_id}")
async def delete_concern(concern_id: str):
    """Delete a concern"""
    db = get_database()
    
    result = await db.concerns.delete_one({"$or": [{"id": concern_id}, {"_id": concern_id}]})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Concern not found")
    
    return {"deleted": True}


@router.get("/stats/summary")
async def get_concern_stats():
    """Get concern statistics"""
    db = get_database()
    
    total = await db.concerns.count_documents({})
    open_count = await db.concerns.count_documents({"status": "open"})
    in_progress = await db.concerns.count_documents({"status": "in_progress"})
    resolved = await db.concerns.count_documents({"status": "resolved"})
    
    # By severity
    high = await db.concerns.count_documents({"severity": "high"})
    medium = await db.concerns.count_documents({"severity": "medium"})
    low = await db.concerns.count_documents({"severity": "low"})
    
    return {
        "total": total,
        "by_status": {
            "open": open_count,
            "in_progress": in_progress,
            "resolved": resolved
        },
        "by_severity": {
            "high": high,
            "medium": medium,
            "low": low
        }
    }
