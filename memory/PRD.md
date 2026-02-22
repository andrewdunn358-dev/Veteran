# Radio Check - UK Armed Forces Support App

## Original Problem Statement
Build and enhance a mobile-first web application for UK serving personnel and veterans with role-based portals, AI chatbots, safeguarding, and peer support features.

## PRODUCTION vs PREVIEW - IMPORTANT

**Your production work is completely separate from this preview environment.**

| Environment | URL | Purpose |
|-------------|-----|---------|
| Preview (here) | `veteran-support-app.preview.emergentagent.com` | Testing sandbox |
| Production | `veterans-support-api.onrender.com` | Live deployment |

**When you deploy:**
1. Push this code to YOUR GitHub repo
2. Render pulls from YOUR GitHub
3. Your production MongoDB data stays intact
4. Preview URL is never involved

**Config files already point to production:**
- `/app/admin-site/config.js` → production URL
- `/app/staff-portal/config.js` → production URL

---

## What's Been Implemented

### Session 22 Feb 2026

#### 1. Hugo AI Wellbeing Coach (Updated)
- Comprehensive new prompt as 35-year-old wellbeing coach
- Friendly, non-judgmental, "hippy guru" style
- Active listening approach - validates feelings before advice
- UK crisis resources integrated
- Medical advice boundaries clearly defined
- Added to `/api/ai-buddies/characters` endpoint

#### NEW: Rita - Family Support Companion
- **Inspired by Rita Restorick** (mother of Stephen Restorick, peace advocate)
- 60-year-old woman, short black hair
- Designed for the **Friends & Family page**
- Supports partners, spouses, parents, and loved ones of military personnel
- Understands deployments, emotional distance, transition stress
- Bio: "I've been around the military for a long time. My son served, and I've experienced more than most people have."
- Avatar generated and added to system

#### 2. Backend Modularization (Complete)
```
/app/backend/
├── server.py              # Main app (still working)
├── models/schemas.py      # All Pydantic models
├── routers/
│   ├── auth.py           # Authentication router
│   ├── cms.py            # CMS router
│   ├── buddy_finder.py   # Buddy finder router
│   └── shifts.py         # Shifts with push notifications
├── services/
│   └── database.py       # Database utilities
└── ARCHITECTURE.md       # Migration documentation
```

#### 3. Push Notifications for Shifts
- Expo Push Notification integration in `/app/backend/routers/shifts.py`
- Sends notifications on shift create/update/delete
- Users can register push tokens via `/api/shifts/register-push-token`
- Email notifications continue via Resend

#### 4. Extended CMS Page Types
New page types supported:
- `standard` - Cards-based (default)
- `article` - Blog/article style
- `landing` - Hero + features
- `contact` - Contact form
- `resources` - Resource list
- `gallery` - Media gallery

New section types:
- `cards`, `hero`, `text`, `resources`, `accordion`, `testimonial`, `stats`, `cta`

#### 5. Drag-and-Drop CMS
- HTML5 drag-and-drop for section reordering
- Visual drag handles and drop indicators
- "Drop here" feedback during drag

#### 6. Message Inbox (Buddy Finder)
- New Inbox tab with unread badge
- Reply modal functionality
- Auto-refresh every 30 seconds

#### 7. Dashboard Analytics Charts
- Chart.js integration
- Activity trends line chart (7 days)
- Contact types doughnut chart

#### 8. Safeguarding Fix
- Added "hurt myself", "want to hurt myself" to RED_INDICATORS
- Now properly detects self-harm intent

---

## Test Results

**Backend: 22/22 tests passed (100%)**
- Auth: Login, JWT generation
- CMS: Pages, sections, cards CRUD
- Buddy Finder: Profiles, inbox, messaging
- Shifts: CRUD with notifications
- AI Characters: All 6 characters listed
- Safeguarding: Detects crisis phrases

---

## Test Credentials
- Admin: `admin@veteran.dbty.co.uk` / `ChangeThisPassword123!`
- Staff: `sarahm.counsellor@radiocheck.me` / `RadioCheck2026!`

---

## Deployment Checklist

Before deploying to production:

1. **OpenAI API Key** - Ensure `OPENAI_API_KEY` is set in production `.env`
2. **Resend API Key** - For email notifications
3. **Push to GitHub** - Use "Save to GitHub" feature
4. **Render deploys automatically** from your GitHub

---

## Files Changed This Session

### Hugo AI
- `/app/backend/server.py` lines 632-720 - New comprehensive prompt

### Backend Modularization
- `/app/backend/models/schemas.py` - All Pydantic models
- `/app/backend/routers/auth.py` - Auth router
- `/app/backend/routers/cms.py` - CMS router
- `/app/backend/routers/buddy_finder.py` - Buddy finder router
- `/app/backend/routers/shifts.py` - Shifts with push notifications
- `/app/backend/services/database.py` - DB utilities
- `/app/backend/ARCHITECTURE.md` - Migration docs

### CMS & Admin
- `/app/admin-site/app.js` - Drag-drop, charts
- `/app/admin-site/styles.css` - Drag states
- `/app/admin-site/index.html` - Chart.js CDN

### Safeguarding
- `/app/backend/server.py` line 1315-1316 - Added "hurt myself" indicators

---

## P0 - Next Up

### Offline Message Queue
Discussion needed:
1. Who sends messages? (users with buddy profile)
2. Queue behavior when offline
3. Push notifications for new messages

## P1 - Future
- Complete router migration (integrate routers into server.py)
- More CMS page templates
- Analytics export to PDF

## P2 - Nice to Have
- Dark/light theme toggle
- Multi-language support
