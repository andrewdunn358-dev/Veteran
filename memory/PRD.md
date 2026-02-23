# Radio Check - Product Requirements Document

## Project Overview
**Radio Check** is a mental health and peer support application for veterans.

---

## Session Summary - February 23, 2026 (Latest)

### ✅ Completed This Session

**🩺 PHQ-9 / GAD-7 Mental Health Screening (Complete):**
1. ✅ **New screen: `/mental-health-screening.tsx`**
   - PHQ-9 (Depression) - 9 questions
   - GAD-7 (Anxiety) - 7 questions
   - Score interpretation with severity levels
   - Warning messages for high scores
   - **Share results with counsellor** feature
   - Crisis helpline links for severe cases
   - Results saved locally for history

2. ✅ **Added to Self-Care Tools** - Mental Health Check card at top of list

**🔄 Shift Swap / Cover Requests (Complete):**
3. ✅ **New API router: `/backend/routers/shift_swaps.py`**
   - `POST /api/shift-swaps/request` - Request cover
   - `POST /api/shift-swaps/{id}/accept` - Accept (first come first served)
   - `POST /api/shift-swaps/{id}/approve` - Admin approve/reject
   - `GET /api/shift-swaps/pending` - Available swaps
   - `GET /api/shift-swaps/needs-approval` - For admin
   - Email notifications to all staff

4. ✅ **Admin Portal - Rota Tab** - Swap requests section with:
   - "Needs Approval" tab with badge count
   - "All Requests" history tab
   - Approve/Reject buttons for admin

5. ✅ **Staff Portal** - Cover Requests section:
   - View available cover requests
   - "I Can Cover" button to accept
   - Request cover for own shifts

**📊 Earlier Today:**
- ✅ Staff Rota Dashboard (Admin + Staff portals)
- ✅ Cookie consent banners
- ✅ Report an Issue button
- ✅ Email shift reminders
- ✅ AI consent modals
- ✅ Mood tracking graph

---

## Shift Swap Flow

```
1. Staff requests cover for their shift
   ↓
2. Email sent to ALL other staff
   ↓
3. First staff member to accept gets it
   ↓
4. Request goes to Admin for approval
   ↓
5. Admin approves/rejects
   ↓
6. If approved, shift is transferred
   ↓
7. Both staff notified by email
```

---

## New API Endpoints

### Shift Swaps
- `POST /api/shift-swaps/request` - Create swap request
- `POST /api/shift-swaps/{id}/accept` - Accept request
- `POST /api/shift-swaps/{id}/approve` - Admin decision
- `POST /api/shift-swaps/{id}/cancel` - Cancel request
- `GET /api/shift-swaps/` - All swaps (admin)
- `GET /api/shift-swaps/pending` - Available to accept
- `GET /api/shift-swaps/needs-approval` - Awaiting admin
- `GET /api/shift-swaps/my-requests/{user_id}` - User's requests

---

## Key Files Created/Updated

### Frontend
- `/app/frontend/app/mental-health-screening.tsx` - NEW
- `/app/frontend/app/self-care.tsx` - Added screening link

### Backend
- `/app/backend/routers/shift_swaps.py` - NEW
- `/app/backend/server.py` - Added shift_swaps router

### Admin Portal
- `/app/admin-site/index.html` - Swap requests section
- `/app/admin-site/styles.css` - Swap styles
- `/app/admin-site/app.js` - Swap functions

### Staff Portal
- `/app/staff-portal/index.html` - Cover requests section
- `/app/staff-portal/styles.css` - Swap styles
- `/app/staff-portal/app.js` - Swap functions

---

## Production Deployment Checklist

| Item | Action |
|------|--------|
| Admin Portal | Upload `/app/admin-site/*` |
| Staff Portal | Upload `/app/staff-portal/*` |
| Marketing Site | Upload `/app/website/*` |
| Backend | Push to Render |
| Cron Jobs | Set up on cron-job.org or Render |

---

## Remaining Tasks

### Medium Priority (P1)
- [ ] DPIA document for AI processing
- [ ] Configure Expo push notifications

### Future / Backlog
- [ ] SMS text reminders (Twilio)
- [ ] Welsh language support
- [ ] Structured CBT courses
- [ ] Consolidate AI chat screens

---

*Last Updated: February 23, 2026*
