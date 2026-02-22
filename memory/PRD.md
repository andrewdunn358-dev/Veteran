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

**🔴 P0 - GDPR AI Consent Modal Rollout (Complete):**
1. ✅ AI consent modal implemented across all AI chat screens (hugo, margie, bob, sentry)
2. ✅ Each shows AI disclosure, privacy info, and crisis numbers before chat

**🟠 P1 - Email Reminders for Shifts (Complete):**
3. ✅ **Created shift_reminders.py script** - `/backend/scripts/shift_reminders.py`
   - Sends email reminders 24 hours before shift
   - Sends email reminders 1 hour before shift
   - Tracks sent reminders to avoid duplicates
   - Beautiful HTML email templates with shift details
4. ✅ **Added API endpoints**:
   - `POST /api/shifts/send-reminders` - Trigger reminder check manually
   - `GET /api/shifts/reminder-status` - View reminder audit log
5. ✅ **expo-notifications installed** - Ready for push notifications on physical devices

**🟢 Cookie Consent Banner (Complete):**
6. ✅ **Admin Portal** (`/admin-site/`)
   - Cookie banner with Accept All and Settings options
   - Cookie settings modal for granular control
   - Styles and JavaScript fully integrated
7. ✅ **Marketing Website** (`/website/`)
   - Cookie banner matching site design
   - Essential and Analytics cookie options
   - Mobile-responsive layout

**🔵 Report an Issue (BACP Compliance - Complete):**
8. ✅ **Settings page updated** - `/frontend/app/settings.tsx`
   - New "Report an Issue" button with orange flag icon
   - Multi-option alert: Technical Problem, Service Complaint, Safety Concern
   - Safety concern option links to crisis numbers and safeguarding email

**🟣 Data Retention System (From Previous Session - Complete):**
9. ✅ Data retention script and admin API
10. ✅ GDPR "Right to be Forgotten" endpoint

**📊 Mood Tracking Enhancement (From Previous Session - Complete):**
11. ✅ Visual mood timeline graph with trend indicators

### 🔄 Production Setup Required

| Task | Command/Action |
|------|----------------|
| **Schedule Email Reminders** | Add cron: `*/15 * * * * curl -X POST https://api.radiocheck.me/api/shifts/send-reminders` |
| **Schedule Data Retention** | Add cron: `0 2 * * * cd /app/backend && python scripts/data_retention.py` |
| **Redeploy Admin Site** | Upload `/app/admin-site/*` to production server |
| **Redeploy Website** | Upload `/app/website/*` to production server |

---

## Technical Architecture

### Backend Structure (17 Routers)
```
/app/backend/
├── server.py                    # Main entry + AI chat
├── routers/
│   ├── shifts.py                # Updated: reminder endpoints
│   ├── data_retention.py        # GDPR compliance
│   └── ... (15 more routers)
├── scripts/
│   ├── shift_reminders.py       # NEW: Email reminder script
│   └── data_retention.py        # Data cleanup script
└── services/
    └── database.py
```

### Frontend Structure
```
/app/frontend/
├── app/
│   ├── settings.tsx             # Updated: Report an Issue button
│   ├── mood.tsx                 # Updated: Timeline graph
│   ├── hugo-chat.tsx            # Updated: AI consent modal
│   ├── margie-chat.tsx          # Updated: AI consent modal
│   └── bob-chat.tsx             # Updated: AI consent modal
└── src/
    ├── components/
    │   └── AIConsentModal.tsx   # Reusable consent component
    └── services/
        └── pushNotifications.ts # NEW: Push notification service
```

---

## API Endpoints Summary

### New/Updated Endpoints (This Session)
- `POST /api/shifts/send-reminders` - Trigger email reminders
- `GET /api/shifts/reminder-status` - View sent reminders audit
- `POST /api/shifts/register-push-token` - Register device for push

### Key Existing Endpoints
- `GET /api/admin/data-retention/status` - Retention policy status
- `POST /api/admin/data-retention/run` - Run data cleanup
- `DELETE /api/admin/data-retention/user-data/{user_id}` - GDPR deletion

---

## Compliance Status

### GDPR ✅
- ✅ AI consent modal (all chat screens)
- ✅ Data export endpoint
- ✅ Account deletion endpoint
- ✅ Data retention automation
- ✅ Right to be forgotten API
- ✅ Cookie consent banner (admin + website)

### BACP ✅
- ✅ AI disclosure in consent modal
- ✅ Crisis numbers prominently displayed
- ✅ Safeguarding alerts system
- ✅ Safeguarding policy page
- ✅ Report an Issue / Complaints button

---

## Remaining Tasks

### High Priority (P0)
- [ ] Configure Expo project ID for push notifications (requires EAS setup)

### Medium Priority (P1)
- [ ] PHQ-9 / GAD-7 mental health screening tools
- [ ] Create DPIA document for AI processing
- [ ] SMS text reminders (Twilio integration - deferred)

### Future / Backlog
- [ ] Consolidate AI chat screens into single reusable component
- [ ] Welsh language support
- [ ] Structured CBT courses
- [ ] App store assets

---

## Free SMS Options (For Future Reference)
When ready to add SMS reminders:
- **Twilio** - Free trial with ~$15 credit
- **TextBelt** - 1 free SMS/day for testing
- **MessageBird** - Good UK coverage with trial credits

---

## Key Files Changed This Session
- `/app/backend/scripts/shift_reminders.py` - NEW: Reminder script
- `/app/backend/routers/shifts.py` - Added reminder endpoints
- `/app/frontend/app/settings.tsx` - Report an Issue button
- `/app/frontend/src/services/pushNotifications.ts` - NEW: Push service
- `/app/admin-site/index.html` - Cookie banner HTML
- `/app/admin-site/styles.css` - Cookie banner styles
- `/app/admin-site/app.js` - Cookie consent JS
- `/app/website/index.html` - Cookie banner
- `/app/website/styles.css` - Cookie styles
- `/app/website/script.js` - Cookie JS

---

*Last Updated: February 23, 2026*
