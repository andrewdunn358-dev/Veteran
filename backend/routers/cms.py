"""
CMS Router - Content Management System endpoints
Handles pages, sections, and cards for the app CMS.
"""

from fastapi import APIRouter, HTTPException
from typing import List
import uuid
from datetime import datetime

from services.database import get_database
from models.schemas import (
    CMSPage, CMSPageCreate, CMSSection, CMSSectionCreate,
    CMSCard, CMSCardCreate
)

router = APIRouter(prefix="/cms", tags=["cms"])


def clean_mongo_doc(doc: dict) -> dict:
    """Remove MongoDB _id and ensure id field exists"""
    if doc is None:
        return None
    result = {k: v for k, v in doc.items() if k != "_id"}
    if "id" not in result and "_id" in doc:
        result["id"] = str(doc["_id"])
    return result


# ==========================================
# Pages
# ==========================================

@router.get("/pages")
async def get_cms_pages():
    """Get list of all CMS pages (basic info only)"""
    db = get_database()
    pages = await db.cms_pages.find({}, {"_id": 0, "sections": 0}).sort("nav_order", 1).to_list(100)
    return pages


@router.get("/pages/all")
async def get_all_cms_pages():
    """Get all CMS pages with full details"""
    db = get_database()
    pages = await db.cms_pages.find({}, {"_id": 0}).sort("nav_order", 1).to_list(100)
    return pages


@router.get("/pages/{slug}")
async def get_cms_page(slug: str):
    """Get a single CMS page with all sections and cards"""
    db = get_database()
    page = await db.cms_pages.find_one({"slug": slug}, {"_id": 0})
    if not page:
        raise HTTPException(status_code=404, detail="Page not found")
    
    # Get sections for this page
    sections = await db.cms_sections.find({"page_slug": slug}, {"_id": 0}).sort("order", 1).to_list(100)
    
    # Get cards for each section
    for section in sections:
        section_id = section.get("id", "")
        cards = await db.cms_cards.find({"section_id": section_id}, {"_id": 0}).sort("order", 1).to_list(100)
        section["cards"] = cards
    
    page["sections"] = sections
    return page


@router.post("/pages")
async def create_cms_page(page: CMSPageCreate):
    """Create a new CMS page"""
    db = get_database()
    page_data = page.dict()
    page_data["id"] = str(uuid.uuid4())
    page_data["created_at"] = datetime.utcnow()
    page_data["updated_at"] = datetime.utcnow()
    
    await db.cms_pages.insert_one(page_data)
    return clean_mongo_doc(page_data)


@router.put("/pages/{slug}")
async def update_cms_page(slug: str, updates: dict):
    """Update a CMS page"""
    db = get_database()
    updates["updated_at"] = datetime.utcnow()
    # Remove _id if present in updates
    updates.pop("_id", None)
    result = await db.cms_pages.update_one({"slug": slug}, {"$set": updates})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Page not found")
    return {"success": True}


@router.delete("/pages/{slug}")
async def delete_cms_page(slug: str):
    """Delete a CMS page and all its sections/cards"""
    db = get_database()
    # Get all sections for this page
    sections = await db.cms_sections.find({"page_slug": slug}).to_list(100)
    
    # Delete all cards in those sections
    for section in sections:
        section_id = section.get("id", str(section.get("_id", "")))
        await db.cms_cards.delete_many({"section_id": section_id})
    
    # Delete all sections
    await db.cms_sections.delete_many({"page_slug": slug})
    
    # Delete the page
    result = await db.cms_pages.delete_one({"slug": slug})
    return {"deleted": result.deleted_count}


# ==========================================
# Sections
# ==========================================

@router.get("/sections/{page_slug}")
async def get_cms_sections(page_slug: str):
    """Get all sections for a page with their cards"""
    db = get_database()
    sections = await db.cms_sections.find({"page_slug": page_slug}, {"_id": 0}).sort("order", 1).to_list(100)
    
    # Get cards for each section
    for section in sections:
        section_id = section.get("id", "")
        cards = await db.cms_cards.find({"section_id": section_id}, {"_id": 0}).sort("order", 1).to_list(100)
        section["cards"] = cards
    
    return sections


