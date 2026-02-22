# Radio Check - UK Armed Forces Support App

## Original Problem Statement
Build and enhance a mobile-first web application for UK serving personnel and veterans with role-based portals, AI chatbots, safeguarding, and peer support features.

## What's Been Implemented

### Session - 22 Feb 2026: CMS Integration Complete

**CMS Integration for Dynamic Content**

Created reusable CMS hook and connected key app pages:

1. **New Hook**: `/app/frontend/src/hooks/useCMSContent.ts`
   - `useCMSContent(pageSlug)` - Fetches CMS page with sections and cards
   - `getSection(sections, sectionType)` - Helper to find specific section
   - Handles loading states, errors, and graceful fallback

2. **Updated Pages**:
   - `home.tsx` - AI Team section now fetches from CMS (`ai_team` section)
   - `self-care.tsx` - Tools grid now fetches from CMS (`cards` section)

3. **CMS Seeded** with default content via `/api/cms/seed`:
   - Home page: 6 AI character cards
   - Self-care page: 6 tool cards

4. **Fallback System**: All pages have hardcoded fallback data so the app works even if CMS is empty or API fails

**API Endpoints Used**:
- `GET /api/cms/pages` - List all CMS pages
- `GET /api/cms/pages/{slug}` - Get page with sections and cards
- `POST /api/cms/seed` - Seed default content (admin only)

### Session - 21 Feb 2026: Calendar/Availability Bug Fixed

**Bug Fixed: Calendar not saving shifts in mobile app**
- Changed `authToken` → `auth_token` (matching AuthContext)
- Changed `userId`/`userName` → reading from `auth_user` JSON
- Changed `peer_supporter_id` → `staff_id` (matching backend)

**New Feature: Calendar in Staff Portal**
- Added calendar/availability management to `/app/staff-portal/`

---

## Test Credentials
- Staff: `sarahm.counsellor@radiocheck.me` / `RadioCheck2026!`
- Admin: `admin@veteran.dbty.co.uk` / `ChangeThisPassword123!`

## Key Files Reference

### CMS Integration
- `/app/frontend/src/hooks/useCMSContent.ts` - CMS data fetching hook
- `/app/frontend/app/home.tsx` - Home page with CMS AI team
- `/app/frontend/app/self-care.tsx` - Self-care page with CMS tools

### Mobile App (React Native/Expo)
- `/app/frontend/app/my-availability.tsx` - Availability calendar screen
- `/app/frontend/app/peer-portal.tsx` - Peer supporter portal
- `/app/frontend/src/context/AuthContext.tsx` - Auth storage

### Web Portals (Static HTML/JS)  
- `/app/staff-portal/` - Staff dashboard with calendar
- `/app/admin-site/` - Admin dashboard

### Backend
- `/app/backend/server.py` - FastAPI server
- CMS API: `/api/cms/pages`, `/api/cms/sections`, `/api/cms/cards`
- Shifts API: `/api/shifts`

## Upcoming Tasks

1. **P1 - Buddy Finder Frontend**: Wire up form to backend APIs
2. **P2 - Generate Contact CSV**: Run script for export
3. **P2 - Email Notifications**: Set up for rota shifts
4. **P2 - Connect more pages to CMS**: organizations, family-friends, etc.

## Deployment Notes
Changes made in preview environment. User needs to:
1. Push code to Git
2. Redeploy app.radiocheck.me
3. Redeploy radiocheck.me/staff-portal
