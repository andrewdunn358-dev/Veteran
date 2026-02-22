# Radio Check - UK Armed Forces Support App

## Original Problem Statement
Build and enhance a mobile-first web application for UK serving personnel and veterans with role-based portals, AI chatbots, safeguarding, and peer support features.

## What's Been Implemented

### Session - 22 Feb 2026

#### Logs & Analytics Dashboard (Admin Portal)
Rebuilt the Calls tab into a comprehensive Logs & Analytics dashboard:

**Features**:
- **Stats Overview Cards**: Total Calls, Live Chats, Escalations, Panic Alerts
- **Time Period Filter**: 7/30/90/365 days
- **Log Tabs**:
  - Call Logs: Date, contact name, type (peer/counsellor), method (webrtc/phone)
  - Chat History: Status, user, staff, message count + view messages modal
  - Safeguarding: Risk level, type, assigned staff, status
  - Callbacks: Type (urgent/normal), phone, handled by, status
  - Panic Alerts: Location, responded by, status (urgent rows highlighted)
- **CSV Export**: Export any log type to CSV

**Files Changed**:
- `/app/admin-site/index.html` - New Logs tab HTML
- `/app/admin-site/app.js` - Log functions (loadLogsData, renderLogTab, exportLogsCSV, etc.)
- `/app/admin-site/styles.css` - Table and badge styles

#### Contact CSV Export
- Created `/app/contacts_full_export.csv` with 44 contacts
- API endpoints: `GET /api/organizations/export/csv`, `POST /api/organizations/import`

#### Production URL Documentation
- `/app/PRODUCTION_CONFIG.md` - Prevents future URL mix-ups

---

## CRITICAL: Production URLs
**See `/app/PRODUCTION_CONFIG.md`**
- Staff Portal: `https://veterans-support-api.onrender.com`
- Admin Portal: `https://veterans-support-api.onrender.com`

## Test Credentials
- Staff: `sarahm.counsellor@radiocheck.me` / `RadioCheck2026!`
- Admin: `admin@veteran.dbty.co.uk` / `ChangeThisPassword123!`

## Key Files

### Admin Portal
- `/app/admin-site/index.html` - Main HTML
- `/app/admin-site/app.js` - JavaScript logic
- `/app/admin-site/styles.css` - Styling
- `/app/admin-site/config.js` - PRODUCTION API URL

### Staff Portal
- `/app/staff-portal/` - Files with calendar feature
- `/app/staff-portal/config.js` - PRODUCTION API URL

### Backend
- `/app/backend/server.py` - FastAPI server

## Remaining Tasks
1. **Connect more pages to CMS** - organizations, family-friends
2. **Email notifications for rota**
3. **Buddy Finder messaging**

## Deployment
Push to Git and redeploy admin-site, staff-portal on production (Render).
