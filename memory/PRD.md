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
- **Preview**: https://crisis-hub-8.preview.emergentagent.com

### Admin Credentials
- **Email**: admin@veteran.dbty.co.uk
- **Password**: ChangeThisPassword123!

---

## Completed Features

### Public-Facing Pages
- [x] Home page with crisis support access + Self-Care Tools section
- [x] Crisis Support page - CONNECTED TO LIVE API (counsellors with real-time availability)
- [x] Peer Support page - CONNECTED TO LIVE API (peer supporters with real-time availability)
- [x] Organizations page
- [x] Historical Investigations support page

### Self-Care Tools (NEW - Phase 1) - All use LOCAL STORAGE, no login required
- [x] **Crisis Journal** (`/journal`) - Private notes stored locally on device
  - Add/edit/delete entries with timestamps
  - Optional mood tagging (😊 Great, 🙂 Good, 😐 Okay, 😔 Low, 😢 Struggling)
  - Search functionality
  - Privacy notice: "Your journal is private and stored only on this device"
- [x] **Daily Check-in / Mood Tracker** (`/mood`)
  - 5 mood options with colored borders
  - Streak tracking (🔥 X day streak!)
  - Mood distribution chart
  - 7 day / 30 day / All time period views
  - History log with expandable view
  - "You've checked in today!" confirmation
- [x] **Settings page** (`/settings`)
  - Dark/Light mode toggle with persistence
  - Links to Journal and Mood History
  - Clear All Data option with confirmation
  - Privacy notice
  - Contact support email
  - App version info
- [x] **Theme System** - Dark/Light mode across all pages
  - ThemeContext provider
  - Persisted preference in AsyncStorage

### Admin Portal (/admin)
- [x] Staff login system
- [x] User management (CRUD)
- [x] Counsellor management (CRUD + status updates)
- [x] Peer supporter management (CRUD + status updates)
- [x] CMS for editing page content
- [x] Password management (change password, admin reset)

### Staff Portals
- [x] Counsellor portal (/counsellor-portal) - update availability status
- [x] Peer supporter portal (/peer-portal) - update availability status

### Password Management
- [x] User password change
- [x] Admin password reset
- [x] Forgot password email flow (requires SMTP config on Render)

### Content Management
- [x] Phone numbers updated to 01912704378
- [x] 999 call functionality disabled (text-only notice)

---

## API Endpoints

### Public APIs
- `GET /api/counsellors` - List all counsellors
- `GET /api/peer-supporters` - List all peer supporters
- `GET /api/organizations` - List all organizations
- `GET /api/content/{page}` - Get page content

### Auth APIs
- `POST /api/auth/login` - Staff login
- `POST /api/auth/change-password` - Change own password
- `POST /api/auth/forgot-password` - Request password reset email
- `POST /api/auth/reset-password` - Reset password with token

### Admin APIs (require auth)
- Full CRUD for users, counsellors, peer supporters, organizations
- CMS content management

---

## Database Schema (MongoDB)

- **users**: {email, password_hash, role, name}
- **counsellors**: {name, specialization, status, phone, sms, whatsapp}
- **peer_supporters**: {firstName, area, background, yearsServed, status, phone}
- **organizations**: {name, description, phone}
- **page_content**: {page_name, section, content}
- **password_resets**: {token, email, expires}

---

## Pending Items

### P0 - Critical
- [ ] **SMTP Configuration**: Add SMTP credentials to Render environment variables for password reset emails
  - Required: SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD, FRONTEND_URL

### Phase 2 - Backend Features (Next)
- [ ] **Achievement Badges for Peer Supporters**
  - 🥉 5 veterans helped
  - 🥈 25 veterans helped
  - 🥇 50 veterans helped
  - ⭐ 100 veterans helped
  - 📅 6 months volunteer
  - 🎖️ 1 year volunteer
  - 🏆 2 years volunteer
- [ ] **Referral System** - Shareable link + track referrals
- [ ] **Callback Request** - Queue system when counsellors are busy
- [ ] **Favorites UI** - Add favorite buttons to counsellor/peer cards (FavoritesContext already built)

### Phase 3 - Future
- [ ] In-App Chat/Messaging (user chose to skip for now)
- [ ] Break down admin.tsx into smaller components
- [ ] Add database query projections for performance

---

## Tech Stack
- **Frontend**: React Native (Expo), Expo Router, AsyncStorage
- **Backend**: Python, FastAPI
- **Database**: MongoDB Atlas
- **Auth**: JWT with role-based access
- **Deployment**: Render (backend), Vercel (frontend)
- **Local Storage**: AsyncStorage (for journal, mood, favorites, theme)

---

## New Files Created (Phase 1)
- `/app/frontend/src/context/ThemeContext.tsx` - Dark/Light mode provider
- `/app/frontend/src/context/FavoritesContext.tsx` - Favorites provider (ready for Phase 2)
- `/app/frontend/app/journal.tsx` - Crisis Journal page
- `/app/frontend/app/mood.tsx` - Daily Check-in / Mood Tracker page
- `/app/frontend/app/settings.tsx` - Settings page

---

## Last Updated
2026-02-13 - Added Phase 1 features (Crisis Journal, Mood Tracker, Settings, Dark/Light Theme)
