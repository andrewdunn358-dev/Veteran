"""
Time Tracking API Router
Allows admin to track work hours - both manual entries and auto-tracked sessions
"""

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime, timedelta, timezone
from bson import ObjectId
import os
import io

router = APIRouter(prefix="/api/timetracking", tags=["Time Tracking"])

# MongoDB connection
from pymongo import MongoClient
MONGO_URL = os.environ.get("MONGO_URL", "mongodb://localhost:27017")
DB_NAME = os.environ.get("DB_NAME", "radiocheck")
client = MongoClient(MONGO_URL)
db = client[DB_NAME]
time_entries = db.time_entries
active_sessions = db.time_tracking_sessions

# Categories for time tracking
CATEGORIES = [
    "Development",
    "Admin Portal",
    "Staff Portal", 
    "LMS Admin",
    "LMS Learning",
    "App Testing",
    "Support",
    "Training",
    "Documentation",
    "Meetings",
    "Other"
]

# Pydantic Models
class TimeEntryCreate(BaseModel):
    date: str = Field(..., description="Date in YYYY-MM-DD format")
    hours: int = Field(..., ge=0, le=24)
    minutes: int = Field(0, ge=0, le=59)
    category: str = Field(..., description="Work category")
    description: str = Field(..., description="What was done")
    
class TimeEntryUpdate(BaseModel):
    date: Optional[str] = None
    hours: Optional[int] = Field(None, ge=0, le=24)
    minutes: Optional[int] = Field(None, ge=0, le=59)
    category: Optional[str] = None
    description: Optional[str] = None

class SessionStart(BaseModel):
    category: str
    page_url: Optional[str] = None

class SessionEnd(BaseModel):
    session_id: str
    description: Optional[str] = None

def serialize_entry(entry):
    """Convert MongoDB document to JSON-serializable dict"""
    return {
        "id": str(entry["_id"]),
        "date": entry.get("date"),
        "hours": entry.get("hours", 0),
        "minutes": entry.get("minutes", 0),
        "category": entry.get("category"),
        "description": entry.get("description"),
        "auto_tracked": entry.get("auto_tracked", False),
        "created_at": entry.get("created_at").isoformat() if entry.get("created_at") else None,
        "updated_at": entry.get("updated_at").isoformat() if entry.get("updated_at") else None,
    }

# ============ CRUD Endpoints ============

@router.get("/categories")
async def get_categories():
    """Get available time tracking categories"""
    return {"categories": CATEGORIES}

@router.post("/entries")
async def create_entry(entry: TimeEntryCreate):
    """Create a manual time entry"""
    if entry.category not in CATEGORIES:
        raise HTTPException(status_code=400, detail=f"Invalid category. Must be one of: {CATEGORIES}")
    
    now = datetime.now(timezone.utc)
    doc = {
        "date": entry.date,
        "hours": entry.hours,
        "minutes": entry.minutes,
        "category": entry.category,
        "description": entry.description,
        "auto_tracked": False,
        "created_at": now,
        "updated_at": now,
    }
    
    result = time_entries.insert_one(doc)
    doc["_id"] = result.inserted_id
    
    return {"message": "Entry created", "entry": serialize_entry(doc)}

@router.get("/entries")
async def get_entries(
    start_date: Optional[str] = Query(None, description="Start date YYYY-MM-DD"),
    end_date: Optional[str] = Query(None, description="End date YYYY-MM-DD"),
    category: Optional[str] = Query(None, description="Filter by category"),
    limit: int = Query(100, le=500),
    skip: int = Query(0, ge=0)
):
    """Get time entries with optional filters"""
    query = {}
    
    if start_date:
        query["date"] = {"$gte": start_date}
    if end_date:
        if "date" in query:
            query["date"]["$lte"] = end_date
        else:
            query["date"] = {"$lte": end_date}
    if category:
        query["category"] = category
    
    cursor = time_entries.find(query).sort("date", -1).skip(skip).limit(limit)
    entries = [serialize_entry(e) for e in cursor]
    
    total = time_entries.count_documents(query)
    
    return {
        "entries": entries,
        "total": total,
        "limit": limit,
        "skip": skip
    }

