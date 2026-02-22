"""
Notes Router - Staff notes and case notes management
"""

from fastapi import APIRouter, HTTPException, Depends
from typing import List, Optional
import uuid
from datetime import datetime

from services.database import get_database
from models.schemas import NoteCreate, Note, NoteUpdate

router = APIRouter(prefix="/notes", tags=["notes"])


@router.post("/")
async def create_note(note: NoteCreate, author_id: str, author_name: str = ""):
    """Create a new note"""
    db = get_database()
    
    note_data = note.dict()
    note_data["id"] = str(uuid.uuid4())
    note_data["author_id"] = author_id
    note_data["author_name"] = author_name
    note_data["created_at"] = datetime.utcnow()
    note_data["updated_at"] = datetime.utcnow()
    
    await db.notes.insert_one(note_data)
    return {**note_data, "_id": None}


@router.get("/")
async def get_notes(
    author_id: Optional[str] = None,
    category: Optional[str] = None,
    client_id: Optional[str] = None
):
    """Get notes with optional filters"""
    db = get_database()
    
    query = {}
    if author_id:
        query["author_id"] = author_id
    if category:
        query["category"] = category
    if client_id:
        query["client_id"] = client_id
    
    notes = await db.notes.find(query).sort("created_at", -1).to_list(200)
    return [{**n, "id": str(n.get("_id", n.get("id", "")))} for n in notes]


@router.get("/{note_id}")
async def get_note(note_id: str):
    """Get a single note"""
    db = get_database()
    
    note = await db.notes.find_one({"$or": [{"id": note_id}, {"_id": note_id}]})
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")
    
    note["id"] = str(note.get("_id", note.get("id", "")))
    return note


@router.put("/{note_id}")
async def update_note(note_id: str, updates: NoteUpdate, user_id: str):
    """Update a note (only by author)"""
    db = get_database()
    
    # Check ownership
    note = await db.notes.find_one({"$or": [{"id": note_id}, {"_id": note_id}]})
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")
    
    if note.get("author_id") != user_id:
        raise HTTPException(status_code=403, detail="Can only edit your own notes")
    
    update_data = {k: v for k, v in updates.dict().items() if v is not None}
    update_data["updated_at"] = datetime.utcnow()
    
    await db.notes.update_one(
        {"$or": [{"id": note_id}, {"_id": note_id}]},
        {"$set": update_data}
    )
    
    return {"success": True}


@router.delete("/{note_id}")
async def delete_note(note_id: str, user_id: str):
    """Delete a note (only by author)"""
    db = get_database()
    
    # Check ownership
    note = await db.notes.find_one({"$or": [{"id": note_id}, {"_id": note_id}]})
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")
    
    if note.get("author_id") != user_id:
        raise HTTPException(status_code=403, detail="Can only delete your own notes")
    
    await db.notes.delete_one({"$or": [{"id": note_id}, {"_id": note_id}]})
    return {"deleted": True}


@router.get("/categories/list")
async def get_note_categories():
    """Get list of unique note categories"""
    db = get_database()
    categories = await db.notes.distinct("category")
    return {"categories": categories if categories else ["general", "case", "meeting", "follow-up"]}


@router.get("/client/{client_id}")
async def get_client_notes(client_id: str):
    """Get all notes related to a specific client"""
    db = get_database()
    
    notes = await db.notes.find({"client_id": client_id}).sort("created_at", -1).to_list(100)
    return [{**n, "id": str(n.get("_id", n.get("id", "")))} for n in notes]
