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
8. Staff notes system for counsellors/peers
9. AI Battle Buddies (Tommy & Doris) chatbot feature
10. Training Portal for peer-to-peer volunteer training

## What's Been Implemented

### AI Battle Buddies (Tommy & Doris) - Feb 2026
- Two AI companion personas: Tommy (male veteran) and Doris (female veteran)
- Character selection screen at `/ai-buddies`
- Chat interface at `/ai-chat`
- Backend endpoint: POST /api/ai/chat
- Uses OpenAI API (gpt-4.1-mini) with user's API key
- About modal with full description text
- Featured prominently at top of home page

### Splash Screen (Feb 2026 Update)
- **Redesigned for calmer UX**:
  - Removed alarming red "I NEED HELP NOW" button
  - New welcoming message: "You're not alone. We're here for you."
  - Blue "Enter the App" as primary action
  - Subtle "I need to talk to someone now" link
  - Subtle emergency notice at bottom

### Home Page (Feb 2026 Update)
- **AI Battle Buddies section moved to TOP**
- Featured card with Tommy & Doris avatars
- "About Tommy & Doris" button with modal
- About modal displays full description text
- "Start a Conversation" button in modal

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
- **Staff Notes System**:
  - POST /api/notes - Create note (private or shared)
  - GET /api/notes - Get notes (own + shared, admins see all)
  - GET /api/notes/{id} - Get specific note
  - PATCH /api/notes/{id} - Update note
  - DELETE /api/notes/{id} - Delete note
  - GET /api/staff-users - Get staff list for sharing
- **AI Battle Buddies Chat**:
  - POST /api/ai/chat - Chat with Tommy or Doris
  - GET /api/ai-buddies/characters - Get character info
  - Uses OpenAI API with user's API key in backend/.env
- **Admin Status Management**:
  - PATCH /api/admin/counsellors/{id}/status - Update counsellor status
  - PATCH /api/admin/peer-supporters/{id}/status - Update peer status
- **Peer Support Registration**:
  - POST /api/peer-support/register - Register interest with email notification
  - GET /api/peer-support/registrations - List all registrations (admin only)

### Frontend (React Native/Expo)
- **AI Battle Buddies** (/ai-buddies, /ai-chat) - Character selection and chat
- **Home Page** - AI Buddies featured at top with About button
- **Splash Screen** - Calmer design without alarming red button
- **Callback Request Page** (/callback) - Form with counsellor/peer selection
- **Peer Support Page** - Registration form for becoming a peer supporter
- **Counsellor Portal** (/counsellor-portal)
- **Peer Portal** (/peer-portal)
- Theme support (light/dark mode)

### Staff Portal (Static HTML)
- Located at `/app/staff-portal/`
- Features: Login, Panic alerts, Callbacks, Notes, Status toggle

### Admin Site (Static HTML)
- Located at `/app/admin-site/`
- Role-based access for admins

### Training Portal Assets
- `/app/training-portal/course-structure.md` - 10-module course outline
- `/app/training-portal/radio-check-theme.css` - WordPress/LMS CSS theme
- `/app/training-portal/formalms-theme.css` - FormaLMS CSS theme

### Database Collections
- users, counsellors, peer_supporters, organizations, resources
- callback_requests, panic_alerts, peer_support_registrations
- settings, call_logs, notes

## Environment Variables
- EXPO_PUBLIC_BACKEND_URL - Backend API URL
- OPENAI_API_KEY - For AI Battle Buddies (user's own key)
- RESEND_API_KEY - Email service (optional)
- MONGO_URL - Database connection

## Deployment Architecture
- **Backend**: Render (FastAPI + MongoDB)
- **Frontend App**: Vercel (React Native/Expo Web)
- **Admin Site**: 20i hosting (veteran.dbty.co.uk)
- **Staff Portal**: 20i hosting (veteran.dbty.co.uk/staff-portal)
- **Training Portal**: WordPress/LMS (user to set up)

## Files of Reference
- backend/server.py - All API endpoints including AI chat
- frontend/app/index.tsx - Splash screen (calmer design)
- frontend/app/home.tsx - Home page with AI Buddies at top
- frontend/app/ai-buddies.tsx - Character selection screen
- frontend/app/ai-chat.tsx - AI chat interface
- staff-portal/ - Staff portal files
- admin-site/ - Admin site files
- training-portal/ - LMS theme assets

## Credentials
- Admin: admin@veteran.dbty.co.uk / ChangeThisPassword123!

## Completed Tasks (Feb 2026)
- [x] AI Battle Buddies (Tommy & Doris) implemented
- [x] Splash screen redesigned (removed alarming red button)
- [x] AI Buddies moved to top of home page
- [x] About Tommy & Doris button and modal added
- [x] Staff notes system implemented
- [x] Staff portal created
- [x] Training portal CSS themes created

## Upcoming Tasks (P1)
- Training Portal API endpoint for progress tracking
- Persistent AI chat history option for logged-in users

## Future Tasks (P2/P3)
- Favorites/Saved Contacts feature
- Privacy Policy & Terms of Service pages
- Backend performance optimization (MongoDB projections)
- VoIP/PBX Integration
- In-App Human-to-Human Chat
- Achievement Badges
- Referral System
- Clean up avatar references (tommy.png vs smudge-avatar.png)
