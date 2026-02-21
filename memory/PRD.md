# Radio Check - UK Armed Forces Support App

## Original Problem Statement
Build and enhance a mobile-first web application for UK serving personnel and veterans with role-based portals, AI chatbots, safeguarding, and peer support features.

## What's Been Implemented (Updated 21 Feb 2026)

### Latest Session - Bug Fixes (21 Feb 2026)

#### Splash Screen Text Readability Fix
Fixed the readability of emergency notice and supporter text on the splash screen:
- **Emergency text** ("In an emergency, always call 999"): Changed from `#94a3b8` to `#ffffff` (white), added `fontWeight: '500'`
- **Shield icon**: Changed from `#94a3b8` to `#ffffff` (white)
- **Supporters label** ("Proudly supported by"): Changed from `#64748b` to `#cbd5e1` (light gray)

**File modified**: `/app/frontend/app/index.tsx`

#### External URL Cleanup
Removed hardcoded external URL fallbacks from multiple files:
- `/app/frontend/app/admin.tsx`: Removed `https://buddy-finder-dev.preview.emergentagent.com` fallback
- `/app/frontend/app/callback.tsx`: Removed `https://buddy-finder-dev.preview.emergentagent.com` fallback
- `/app/admin-site/app.js`: Changed external logo URL to local `logo.png`

**Local assets added**:
- `/app/admin-site/logo.png` - Copied from frontend assets
- `/app/staff-portal/logo.png` - Copied from frontend assets

### Marketing Website (21 Feb 2026)

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

### Dark/Light Mode Fixes (21 Feb 2026)
Fixed the global HTML wrapper (`+html.tsx`) that was forcing dark background:
- Added CSS variables for theme-aware backgrounds
- Added JavaScript to sync HTML class with saved theme
- Updated ThemeContext to sync with document class on theme change

Fixed 4 pages that were stuck in dark mode:
- `/app/frontend/app/crisis-support.tsx` - Completely rewritten with theme support
- `/app/frontend/app/peer-support.tsx` - Added theme support
- `/app/frontend/app/historical-investigations.tsx` - Fully rewritten with theme
- `/app/frontend/app/organizations.tsx` - Fully rewritten with theme

New page created:
- `/app/frontend/app/counsellors.tsx` - Dedicated page for viewing on-duty counsellors

### Crisis Support Page Restructure (21 Feb 2026)
- Samaritans moved above Combat Stress
- "On-Duty Counsellors" is now a clickable card that navigates to `/counsellors`
- Simplified layout matching peer-support page pattern

### Logo Update (21 Feb 2026)
Updated to new transparent background logo across all locations.

**Deployment**:
- Built files in `/app/website/dist/`
- `.htaccess` for Apache SPA routing
- See `/app/website/DEPLOYMENT.md` for 20i hosting instructions

---

### CMS System (Backend)
- **Pages API**: `/api/cms/pages` - CRUD for app pages
- **Sections API**: `/api/cms/sections` - CRUD for page sections
- **Cards API**: `/api/cms/cards` - CRUD for cards/items
- **Seed endpoint**: `/api/cms/seed` - Initialize default CMS data
- Supports: reordering, visibility toggle, custom metadata

### Admin CMS Interface (Frontend)
- Full page management (add/edit/delete)
- Section management with drag-to-reorder
- Card management (AI characters, tools, resources, links)
- "Initialize CMS" button to seed default data
- Legacy text content still supported

### Staff Calendar
- Peer Portal: "My Availability" card
- Admin Portal: "Rota" tab
- Removed from public peer-support page

### AI Characters (6 total)
- **Tommy**: Friendly conversational support
- **Doris**: Friendly conversational support
- **Bob**: Ex-Para peer support, banter and guidance
- **Finch/Sentry**: PTSD and mental health crisis support
- **Margie**: Alcohol & substance misuse support
- **Hugo**: Self-help & wellness guru

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

## Known Issues

### External Image URLs Still Present (P2)
The following files still reference external image URLs (emergentagent.com) for AI avatars:
- `/app/frontend/app/bob-chat.tsx`
- `/app/frontend/app/crisis-support.tsx`
- `/app/frontend/app/historical-investigations.tsx`
- `/app/frontend/app/home.tsx`
- `/app/frontend/app/hugo-chat.tsx`
- `/app/frontend/app/margie-chat.tsx`
- `/app/frontend/app/peer-support.tsx`
- `/app/frontend/app/self-care.tsx`
- `/app/frontend/app/sentry-chat.tsx`
- `/app/frontend/app/substance-support.tsx`

These work but should ideally be replaced with local assets in `/app/frontend/assets/images/`.

### CMS Not Functional (P1)
The CMS backend and admin UI exist, but app pages still use hardcoded content instead of fetching from CMS APIs. Pages that need to be refactored:
- `home.tsx`
- `self-care.tsx`
- `support-organisations.tsx`

## Upcoming Tasks

### P1 - Make CMS Fully Dynamic
Refactor all relevant frontend pages to fetch content from the CMS APIs.

### P1 - Complete Buddy Finder Frontend
Wire up the `buddy-finder.tsx` form to the backend APIs.

### P2 - Implement Email Notifications for Rota
Set up an email service to send notifications for peer support shifts.

### P2 - Generate Contact CSV
Run the script to generate contacts CSV (forgotten from previous session).

## Future Tasks

### Refactor - Modularize Backend
Decompose the monolithic `server.py` into a structured architecture.

### Refactor - Reusable AI Chat Component
Abstract the duplicated chat UI into a single, reusable React component.

## Key Files Reference

### Backend
- `/app/backend/server.py` - All API endpoints including Shift, Buddy Finder, and AI endpoints

### Frontend
- `/app/frontend/app/index.tsx` - Splash screen (text readability fixed)
- `/app/frontend/app/admin.tsx` - Admin dashboard (URL cleanup)
- `/app/frontend/app/callback.tsx` - Callback request (URL cleanup)
- `/app/frontend/app/margie-chat.tsx` - Margie AI for alcohol/substance support
- `/app/frontend/app/hugo-chat.tsx` - Hugo AI for self-help/wellness
- `/app/frontend/app/my-availability.tsx` - Staff calendar/shifts
- `/app/frontend/app/substance-support.tsx` - Alcohol & substance resources with Margie
- `/app/frontend/app/buddy-finder.tsx` - Buddy Finder with GDPR signup
- `/app/frontend/app/bob-chat.tsx` - Bob with AI profile card
- `/app/frontend/app/home.tsx` - Meet the AI Team with toggle
- `/app/frontend/app/self-care.tsx` - Self-care tools grid

### Admin/Staff Sites
- `/app/admin-site/app.js` - Admin site JS (logo localized)
- `/app/admin-site/logo.png` - Local logo asset
- `/app/staff-portal/logo.png` - Local logo asset

### Website
- `/app/website/` - Marketing website directory
- `/app/website/dist/` - Built website for deployment
- `/app/website/DEPLOYMENT.md` - Deployment instructions

## Test Credentials
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
