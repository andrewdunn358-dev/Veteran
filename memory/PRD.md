# Radio Check - Product Requirements Document

## Project Overview
**Radio Check** is a mental health and peer support application for veterans, featuring:
- React Native mobile app (Expo)
- Python FastAPI backend
- MongoDB database
- Static HTML admin and staff portals

## Core Features

### User-Facing (Mobile App)
- User authentication (JWT)
- 7 AI chat personas with crisis detection (Tommy, Sarah, Marcus, Hugo, Donna, Amy, Rita)
- Staff availability calendar
- Buddy Finder with peer matching and messaging
- Message inbox
- Educational resources
- Crisis/panic button (SOS)

### Admin Portal
- Visual CMS Editor (WYSIWYG) - edit app content via phone preview
- Logs & Analytics dashboard with Chart.js visualizations
- Staff management (unified view)
- Safeguarding alerts management
- Prompt improvement workflow

### Staff Portal
- Shift calendar and rota management
- Callback queue
- Live chat rooms
- Case notes

## Technical Architecture

### Backend Structure (Modularized)
```
/app/backend/
├── server.py                    # Main entry + AI chat logic
├── routers/                     # 15 modular API routers
│   ├── auth.py                  # Authentication + push tokens
│   ├── cms.py                   # Content Management System
│   ├── shifts.py                # Staff scheduling
│   ├── buddy_finder.py          # Peer matching
│   ├── staff.py                 # Counsellors/Peers
│   ├── organizations.py         # Support orgs
│   ├── resources.py             # Educational materials
│   ├── safeguarding.py          # Alerts management
│   ├── callbacks.py             # Callback requests
│   ├── live_chat.py             # Chat rooms
│   ├── notes.py                 # Staff notes
│   ├── concerns.py              # Family concerns
│   ├── message_queue.py         # NEW: Offline messaging
│   ├── ai_feedback.py           # NEW: AI feedback system
│   └── knowledge_base.py        # NEW: RAG for AI
├── models/schemas.py            # Centralized Pydantic models
└── services/database.py         # DB utilities
```

### Key Integrations
- **OpenAI GPT-4**: AI chat personas (user-provided key)
- **Resend**: Email notifications (user-provided key)
- **Expo Push**: Mobile notifications (implemented)
- **Metered.ca**: WebRTC TURN servers (not yet implemented)

## Completed Work (Feb 22, 2026)

### P0 - Backend Modularization ✅
- Created 15 modular routers in `/app/backend/routers/`
- All endpoints properly integrated in server.py
- Architecture documentation at `/app/backend/ARCHITECTURE.md`

### P1 - Push Notifications ✅
- Token registration: `POST /api/auth/push-token`
- Token removal: `DELETE /api/auth/push-token`
- Integrated with Expo Push Notifications API
- Connected to shift notifications

### P1 - Offline Message Queue ✅
- Message queuing: `POST /api/message-queue/queue`
- Pending retrieval: `GET /api/message-queue/pending/{user_id}`
- Online/offline status tracking
- Push notification delivery attempts

### P1 - AI Feedback System ✅
- Thumbs up/down: `POST /api/ai-feedback/thumbs`
- Detailed feedback: `POST /api/ai-feedback/submit`
- Report issues: `POST /api/ai-feedback/report`
- Character analytics: `GET /api/ai-feedback/character/{name}`
- Improvement suggestions: `GET /api/ai-feedback/improvements/{name}`

### P1 - Knowledge Base (RAG) ✅
- Entry management: CRUD at `/api/knowledge-base/entries`
- Semantic search: `POST /api/knowledge-base/search`
- AI context retrieval: `GET /api/knowledge-base/context/{query}`
- Seeded with 11 UK veteran-specific entries

### Admin Portal Enhancements (Previous Session)
- WYSIWYG CMS editor with phone preview
- Analytics dashboard with Chart.js
- Deployment guides created

## Production Deployment

### Backend
- Hosted on Render
- URL: `https://veterans-support-api.onrender.com`
- OpenAI and Resend keys configured as env vars

### Admin Portal (Static)
- User-deployed
- Must be manually updated with new files
- See `/app/admin-site/DEPLOYMENT_GUIDE.md`

### Staff Portal (Static)
- User-deployed
- Same deployment process as admin portal

## Remaining/Future Tasks

### Not Started
- [ ] WebRTC peer-to-peer audio calls (Metered.ca)
- [ ] Reusable AI chat component in mobile app
- [ ] Production admin portal deployment (user responsibility)

### Technical Debt
- [ ] Remove duplicate auth endpoints (modular vs server.py)
- [ ] Add comprehensive test coverage

## Key Credentials
- **Admin Login**: admin@veteran.dbty.co.uk / ChangeThisPassword123!
- **MongoDB**: Local via MONGO_URL env var
- **OpenAI/Resend**: User-provided production keys

## Important Notes
1. Admin portal changes require manual deployment by user
2. OpenAI key is user-managed - check billing if AI fails
3. Knowledge base can be expanded via admin portal or API
4. All 15 backend routers are now active and tested
