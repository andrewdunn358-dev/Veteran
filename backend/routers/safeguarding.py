"""
Safeguarding Router - Panic alerts and safeguarding alerts management
"""

from fastapi import APIRouter, HTTPException, Depends
from typing import List, Optional
import uuid
from datetime import datetime

from services.database import get_database
from models.schemas import PanicAlertCreate, PanicAlert, SafeguardingAlert

router = APIRouter(tags=["safeguarding"])


# ==========================================
# Panic Alerts
# ==========================================

@router.post("/panic-alert")
async def create_panic_alert(alert: PanicAlertCreate):
    """Create a panic alert (SOS button pressed)"""
    db = get_database()
    
    alert_data = alert.dict()
    alert_data["id"] = str(uuid.uuid4())
    alert_data["status"] = "active"
    alert_data["created_at"] = datetime.utcnow()
    
    await db.panic_alerts.insert_one(alert_data)
    
    # TODO: Send notifications to staff
    # await notify_staff_of_panic_alert(alert_data)
    
    return {**alert_data, "_id": None}


@router.get("/panic-alerts")
async def get_panic_alerts(status: Optional[str] = None):
    """Get all panic alerts, optionally filtered by status"""
    db = get_database()
    
    query = {}
    if status:
        query["status"] = status
    
    alerts = await db.panic_alerts.find(query).sort("created_at", -1).to_list(200)
    return [{**a, "id": str(a.get("_id", a.get("id", "")))} for a in alerts]


@router.patch("/panic-alerts/{alert_id}/acknowledge")
async def acknowledge_panic_alert(alert_id: str, staff_id: str, staff_name: str = ""):
    """Acknowledge a panic alert"""
    db = get_database()
    
    result = await db.panic_alerts.update_one(
        {"$or": [{"id": alert_id}, {"_id": alert_id}]},
        {"$set": {
            "status": "acknowledged",
            "acknowledged_by": staff_id,
            "acknowledged_by_name": staff_name,
            "acknowledged_at": datetime.utcnow()
        }}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Alert not found")
    
    return {"success": True}


@router.patch("/panic-alerts/{alert_id}/resolve")
async def resolve_panic_alert(alert_id: str, staff_id: str, notes: str = ""):
    """Resolve a panic alert"""
    db = get_database()
    
    result = await db.panic_alerts.update_one(
        {"$or": [{"id": alert_id}, {"_id": alert_id}]},
        {"$set": {
            "status": "resolved",
            "resolved_by": staff_id,
            "resolved_at": datetime.utcnow(),
            "resolution_notes": notes
        }}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Alert not found")
    
    return {"success": True}


# ==========================================
# Safeguarding Alerts (AI-triggered)
# ==========================================

@router.get("/safeguarding-alerts")
async def get_safeguarding_alerts(status: Optional[str] = None, risk_level: Optional[str] = None):
    """Get safeguarding alerts from AI chat sessions"""
    db = get_database()
    
    query = {}
    if status:
        query["status"] = status
    if risk_level:
        query["risk_level"] = risk_level
    
    alerts = await db.safeguarding_alerts.find(query).sort("created_at", -1).to_list(200)
    return [{**a, "id": str(a.get("_id", a.get("id", "")))} for a in alerts]


@router.get("/safeguarding-alerts/{alert_id}")
async def get_safeguarding_alert(alert_id: str):
    """Get a single safeguarding alert with full details"""
    db = get_database()
    
    alert = await db.safeguarding_alerts.find_one({"$or": [{"id": alert_id}, {"_id": alert_id}]})
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    
    alert["id"] = str(alert.get("_id", alert.get("id", "")))
    return alert


@router.patch("/safeguarding-alerts/{alert_id}/acknowledge")
async def acknowledge_safeguarding_alert(alert_id: str, staff_id: str, staff_name: str = ""):
    """Acknowledge a safeguarding alert"""
    db = get_database()
    
    result = await db.safeguarding_alerts.update_one(
        {"$or": [{"id": alert_id}, {"_id": alert_id}]},
        {"$set": {
            "status": "acknowledged",
            "acknowledged_by": staff_id,
            "acknowledged_by_name": staff_name,
            "acknowledged_at": datetime.utcnow()
        }}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Alert not found")
    
    return {"success": True}


@router.patch("/safeguarding-alerts/{alert_id}/resolve")
async def resolve_safeguarding_alert(alert_id: str, staff_id: str, notes: str = "", outcome: str = ""):
    """Resolve a safeguarding alert"""
    db = get_database()
    
    result = await db.safeguarding_alerts.update_one(
        {"$or": [{"id": alert_id}, {"_id": alert_id}]},
        {"$set": {
            "status": "resolved",
            "resolved_by": staff_id,
            "resolved_at": datetime.utcnow(),
            "resolution_notes": notes,
            "outcome_assessment": outcome
        }}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Alert not found")
    
    return {"success": True}


@router.patch("/safeguarding-alerts/{alert_id}/notes")
async def update_safeguarding_notes(alert_id: str, notes: str):
    """Update notes on a safeguarding alert"""
    db = get_database()
    
    result = await db.safeguarding_alerts.update_one(
        {"$or": [{"id": alert_id}, {"_id": alert_id}]},
        {"$set": {"notes": notes, "updated_at": datetime.utcnow()}}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Alert not found")
    
    return {"success": True}


@router.get("/safeguarding-alerts/stats/summary")
async def get_safeguarding_stats():
    """Get summary statistics for safeguarding alerts"""
    db = get_database()
    
    total = await db.safeguarding_alerts.count_documents({})
    active = await db.safeguarding_alerts.count_documents({"status": "active"})
    acknowledged = await db.safeguarding_alerts.count_documents({"status": "acknowledged"})
    resolved = await db.safeguarding_alerts.count_documents({"status": "resolved"})
    
    # Count by risk level
    red = await db.safeguarding_alerts.count_documents({"risk_level": "RED"})
    amber = await db.safeguarding_alerts.count_documents({"risk_level": "AMBER"})
    yellow = await db.safeguarding_alerts.count_documents({"risk_level": "YELLOW"})
    
    return {
        "total": total,
        "by_status": {
            "active": active,
            "acknowledged": acknowledged,
            "resolved": resolved
        },
        "by_risk_level": {
            "RED": red,
            "AMBER": amber,
            "YELLOW": yellow
        }
    }
