# UK Veterans Support App - Product Requirements Document

## Original Problem Statement
Build and deploy a mobile-first web application for UK military veterans providing:
- Crisis support with access to professional counsellors
- Peer support connections with fellow veterans
- Links to veteran support organizations
- Admin portal for managing staff and content

## Current Status: LIVE & OPERATIONAL

### Deployed URLs
- **Frontend**: Deployed on Vercel
- **Backend**: Deployed on Render
- **Preview**: https://peer-connect-11.preview.emergentagent.com

### Admin Credentials
- **Email**: admin@veteran.dbty.co.uk
- **Password**: ChangeThisPassword123!

---

## Completed Features

### Public-Facing Pages
- [x] Home page with crisis support access + Self-Care Tools section
- [x] Crisis Support page - CONNECTED TO LIVE API (counsellors with real-time availability)
- [x] Peer Support page - CONNECTED TO LIVE API (peer supporters with real-time availability)
- [x] Organizations page - **NOW FETCHES FROM DATABASE (Feb 2026)**
- [x] Historical Investigations support page

### Self-Care Tools (Phase 1) - All use LOCAL STORAGE, no login required
- [x] **Crisis Journal** (`/journal`) - Private notes stored locally on device
- [x] **Daily Check-in / Mood Tracker** (`/mood`) - 5 mood options with streak tracking
- [x] **Settings page** (`/settings`) - Dark/Light mode toggle with persistence
- [x] **Theme System** - Dark/Light mode across all pages

### Admin Portal (/admin) - UPDATED Feb 2026
- [x] Staff login system
- [x] User management (CRUD)
- [x] Counsellor management (CRUD + status updates)
- [x] Peer supporter management (CRUD + status updates)
- [x] **Organizations/Resources Management** - NEW: Full CRUD with "Load UK Veteran Resources" seed button
- [x] **Combined Staff + User Creation** - Single form with "Create login account" checkbox
- [x] CMS for editing page content - WORKING
- [x] Password management (change password, admin reset)
- [x] **Toast Notifications** - Visual feedback on successful actions
- [x] **Call Metrics Tab** - View call logs, stats by type/method, recent activity

### Call Intent Logging - Feb 2026
- [x] Log all call intents (phone, SMS, WhatsApp) to database
- [x] Metrics dashboard for admins showing:
  - Total calls (30 days)
  - Calls by contact type (counsellor, peer, crisis_line)
  - Calls by method (phone, sms, whatsapp)
  - Recent activity log

### Staff Portals
- [x] Counsellor portal (/counsellor-portal) - update availability status
- [x] Peer supporter portal (/peer-portal) - update availability status

### Password Management - Feb 2026
- [x] User password change
- [x] Admin password reset
- [x] **Forgot password email flow - Now using Resend** (requires RESEND_API_KEY on Render)

---

## API Endpoints

### Public APIs
- `GET /api/counsellors` - List all counsellors
- `GET /api/peer-supporters` - List all peer supporters
- `GET /api/organizations` - List all organizations
- `GET /api/content` - Get all CMS content
- `POST /api/call-logs` - Log a call intent (no auth required)

### Auth APIs
- `POST /api/auth/login` - Staff login
- `POST /api/auth/change-password` - Change own password
- `POST /api/auth/forgot-password` - Request password reset email (uses Resend)
- `POST /api/auth/reset-password` - Reset password with token
- `POST /api/auth/admin-reset-password` - Admin resets another user's password

### Admin APIs (require auth)
- `POST /api/auth/register` - Create new user (admin only)
- `GET /api/auth/users` - List all users (admin only)
- `DELETE /api/auth/users/{id}` - Delete user (admin only)
- `GET /api/call-logs` - Get call metrics with stats (admin only)
- Full CRUD for counsellors, peer supporters, organizations
- `POST /api/organizations/seed` - Seed default UK veteran organizations (admin only)
- `POST /api/content/seed` - Seed default CMS content
- `PUT /api/content/{page}/{section}` - Update CMS content

---

## Database Schema (MongoDB)

- **users**: {email, password_hash, role, name}
- **counsellors**: {name, specialization, status, phone, sms, whatsapp, user_id}
- **peer_supporters**: {firstName, area, background, yearsServed, status, phone, user_id}
- **organizations**: {id, name, description, phone, sms, whatsapp, created_at}
- **page_content**: {page_name, section, content}
- **password_resets**: {token, email, expires}
- **call_logs**: {id, contact_type, contact_id, contact_name, contact_phone, call_method, timestamp}

---

## Pending Items

### P0 - Critical (User Action Required)
- [ ] **Resend API Key Configuration**: Add `RESEND_API_KEY` to Render environment variables
  - Get key from: https://resend.com/api-keys
  - Add to Render: `RESEND_API_KEY=re_your_api_key_here`
  - Also add: `SENDER_EMAIL=noreply@veteran.dbty.co.uk`
  - And: `FRONTEND_URL=https://your-vercel-url.com`

### P1 - VoIP/PBX Integration (User Request)
- [ ] **FusionPBX or alternative VoIP integration** for:
  - Live call routing
  - User presence/busy status
  - Operator panel integration
- Options researched: FusionPBX (requires membership), 3CX (free tier), Vonage (API-first), CloudTalk

### P1 - Image Upload for CMS
- [ ] Implement file upload for CMS images
- [ ] Frontend UI needs file picker integration

### P1 - Favorites UI
- [ ] Add favorite buttons (star icons) to counsellor/peer cards
- [ ] FavoritesContext already built, needs UI implementation

### P2 - Upcoming Features
- [ ] **Achievement Badges for Peer Supporters**
- [ ] **Callback Request** - Queue system when counsellors are busy
- [ ] **Referral System** - Shareable link + track referrals

### P3 - Future
- [ ] In-App Chat/Messaging (user chose to skip for now)

---

## Tech Stack
- **Frontend**: React Native (Expo), Expo Router, AsyncStorage
- **Backend**: Python, FastAPI
- **Database**: MongoDB
- **Auth**: JWT with role-based access
- **Email**: Resend (for password reset)
- **Deployment**: Render (backend), Vercel (frontend)

---

## Key Files Reference
- `/app/frontend/app/admin.tsx` - Admin dashboard with Resources tab, call metrics
- `/app/frontend/app/organizations.tsx` - Public organizations page (fetches from API)
- `/app/frontend/app/login.tsx` - Staff login page
- `/app/frontend/app/crisis-support.tsx` - Crisis support page with call logging
- `/app/frontend/app/peer-support.tsx` - Peer support page with call logging
- `/app/frontend/src/components/Toast.tsx` - Toast notification component
- `/app/backend/server.py` - All API endpoints including organizations seed

---

## Last Updated
2026-02-16 - Fixed CMS Organizations management, researched VoIP options
