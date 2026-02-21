# Radio Check - UK Armed Forces Support App

## Original Problem Statement
Build and enhance a mobile-first web application for UK serving personnel and veterans with role-based portals, AI chatbots, safeguarding, and peer support features.

## What's Been Implemented (Updated 21 Feb 2026)

### Latest Session - Calendar/Availability Feature Added (21 Feb 2026)

#### Staff Portal Calendar Feature Added
Added full availability/calendar management to the Staff Portal (`/app/staff-portal/`):

**HTML Changes** (`index.html`):
- Added "My Availability" section with interactive calendar
- Month navigation (prev/next)
- Calendar grid showing shifts
- Legend for "Your Shifts" vs "Other Staff"
- Selected day panel showing shift details
- "Add Shift" modal with date, start time, end time inputs

**CSS Changes** (`styles.css`):
- New `.availability-section` styles
- Calendar grid styles (`.calendar-day`, `.calendar-header`)
- Shift indicators (`.shift-dot`)
- Legend styles
- Selected day panel styles
- Mobile responsive adjustments

**JavaScript Changes** (`app.js`):
- `loadShifts()` - Fetches shifts from `/api/shifts` API
- `renderCalendar()` - Draws calendar grid with shift indicators
- `selectCalendarDate()` - Handles date selection
- `showSelectedDayShifts()` - Shows shifts for selected day
- `prevMonth()` / `nextMonth()` - Month navigation
- `openShiftModal()` / `closeShiftModal()` - Modal management
- `saveShift()` - Creates new shift via API
- `deleteShift()` - Removes shift via API

**API Integration**:
- GET `/api/shifts` - List shifts by date range
- POST `/api/shifts` - Create new shift (requires auth)
- DELETE `/api/shifts/{id}` - Delete shift (requires auth)

#### Staff Portal Config Updated
- Updated `config.js` to use preview environment URL for testing

#### Mobile App Availability Verified
- Confirmed `/app/frontend/app/my-availability.tsx` is working
- Calendar renders correctly
- Date selection works
- "Add Availability" modal opens
- Requires login to save (correct behavior)

### Previous Session Work

#### Marketing Website Rebuilt (No React)
Pure static HTML/CSS/JS website in `/app/website/`

#### External URL Cleanup
Removed references to external asset URLs in admin-site and staff-portal

#### Splash Screen Text Fix
Fixed readability of text on splash screen

---

## Known Issues

### Staff Portal Mobile View - Clarification Needed (P0)
**User reported**: On mobile staff portal, only sees Panic button, status, "My Availability", pending callbacks.

**Analysis**: 
- The user may be confusing the **React Native app's Peer Portal** (`/app/frontend/app/peer-portal.tsx`) with the **Staff Portal website** (`/app/staff-portal/`).
- The React Native app's Peer Portal DOES have: Panic button, status, "My Availability" link, callbacks.
- The Staff Portal website SHOULD show: Safeguarding alerts, Live Chats, Phone, Notes, etc. for all staff roles.
- The 403 errors in console logs were likely from expired session tokens (session timeout feature).

**Next Step**: User needs to clarify which portal they're using - the app or the website.

### Calendar Saving - Authentication Required
When users click "Add Shift" and nothing happens, it's likely because:
1. They're not logged in
2. Their session token expired
3. They're not registered as a peer supporter

The app shows an alert asking to login - user needs to be authenticated.

### External Image URLs (P2)
Some app pages still use external URLs for AI avatars.

### CMS Not Connected (P1)
CMS exists but app pages use hardcoded content.

## Deployment Ready Items

### Marketing Website
**Location**: `/app/website/` and `/app/radiocheck-website.zip`

### Admin Site
**Location**: `/app/admin-site/`

### Staff Portal
**Location**: `/app/staff-portal/`
**Note**: Includes new calendar/availability feature

## Upcoming Tasks

1. **P0 - Verify Staff Portal Mobile View**: Get clarification from user if they mean app or website
2. **P1 - Make CMS Fully Dynamic**: Connect app pages to CMS APIs
3. **P1 - Buddy Finder Frontend**: Wire up form to backend
4. **P2 - Replace AI Avatar URLs**: Download images and use local assets
5. **P2 - Email Notifications**: Set up for rota shifts
6. **P2 - Generate Contact CSV**: Run script to export contacts

## Test Credentials
- Admin: `admin@veteran.dbty.co.uk` / `ChangeThisPassword123!`
- Staff: `sarahm.counsellor@radiocheck.me` / `RadioCheck2026!`

## Key Files Reference

### Website (Static HTML)
- `/app/website/` - Marketing website directory

### Portals (Static HTML/JS)
- `/app/admin-site/` - Admin dashboard
- `/app/staff-portal/` - Staff/counsellor dashboard (now with calendar)

### Frontend (React Native/Expo)
- `/app/frontend/app/` - All app screens
- `/app/frontend/app/my-availability.tsx` - Mobile app availability calendar
- `/app/frontend/app/peer-portal.tsx` - Mobile app peer supporter portal

### Backend
- `/app/backend/server.py` - FastAPI server
- Shifts API: `/api/shifts`
