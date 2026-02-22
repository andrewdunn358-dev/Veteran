# Radio Check - Product Requirements Document

## Project Overview
**Radio Check** is a mental health and peer support application for veterans, featuring:
- React Native mobile app (Expo)
- Python FastAPI backend
- MongoDB database
- Static HTML admin and staff portals

---

## Session Summary - February 23, 2026 (Latest)

### ✅ Completed This Session

**🔴 Staff Rota System (Complete):**
1. ✅ **Admin Portal - Rota Tab** - New dedicated tab showing:
   - Today's staff on duty (counsellors & peers)
   - Tomorrow's scheduled staff
   - 7-day week view calendar
   - Coverage stats (counsellors today, peers today, total shifts)
   - Coverage gap warnings
   
2. ✅ **Staff Portal - Team On Duty** - New section showing:
   - Today's team (who else is working)
   - Tomorrow's team tab
   - Role badges (Counsellor/Peer Supporter)
   - Current user highlighted
   
3. ✅ **Mobile App - Staff On Duty Widget** - Home page card showing:
   - Live count of counsellors and peers on duty today
   - "Support available now" / "Check back soon" indicator

**🟠 Admin Portal Cleanup (Complete):**
4. ✅ **Removed Resources tab** - Will be managed via CMS
5. ✅ **Removed Organizations tab** - Will be managed via CMS

**🟢 Previous Session Work (Carried Forward):**
- ✅ Email shift reminders (24hr + 1hr before shift)
- ✅ Cookie consent banners (admin + website)
- ✅ Report an Issue button (BACP compliance)
- ✅ AI consent modals (all chat screens)
- ✅ Data retention system

### 🔄 Production Setup Required

| Task | Command/Action |
|------|----------------|
| **Redeploy Admin Site** | Upload `/app/admin-site/*` to production (rota tab + cookie banner) |
| **Redeploy Staff Portal** | Upload `/app/staff-portal/*` to production (team on duty) |
| **Redeploy Website** | Upload `/app/website/*` to production (cookie banner) |
| **Schedule Reminders** | Add cron: `*/15 * * * * curl -X POST https://api.radiocheck.me/api/shifts/send-reminders` |

---

## Technical Architecture

### Admin Portal (`/app/admin-site/`)
- **Tabs**: Staff, Rota (NEW), CMS, Compliance, Logs, Settings
- **Removed**: Resources, Organizations (now in CMS)

### Staff Portal (`/app/staff-portal/`)
- **Sections**: My Availability, Team On Duty (NEW), Notes, Callback Queue

### Mobile App (`/app/frontend/`)
- **Home Page**: Staff On Duty widget (NEW), AI Team, Menu cards

---

## Key Files Changed This Session
- `/app/admin-site/index.html` - Added Rota tab, removed Resources/Orgs
- `/app/admin-site/styles.css` - Rota styles
- `/app/admin-site/app.js` - Rota data loading & rendering functions
- `/app/staff-portal/index.html` - Added Team On Duty section
- `/app/staff-portal/styles.css` - Team styles
- `/app/staff-portal/app.js` - Team data functions
- `/app/frontend/app/home.tsx` - Staff On Duty widget

---

## Staff/Counsellor Feature Parity

| Feature | Peer Supporters | Counsellors |
|---------|-----------------|-------------|
| Shift scheduling | ✅ | ✅ |
| Email reminders | ✅ | ✅ |
| Staff portal access | ✅ | ✅ |
| Rota visibility | ✅ | ✅ |
| Team on duty view | ✅ | ✅ |
| Notes system | ✅ | ✅ |
| Callback queue | ✅ | ✅ |

---

## API Endpoints Summary

### Staff/Rota APIs
- `GET /api/shifts/` - Get all shifts
- `GET /api/staff/counsellors` - Get all counsellors
- `GET /api/staff/peers` - Get all peer supporters
- `POST /api/shifts/` - Create shift
- `PUT /api/shifts/{id}` - Update shift
- `DELETE /api/shifts/{id}` - Delete shift
- `POST /api/shifts/send-reminders` - Trigger email reminders

---

## Remaining Tasks

### High Priority (P0)
- [ ] Configure Expo project ID for push notifications

### Medium Priority (P1)
- [ ] PHQ-9 / GAD-7 mental health screening tools
- [ ] DPIA document for AI processing

### Future / Backlog
- [ ] SMS text reminders (Twilio - deferred)
- [ ] Consolidate AI chat screens
- [ ] Welsh language support
- [ ] Structured CBT courses

---

*Last Updated: February 23, 2026*