@router.get("/entries/{entry_id}")
async def get_entry(entry_id: str):
    """Get a specific time entry"""
    try:
        entry = time_entries.find_one({"_id": ObjectId(entry_id)})
    except:
        raise HTTPException(status_code=400, detail="Invalid entry ID")
    
    if not entry:
        raise HTTPException(status_code=404, detail="Entry not found")
    
    return {"entry": serialize_entry(entry)}

@router.put("/entries/{entry_id}")
async def update_entry(entry_id: str, update: TimeEntryUpdate):
    """Update a time entry"""
    try:
        entry = time_entries.find_one({"_id": ObjectId(entry_id)})
    except:
        raise HTTPException(status_code=400, detail="Invalid entry ID")
    
    if not entry:
        raise HTTPException(status_code=404, detail="Entry not found")
    
    update_data = {k: v for k, v in update.dict().items() if v is not None}
    
    if "category" in update_data and update_data["category"] not in CATEGORIES:
        raise HTTPException(status_code=400, detail=f"Invalid category")
    
    if update_data:
        update_data["updated_at"] = datetime.now(timezone.utc)
        time_entries.update_one({"_id": ObjectId(entry_id)}, {"$set": update_data})
    
    updated = time_entries.find_one({"_id": ObjectId(entry_id)})
    return {"message": "Entry updated", "entry": serialize_entry(updated)}

@router.delete("/entries/{entry_id}")
async def delete_entry(entry_id: str):
    """Delete a time entry"""
    try:
        result = time_entries.delete_one({"_id": ObjectId(entry_id)})
    except:
        raise HTTPException(status_code=400, detail="Invalid entry ID")
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Entry not found")
    
    return {"message": "Entry deleted"}

# ============ Session Tracking ============

@router.post("/session/start")
async def start_session(session: SessionStart):
    """Start an auto-tracking session"""
    now = datetime.now(timezone.utc)
    
    doc = {
        "category": session.category,
        "page_url": session.page_url,
        "started_at": now,
        "last_activity": now,
        "active": True,
    }
    
    result = active_sessions.insert_one(doc)
    
    return {
        "session_id": str(result.inserted_id),
        "started_at": now.isoformat()
    }

@router.post("/session/heartbeat/{session_id}")
async def session_heartbeat(session_id: str):
    """Update session activity timestamp"""
    try:
        result = active_sessions.update_one(
            {"_id": ObjectId(session_id), "active": True},
            {"$set": {"last_activity": datetime.now(timezone.utc)}}
        )
    except:
        raise HTTPException(status_code=400, detail="Invalid session ID")
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Active session not found")
    
    return {"message": "Heartbeat recorded"}

@router.post("/session/end")
async def end_session(data: SessionEnd):
    """End a session and create time entry"""
    try:
        session = active_sessions.find_one({"_id": ObjectId(data.session_id)})
    except:
        raise HTTPException(status_code=400, detail="Invalid session ID")
    
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    # Calculate duration
    started_at = session["started_at"]
    ended_at = datetime.now(timezone.utc)
    duration = ended_at - started_at
    
    total_minutes = int(duration.total_seconds() / 60)
    hours = total_minutes // 60
    minutes = total_minutes % 60
    
    # Only log if more than 1 minute
    if total_minutes >= 1:
        entry_doc = {
            "date": started_at.strftime("%Y-%m-%d"),
            "hours": hours,
            "minutes": minutes,
            "category": session["category"],
            "description": data.description or f"Auto-tracked session on {session.get('page_url', session['category'])}",
            "auto_tracked": True,
            "session_id": data.session_id,
            "created_at": ended_at,
            "updated_at": ended_at,
        }
        time_entries.insert_one(entry_doc)
    
    # Mark session as inactive
    active_sessions.update_one(
        {"_id": ObjectId(data.session_id)},
        {"$set": {"active": False, "ended_at": ended_at}}
    )
    
    return {
        "message": "Session ended",
        "duration_minutes": total_minutes,
        "hours": hours,
        "minutes": minutes
    }

# ============ Summary & Reports ============