@router.post("/sections")
async def create_cms_section(section: CMSSectionCreate):
    """Create a new CMS section"""
    db = get_database()
    section_data = section.dict()
    section_data["id"] = str(uuid.uuid4())
    section_data["created_at"] = datetime.utcnow()
    section_data["updated_at"] = datetime.utcnow()
    
    await db.cms_sections.insert_one(section_data)
    return clean_mongo_doc(section_data)


@router.put("/sections/{section_id}")
async def update_cms_section(section_id: str, updates: dict):
    """Update a CMS section"""
    db = get_database()
    updates["updated_at"] = datetime.utcnow()
    updates.pop("_id", None)
    result = await db.cms_sections.update_one(
        {"id": section_id},
        {"$set": updates}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Section not found")
    return {"success": True}


@router.delete("/sections/{section_id}")
async def delete_cms_section(section_id: str):
    """Delete a CMS section and all its cards"""
    db = get_database()
    # Delete all cards in this section
    await db.cms_cards.delete_many({"section_id": section_id})
    
    # Delete the section
    result = await db.cms_sections.delete_one({"id": section_id})
    return {"deleted": result.deleted_count}


@router.put("/sections/reorder")
async def reorder_cms_sections(updates: dict):
    """Reorder sections by updating their order values"""
    db = get_database()
    for section_id, new_order in updates.items():
        await db.cms_sections.update_one(
            {"id": section_id},
            {"$set": {"order": new_order}}
        )
    return {"success": True}


# ==========================================
# Cards
# ==========================================

@router.get("/cards/{section_id}")
async def get_cms_cards(section_id: str):
    """Get all cards for a section"""
    db = get_database()
    cards = await db.cms_cards.find({"section_id": section_id}, {"_id": 0}).sort("order", 1).to_list(100)
    return cards


@router.post("/cards")
async def create_cms_card(card: CMSCardCreate):
    """Create a new CMS card"""
    db = get_database()
    card_data = card.dict()
    card_data["id"] = str(uuid.uuid4())
    card_data["created_at"] = datetime.utcnow()
    card_data["updated_at"] = datetime.utcnow()
    
    await db.cms_cards.insert_one(card_data)
    return clean_mongo_doc(card_data)


@router.put("/cards/{card_id}")
async def update_cms_card(card_id: str, updates: dict):
    """Update a CMS card"""
    db = get_database()
    updates["updated_at"] = datetime.utcnow()
    updates.pop("_id", None)
    result = await db.cms_cards.update_one(
        {"id": card_id},
        {"$set": updates}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Card not found")
    return {"success": True}


@router.delete("/cards/{card_id}")
async def delete_cms_card(card_id: str):
    """Delete a CMS card"""
    db = get_database()
    result = await db.cms_cards.delete_one({"id": card_id})
    return {"deleted": result.deleted_count}


@router.put("/cards/reorder")
async def reorder_cms_cards(updates: dict):
    """Reorder cards by updating their order values"""
    db = get_database()
    for card_id, new_order in updates.items():
        await db.cms_cards.update_one(
            {"id": card_id},
            {"$set": {"order": new_order}}
        )
    return {"success": True}



# ==========================================
# Public Seed Endpoint (No Auth Required)
# ==========================================

@router.post("/seed-public")
async def seed_cms_public():
    """Public endpoint to seed CMS data (no auth required for initial setup)"""
    db = get_database()
    
    # Check if already seeded
    existing = await db.cms_pages.count_documents({})
    if existing > 0:
        return {"message": "CMS already seeded", "count": existing}
    
    now = datetime.utcnow()
    
    # Default CMS Pages
    pages = [
        {"id": str(uuid.uuid4()), "slug": "home", "title": "Home", "nav_order": 1, "is_published": True, "created_at": now, "updated_at": now},
        {"id": str(uuid.uuid4()), "slug": "self-care", "title": "Self-Care Tools", "nav_order": 2, "is_published": True, "created_at": now, "updated_at": now},
        {"id": str(uuid.uuid4()), "slug": "peer-support", "title": "Peer Support", "nav_order": 3, "is_published": True, "created_at": now, "updated_at": now},
        {"id": str(uuid.uuid4()), "slug": "organizations", "title": "Organizations", "nav_order": 4, "is_published": True, "created_at": now, "updated_at": now},
        {"id": str(uuid.uuid4()), "slug": "family-friends", "title": "Family & Friends", "nav_order": 5, "is_published": True, "created_at": now, "updated_at": now},
        {"id": str(uuid.uuid4()), "slug": "substance-support", "title": "Substance Support", "nav_order": 6, "is_published": True, "created_at": now, "updated_at": now},
    ]
    
    # Insert pages
    await db.cms_pages.insert_many(pages)
    
    # Create default sections for each page
    sections = []
    cards = []
    
    # Self-Care page sections and cards
    self_care_section_id = str(uuid.uuid4())
    sections.append({
        "id": self_care_section_id,
        "page_slug": "self-care",
        "title": "Self-Care Tools",
        "type": "cards",
        "order": 1,
        "created_at": now,
        "updated_at": now
    })
    
    # Self-care cards
    self_care_cards = [
        {"title": "Mental Health Check", "description": "PHQ-9 & GAD-7 assessments", "icon": "clipboard", "color": "#3b82f6", "route": "/mental-health-screening", "order": 1},
        {"title": "My Journal", "description": "Write down your thoughts", "icon": "book", "color": "#3b82f6", "route": "/journal", "order": 2},
        {"title": "Daily Check-in", "description": "Track how you're feeling", "icon": "happy", "color": "#f59e0b", "route": "/mood", "order": 3},
        {"title": "Grounding Tools", "description": "5-4-3-2-1 and more techniques", "icon": "hand-left", "color": "#22c55e", "route": "/grounding", "order": 4},
        {"title": "Breathing Exercises", "description": "Box breathing & relaxation", "icon": "cloud", "color": "#06b6d4", "route": "/breathing-game", "order": 5},
        {"title": "Buddy Finder", "description": "Connect with veterans near you", "icon": "people", "color": "#10b981", "route": "/buddy-finder", "order": 6},
        {"title": "Resources Library", "description": "Helpful information", "icon": "library", "color": "#ec4899", "route": "/resources", "order": 7},
    ]
    
    for card in self_care_cards:
        cards.append({
            "id": str(uuid.uuid4()),
            "section_id": self_care_section_id,
            "title": card["title"],
            "description": card["description"],
            "icon": card["icon"],
            "color": card["color"],
            "route": card["route"],
            "order": card["order"],
            "is_visible": True,
            "created_at": now,
            "updated_at": now
        })
    
    # Family & Friends page sections
    family_section_id = str(uuid.uuid4())
    sections.append({
        "id": family_section_id,
        "page_slug": "family-friends",
        "title": "Support for Family & Friends",
        "type": "cards",
        "order": 1,
        "created_at": now,
        "updated_at": now
    })
    
    family_cards = [
        {"title": "Understanding PTSD", "description": "Learn about post-traumatic stress", "icon": "heart", "color": "#ef4444", "route": "/resources", "order": 1},
        {"title": "Supporting a Veteran", "description": "Tips for family members", "icon": "people", "color": "#3b82f6", "route": "/resources", "order": 2},
        {"title": "Self-Care for Carers", "description": "Looking after yourself", "icon": "leaf", "color": "#22c55e", "route": "/self-care", "order": 3},
        {"title": "Find Support Groups", "description": "Connect with other families", "icon": "chatbubbles", "color": "#8b5cf6", "route": "/organizations", "order": 4},
    ]
    
    for card in family_cards:
        cards.append({
            "id": str(uuid.uuid4()),
            "section_id": family_section_id,
            "title": card["title"],
            "description": card["description"],
            "icon": card["icon"],
            "color": card["color"],
            "route": card["route"],
            "order": card["order"],
            "is_visible": True,
            "created_at": now,
            "updated_at": now
        })
    
    # Insert sections and cards
    if sections:
        await db.cms_sections.insert_many(sections)
    if cards:
        await db.cms_cards.insert_many(cards)
    
    return {
        "message": "CMS seeded successfully",
        "pages": len(pages),
        "sections": len(sections),
        "cards": len(cards)
    }
