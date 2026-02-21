# Radio Check - UK Armed Forces Support App

## Original Problem Statement
Build and enhance a mobile-first web application for UK serving personnel and veterans with role-based portals, AI chatbots, safeguarding, and peer support features.

## What's Been Implemented (Updated 21 Feb 2026)

### Latest Session Updates

#### 1. New AI Characters Added
- **Margie**: Alcohol & substance misuse support AI
- **Hugo**: Self-help & wellness guru AI
- Both have safeguarding capabilities and friendly bios
- Margie added to substance-support.tsx page
- Hugo added to self-care.tsx as first card option

#### 2. Supporter Logos on Splash Screen
- Added Frankie's Pod logo (links to YouTube)
- Added Standing Tall Foundation logo (links to website)
- "Proudly supported by" section at bottom of splash screen

#### 3. Staff Calendar/Availability (Frontend Added)
- Created `/app/frontend/app/my-availability.tsx`
- Calendar view for volunteers to log shifts
- Added "My Availability" button on peer-support.tsx
- Integrates with existing `/api/shifts` endpoints
- Requires authentication to add shifts

#### 4. Terminology Updated
- Changed "veterans" to "serving personnel and veterans" throughout
- Updated family-friends.tsx, substance-support.tsx, organizations.tsx, self-care.tsx
- UK English grammar corrected across pages

#### 5. Bob AI Prompt Fixed (Previous Session)
- Removed repetitive "Alright mate, Bob here" intro
- Added instruction to never introduce himself - just respond naturally
- Updated welcome message in bob-chat.tsx

#### 6. Shift/Rota System (Backend Complete)
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

### AI Characters (6 total)
- **Tommy**: Friendly conversational support
- **Doris**: Friendly conversational support
- **Bob**: Ex-Para peer support, banter and guidance
- **Finch/Sentry**: PTSD and mental health crisis support
- **Margie** (NEW): Alcohol & substance misuse support
- **Hugo** (NEW): Self-help & wellness guru

### Self-Care Tools (9 tools)
- Chat with Hugo (NEW)
- My Journal
- Daily Check-in
- Grounding Tools
- Breathing Exercises
- Buddy Finder
- Regimental Associations (NEW)
- Find Local Support
- Resources Library

### Core Features (Complete)
- AI Battle Buddies: Tommy, Doris, Bob, Finch, Margie, Hugo - all with safeguarding
- Safeguarding System: Detects crisis messages, creates alerts
- Role-Based Portals: Admin, Counsellor, Peer Supporter
- Staff Notes System: GDPR-compliant
- WebRTC Calling: Fixed user_id blocker
- Field-Level Encryption: PII encrypted at rest
- Regimental Associations: 35+ associations searchable
- Staff Calendar: Volunteers can log availability (my-availability.tsx)
- Substance Support: Dedicated page with Margie AI

## Key Files Reference

### Backend
- `/app/backend/server.py` - All API endpoints including Shift, Buddy Finder, and AI endpoints

### Frontend
- `/app/frontend/app/margie-chat.tsx` - Margie AI for alcohol/substance support (NEW)
- `/app/frontend/app/hugo-chat.tsx` - Hugo AI for self-help/wellness (NEW)
- `/app/frontend/app/my-availability.tsx` - Staff calendar/shifts (NEW)
- `/app/frontend/app/substance-support.tsx` - Alcohol & substance resources with Margie
- `/app/frontend/app/buddy-finder.tsx` - Buddy Finder with GDPR signup
- `/app/frontend/app/bob-chat.tsx` - Bob with AI profile card
- `/app/frontend/app/home.tsx` - Meet the AI Team with toggle
- `/app/frontend/app/self-care.tsx` - Self-care tools grid
- `/app/frontend/app/index.tsx` - Splash screen with supporter logos

## Pending/TODO

### Family & Friends Dark Mode Fix
- Page has hardcoded styles that don't respond to dark mode
- Need to refactor to use ThemeContext colors

### Buddy Finder Frontend
- GDPR consent form needs completion
- Profile browsing interface

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
