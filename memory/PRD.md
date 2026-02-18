# UK Veterans Support App - Product Requirements Document

## Original Problem Statement
Build and enhance a mobile-first web application for UK military veterans providing crisis support, counselling, peer support, callback request functionality, and AI-powered companionship with comprehensive BACP-aligned safeguarding.

## What's Been Implemented (Feb 2026)

### NEW: Zentrafuge Veteran AI Safety Layer Integration
**Source**: https://github.com/TheAIOldtimer/veteran-ai-safety-layer (MIT License)

Enhanced AI safety features:
- **Negation-aware detection** - Distinguishes "I want to kill myself" vs "I don't want to kill myself"
- **Context multipliers** - Escalates risk when substances, isolation, or means mentioned
- **Multi-level risk** - NONE → LOW → MEDIUM → HIGH → CRITICAL
- **Fail-safe design** - On error, assumes HIGH risk (never silently passes)
- **UK Veteran Crisis Resources** - Combat Stress, Veterans Gateway, Op COURAGE, Samaritans

Files added:
- `/app/backend/safety/safety_monitor.py` - Enhanced crisis detection
- `/app/backend/safety/crisis_resources.py` - Country-specific helplines
- `/app/SAFEGUARDING_DISCLAIMER.md` - Legal/liability documentation
- `/app/ATTRIBUTION.md` - Open source attribution

### NEW: Field-Level Data Encryption (AES-256)
Sensitive data now encrypted at rest:
- **Counsellors**: name, phone, sms, whatsapp
- **Peer Supporters**: firstName, phone, sms, whatsapp
- **Callbacks**: name, phone, email, message
- **Notes**: content, subject
- **Safeguarding Alerts**: ip_address, conversation_history

⚠️ **CRITICAL**: Add `ENCRYPTION_KEY` to Render environment variables

### NEW: API Security Hardening
- `/api/counsellors` and `/api/peer-supporters` now require authentication
- Public `/available` endpoints return only safe data (no contact info)
- Role-based access (admin, counsellor, peer)

### NEW: Friends & Family Section
**Purpose**: Support for concerned loved ones
- **Raise a Concern form** - Family/friends can report worries
- **Signs to Look For** - Education on warning signs
- **Support Services** - Op Courage, Combat Stress, Men's Sheds, SSAFA, RBL
- **Armed Forces Covenant** info
- **Substance & Alcohol Support** - Tom Harrison House, AA, FRANK
- **Criminal Justice Support** - NACRO, Project Nova, Walking With The Wounded

### Enhanced Safeguarding Indicators
Now detects:
- **Addiction**: gambling, drinking to cope, drug use, "can't stop drinking"
- **Offending/Legal**: prison, court cases, anger issues, assault charges
- **Self-care deterioration**: not eating, not showering, letting go
- **Sleep changes**: insomnia, sleeping all day, "awake all night"
- **Isolation**: pushing people away, not leaving house, avoiding everyone
- **Pride/Stigma barriers**: "too proud to ask", "sign of weakness", "others had it worse", "real men don't"

### Safeguarding Modal Enhanced
When triggered offers:
- **Request a Callback** - Captures phone number for staff to call back
- **Connect Now** - Shows available counsellors/peers online
- **Samaritans** - Direct dial 116 123
- **999 notice**

### Tommy & Doris - Squaddie Personalities
- Proper military banter and slang
- "Alright mucker", "brew", "scran", "threaders"
- Drops banter immediately for serious topics

## Files to Deploy

| File | Location | Action |
|------|----------|--------|
| `staff-portal-livechat.zip` | `/app/staff-portal/` | Upload to 20i hosting - includes latest live chat flow |
| `FEATURE_LIST.md` | `/app/` | Complete reference |
| `DEPLOYMENT_INSTRUCTIONS.md` | `/app/` | Morning setup guide |

## New API Endpoints

### Family/Friends Concerns
- `POST /api/concerns` - Submit concern (public)
- `GET /api/concerns` - List concerns (staff only)
- `PATCH /api/concerns/{id}/status` - Update status

## New Pages

