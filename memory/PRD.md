# Radio Check - UK Armed Forces Support App

## Original Problem Statement
Build and enhance a mobile-first web application for UK serving personnel and veterans with role-based portals, AI chatbots, safeguarding, and peer support features.

## What's Been Implemented

### Session - 22 Feb 2026

#### CMS Preview Feature Added to Admin Portal
Added live preview functionality to the Admin Portal's CMS tab:

**New Features**:
- **Preview App Button**: Opens a modal showing the app in a phone frame
- **Live Preview**: Embedded iframe showing the actual React Native app
- **Page Selector**: Switch between Home and Self-Care pages
- **Content Panel**: View all CMS sections and cards for the selected page
- **Inline Editing**: Click edit button on any card to modify title, description, icon, image, color, route
- **Auto-Refresh**: Preview updates immediately after saving changes

**Files Changed**:
- `/app/admin-site/index.html` - Added preview modal HTML
- `/app/admin-site/app.js` - Added preview functions (openCMSPreview, loadPreviewData, editPreviewCard, etc.)

#### Buddy Finder Verified Working
Confirmed Buddy Finder frontend is fully integrated with backend:
- Browse profiles with filters (region, service branch)
- Sign up with GDPR-compliant form
- Profile cards display name, bio, interests, regiment
- "Send Message" button ready for messaging feature

#### CMS Integration Complete
Connected key app pages to CMS APIs:
- `home.tsx` - AI Team section CMS-driven
- `self-care.tsx` - Tools grid CMS-driven
- Fallback to hardcoded content if CMS unavailable

---

## Test Credentials
- Staff: `sarahm.counsellor@radiocheck.me` / `RadioCheck2026!`
- Admin: `admin@veteran.dbty.co.uk` / `ChangeThisPassword123!`

## Key Files Reference

### CMS Integration
- `/app/frontend/src/hooks/useCMSContent.ts` - CMS data fetching hook
- `/app/frontend/app/home.tsx` - Home page with CMS AI team
- `/app/frontend/app/self-care.tsx` - Self-care page with CMS tools

### Admin Portal (with CMS Preview)
- `/app/admin-site/index.html` - Admin portal with preview modal
- `/app/admin-site/app.js` - JS including preview functions

### Mobile App (React Native/Expo)
- `/app/frontend/app/buddy-finder.tsx` - Buddy Finder with browse/signup
- `/app/frontend/app/my-availability.tsx` - Availability calendar screen

### Web Portals (Static HTML/JS)  
- `/app/staff-portal/` - Staff dashboard with calendar
- `/app/admin-site/` - Admin dashboard with CMS preview

### Backend
- `/app/backend/server.py` - FastAPI server
- CMS API: `/api/cms/pages`, `/api/cms/sections`, `/api/cms/cards`
- Buddy Finder API: `/api/buddy-finder/profiles`, `/api/buddy-finder/signup`

## Upcoming Tasks

1. **P2 - Connect more pages to CMS**: organizations, family-friends, etc.
2. **P2 - Generate Contact CSV**: Run script for export
3. **P2 - Email Notifications**: Set up for rota shifts
4. **P2 - Buddy Finder Messaging**: Enable "Send Message" functionality

## Deployment Notes
Changes made in preview environment. User needs to:
1. Push code to Git
2. Redeploy app.radiocheck.me
3. Redeploy radiocheck.me/admin-site
4. Redeploy radiocheck.me/staff-portal