@router.get("/summary")
async def get_summary(
    month: Optional[str] = Query(None, description="Month in YYYY-MM format"),
    year: Optional[int] = Query(None, description="Year for summary")
):
    """Get time tracking summary"""
    now = datetime.now(timezone.utc)
    
    # Determine date range
    if month:
        year_num, month_num = map(int, month.split("-"))
        start_date = f"{year_num}-{month_num:02d}-01"
        if month_num == 12:
            end_date = f"{year_num + 1}-01-01"
        else:
            end_date = f"{year_num}-{month_num + 1:02d}-01"
    elif year:
        start_date = f"{year}-01-01"
        end_date = f"{year + 1}-01-01"
    else:
        # Default to current month
        start_date = f"{now.year}-{now.month:02d}-01"
        if now.month == 12:
            end_date = f"{now.year + 1}-01-01"
        else:
            end_date = f"{now.year}-{now.month + 1:02d}-01"
    
    # Aggregate by category
    pipeline = [
        {"$match": {"date": {"$gte": start_date, "$lt": end_date}}},
        {"$group": {
            "_id": "$category",
            "total_hours": {"$sum": "$hours"},
            "total_minutes": {"$sum": "$minutes"},
            "entry_count": {"$sum": 1}
        }}
    ]
    
    results = list(time_entries.aggregate(pipeline))
    
    # Calculate totals
    by_category = {}
    grand_total_minutes = 0
    
    for r in results:
        cat = r["_id"]
        total_mins = r["total_hours"] * 60 + r["total_minutes"]
        grand_total_minutes += total_mins
        by_category[cat] = {
            "hours": total_mins // 60,
            "minutes": total_mins % 60,
            "total_minutes": total_mins,
            "entry_count": r["entry_count"]
        }
    
    # Get daily breakdown for the period
    daily_pipeline = [
        {"$match": {"date": {"$gte": start_date, "$lt": end_date}}},
        {"$group": {
            "_id": "$date",
            "total_hours": {"$sum": "$hours"},
            "total_minutes": {"$sum": "$minutes"}
        }},
        {"$sort": {"_id": 1}}
    ]
    
    daily_results = list(time_entries.aggregate(daily_pipeline))
    daily_breakdown = []
    for d in daily_results:
        total_mins = d["total_hours"] * 60 + d["total_minutes"]
        daily_breakdown.append({
            "date": d["_id"],
            "hours": total_mins // 60,
            "minutes": total_mins % 60,
            "total_minutes": total_mins
        })
    
    return {
        "period": {
            "start": start_date,
            "end": end_date
        },
        "total": {
            "hours": grand_total_minutes // 60,
            "minutes": grand_total_minutes % 60,
            "total_minutes": grand_total_minutes
        },
        "by_category": by_category,
        "daily_breakdown": daily_breakdown,
        "entry_count": sum(r["entry_count"] for r in results)
    }