| Page | URL |
|------|-----|
| Friends & Family | `/family-friends` |

## Credentials
- Admin: admin@veteran.dbty.co.uk / ChangeThisPassword123!

## Completed This Session
- [x] BACP-aligned weighted safeguarding scoring
- [x] Addiction and offending behaviour detection
- [x] Self-care and sleep change detection
- [x] Pride/stigma barrier detection
- [x] Friends & Family page with Raise a Concern
- [x] Signs to Look For education
- [x] Support services (Op Courage, Men's Sheds, etc.)
- [x] Armed Forces Covenant info
- [x] Concern API endpoints
- [x] Feature list documentation
- [x] Deployment instructions

## Completed (Feb 18, 2026)
- [x] **Safeguarding Sensitivity Adjustment**: Raised AMBER threshold to 80+ (was 60), RED threshold to 120+. Modal now only triggers on RED level.
- [x] **Back Button in Safeguarding Modal**: Added "Go Back" button in the callback request view so users aren't stuck.
- [x] **Live Chat Feature (P1)**: Complete real-time in-app chat between users and staff
  - New `/live-chat` page with staff info, secure connection banner, message UI
  - Backend API: `POST /api/live-chat/rooms`, `GET/POST /api/live-chat/rooms/{id}/messages`, `POST /api/live-chat/rooms/{id}/end`
  - Integration with safeguarding flow - "Connect Now" navigates to live chat
- [x] **Splash Screen Button Update**: Changed "No, I'll explore the app" to "I'm ok, take me to the app"
- [x] **Substance & Alcohol Support Section**: New section in Friends & Family page with resources:
  - Tom Harrison House (veteran-specific rehab)
  - Change Grow Live, Alcoholics Anonymous, FRANK, Drinkline, We Are With You
- [x] **Criminal Justice Support Section**: New section in Friends & Family page with resources:
  - NACRO, Forces in Mind Trust, Walking With The Wounded
  - Project Nova, Probation Services, Veterans' Gateway
- [x] **Live Chat Handover Flow Enhancement**: 
  - Staff are NO LONGER auto-assigned - all available staff (counsellors AND peer supporters) see live chat alerts
  - New `/api/live-chat/rooms/{id}/join` endpoint for staff to claim chats
  - Staff portal updated with "Join Chat" button that properly assigns staff member
  - User sees "Waiting for support team member to join..." while waiting
  - When staff joins, user's UI updates to show staff member name
- [x] **Live Chat Close Button Fix**: Fixed bug where Close button (X) did nothing on web
  - Root cause: React Native Web's Alert.alert() is stubbed (does nothing)
  - Solution: Platform-specific handling - window.confirm() for web, Alert.alert() for mobile

## New API Endpoints (Feb 2026)

### Live Chat
- `POST /api/live-chat/rooms` - Create chat room (staff_id/staff_name now optional)
- `GET /api/live-chat/rooms/{id}` - Get room details (NEW - for polling staff assignment)
- `POST /api/live-chat/rooms/{id}/join` - Staff joins chat (NEW - requires auth)
- `GET /api/live-chat/rooms/{id}/messages` - Get messages (public)
- `POST /api/live-chat/rooms/{id}/messages` - Send message (public)
- `POST /api/live-chat/rooms/{id}/end` - End chat session (public)
- `GET /api/live-chat/rooms` - List active rooms (staff only)

## New Pages (Feb 2026)

| Page | URL | Description |
|------|-----|-------------|
| Live Chat | `/live-chat` | Real-time chat with staff member |

## Upcoming Tasks
- Add Concerns section to Staff Portal
- LMS course setup in WordPress/Tutor
- Push notifications for safeguarding alerts
- Training Portal API endpoint for WordPress/Tutor LMS integration
- Persistent AI Chat History for logged-in users

## Future Tasks
- Grounding techniques page
- Local mental health team finder
- In-App Human-to-Human Chat (non-crisis)
- Favorites/Saved Contacts
- Privacy Policy & Terms pages
- VoIP/PBX Integration
- Achievement Badges
- Referral System
