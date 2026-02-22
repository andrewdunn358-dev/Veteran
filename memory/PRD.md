# Radio Check - UK Armed Forces Support App

## Original Problem Statement
Build and enhance a mobile-first web application for UK serving personnel and veterans with role-based portals, AI chatbots, safeguarding, and peer support features.

## What's Been Implemented (Session 22 Feb 2026)

### 1. CMS Connected to More Pages
- **Family & Friends page** now fetches from CMS:
  - Support Resources section (Op Courage, Combat Stress, SSAFA, etc.)
  - Addiction Resources section (Tom Harrison House, AA, FRANK, etc.)
  - Warning Signs section (8 behavioral indicators)
- CMS seeded with 19 new cards across 3 sections

### 2. Email Notifications for Rota Shifts
- Added `send_shift_notification_email()` function
- Sends styled HTML email when shift created
- Includes date, time, staff name
- Uses Resend for email delivery
- Non-blocking async execution

### 3. Buddy Finder Messaging
- Added message modal with text input
- "Send Message" button now functional
- Requires login to send messages
- Posts to `/api/buddy-finder/message` endpoint
- Styled bottom-sheet modal UI

### 4. Logs & Analytics Dashboard (Admin Portal)
- Stats overview (Calls, Chats, Escalations, Panic)
- 5 log types with tables and CSV export
- Time period filter (7/30/90/365 days)
- Chat history viewer modal

### 5. Contact CSV Export
- `/app/contacts_full_export.csv` - 44 contacts
- API: `GET /api/organizations/export/csv`
- API: `POST /api/organizations/import`

---

## CRITICAL: Production URLs
**See `/app/PRODUCTION_CONFIG.md`**
- Staff Portal: `https://veterans-support-api.onrender.com`
- Admin Portal: `https://veterans-support-api.onrender.com`
- **NEVER** change these to preview URLs

## Test Credentials
- Staff: `sarahm.counsellor@radiocheck.me` / `RadioCheck2026!`
- Admin: `admin@veteran.dbty.co.uk` / `ChangeThisPassword123!`

## Key Files Changed This Session

### CMS Integration
- `/app/frontend/app/family-friends.tsx` - CMS connected
- `/app/backend/server.py` - CMS seed with family-friends content

### Email Notifications
- `/app/backend/server.py` - `send_shift_notification_email()` function

### Buddy Finder Messaging
- `/app/frontend/app/buddy-finder.tsx` - Message modal + sendMessage function

### Admin Portal
- `/app/admin-site/index.html` - Logs tab
- `/app/admin-site/app.js` - Log functions
- `/app/admin-site/styles.css` - Table styles

## Deployment Required
Push to Git and redeploy on Render:
- app.radiocheck.me
- radiocheck.me/admin-site  
- radiocheck.me/staff-portal