@router.get("/export")
async def export_entries(
    month: str = Query(..., description="Month in YYYY-MM format")
):
    """Export time entries for a month as Excel"""
    try:
        import openpyxl
        from openpyxl.styles import Font, Alignment, PatternFill, Border, Side
        from openpyxl.utils import get_column_letter
    except ImportError:
        raise HTTPException(status_code=500, detail="openpyxl not installed")
    
    year_num, month_num = map(int, month.split("-"))
    start_date = f"{year_num}-{month_num:02d}-01"
    if month_num == 12:
        end_date = f"{year_num + 1}-01-01"
    else:
        end_date = f"{year_num}-{month_num + 1:02d}-01"
    
    # Get entries
    entries = list(time_entries.find({
        "date": {"$gte": start_date, "$lt": end_date}
    }).sort("date", 1))
    
    # Create workbook
    wb = openpyxl.Workbook()
    ws = wb.active
    ws.title = f"Time Tracking {month}"
    
    # Styles
    header_font = Font(bold=True, color="FFFFFF")
    header_fill = PatternFill(start_color="4472C4", end_color="4472C4", fill_type="solid")
    border = Border(
        left=Side(style='thin'),
        right=Side(style='thin'),
        top=Side(style='thin'),
        bottom=Side(style='thin')
    )
    
    # Headers
    headers = ["Date", "Hours", "Minutes", "Total (hrs)", "Category", "Description", "Type"]
    for col, header in enumerate(headers, 1):
        cell = ws.cell(row=1, column=col, value=header)
        cell.font = header_font
        cell.fill = header_fill
        cell.alignment = Alignment(horizontal='center')
        cell.border = border
    
    # Data rows
    total_minutes = 0
    for row, entry in enumerate(entries, 2):
        mins = entry.get("hours", 0) * 60 + entry.get("minutes", 0)
        total_minutes += mins
        
        ws.cell(row=row, column=1, value=entry.get("date", "")).border = border
        ws.cell(row=row, column=2, value=entry.get("hours", 0)).border = border
        ws.cell(row=row, column=3, value=entry.get("minutes", 0)).border = border
        ws.cell(row=row, column=4, value=round(mins / 60, 2)).border = border
        ws.cell(row=row, column=5, value=entry.get("category", "")).border = border
        ws.cell(row=row, column=6, value=entry.get("description", "")).border = border
        ws.cell(row=row, column=7, value="Auto" if entry.get("auto_tracked") else "Manual").border = border
    
    # Summary row
    summary_row = len(entries) + 3
    ws.cell(row=summary_row, column=1, value="TOTAL").font = Font(bold=True)
    ws.cell(row=summary_row, column=4, value=round(total_minutes / 60, 2)).font = Font(bold=True)
    
    # Category summary
    ws.cell(row=summary_row + 2, column=1, value="By Category:").font = Font(bold=True)
    
    # Aggregate by category
    cat_totals = {}
    for entry in entries:
        cat = entry.get("category", "Other")
        mins = entry.get("hours", 0) * 60 + entry.get("minutes", 0)
        cat_totals[cat] = cat_totals.get(cat, 0) + mins
    
    for i, (cat, mins) in enumerate(sorted(cat_totals.items())):
        ws.cell(row=summary_row + 3 + i, column=1, value=cat)
        ws.cell(row=summary_row + 3 + i, column=4, value=round(mins / 60, 2))
    
    # Adjust column widths
    ws.column_dimensions['A'].width = 12
    ws.column_dimensions['B'].width = 8
    ws.column_dimensions['C'].width = 10
    ws.column_dimensions['D'].width = 12
    ws.column_dimensions['E'].width = 15
    ws.column_dimensions['F'].width = 50
    ws.column_dimensions['G'].width = 10
    
    # Save to bytes
    from fastapi.responses import StreamingResponse
    output = io.BytesIO()
    wb.save(output)
    output.seek(0)
    
    filename = f"time_tracking_{month}.xlsx"
    
    return StreamingResponse(
        output,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )

# ============ Pre-populate Historical Data ============

