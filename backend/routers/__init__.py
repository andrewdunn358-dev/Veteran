"""
Backend API Routers Package

This package contains modularized API routers extracted from the monolithic server.py.
Each router handles a specific domain of functionality.

Routers:
- auth: User authentication, login, registration, password management, push tokens
- cms: Content Management System - pages, sections, cards
- shifts: Staff scheduling and rota management with push notifications
- buddy_finder: Peer matching and messaging for veterans
- staff: Counsellors and Peer Supporters management
- organizations: Support organizations directory
- resources: Educational resources and support materials
- safeguarding: Panic alerts and AI-triggered safeguarding alerts
- callbacks: Callback request management
- live_chat: Real-time chat rooms for staff-veteran communication
- notes: Staff notes and case notes management
- concerns: Family/Friends concerns about veterans
- message_queue: Offline message queuing and delivery
- ai_feedback: User feedback system for AI responses
- knowledge_base: RAG system for AI characters

Usage:
    from routers import auth, cms, shifts, buddy_finder
    app.include_router(auth.router, prefix="/api")
    app.include_router(cms.router, prefix="/api")
    # etc.
"""

from . import (
    auth,
    cms,
    shifts,
    buddy_finder,
    staff,
    organizations,
    resources,
    safeguarding,
    callbacks,
    live_chat,
    notes,
    concerns,
    message_queue,
    ai_feedback,
    knowledge_base
)

__all__ = [
    "auth",
    "cms", 
    "shifts",
    "buddy_finder",
    "staff",
    "organizations",
    "resources",
    "safeguarding",
    "callbacks",
    "live_chat",
    "notes",
    "concerns",
    "message_queue",
    "ai_feedback",
    "knowledge_base"
]
