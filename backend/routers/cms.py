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


# ==========================================
# Pages
# ==========================================

@router.get("/pages")
async def get_cms_pages():
    """Get list of all CMS pages (basic info only)"""
    db = get_database()
    pages = await db.cms_pages.find({}, {"sections": 0}).sort("order", 1).to_list(100)
    return [{**page, "id": str(page.get("_id", page.get("id", "")))} for page in pages]


@router.get("/pages/all")
async def get_all_cms_pages():
    """Get all CMS pages with full details"""
    db = get_database()
    pages = await db.cms_pages.find({}).sort("order", 1).to_list(100)
    return [{**page, "id": str(page.get("_id", page.get("id", "")))} for page in pages]


@router.get("/pages/{slug}")
async def get_cms_page(slug: str):
    """Get a single CMS page with all sections and cards"""
    db = get_database()
    page = await db.cms_pages.find_one({"slug": slug})
    if not page:
        raise HTTPException(status_code=404, detail="Page not found")
    
    # Get sections for this page
    sections = await db.cms_sections.find({"page_slug": slug}).sort("order", 1).to_list(100)
    
    # Get cards for each section
    for section in sections:
        section["id"] = str(section.get("_id", section.get("id", "")))
        cards = await db.cms_cards.find({"section_id": section["id"]}).sort("order", 1).to_list(100)
        section["cards"] = [{**card, "id": str(card.get("_id", card.get("id", "")))} for card in cards]
    
    page["sections"] = sections
    page["id"] = str(page.get("_id", page.get("id", "")))
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
    return page_data


@router.put("/pages/{slug}")
async def update_cms_page(slug: str, updates: dict):
    """Update a CMS page"""
    db = get_database()
    updates["updated_at"] = datetime.utcnow()
    result = await db.cms_pages.update_one({"slug": slug}, {"$set": updates})
    if result.modified_count == 0:
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
        await db.cms_cards.delete_many({"section_id": section.get("id", str(section.get("_id", "")))})
    
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
    """Get all sections for a page"""
    db = get_database()
    sections = await db.cms_sections.find({"page_slug": page_slug}).sort("order", 1).to_list(100)
    return [{**s, "id": str(s.get("_id", s.get("id", "")))} for s in sections]


@router.post("/sections")
async def create_cms_section(section: CMSSectionCreate):
    """Create a new CMS section"""
    db = get_database()
    section_data = section.dict()
    section_data["id"] = str(uuid.uuid4())
    section_data["created_at"] = datetime.utcnow()
    
    await db.cms_sections.insert_one(section_data)
    return section_data


@router.put("/sections/{section_id}")
async def update_cms_section(section_id: str, updates: dict):
    """Update a CMS section"""
    db = get_database()
    result = await db.cms_sections.update_one(
        {"$or": [{"id": section_id}, {"_id": section_id}]},
        {"$set": updates}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Section not found")
    return {"success": True}


@router.delete("/sections/{section_id}")
async def delete_cms_section(section_id: str):
    """Delete a CMS section and all its cards"""
    db = get_database()
    # Delete all cards in this section
    await db.cms_cards.delete_many({"section_id": section_id})
    
    # Delete the section
    result = await db.cms_sections.delete_one(
        {"$or": [{"id": section_id}, {"_id": section_id}]}
    )
    return {"deleted": result.deleted_count}


@router.put("/sections/reorder")
async def reorder_cms_sections(updates: dict):
    """Reorder sections by updating their order values"""
    db = get_database()
    for section_id, new_order in updates.items():
        await db.cms_sections.update_one(
            {"$or": [{"id": section_id}, {"_id": section_id}]},
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
    cards = await db.cms_cards.find({"section_id": section_id}).sort("order", 1).to_list(100)
    return [{**c, "id": str(c.get("_id", c.get("id", "")))} for c in cards]


@router.post("/cards")
async def create_cms_card(card: CMSCardCreate):
    """Create a new CMS card"""
    db = get_database()
    card_data = card.dict()
    card_data["id"] = str(uuid.uuid4())
    card_data["created_at"] = datetime.utcnow()
    
    await db.cms_cards.insert_one(card_data)
    return card_data


@router.put("/cards/{card_id}")
async def update_cms_card(card_id: str, updates: dict):
    """Update a CMS card"""
    db = get_database()
    result = await db.cms_cards.update_one(
        {"$or": [{"id": card_id}, {"_id": card_id}]},
        {"$set": updates}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Card not found")
    return {"success": True}


@router.delete("/cards/{card_id}")
async def delete_cms_card(card_id: str):
    """Delete a CMS card"""
    db = get_database()
    result = await db.cms_cards.delete_one(
        {"$or": [{"id": card_id}, {"_id": card_id}]}
    )
    return {"deleted": result.deleted_count}


@router.put("/cards/reorder")
async def reorder_cms_cards(updates: dict):
    """Reorder cards by updating their order values"""
    db = get_database()
    for card_id, new_order in updates.items():
        await db.cms_cards.update_one(
            {"$or": [{"id": card_id}, {"_id": card_id}]},
            {"$set": {"order": new_order}}
        )
    return {"success": True}
