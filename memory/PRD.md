# Radio Check - UK Veterans Support App

## Original Problem Statement
Build and enhance a mobile-first web application for UK military veterans. The application includes role-based portals (Admin, Counsellor, Peer Supporter), a staff notes system, a callback/panic system, and AI chatbots. Key features include a full-featured live chat system, a side-by-side staff dashboard, significant security hardening with field-level encryption, an AI safety layer, and in-app voice calling.

## Core Requirements

### 1. Callback/Panic System
A system for users to request callbacks and for peer supporters to signal a crisis to counsellors.
**Status**: ✅ Completed

### 2. Role-Based Portals
Dedicated portals for Counsellors and Peer Supporters, plus a separate portal for Admins.
**Status**: ✅ Completed

### 3. Staff Notes System
A GDPR-compliant system for counsellors and peers to create and share notes.
**Status**: ✅ Completed

### 4. AI Chatbot ("Battle Buddies")
An anonymous AI chatbot with advanced, professional-grade safeguarding.
**Status**: ✅ Completed (Tommy & Doris with enhanced squaddie banter)

### 5. Live Chat Handover
A system for users to be handed over from the AI to a live chat with any available human supporter.
**Status**: ✅ Completed

### 6. Field-Level Encryption
All Personally Identifiable Information (PII) must be encrypted at rest in the database.
**Status**: ✅ Completed

### 7. In-App Calling (WebRTC)
A free, serverless (P2P) system for users and staff to make voice calls within the app.
**Status**: ✅ Blocker Fixed - All staff now have user_id for WebRTC signaling

### 8. Substance Misuse Section
A dedicated section on the home page for advice on alcohol and substance misuse.
**Status**: ✅ Completed

### 9. Self-Help & Gamification
Grounding Techniques, local support finder, Breathing Challenge, and Buddy Finder.
**Status**: ✅ Completed

### 10. Human-to-Human Chat
A real-time messaging feature for users to chat with staff.
**Status**: ✅ Completed

### 11. Warfare on Lawfare Section
A section with a specialized AI ("Sentry") to provide informational support for veterans facing legal investigations.
**Status**: ✅ Completed

### 12. AI Chat Persistence
A system using email and a 4-digit PIN to save and restore AI chat conversations on the user's device.
**Status**: ✅ Completed

### 13. Regimental Associations Directory
A searchable page listing UK military associations with contact details.
**Status**: ✅ Completed (35 associations with search/filter)

---

## What's Been Implemented (Session: Feb 2026)

### Completed This Session:
1. **Fixed Sentry AI Connection** - Changed API endpoint from non-existent `/api/ai/chat` to working `/api/ai-buddies/chat`
2. **Added Sentry to Backend AI Characters** - Sentry now has proper system prompt in backend
3. **Enhanced Tommy & Doris Squaddie Banter** - Updated prompts with more British military slang and banter expressions
4. **Created Regimental Associations Page** - 35 associations searchable/filterable by service (Navy/Army/RAF)
5. **Added Regimental Associations to Home Screen** - Medal icon button in Self-Care Tools section

---

## Known Issues (Prioritized)

### P0 - CRITICAL
- ~~**WebRTC Blocker**: Staff profiles missing `user_id` field.~~ **FIXED** - Created endpoint and linked all staff

### P1 - HIGH  
- **WebRTC call connection/hangup** - Now unblocked and ready for end-to-end testing

### P2 - MEDIUM
- **Stale user data** ("Barry Gib") in production - User action pending

---

## Upcoming Tasks

### P1
- Training Portal API Endpoint for WordPress/LearnDash

### P2
- Legal disclaimers for staff portal
- Privacy Policy & Terms of Service pages

### Future/Backlog
- Achievement Badges system
- Referral System

---

## Code Architecture

```
/app
├── backend/
│   ├── server.py              # Main API with AI prompts (Tommy, Doris, Sentry)
│   ├── encryption.py          # Field-level encryption
│   └── safety.py              # Safeguarding/safety layer
├── frontend/
│   └── app/
│       ├── home.tsx           # Home screen with tools
│       ├── ai-chat.tsx        # Tommy & Doris chat
│       ├── sentry-chat.tsx    # Sentry legal support chat
│       ├── regimental-associations.tsx  # NEW: Associations directory
│       ├── buddy-finder.tsx   # Regiment finder
│       └── historical-investigations.tsx # Warfare on Lawfare
├── staff-portal/              # Vanilla JS staff dashboard
│   ├── app.js
│   ├── index.html
│   ├── webrtc-phone.js
│   └── webrtc-phone.css
└── admin-site/                # Admin portal
```

---

## Tech Stack
- **Frontend**: React Native, Expo, Expo Router, TypeScript
- **Backend**: Python, FastAPI
- **Database**: MongoDB
- **Real-time**: WebRTC (calling), Socket.IO (signaling/chat)
- **AI**: OpenAI GPT

---

## Credentials (Test Accounts)
- **Admin**: `admin@veteran.dbty.co.uk` / `ChangeThisPassword123!`
- **Peer Supporter**: `kev@radiocheck.me` / `AS90155mm`
