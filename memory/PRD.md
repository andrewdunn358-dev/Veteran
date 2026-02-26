# Radio Check - Mental Health & Peer Support for Veterans

## Original Problem Statement
Build "Radio Check," a mental health and peer support application for veterans. The project includes a React Native/Expo web app, Python FastAPI backend, and web portals (Admin, Staff). Key requirements include:
- Staff rota/calendar system with shift swap capabilities
- Content Management System (CMS) for app content editing
- Beta testing feedback survey system
- Compliance document generation as PDFs
- Multi-layered safeguarding system for user chat monitoring
- Push notifications, mood tracking, and core support features
- Distinct AI personas for peer support
- WebRTC and live chat for user-to-staff communication

## Current Architecture
```
/app
├── backend/
│   ├── server.py           # Main FastAPI app (monolithic, ~5700 lines)
│   ├── webrtc_signaling.py # Socket.IO signaling for WebRTC calls and chat
│   └── routes/             # Modularized route handlers
├── frontend/               # Expo/React Native web app
│   ├── app/                # App screens (home, chat, live-chat, peer-support)
│   └── hooks/              # useWebRTCCallWeb.ts for in-app calls
├── staff-portal/           # Static HTML/JS for staff (hosted on 20i)
│   ├── app.js              # Staff portal logic
│   ├── webrtc-phone.js     # WebRTC calling for staff
│   └── styles.css
└── admin-site/             # Static HTML admin portal (hosted on 20i)
```

## Hosting
- **Frontend App**: Vercel (auto-deploy from GitHub)
- **Backend**: Render (WebSocket-enabled)
- **Staff/Admin Portals**: 20i (manual upload)
- **Database**: MongoDB

## What's Been Implemented

### Session - February 26, 2025
- **WebRTC Audio Fix**: Added Metered.ca TURN servers to frontend and staff portal for NAT traversal
- **Live Chat Flow Fix**: Added Socket.IO event listeners for real-time chat requests:
  - Staff portal now receives `incoming_chat_request` when users click "Talk to Someone"
  - Staff can accept via `accept_chat_request` and join same room as user
  - Added visual banner UI for incoming chat requests

### Previous Sessions
- AI persona updates (Hugo as UK services navigator, Catherine avatar fixes)
- Vercel build fix (Expo SDK 55 upgrade)
- Safeguarding alert system with risk scoring
- Staff portal WebRTC phone integration
- Live chat modal for staff
- "Call User" and "Chat with User" buttons on safeguarding alerts
- Session timeout and activity tracking

## Known Issues

### P0 (Critical) - Under Testing
- ~~WebRTC audio not working~~ - Fixed with TURN servers (needs production testing)
- ~~Live chat not connecting~~ - Fixed Socket.IO flow (needs production testing)

### P1 (High Priority)
- Production CORS/500 error on `/api/surveys/status/` endpoint
- Safeguarding history shows incorrect character name (fix unverified)
- CMS Editor overhaul (paused)
- External callback phone integration (users leaving phone numbers)

### P2 (Medium Priority)
- Render cron job status unknown (shift reminders)
- Inconsistent admin user creation UI between platforms

## Upcoming Tasks (Prioritized)

### P1 - Next Sprint
1. Verify WebRTC and chat fixes on production
2. Fix CORS/500 error on surveys endpoint
3. External callback phone integration (Twilio/push notifications)
4. Migrate hardcoded AI personas to CMS
5. Push notifications implementation

### P2 - Backlog
1. Mood tracker journal feature
2. Visual page builder for CMS
3. Appointment booking system
4. Secure messaging
5. Achievement badges system
6. CBT courses integration
7. Welsh language support

## 3rd Party Integrations
- **OpenAI GPT-4**: AI chat personas
- **Resend**: Email notifications
- **Metered.ca**: TURN server for WebRTC (free tier)
- **Expo Push**: Infrastructure ready (not implemented)

## Test Credentials
- **Admin**: admin@veteran.dbty.co.uk / ChangeThisPassword123!
- **Staff**: sharon@radiocheck.me / ChangeThisPassword123!

## Deployment Process
1. **Frontend**: Push to GitHub → Vercel auto-deploys
2. **Backend**: Push to GitHub → Render auto-deploys
3. **Staff/Admin Portals**: Manual upload to 20i hosting:
   - `staff-portal/app.js`
   - `staff-portal/webrtc-phone.js`
   - `staff-portal/styles.css`
