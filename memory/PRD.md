# Radio Check - UK Armed Forces Support App

## Original Problem Statement
Build and enhance a mobile-first web application for UK serving personnel and veterans with role-based portals, AI chatbots, safeguarding, and peer support features.

## What's Been Implemented (Updated 21 Feb 2026)

### Latest Session - Marketing Website (NEW)

#### Marketing Website for radiocheck.me
A standalone React website for promoting Radio Check, to be deployed at radiocheck.me.

**Location**: `/app/website/`

**Pages Created**:
- **Home** (`/`) - Hero section, features, CTA, emergency notice
- **About the App** (`/about`) - What Radio Check is and isn't, AI limitations
- **Meet the AI Team** (`/ai-team`) - All 6 AI companions with descriptions
- **Contact** (`/contact`) - Contact form, crisis numbers, location info
- **Legal** (`/legal`) - Terms of use, medical disclaimers, copyright
- **Privacy** (`/privacy`) - GDPR compliance, data handling, user rights

**Features**:
- Responsive design (mobile, tablet, desktop)
- Same color scheme as the app (navy blue, teal, green)
- Sponsor logos (Frankie's Pod, Standing Tall)
- Staff Portal login link
- Emergency numbers prominently displayed
- Built with React + Vite + Tailwind CSS

**Deployment**:
- Built files in `/app/website/dist/`
- `.htaccess` for Apache SPA routing
- See `/app/website/DEPLOYMENT.md` for 20i hosting instructions

---

### Latest Session - Comprehensive CMS

#### 1. Enhanced CMS System (Backend)
- **Pages API**: `/api/cms/pages` - CRUD for app pages
- **Sections API**: `/api/cms/sections` - CRUD for page sections
- **Cards API**: `/api/cms/cards` - CRUD for cards/items
- **Seed endpoint**: `/api/cms/seed` - Initialize default CMS data
- Supports: reordering, visibility toggle, custom metadata

#### 2. Admin CMS Interface (Frontend)
- Full page management (add/edit/delete)
- Section management with drag-to-reorder
- Card management (AI characters, tools, resources, links)
- "Initialize CMS" button to seed default data
- Legacy text content still supported

#### 3. Staff Calendar
- Peer Portal: "My Availability" card
- Admin Portal: "Rota" tab
- Removed from public peer-support page

#### 4. New AI Characters
- **Margie**: Alcohol & substance support
- **Hugo**: Self-help & wellness guru
- Added to Meet the AI Team (6 total)

#### 5. Supporter Logos
- Frankie's Pod (YouTube link)
- Standing Tall Foundation (website link)
- Added to splash screen

### CMS Data Structure
```
Pages → Sections → Cards
  └── slug, title, icon, nav_order
        └── section_type, title, order
              └── card_type, title, icon, route, etc.
```

### CMS Card Types
- `ai_character` - AI team members
- `tool` - Self-care tools
- `resource` - Support resources
- `organization` - Support organizations
- `link` - Generic links

### AI Characters (6 total)
- **Tommy**: Your battle buddy
- **Doris**: Warm support
- **Bob**: Ex-Para peer support
- **Finch**: Crisis & PTSD support
- **Margie**: Alcohol & substance help
- **Hugo**: Self-help & wellness
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

### ✅ Family & Friends Dark Mode (FIXED)
- Page now uses dynamic styles with ThemeContext
- All colors respond to light/dark mode

### ✅ Buddy Finder Frontend (COMPLETE)
- GDPR consent form with checkbox
- Profile browsing interface with filters
- Search by region and service branch

### AI Profile Cards for Other Characters
- Add AI profile cards to ai-chat.tsx (Tommy/Doris)
- Add AI profile cards to sentry-chat.tsx (Finch)

### Security Fix Applied
- Removed exposed OpenAI API key from backend/.env
- Key must be added separately in deployment environment

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
