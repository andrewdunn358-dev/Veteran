# UK Veterans Support App - Product Requirements Document

## Original Problem Statement
Build and enhance a mobile-first web application for UK military veterans providing crisis support, counselling, peer support, callback request functionality, and AI-powered companionship with comprehensive safeguarding.

## Core Requirements
1. Crisis support with immediate help options
2. Counsellor and peer supporter management
3. Callback request system
4. Panic button for emergencies
5. Admin panel for managing staff status
6. Organization and resource directory
7. Email notification system for admin alerts
8. Staff notes system for counsellors/peers
9. AI Battle Buddies (Tommy & Doris) chatbot feature with **SAFEGUARDING**
10. Training Portal for peer-to-peer volunteer training

## What's Been Implemented (Feb 2026)

### Splash Screen - Two-Option Design
- **Question**: "Do you need to speak with someone right now?"
- **Yes Button**: "Yes, connect me now" → Routes to /crisis-support (counsellor page)
- **No Button**: "No, I'll explore the app" → Routes to /home
- Subtle emergency notice: "In an emergency, always call 999"
- Welcoming message: "You're not alone. We're here for you."

### AI Battle Buddies with Safeguarding
**Characters:**
- Tommy: Warm, steady male presence with military-friendly tone
- Doris: Nurturing, compassionate female presence

**Safeguarding System:**
- Keyword detection for crisis indicators:
  - Suicide: "kill myself", "end my life", "want to die", "suicide", "suicidal"
  - Self-harm: "self harm", "hurt myself", "cut myself", "cutting"
  - Hopelessness: "hopeless", "no point living", "can't go on", "given up", "no hope"
  - Crisis: "can't take it anymore", "no way out", "burden to everyone"
- When triggered:
  - Backend returns `safeguardingTriggered: true`
  - Creates SafeguardingAlert in database
  - Sends email notification to admin (if configured)
  - Frontend shows modal with support options requiring acknowledgment
- Modal options: Talk to Counsellor, Talk to Peer, Samaritans (116 123), 999

**Home Page Integration:**
- AI Buddies featured at TOP of home page
- "About Tommy & Doris" button opens modal with full description
- Start a Conversation button in modal

### Backend APIs (FastAPI)
**AI Battle Buddies:**
- `GET /api/ai-buddies/characters` - Get character info
- `POST /api/ai-buddies/chat` - Chat with Tommy/Doris (includes safeguarding check)
- `POST /api/ai-buddies/reset` - Reset session

**Safeguarding Alerts:**
- `GET /api/safeguarding-alerts` - Get alerts (counsellors/admins only)
- `PATCH /api/safeguarding-alerts/{id}/acknowledge` - Acknowledge alert
- `PATCH /api/safeguarding-alerts/{id}/resolve` - Resolve alert with notes

**Existing APIs:**
- Auth (login, register, password reset)
- Callbacks (create, list, take, release, complete)
- Panic alerts (create, list, acknowledge, resolve)
- Notes (create, list, update, delete, share)
- Organizations, Resources, Settings

### Database Collections
- users, counsellors, peer_supporters
- organizations, resources
- callback_requests, panic_alerts
- **safeguarding_alerts** (NEW)
- notes, settings, call_logs

## Testing Status (Feb 2026)
- **Backend**: 100% pass (15/15 tests)
- **Frontend**: 95% pass (all core features working)
- Test file: `/app/backend/tests/test_safeguarding.py`

## Environment Variables
- EXPO_PUBLIC_BACKEND_URL - Backend API URL
- OPENAI_API_KEY - For AI Battle Buddies
- RESEND_API_KEY - Email notifications (optional)
- MONGO_URL - Database connection

## Deployment Architecture
- **Backend**: Render (FastAPI + MongoDB)
- **Frontend App**: Vercel (React Native/Expo Web)
- **Admin Site**: 20i hosting (veteran.dbty.co.uk)
- **Staff Portal**: 20i hosting (veteran.dbty.co.uk/staff-portal)

## Files of Reference
- `/app/backend/server.py` - All backend APIs
- `/app/frontend/app/index.tsx` - Splash screen (two options)
- `/app/frontend/app/home.tsx` - Home page with AI Buddies at top
- `/app/frontend/app/ai-buddies.tsx` - Character selection
- `/app/frontend/app/ai-chat.tsx` - Chat with safeguarding modal
- `/app/staff-portal/` - Staff portal files

## Credentials
- Admin: admin@veteran.dbty.co.uk / ChangeThisPassword123!

## Completed Tasks (Feb 2026)
- [x] Splash screen redesigned with two-option question
- [x] AI Battle Buddies moved to top of home page
- [x] About Tommy & Doris button and modal added
- [x] Safeguarding keyword detection implemented
- [x] SafeguardingAlert model and database collection
- [x] Email notification on safeguarding trigger
- [x] Frontend safeguarding modal with support options
- [x] Safeguarding alerts API endpoints
- [x] All features tested

## Upcoming Tasks (P1)
- Add safeguarding alerts tab to Staff Portal UI
- Training Portal API endpoint for progress tracking
- Persistent AI chat history option for logged-in users

## Future Tasks (P2/P3)
- Push notifications for safeguarding alerts
- Favorites/Saved Contacts feature
- Privacy Policy & Terms of Service pages
- Backend performance optimization
- VoIP/PBX Integration
- In-App Human-to-Human Chat
- Achievement Badges
- Referral System
