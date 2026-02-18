# UK Veterans Support App - Product Requirements Document

## Original Problem Statement
Build and enhance a mobile-first web application for UK military veterans providing crisis support, counselling, peer support, callback request functionality, and AI-powered companionship with comprehensive BACP-aligned safeguarding.

## What's Been Implemented (Feb 2026)

### NEW: Friends & Family Section
**Purpose**: Support for concerned loved ones
- **Raise a Concern form** - Family/friends can report worries
- **Signs to Look For** - Education on warning signs
- **Support Services** - Op Courage, Combat Stress, Men's Sheds, SSAFA, RBL
- **Armed Forces Covenant** info

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
| `staff-portal-safeguarding.zip` | `/app/staff-portal/` | Upload to 20i hosting |
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

## New API Endpoints (Feb 2026)

### Live Chat
- `POST /api/live-chat/rooms` - Create chat room (public)
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
