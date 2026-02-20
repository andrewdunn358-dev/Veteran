# UK Veterans Support App - Product Requirements Document

## Original Problem Statement
Build and enhance a mobile-first web application for UK military veterans providing crisis support, counselling, peer support, callback request functionality, and AI-powered companionship with comprehensive BACP-aligned safeguarding.

## What's Been Implemented (Feb 2026)

### NEW: Substance Misuse Advice Section (Feb 20, 2026)
**Purpose**: Dedicated home page section for alcohol and substance support for veterans
- **Home Page Card** - "Alcohol & Substance Support" with amber styling, links to /substance-support
- **Overview Section** - "You're Not Alone" hero, quick call buttons for Combat Stress & AA
- **Why Veterans at Higher Risk** - 6 risk factors (PTSD, sleep, drinking culture, civilian adjustment, injuries, loss of identity)
- **Featured Resource** - Tom Harrison House (UK's only veteran-specific residential rehab)
- **Resources Section** - Veteran-specific (Tom Harrison, Combat Stress, Op Courage, Veterans' Gateway) + General UK (AA, Drinkline, FRANK, Change Grow Live)
- **Self-Help Guide** - 6 practical tips (Track intake, Identify triggers, Talk to someone, Build routines, Set goals, Avoid temptation)
- **Warning Signs** - 8 indicators with checklist format, Take Action card with Veterans' Gateway, Samaritans info

**Files Added:**
- `/app/frontend/app/substance-support.tsx` - Full substance support page with 4 sub-sections

**Files Modified:**
- `/app/frontend/app/home.tsx` - Added "Alcohol & Substance Support" navigation card

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

## Completed (Feb 19, 2026)

### WebRTC In-App Calling (P0)
- [x] **SIP to WebRTC Migration** - Replaced complex SIP/PBX stack with free, serverless WebRTC solution
- [x] **Socket.IO Signaling Server** - Backend signaling at `/api/socket.io` for WebRTC handshakes
- [x] **Mobile App Calling UI** - WebRTC call modal with connecting, ringing, connected states, call timer
- [x] **Staff Portal WebRTC Phone** - Real-time phone widget for receiving calls
- [x] **Fallback Handling** - If staff has no `user_id`, shows dialog offering to call phone instead
- [x] **Caller Registration** - App users auto-register with signaling server before calling

**Technical Details:**
- Uses Google STUN servers for NAT traversal (free)
- Socket.IO path: `/api/socket.io` (routed through K8s ingress)
- React Native Web Alert.alert fix: Uses `window.confirm()` on web platform
- Staff must have `user_id` linked to receive WebRTC calls

**Files Created/Modified:**
- `/app/backend/webrtc_signaling.py` - Socket.IO signaling events
- `/app/frontend/hooks/useWebRTCCallWeb.ts` - React hook for WebRTC
- `/app/frontend/app/peer-support.tsx` - Added WebRTC call initiation
- `/app/frontend/app/crisis-support.tsx` - Added WebRTC call initiation
- `/app/staff-portal/webrtc-phone.js` - Staff portal phone widget
- `/app/staff-portal/webrtc-phone.css` - Phone styles

**Important Note:** Most existing staff profiles have `user_id: null`. WebRTC only works for staff with linked user accounts. Use Admin Portal → Staff tab to manage profiles.

### Staff Management System Overhaul
- [x] **Unified Staff Management** - Replaced separate Counsellors/Peers/Users tabs with single "Staff" tab
- [x] **Auto-Profile Creation** - When creating a user with role 'counsellor' or 'peer', profile is auto-created
- [x] **Fix Missing Profiles** - One-click button to create profiles for existing users without one
- [x] **Filter by Role** - Filter staff list by All/Admins/Counsellors/Peers
- [x] **Unified View** - See email, name, role, status, and profile details in one card
- [x] **In-Place Actions** - Edit profile, change status, reset password, delete - all from one place

**New API Endpoints:**
- `GET /api/admin/unified-staff` - Get all staff with linked profile data
- `POST /api/admin/fix-missing-profiles` - Create missing profiles for unlinked users

**Updated API:**
- `POST /api/auth/register` - Now accepts optional profile fields (phone, specialization, area, etc.) and auto-creates profile

### P0: VoIP Extension Management (Admin UI)
- [x] Added "VoIP" tab to Admin Dashboard
- [x] View all Counsellors and Peer Supporters in one list
- [x] "Assign Extension" button opens modal to input extension number and password
- [x] "Remove SIP" button revokes extension from staff
- [x] Extensions encrypted before storing in database
- [x] Info card shows available extensions on FusionPBX server

**API Endpoints:**
- `GET /api/admin/sip-extensions` - List all staff with SIP assignments
- `PATCH /api/admin/counsellors/{id}/sip` - Assign SIP extension to counsellor
- `PATCH /api/admin/peer-supporters/{id}/sip` - Assign SIP extension to peer supporter
- `DELETE /api/admin/counsellors/{id}/sip` - Remove SIP extension from counsellor
- `DELETE /api/admin/peer-supporters/{id}/sip` - Remove SIP extension from peer supporter

### P1: Data Migration Script (PII Encryption)
- [x] Created `/app/backend/scripts/migrate_encrypt_pii.py`
- [x] Encrypts all existing unencrypted PII in production database
- [x] Skips already-encrypted fields (prefixed with `ENC:`)
- [x] Shows migration progress and summary
- [x] Includes verification step after migration

**Collections Migrated:**
- counsellors, peer_supporters, callbacks, notes, safeguarding_alerts, concerns

### P2: Legal Disclaimer Modal (AI Chat)
- [x] Shows "Before We Begin" modal before AI chat starts
- [x] Sections: What This Chat Is, What This Chat Is NOT, Crisis Support, Privacy Notice
- [x] Crisis numbers: 999, Samaritans 116 123, Combat Stress 0800 138 1619
- [x] "Go Back" returns to previous page
- [x] "I Understand, Start Chat" starts the AI conversation
- [x] Chat only initiates AFTER user accepts disclaimer

**Files Modified:**
- `/app/frontend/app/admin.tsx` - Added VoIP tab and SIP management UI
- `/app/frontend/app/ai-chat.tsx` - Added legal disclaimer modal

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

## SIP/VoIP Integration (Proof of Concept - Feb 2026)

**Files Created:**
- `/app/staff-portal/sip-phone.js` - JsSIP integration for staff portal
- `/app/frontend/hooks/useSIPPhone.ts` - React hook for mobile app
- `/app/FREESWITCH_SETUP.md` - FreeSWITCH server setup guide

**How it works:**
1. Counsellor logs in → Auto-registers SIP extension
2. Status shown as "Online" in app
3. Veteran clicks "Call" → JsSIP initiates WebRTC call
4. Call connects → Voice through browser, no phone needed

**Requirements:**
- FreeSWITCH or Asterisk server (~£10/month VPS)
- SSL certificate for WSS
- Optional TURN server for NAT traversal

## Upcoming Tasks
- **P0: Test WebRTC E2E** - Log into staff portal, set status available, test call from app
- P1: Execute Data Migration Script - Encrypt existing PII in production database
- P2: Training Portal API Endpoint for WordPress/LearnDash integration
- P3: Implement "Calls" Tab in admin portal - real-time view of online staff and active calls
- P4: Add Legal Disclaimers to Staff Portal

## Known Issues
- Most existing staff profiles have `user_id: null` - WebRTC only works for newly created staff
- Call logs API returns 422 when phone is undefined - frontend has been patched to skip logging

## Future Tasks
- Grounding techniques page
- Local mental health team finder
- In-App Human-to-Human Chat (non-crisis)
- Favorites/Saved Contacts
- Privacy Policy & Terms pages
- Achievement Badges
- Referral System
