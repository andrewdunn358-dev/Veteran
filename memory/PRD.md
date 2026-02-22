# Radio Check - UK Armed Forces Support App

## Original Problem Statement
Build and enhance a mobile-first web application for UK serving personnel and veterans with role-based portals, AI chatbots, safeguarding, and peer support features.

## What's Been Implemented

### Session - 21 Feb 2026: Calendar/Availability Bug Fix

**Bug Fixed: Calendar not saving shifts in mobile app**

Root cause identified and fixed:
1. **Wrong AsyncStorage key for auth token**: App was using `authToken` but AuthContext stores as `auth_token`
2. **Wrong AsyncStorage key for user info**: App was reading `userId`/`userName` separately but AuthContext stores user as JSON in `auth_user`
3. **Wrong field names**: Frontend used `peer_supporter_id` but backend returns `staff_id`

Files changed:
- `/app/frontend/app/my-availability.tsx` - Fixed storage key reads and field names
- `/app/staff-portal/app.js` - Added full calendar/availability feature with same field fixes

**New Feature: Calendar in Staff Portal**
Added complete calendar/availability management to the Staff Portal (`/app/staff-portal/`):
- Interactive calendar with month navigation
- View all staff shifts with color indicators
- Add/delete your own shifts via modal
- Legend showing "Your Shifts" (green) vs "Other Staff" (orange)

**Testing Results**: 100% pass rate (8/8 backend tests, frontend verified)

---

## Test Credentials
- Staff: `sarahm.counsellor@radiocheck.me` / `RadioCheck2026!`
- Admin: `admin@veteran.dbty.co.uk` / `ChangeThisPassword123!`

## Key Files Reference

### Mobile App (React Native/Expo)
- `/app/frontend/app/my-availability.tsx` - Availability calendar screen
- `/app/frontend/app/peer-portal.tsx` - Peer supporter portal
- `/app/frontend/src/context/AuthContext.tsx` - Auth storage (auth_token, auth_user)

### Web Portals (Static HTML/JS)  
- `/app/staff-portal/` - Staff dashboard with new calendar
- `/app/admin-site/` - Admin dashboard

### Backend
- `/app/backend/server.py` - FastAPI server
- Shifts API: GET/POST/DELETE `/api/shifts`

## Upcoming Tasks

1. **P1 - Make CMS Fully Dynamic**: Connect app pages to CMS APIs
2. **P1 - Buddy Finder Frontend**: Wire up form to backend
3. **P2 - Generate Contact CSV**: Run script for export
4. **P2 - Email Notifications**: Set up for rota shifts

## Deployment Notes
Changes made in preview environment. User needs to:
1. Push code to Git
2. Redeploy app.radiocheck.me
3. Redeploy radiocheck.me/staff-portal
