# UK Veterans Support App - Product Requirements Document

## Original Problem Statement
Build and enhance a mobile-first web application for UK military veterans providing crisis support, counselling, peer support, and callback request functionality.

## Core Requirements
1. Crisis support with immediate help options
2. Counsellor and peer supporter management
3. Callback request system
4. Panic button for emergencies
5. Admin panel for managing staff status
6. Organization and resource directory
7. Email notification system for admin alerts
8. **NEW (Feb 2026)**: Staff notes system for counsellors/peers
9. **NEW (Feb 2026)**: Smudge AI chatbot listener

## What's Been Implemented

### Backend (FastAPI)
- **Authentication**: JWT-based auth with admin/counsellor/peer roles
- **Callback Request System**:
  - POST /api/callbacks - Create callback requests (counsellor or peer type)
  - GET /api/callbacks - List callbacks (filtered by role)
  - PATCH /api/callbacks/{id}/take - Take control of callback
  - PATCH /api/callbacks/{id}/release - Release callback
  - PATCH /api/callbacks/{id}/complete - Complete callback
- **Panic Alert System**:
  - POST /api/panic-alert - Create panic alert
  - GET /api/panic-alerts - List alerts (admin/counsellor only)
  - PATCH /api/panic-alerts/{id}/acknowledge - Acknowledge alert
  - PATCH /api/panic-alerts/{id}/resolve - Resolve alert
- **Staff Notes System** (NEW Feb 2026):
  - POST /api/notes - Create note (private or shared)
  - GET /api/notes - Get notes (own + shared, admins see all)
  - GET /api/notes/{id} - Get specific note
  - PATCH /api/notes/{id} - Update note
  - DELETE /api/notes/{id} - Delete note
  - GET /api/staff-users - Get staff list for sharing
- **Smudge AI Chat** (NEW Feb 2026):
  - POST /api/smudge/chat - Send message to Smudge AI listener
  - POST /api/smudge/reset - Reset chat session
  - Uses GPT-4o-mini via Emergent LLM Key
  - Rate limited to 30 messages per session
  - System prompt enforces safe, empathetic listening without advice
- **Admin Status Management**:
  - PATCH /api/admin/counsellors/{id}/status - Update counsellor status
  - PATCH /api/admin/peer-supporters/{id}/status - Update peer status
- **Peer Support Registration**:
  - POST /api/peer-support/register - Register interest with email notification
  - GET /api/peer-support/registrations - List all registrations (admin only)
- **Site Settings**:
  - GET /api/settings - Get site settings
  - PUT /api/settings - Update settings

### Frontend (React Native/Expo)
- **Smudge Chat** (/smudge) - NEW Feb 2026:
  - AI listener chatbot interface
  - Multi-turn conversation with context
  - "Talk to a peer" and "Talk to a counsellor" buttons always visible
  - Disclaimer that Smudge is AI and cannot provide advice
- **Home Page** - "Talk to Smudge" button added to Self-Care Tools
- **Callback Request Page** (/callback) - Form with counsellor/peer selection
- **Admin Panel** - Callbacks and Alerts tabs, status change modals
- **Splash Screen** - Clean entry point with Yes/No help buttons
- **Peer Support Page** - Registration form for becoming a peer supporter
- **Counsellor Portal** (/counsellor-portal):
  - PANIC ALERTS section with Acknowledge/Resolve actions
  - Auto-polls every 10 seconds
  - Callbacks management
- **Peer Portal** (/peer-portal):
  - Panic button to alert counsellors
  - Callbacks management
- Theme support (light/dark mode)

### Staff Portal (NEW Feb 2026 - Static HTML)
- Located at `/app/staff-portal/` - Deploy to `veteran.dbty.co.uk/staff-portal`
- Features:
  - Login for counsellors/peers (admins can access for testing)
  - Panic button (peers) / Panic alerts (counsellors)
  - Callbacks management
  - Status toggle (available/busy/off)
  - **Notes section**: Create, edit, delete, share notes
  - Notes tabs: "My Notes" and "Shared With Me"
  - Link notes to callbacks
  - Auto-refresh every 30 seconds

### Admin Site (Static HTML)
- Located at `/app/admin-site/` - Deployed to `veteran.dbty.co.uk`
- Role-based access for admins
- Restored to working version from Feb 16, 2026

### Database Collections
- users, counsellors, peer_supporters, organizations, resources
- callback_requests, panic_alerts, peer_support_registrations
- settings, call_logs
- **notes** (NEW Feb 2026)

## Environment Variables
- EXPO_PUBLIC_BACKEND_URL - Backend API URL
- EMERGENT_LLM_KEY - For Smudge AI (GPT-4o-mini)
- RESEND_API_KEY - Email service (optional)
- MONGO_URL - Database connection

## Deployment Architecture
- **Backend**: Render (FastAPI + MongoDB)
- **Frontend App**: Vercel (React Native/Expo Web)
- **Admin Site**: 20i hosting (veteran.dbty.co.uk)
- **Staff Portal**: 20i hosting (veteran.dbty.co.uk/staff-portal)

## Files of Reference
- backend/server.py - All API endpoints including Smudge AI
- frontend/app/smudge.tsx - Smudge AI chat interface
- frontend/app/home.tsx - Home page with Smudge button
- staff-portal/ - Staff portal files (index.html, app.js, styles.css, config.js)
- admin-site/ - Admin site files

## Credentials
- Admin: admin@veteran.dbty.co.uk / ChangeThisPassword123!

## Upcoming Tasks (P1)
- Implement "Favorites/Saved Contacts" feature
- Add Privacy Policy & Terms of Service pages
- Backend performance optimization (MongoDB projections)

## Future Tasks (P2/P3)
- VoIP/PBX Integration
- In-App Chat/Messaging
- Achievement Badges
- Referral System
