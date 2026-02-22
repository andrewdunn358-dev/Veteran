"""
Resources Router - Educational resources and support materials
"""

from fastapi import APIRouter, HTTPException
from typing import List
import uuid
from datetime import datetime

from services.database import get_database
from models.schemas import ResourceCreate, Resource, ResourceUpdate

router = APIRouter(prefix="/resources", tags=["resources"])


@router.get("/")
async def get_resources():
    """Get all resources"""
    db = get_database()
    resources = await db.resources.find({}).sort("order", 1).to_list(200)
    return [{**r, "id": str(r.get("_id", r.get("id", "")))} for r in resources]


@router.post("/", response_model=Resource)
async def create_resource(resource: ResourceCreate):
    """Create a new resource"""
    db = get_database()
    resource_data = resource.dict()
    resource_data["id"] = str(uuid.uuid4())
    resource_data["created_at"] = datetime.utcnow()
    resource_data["updated_at"] = datetime.utcnow()
    
    await db.resources.insert_one(resource_data)
    return {**resource_data, "_id": None}


@router.get("/{resource_id}")
async def get_resource(resource_id: str):
    """Get a single resource by ID"""
    db = get_database()
    resource = await db.resources.find_one({"$or": [{"id": resource_id}, {"_id": resource_id}]})
    if not resource:
        raise HTTPException(status_code=404, detail="Resource not found")
    resource["id"] = str(resource.get("_id", resource.get("id", "")))
    return resource


@router.put("/{resource_id}")
async def update_resource(resource_id: str, updates: ResourceUpdate):
    """Update a resource"""
    db = get_database()
    update_data = {k: v for k, v in updates.dict().items() if v is not None}
    update_data["updated_at"] = datetime.utcnow()
    
    result = await db.resources.update_one(
        {"$or": [{"id": resource_id}, {"_id": resource_id}]},
        {"$set": update_data}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Resource not found")
    
    return {"success": True}


@router.delete("/{resource_id}")
async def delete_resource(resource_id: str):
    """Delete a resource"""
    db = get_database()
    result = await db.resources.delete_one({"$or": [{"id": resource_id}, {"_id": resource_id}]})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Resource not found")
    
    return {"deleted": True}


@router.post("/seed")
async def seed_resources():
    """Seed default resources for veterans"""
    db = get_database()
    
    default_resources = [
        {
            "id": str(uuid.uuid4()),
            "title": "Managing Flashbacks",
            "description": "Techniques for coping with flashbacks and intrusive memories",
            "category": "Mental Health",
            "url": "",
            "phone": "",
            "icon": "brain",
            "order": 1,
            "created_at": datetime.utcnow()
        },
        {
            "id": str(uuid.uuid4()),
            "title": "Sleep Hygiene Guide",
            "description": "Tips for better sleep and managing nightmares",
            "category": "Wellbeing",
            "url": "",
            "phone": "",
            "icon": "moon",
            "order": 2,
            "created_at": datetime.utcnow()
        },
        {
            "id": str(uuid.uuid4()),
            "title": "Breathing Exercises",
            "description": "Calming breathing techniques for anxiety and stress",
            "category": "Wellbeing",
            "url": "",
            "phone": "",
            "icon": "wind",
            "order": 3,
            "created_at": datetime.utcnow()
        },
        {
            "id": str(uuid.uuid4()),
            "title": "Alcohol Support",
            "description": "Resources for managing alcohol use",
            "category": "Substance Support",
            "url": "",
            "phone": "0300 123 1110",
            "icon": "wine",
            "order": 4,
            "created_at": datetime.utcnow()
        },
        {
            "id": str(uuid.uuid4()),
            "title": "Benefits & Entitlements",
            "description": "Guide to veteran benefits and how to claim them",
            "category": "Practical Support",
            "url": "https://www.gov.uk/veteran-benefits",
            "phone": "",
            "icon": "document",
            "order": 5,
            "created_at": datetime.utcnow()
        },
        {
            "id": str(uuid.uuid4()),
            "title": "Housing Support",
            "description": "Help with housing and homelessness for veterans",
            "category": "Practical Support",
            "url": "",
            "phone": "",
            "icon": "home",
            "order": 6,
            "created_at": datetime.utcnow()
        }
    ]
    
    existing = await db.resources.count_documents({})
    if existing == 0:
        await db.resources.insert_many(default_resources)
        return {"message": f"Seeded {len(default_resources)} resources"}
    
    return {"message": f"Resources already exist ({existing} found)"}


@router.get("/category/{category}")
async def get_resources_by_category(category: str):
    """Get resources by category"""
    db = get_database()
    resources = await db.resources.find({"category": category}).sort("order", 1).to_list(100)
    return [{**r, "id": str(r.get("_id", r.get("id", "")))} for r in resources]


@router.get("/categories/list")
async def get_resource_categories():
    """Get list of unique resource categories"""
    db = get_database()
    categories = await db.resources.distinct("category")
    return {"categories": categories}
