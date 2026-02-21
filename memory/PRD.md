# Radio Check - UK Veterans Support App

## Original Problem Statement
Build and enhance a mobile-first web application for UK military veterans with role-based portals, AI chatbots, safeguarding, and peer support features.

## What's Been Implemented (Updated 21 Feb 2026)

### Latest Session Updates

#### 1. Bob AI Prompt Fixed
- Removed repetitive "Alright mate, Bob here" intro
- Added instruction to never introduce himself - just respond naturally
- Updated welcome message in bob-chat.tsx

#### 2. Shift/Rota System (Backend Complete)
New endpoints for peer supporter availability management:
- `GET /api/shifts` - Get all shifts
- `GET /api/shifts/today` - Get today's shifts (for "Someone on the net" status)
- `GET /api/shifts/my-shifts` - Staff member's own shifts
- `POST /api/shifts` - Create a shift (peer, counsellor, or admin)
- `PUT /api/shifts/{id}` - Update a shift
- `DELETE /api/shifts/{id}` - Cancel a shift
- `GET /api/shifts/coverage` - Admin coverage report

#### 3. Buddy Finder with GDPR (Backend Complete)
GDPR-compliant veteran networking:
- `POST /api/buddy-finder/signup` - Create profile (requires GDPR consent)
- `GET /api/buddy-finder/profiles` - Search profiles by region/branch
- `GET /api/buddy-finder/profile/{id}` - View a profile
- `PUT /api/buddy-finder/profile/{id}` - Update profile
- `DELETE /api/buddy-finder/profile/{id}` - Delete profile (GDPR right to be forgotten)
- `POST /api/buddy-finder/message` - In-app messaging
- `GET /api/buddy-finder/messages/{id}` - Get messages
- `GET /api/buddy-finder/regions` - UK regions list
- `GET /api/buddy-finder/branches` - Service branches list

#### 4. AI Profile Cards Added
- Bob chat now shows AI profile card with avatar, name, role, and description below header
- Appears when conversation starts (messages <= 1)

#### 5. Meet the AI Team Toggle
- Home page "Meet the AI Team" now has Show/Hide button
- Team members collapsed by default, revealed on tap

### Self-Care Tools (8 tools)
- My Journal
- Daily Check-in
- Grounding Tools
- Breathing Exercises
- Buddy Finder (NEW)
- Regimental Associations (NEW)
- Find Local Support
- Resources Library

### Core Features (Complete)
- AI Battle Buddies: Tommy, Doris, Bob, Finch - all with safeguarding
- Safeguarding System: Detects crisis messages, creates alerts
- Role-Based Portals: Admin, Counsellor, Peer Supporter
- Staff Notes System: GDPR-compliant
- WebRTC Calling: Fixed user_id blocker
- Field-Level Encryption: PII encrypted at rest
- Regimental Associations: 35+ associations searchable

## Key Files Reference

### Backend
- `/app/backend/server.py` - All API endpoints including new Shift and Buddy Finder endpoints

### Frontend
- `/app/frontend/app/buddy-finder.tsx` - Buddy Finder with GDPR signup
- `/app/frontend/app/bob-chat.tsx` - Bob with AI profile card
- `/app/frontend/app/home.tsx` - Meet the AI Team with toggle
- `/app/frontend/app/self-care.tsx` - Self-care tools grid

## Pending/TODO

### Shift/Rota Frontend
- Create "My Availability" page in staff portal
- Calendar view for selecting dates/times
- Show "Someone is on the net" indicator on home page

### AI Profile Cards for Other Characters
- Add AI profile cards to ai-chat.tsx (Tommy/Doris)
- Add AI profile cards to sentry-chat.tsx (Finch)

### Test Credentials
- Admin: `admin@veteran.dbty.co.uk` / `ChangeThisPassword123!`
- Staff: `sarahm.counsellor@radiocheck.me` / `RadioCheck2026!`

## API Test Commands

### Shift/Rota
```bash
curl http://localhost:8001/api/shifts/today
```

### Buddy Finder
```bash
curl http://localhost:8001/api/buddy-finder/regions
curl http://localhost:8001/api/buddy-finder/branches
curl -X POST http://localhost:8001/api/buddy-finder/signup \
  -H "Content-Type: application/json" \
  -d '{"display_name":"TestVet","region":"London","service_branch":"British Army","gdpr_consent":true}'
```
