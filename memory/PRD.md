# Radio Check - UK Armed Forces Support App

## Original Problem Statement
Build and enhance a mobile-first web application for UK serving personnel and veterans with role-based portals, AI chatbots, safeguarding, and peer support features.

## What's Been Implemented

### Session - 22 Feb 2026

#### Contact CSV Export Feature
Added endpoints for managing organizations/contacts via CSV:

**New API Endpoints**:
- `GET /api/organizations/export/csv` - Download all organizations as CSV (admin only)
- `POST /api/organizations/import` - Bulk import/update organizations from JSON (admin only)

**CSV Files Created**:
- `/app/contacts_full_export.csv` - 44 contacts including:
  - 8 support organizations (Combat Stress, Samaritans, SSAFA, etc.)
  - 36 regimental associations (Navy, RAF, Army)

**How to use**:
1. Export current contacts: `GET /api/organizations/export/csv` with admin token
2. Edit CSV, convert to JSON, import via: `POST /api/organizations/import`

#### Production URL Documentation
Created `/app/PRODUCTION_CONFIG.md` to prevent future agents from changing production URLs to preview URLs. Added comments in config.js files.

#### CMS Preview Feature
Added live preview in Admin Portal CMS tab.

#### Buddy Finder
Verified working - browse/signup functional.

---

## CRITICAL: Production URLs
**See `/app/PRODUCTION_CONFIG.md`**
- Staff Portal config: `https://veterans-support-api.onrender.com`
- Admin Portal config: `https://veterans-support-api.onrender.com`
- NEVER change these to preview URLs

## Test Credentials
- Staff: `sarahm.counsellor@radiocheck.me` / `RadioCheck2026!`
- Admin: `admin@veteran.dbty.co.uk` / `ChangeThisPassword123!`

## Key Files Reference

### Contact Management
- `/app/contacts_full_export.csv` - Full export with all contacts
- `/app/backend/server.py` - API endpoints for import/export

### CMS Integration
- `/app/frontend/src/hooks/useCMSContent.ts` - CMS data fetching hook
- `/app/frontend/app/home.tsx` - Home page with CMS AI team
- `/app/frontend/app/self-care.tsx` - Self-care page with CMS tools

### Admin/Staff Portals
- `/app/staff-portal/` - Staff dashboard with calendar
- `/app/admin-site/` - Admin dashboard with CMS preview
- `/app/PRODUCTION_CONFIG.md` - Production URL documentation

### Backend
- `/app/backend/server.py` - FastAPI server

## Remaining Tasks

1. **CMS Rewrite** - Better admin interface for content management
2. **Logs & Analytics Dashboard** - Call logs, chat logs, escalations
3. **Connect more pages to CMS** - organizations, family-friends
4. **Email notifications for rota**
5. **Buddy Finder messaging**

## Deployment Notes
Push to Git and redeploy all services on production (Render).
