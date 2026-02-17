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
- **Admin Status Management**:
  - PATCH /api/admin/counsellors/{id}/status - Update counsellor status
  - PATCH /api/admin/peer-supporters/{id}/status - Update peer status
- **Peer Support Registration** (UPDATED Feb 2026):
  - POST /api/peer-support/register - Register interest with email notification to admin
  - GET /api/peer-support/registrations - List all registrations (admin only)
- **Site Settings** (UPDATED Feb 2026):
  - GET /api/settings - Get site settings (includes notification email)
  - PUT /api/settings - Update settings (logo, notification email)
  - `peer_registration_notification_email` - Configurable admin notification email

### Frontend (React Native/Expo)
- **Callback Request Page** (/callback) - Form with counsellor/peer selection
- **Home Page** - Updated with "Request a Callback" button
- **Admin Panel** - Added Callbacks and Alerts tabs, status change modals
- **Splash Screen** - Clean entry point with Yes/No help buttons (panic button removed from public view)
- **Peer Support Page** - Registration form for becoming a peer supporter
- **Counsellor Portal** (/counsellor-portal) - UPDATED Feb 2026:
  - **PANIC ALERTS section** - Shows active panic alerts from peer supporters with Acknowledge/Resolve actions
  - Auto-polls every 10 seconds for new alerts
  - View and manage assigned callbacks (take, complete)
  - Status update (available/busy/off)
- **Peer Portal** (/peer-portal) - UPDATED Feb 2026:
  - Panic button to alert counsellors for help during calls
  - View and manage assigned callbacks (take, release, complete)
  - Status update (available/limited/unavailable)
- Theme support (light/dark mode)
- Logo wrapper for theme compatibility
- **Fixed**: `useNativeDriver` warning on web (Feb 2026)

### Admin Site (Static HTML)
- **Settings Section** (UPDATED Feb 2026):
  - Branding: Logo upload
  - Notifications: Peer registration notification email configuration

### Database Collections
- users, counsellors, peer_supporters, organizations, resources
- callback_requests
- panic_alerts
- peer_support_registrations
- settings (includes peer_registration_notification_email)
- call_logs

## Testing Status
- Backend: 100% (24/24 tests passed)
- Frontend: 80% (Callback form works, minor React Native Web issues)

## Known Issues
1. Splash screen (index.tsx) has rendering issue where content doesn't appear
2. React Native Web TouchableOpacity click events have automation issues
3. Resend API key not configured (emails won't send until configured)

## Deployment Architecture
- **Backend**: Render (FastAPI + MongoDB)
- **Frontend App**: Vercel (React Native/Expo Web)
- **Admin Site**: 20i hosting (static HTML/JS)

## Credentials
- Admin: admin@veteran.dbty.co.uk / ChangeThisPassword123!

## Upcoming Tasks (P1)
- Fix splash screen rendering issue
- Implement "Favorites/Saved Contacts" feature
- Add Privacy Policy & Terms of Service pages

## Future Tasks (P2/P3)
- VoIP/PBX Integration
- In-App Chat/Messaging
- Achievement Badges
- Referral System

## Files of Reference
- backend/server.py - All API endpoints
- frontend/app/callback.tsx - Callback request form
- frontend/app/admin.tsx - Admin panel with status management
- frontend/app/index.tsx - Splash screen with panic button
- frontend/app/peer-support.tsx - Peer support registration
- frontend/src/components/Toast.tsx - Toast notifications (fixed useNativeDriver)
- admin-site/app.js - Admin site functionality
- admin-site/index.html - Admin site UI
- frontend/app/home.tsx - Main home page

## Environment Variables
- EXPO_PUBLIC_BACKEND_URL - Backend API URL
- RESEND_API_KEY - Email service (optional)
- MONGO_URL - Database connection
