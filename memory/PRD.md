# Radio Check - UK Armed Forces Support App

## Original Problem Statement
Build and enhance a mobile-first web application for UK serving personnel and veterans with role-based portals, AI chatbots, safeguarding, and peer support features.

## What's Been Implemented

### Session 22 Feb 2026 (Latest)

#### 1. Message Inbox Feature (Buddy Finder)
- **New "Inbox" tab** in Buddy Finder page
- Backend endpoint `/api/buddy-finder/inbox` fetches user's messages
- Displays sent and received messages with timestamps
- Reply modal for responding to messages
- Unread count badge on inbox tab
- Auto-refresh every 30 seconds

#### 2. Dashboard Analytics Charts (Admin Portal)
- Added **Chart.js** for visual analytics
- **Activity Trends Chart** - Line chart showing calls, chats, and alerts over 7 days
- **Contact Types Chart** - Doughnut chart showing distribution by type
- Charts update when time period filter changes

#### 3. WYSIWYG Visual CMS Editor (Admin Portal)
- **Phone Preview Frame** - Shows content as it appears in the mobile app
- **Visual editing** - Click any element to edit directly
- **Drag-and-Drop** - Reorder sections by dragging
- **Edit Panel** - Form fields for title, description, colors, icons, routes
- **Section & Card Management** - Add, delete, reorder
- **Color pickers** for icon and background colors

#### 4. Backend Modularization (Started)
New modular structure created:
```
/app/backend/
├── models/schemas.py      # All Pydantic models extracted
├── routers/cms.py         # Example CMS router (ready)
├── services/database.py   # Database connection utilities
└── ARCHITECTURE.md        # Migration guide
```
Server.py remains working - migration can happen incrementally.

#### Previous Sessions
- CMS connected to Family & Friends, Self-Care, Home pages
- Email notifications for rota shifts via Resend
- Buddy Finder messaging between veterans
- Logs & Analytics dashboard with 5 log types
- Contact CSV export/import functionality
- Staff portal calendar/availability feature

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

### Message Inbox
- `/app/frontend/app/buddy-finder.tsx` - Full inbox implementation

### Analytics Charts
- `/app/admin-site/index.html` - Chart.js CDN, chart containers
- `/app/admin-site/app.js` - Chart rendering functions

### WYSIWYG CMS Editor
- `/app/admin-site/index.html` - Visual editor HTML
- `/app/admin-site/app.js` - WYSIWYG + drag-drop functions
- `/app/admin-site/styles.css` - Phone frame, drag states

### Backend Modularization
- `/app/backend/models/schemas.py` - Pydantic models
- `/app/backend/routers/cms.py` - CMS router
- `/app/backend/services/database.py` - DB utilities
- `/app/backend/ARCHITECTURE.md` - Migration docs

## Backend Test Results
- **17/17 tests passed (100%)**

## Deployment Required
Push to Git and redeploy on Render:
- app.radiocheck.me
- radiocheck.me/admin-site  
- radiocheck.me/staff-portal

---

## P0 - Priority Backlog (Next Up)

### Offline Message Queue Discussion
- Who sends messages? (users with buddy profile)
- Queue behavior when offline
- Push notifications for new messages

## P1 - Future Tasks
- Complete backend modularization (move more routers)
- Push notifications for shift assignments
- More CMS page types (custom layouts)

## P2 - Nice to Have
- Dark/light theme toggle
- Multi-language support
- Analytics export to PDF
