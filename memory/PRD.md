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
- Enriched messages with sender/receiver display names

#### 2. Dashboard Analytics Charts (Admin Portal)
- Added **Chart.js** for visual analytics
- **Activity Trends Chart** - Line chart showing calls, chats, and alerts over 7 days
- **Contact Types Chart** - Doughnut chart showing distribution by counsellor, peer, organization, crisis line
- Charts update when time period filter changes
- Located in the Logs & Analytics tab

#### 3. WYSIWYG Visual CMS Editor (Admin Portal)
- **Phone Preview Frame** - Shows content as it appears in the mobile app
- **Visual editing** - Click any element to edit directly
- **Edit Panel** - Form fields for title, description, colors, icons, routes
- **Section Management** - Add, delete, reorder sections
- **Card Management** - Add, delete cards within sections
- **Color pickers** for icon and background colors
- **Toggle between List View and Visual Editor**
- Page selector dropdown for different app pages

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
- `/app/frontend/app/buddy-finder.tsx` - Full inbox implementation with tabs, message list, reply modal
- `/app/backend/server.py` - `/api/buddy-finder/inbox` endpoint (lines 5428-5485)

### Analytics Charts
- `/app/admin-site/index.html` - Chart.js CDN, chart containers
- `/app/admin-site/app.js` - `renderActivityTrendChart()`, `renderContactTypeChart()` functions

### WYSIWYG CMS Editor
- `/app/admin-site/index.html` - Visual editor HTML structure
- `/app/admin-site/app.js` - WYSIWYG functions (loadCMSPage, renderPhonePreview, selectSection, etc.)
- `/app/admin-site/styles.css` - Phone frame, edit panel, card styles

## Backend Test Results
- **17/17 tests passed (100%)**
- Inbox endpoint returns proper structure
- CMS CRUD endpoints working
- Call logs endpoint returns chart-ready data

## Deployment Required
Push to Git and redeploy on Render:
- app.radiocheck.me
- radiocheck.me/admin-site  
- radiocheck.me/staff-portal

---

## P0 - Priority Backlog

### Admin Portal Improvements
- [ ] Push notifications for shift assignments
- [ ] More CMS page types (custom layouts)

### Mobile App
- [ ] Push notifications integration (Expo Push / Firebase)
- [ ] Offline message queue

## P1 - Future Tasks
- [ ] Modularize `server.py` into routers/models/services
- [ ] Create reusable AI chat component
- [ ] Add WebRTC TURN server integration (Metered.ca credentials pending)

## P2 - Nice to Have
- [ ] Dark/light theme toggle
- [ ] Multi-language support
- [ ] Analytics export to PDF
