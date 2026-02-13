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
- **Preview**: https://veteran-staff-portal.preview.emergentagent.com

### Admin Credentials
- **Email**: admin@veteran.dbty.co.uk
- **Password**: ChangeThisPassword123!

---

## Completed Features

### Public-Facing Pages
- [x] Home page with crisis support access
- [x] Crisis Support page - NOW CONNECTED TO LIVE API (counsellors with real-time availability)
- [x] Peer Support page - NOW CONNECTED TO LIVE API (peer supporters with real-time availability)
- [x] Organizations page
- [x] Historical Investigations support page

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
- [ ] **SMTP Configuration**: Add SMTP credentials to Render environment variables for password reset emails to work
  - Required: SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD, FRONTEND_URL

### P1 - Improvements
- [ ] Add database query projections for performance
- [ ] Remove JWT secret fallback in production

### P2 - Enhancements
- [ ] Break down admin.tsx into smaller components
- [ ] Add more organizations to the database
- [ ] Implement email notifications for new peer support registrations

---

## Tech Stack
- **Frontend**: React Native (Expo), Expo Router
- **Backend**: Python, FastAPI
- **Database**: MongoDB Atlas
- **Auth**: JWT with role-based access
- **Deployment**: Render (backend), Vercel (frontend)

---

## Last Updated
2026-02-13 - Connected frontend public pages to live backend APIs