@router.post("/seed-historical")
async def seed_historical_data():
    """Seed historical time entries based on Emergent development sessions"""
    
    # Check if already seeded
    existing = time_entries.count_documents({})
    if existing > 0:
        return {"message": f"Already have {existing} entries. Delete them first to re-seed.", "seeded": False}
    
    # Historical work estimates based on Radio Check development
    historical_entries = [
        # Initial Setup & Core Features
        {"date": "2024-11-01", "hours": 4, "minutes": 0, "category": "Development", "description": "Initial project setup, FastAPI backend, MongoDB configuration"},
        {"date": "2024-11-02", "hours": 6, "minutes": 30, "category": "Development", "description": "User authentication system, JWT tokens, password hashing"},
        {"date": "2024-11-04", "hours": 5, "minutes": 0, "category": "Development", "description": "AI Chat personas - Hugo, Bob, Margie character setup"},
        {"date": "2024-11-05", "hours": 4, "minutes": 30, "category": "Development", "description": "OpenAI GPT integration for AI chat responses"},
        {"date": "2024-11-06", "hours": 3, "minutes": 0, "category": "Development", "description": "Chat UI components, message bubbles, typing indicators"},
        
        # Admin & Staff Portals
        {"date": "2024-11-08", "hours": 6, "minutes": 0, "category": "Admin Portal", "description": "Admin portal setup - user management, dashboard"},
        {"date": "2024-11-09", "hours": 5, "minutes": 30, "category": "Staff Portal", "description": "Staff portal - case management, support queue"},
        {"date": "2024-11-11", "hours": 4, "minutes": 0, "category": "Development", "description": "WebRTC signaling server for live calls"},
        {"date": "2024-11-12", "hours": 5, "minutes": 0, "category": "Development", "description": "Socket.io real-time communication setup"},
        
        # LMS Development
        {"date": "2024-11-14", "hours": 6, "minutes": 0, "category": "LMS Admin", "description": "LMS admin portal - course creation, module management"},
        {"date": "2024-11-15", "hours": 5, "minutes": 0, "category": "Development", "description": "LMS learner portal - course enrollment, progress tracking"},
        {"date": "2024-11-16", "hours": 4, "minutes": 30, "category": "Development", "description": "Quiz system with multiple choice questions"},
        {"date": "2024-11-18", "hours": 3, "minutes": 0, "category": "Documentation", "description": "LMS course content - Mental Health Awareness module"},
        
        # Events & Video
        {"date": "2024-11-20", "hours": 5, "minutes": 0, "category": "Development", "description": "Events system - create, manage, RSVP functionality"},
        {"date": "2024-11-21", "hours": 6, "minutes": 30, "category": "Development", "description": "Jitsi Meet integration for group video calls"},
        {"date": "2024-11-22", "hours": 3, "minutes": 0, "category": "App Testing", "description": "Video call testing, debugging WebRTC issues"},
        
        # Safeguarding System
        {"date": "2024-11-25", "hours": 8, "minutes": 0, "category": "Development", "description": "Safeguarding system v1 - keyword detection, risk scoring"},
        {"date": "2024-11-26", "hours": 6, "minutes": 0, "category": "Development", "description": "Sentence-transformers integration for semantic analysis"},
        {"date": "2024-11-27", "hours": 5, "minutes": 30, "category": "Development", "description": "Crisis phrase dataset - 500+ suicide-related phrases"},
        {"date": "2024-11-28", "hours": 4, "minutes": 0, "category": "Development", "description": "Pattern detection engine - 10 escalation patterns"},
        {"date": "2024-11-29", "hours": 5, "minutes": 0, "category": "Development", "description": "AI Safety Classifier using GPT-4o-mini"},
        {"date": "2024-11-30", "hours": 3, "minutes": 0, "category": "Documentation", "description": "Safeguarding system documentation"},
        
        # December - UI/UX & Fixes
        {"date": "2024-12-02", "hours": 4, "minutes": 0, "category": "Development", "description": "Home screen redesign - 2-column grid layout"},
        {"date": "2024-12-03", "hours": 3, "minutes": 30, "category": "Development", "description": "Live chat UI cleanup, header simplification"},
        {"date": "2024-12-04", "hours": 2, "minutes": 30, "category": "Development", "description": "Desktop layout fix - removed blue bar issue"},
        {"date": "2024-12-05", "hours": 4, "minutes": 0, "category": "Development", "description": "Local conversation storage - encrypted device storage"},
        {"date": "2024-12-06", "hours": 3, "minutes": 0, "category": "Support", "description": "Bug fixes - staff status reset, WebSocket reconnection"},
        
        # Recent Sessions
        {"date": "2024-12-09", "hours": 5, "minutes": 0, "category": "Development", "description": "Jitsi prejoin page fix - disable lobby screen"},
        {"date": "2024-12-10", "hours": 4, "minutes": 30, "category": "Development", "description": "AI conversation memory - show previous messages on return"},
        {"date": "2024-12-10", "hours": 2, "minutes": 0, "category": "Support", "description": "Debugging video chat issues, log analysis"},
        
        # Today's work
        {"date": "2024-12-11", "hours": 1, "minutes": 30, "category": "Development", "description": "Jitsi backend config fix - prejoinPageEnabled enforcement"},
        {"date": "2024-12-11", "hours": 2, "minutes": 0, "category": "Development", "description": "Time tracking system - API, admin portal integration"},
    ]
    
    now = datetime.now(timezone.utc)
    
    for entry in historical_entries:
        entry["auto_tracked"] = False
        entry["created_at"] = now
        entry["updated_at"] = now
    
    result = time_entries.insert_many(historical_entries)
    
    # Calculate totals
    total_minutes = sum(e["hours"] * 60 + e["minutes"] for e in historical_entries)
    
    return {
        "message": f"Seeded {len(result.inserted_ids)} historical entries",
        "total_hours": round(total_minutes / 60, 1),
        "seeded": True
    }

@router.delete("/entries/all")
async def delete_all_entries(confirm: bool = Query(False)):
    """Delete all time entries (use with caution!)"""
    if not confirm:
        raise HTTPException(status_code=400, detail="Must set confirm=true to delete all entries")
    
    result = time_entries.delete_many({})
    return {"message": f"Deleted {result.deleted_count} entries"}
