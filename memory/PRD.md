# Radio Check - UK Armed Forces Support App

## Original Problem Statement
Build and enhance a mobile-first web application for UK serving personnel and veterans with role-based portals, AI chatbots, safeguarding, and peer support features.

## What's Been Implemented (Updated 21 Feb 2026)

### Latest Session - Website Rebuild & External URL Cleanup (21 Feb 2026)

#### Marketing Website Rebuilt (No React)
Completely rebuilt the marketing website as plain HTML/CSS/JS for compatibility with 20i hosting:
- **Previous issue**: React/Vite website had `main.tsx:1 Failed to load resource: 404` error
- **Solution**: Pure static HTML files, no build process needed

**Location**: `/app/website/`

**Pages Created**:
- `index.html` - Home page with hero, features, audience cards
- `about.html` - What Radio Check is and isn't
- `ai-team.html` - All 6 AI companions with descriptions
- `contact.html` - Contact form, crisis numbers
- `legal.html` - Terms of use
- `privacy.html` - Privacy policy (UK GDPR compliant)
- `styles.css` - All styling
- `script.js` - Mobile nav, smooth scroll
- `.htaccess` - Apache config for 20i
- `DEPLOYMENT.md` - Deployment instructions

**Deployment**: Just upload all files to `public_html` - no build required!

#### External URL Cleanup Complete
Removed ALL references to `https://customer-assets.emergentagent.com`:

**Admin Site** (`/app/admin-site/`):
- `index.html` - Changed logo src to `logo.png`
- `app.js` - Changed default logo to `logo.png`
- Added `/app/admin-site/logo.png`

**Staff Portal** (`/app/staff-portal/`):
- `index.html` - Changed both logo references to `logo.png`
- Added `/app/staff-portal/logo.png`

**Frontend App**:
- `admin.tsx` - Removed fallback URL `https://buddy-finder-dev.preview.emergentagent.com`
- `callback.tsx` - Removed fallback URL

#### Splash Screen Text Fix (21 Feb 2026)
Fixed readability of text on splash screen:
- "In an emergency, always call 999" - Now white (`#ffffff`) with bold
- "Proudly supported by" - Now light gray (`#cbd5e1`)
- Shield icon - Now white

**File**: `/app/frontend/app/index.tsx`

---

### Previous Session Work

#### Dark/Light Mode Fixes
Fixed global theming in `+html.tsx` and multiple pages.

#### CMS System
Backend and admin UI for content management (not yet connected to app pages).

#### AI Characters (6 total)
- Tommy, Doris, Bob, Finch, Margie, Hugo

#### Staff Calendar
Peer supporters can log availability via My Availability page.

## Known Issues

### External Image URLs Still Present (P2)
These files still use external URLs for AI avatars (they work, but not self-contained):
- `/app/frontend/app/bob-chat.tsx`
- `/app/frontend/app/crisis-support.tsx`
- `/app/frontend/app/home.tsx`
- `/app/frontend/app/hugo-chat.tsx`
- `/app/frontend/app/margie-chat.tsx`
- `/app/frontend/app/peer-support.tsx`
- `/app/frontend/app/self-care.tsx`
- `/app/frontend/app/sentry-chat.tsx`
- `/app/frontend/app/substance-support.tsx`
- `/app/frontend/app/historical-investigations.tsx`

### CMS Not Connected (P1)
CMS exists but app pages use hardcoded content.

## Deployment Ready Items

### Marketing Website
**Location**: `/app/website/` and `/app/radiocheck-website.zip`
**Type**: Static HTML/CSS/JS
**Host**: Any web server (tested for 20i Apache)
**Instructions**: See `/app/website/DEPLOYMENT.md`

### Admin Site
**Location**: `/app/admin-site/`
**Assets**: All local, no external URLs

### Staff Portal
**Location**: `/app/staff-portal/`
**Assets**: All local, no external URLs

## Upcoming Tasks

1. **P1 - Make CMS Fully Dynamic**: Connect app pages to CMS APIs
2. **P1 - Buddy Finder Frontend**: Wire up form to backend
3. **P2 - Replace AI Avatar URLs**: Download images and use local assets
4. **P2 - Email Notifications**: Set up for rota shifts

## Test Credentials
- Admin: `admin@veteran.dbty.co.uk` / `ChangeThisPassword123!`
- Staff: `sarahm.counsellor@radiocheck.me` / `RadioCheck2026!`

## Key Files Reference

### Website (Static HTML)
- `/app/website/` - Marketing website directory
- `/app/radiocheck-website.zip` - Ready for deployment

### Portals (Static HTML/JS)
- `/app/admin-site/` - Admin dashboard
- `/app/staff-portal/` - Staff/counsellor dashboard

### Frontend (React Native/Expo)
- `/app/frontend/app/` - All app screens

### Backend
- `/app/backend/server.py` - FastAPI server
