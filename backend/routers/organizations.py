"""
Organizations Router - Support organizations management
"""

from fastapi import APIRouter, HTTPException
from typing import List
import uuid
from datetime import datetime
import csv
import io

from services.database import get_database
from models.schemas import OrganizationCreate, Organization

router = APIRouter(prefix="/organizations", tags=["organizations"])


@router.post("/", response_model=Organization)
async def create_organization(org: OrganizationCreate):
    """Create a new organization"""
    db = get_database()
    org_data = org.dict()
    org_data["id"] = str(uuid.uuid4())
    org_data["created_at"] = datetime.utcnow()
    
    await db.organizations.insert_one(org_data)
    return {**org_data, "_id": None}


@router.get("/", response_model=List[Organization])
async def get_organizations():
    """Get all organizations"""
    db = get_database()
    orgs = await db.organizations.find({}).to_list(200)
    return [{**o, "id": str(o.get("_id", o.get("id", "")))} for o in orgs]


@router.get("/{org_id}", response_model=Organization)
async def get_organization(org_id: str):
    """Get a single organization by ID"""
    db = get_database()
    org = await db.organizations.find_one({"$or": [{"id": org_id}, {"_id": org_id}]})
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")
    org["id"] = str(org.get("_id", org.get("id", "")))
    return org


@router.put("/{org_id}", response_model=Organization)
async def update_organization(org_id: str, updates: dict):
    """Update an organization"""
    db = get_database()
    updates["updated_at"] = datetime.utcnow()
    
    result = await db.organizations.update_one(
        {"$or": [{"id": org_id}, {"_id": org_id}]},
        {"$set": updates}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Organization not found")
    
    return await get_organization(org_id)


@router.delete("/{org_id}")
async def delete_organization(org_id: str):
    """Delete an organization"""
    db = get_database()
    result = await db.organizations.delete_one({"$or": [{"id": org_id}, {"_id": org_id}]})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Organization not found")
    
    return {"deleted": True}


@router.post("/seed")
async def seed_organizations():
    """Seed default UK veteran support organizations"""
    db = get_database()
    
    default_orgs = [
        {
            "id": str(uuid.uuid4()),
            "name": "Samaritans",
            "service": "24/7 emotional support for anyone in distress",
            "phone": "116 123",
            "email": "jo@samaritans.org",
            "website": "https://www.samaritans.org",
            "created_at": datetime.utcnow()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Combat Stress",
            "service": "Mental health support for veterans",
            "phone": "0800 138 1619",
            "email": "helpline@combatstress.org.uk",
            "website": "https://www.combatstress.org.uk",
            "created_at": datetime.utcnow()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Veterans Gateway",
            "service": "First point of contact for veteran support",
            "phone": "0808 802 1212",
            "email": "",
            "website": "https://www.veteransgateway.org.uk",
            "created_at": datetime.utcnow()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "SSAFA",
            "service": "Lifelong support for Forces and their families",
            "phone": "0800 260 6767",
            "email": "",
            "website": "https://www.ssafa.org.uk",
            "created_at": datetime.utcnow()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "The Royal British Legion",
            "service": "Support for serving and ex-serving personnel",
            "phone": "0808 802 8080",
            "email": "",
            "website": "https://www.britishlegion.org.uk",
            "created_at": datetime.utcnow()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Help for Heroes",
            "service": "Recovery support for wounded veterans",
            "phone": "0800 058 8717",
            "email": "",
            "website": "https://www.helpforheroes.org.uk",
            "created_at": datetime.utcnow()
        }
    ]
    
    # Only insert if collection is empty
    existing = await db.organizations.count_documents({})
    if existing == 0:
        await db.organizations.insert_many(default_orgs)
        return {"message": f"Seeded {len(default_orgs)} organizations"}
    
    return {"message": f"Organizations already exist ({existing} found)"}


@router.get("/export/csv")
async def export_organizations_csv():
    """Export organizations to CSV format"""
    db = get_database()
    orgs = await db.organizations.find({}).to_list(500)
    
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["Name", "Service", "Phone", "Email", "Website"])
    
    for org in orgs:
        writer.writerow([
            org.get("name", ""),
            org.get("service", ""),
            org.get("phone", ""),
            org.get("email", ""),
            org.get("website", "")
        ])
    
    return {"csv": output.getvalue()}


@router.post("/import")
async def import_organizations(organizations: List[OrganizationCreate]):
    """Import multiple organizations"""
    db = get_database()
    
    imported = 0
    for org in organizations:
        org_data = org.dict()
        org_data["id"] = str(uuid.uuid4())
        org_data["created_at"] = datetime.utcnow()
        await db.organizations.insert_one(org_data)
        imported += 1
    
    return {"imported": imported}
