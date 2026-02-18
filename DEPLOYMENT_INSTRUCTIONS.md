# Radio Check - Deployment Instructions
## What to Update on Your Hosting (Morning Checklist)

---

## 1. STAFF PORTAL UPDATE (20i Hosting)

### File to Upload
`/app/staff-portal/staff-portal-safeguarding.zip`

### Steps
1. Log into your 20i hosting control panel
2. Navigate to File Manager → `veteran.dbty.co.uk/staff-portal/` (or your staff portal directory)
3. **Backup**: Download existing files first
4. Delete existing files: `index.html`, `app.js`, `styles.css`, `config.js`
5. Upload `staff-portal-safeguarding.zip`
6. Extract the ZIP file
7. Delete the ZIP file after extraction
8. Test: Visit your staff portal URL and login as admin

### What's New in Staff Portal
- **Safeguarding Alerts Section** with:
  - Risk level badges (RED/AMBER with scores)
  - Triggered indicators display
  - Acknowledge and Resolve buttons
  - Auto-refresh every 30 seconds
  - Pulsing animation for active RED alerts

---

## 2. FEATURE LIST DOCUMENT

### File Location
`/app/FEATURE_LIST.md`

### What to Do
- Download this file
- Upload to your admin site or documentation area
- This is your complete reference for all app features

---

## 3. TRAINING PORTAL (WordPress + Tutor LMS)

### Files Location
- `/app/training-portal/course-structure.md` - Course outline
- `/app/training-portal/radio-check-theme.css` - CSS theme

### Setup Steps
1. Install WordPress with Astra theme
2. Install Tutor LMS plugin
3. Go to **Appearance → Customize → Additional CSS**
4. Paste contents of `radio-check-theme.css`
5. Create courses following `course-structure.md`

---

## 4. VERIFY EVERYTHING WORKS

### Test Checklist

#### Splash Screen
- [ ] Open app at `veteran.dbty.co.uk` (or your URL)
- [ ] See two-option question: "Do you need to speak with someone right now?"
- [ ] "Yes" goes to crisis support
- [ ] "No" goes to home page

#### AI Battle Buddies
- [ ] Navigate to home → See "We're on stag 24/7" at top
- [ ] Click "About Tommy & Doris" → Modal opens
- [ ] Start chat with Tommy or Doris
- [ ] Chat has squaddie banter for casual messages

#### Safeguarding Test
- [ ] In AI chat, type: "I feel like I want to end it all"
- [ ] Modal appears with:
  - Request Callback option
  - Connect Now (if staff available)
  - Samaritans link
  - 999 notice
- [ ] Click "Request Callback" → Form appears
- [ ] Enter phone number and submit

#### Staff Portal Test
- [ ] Login as admin
- [ ] See Safeguarding Alerts section (red border)
- [ ] Alerts show risk level (RED/AMBER) and score
- [ ] Click Acknowledge → Status changes
- [ ] Click Resolve → Can add notes

---

## 5. IMPORTANT NOTES

### Safeguarding Alert Flow
1. User sends crisis message in AI chat
2. System detects keywords (weighted scoring)
3. Score ≥60 (AMBER) or any RED indicator triggers modal
4. User can:
   - Request callback → Creates callback with phone number
   - Connect live → If staff available, creates urgent callback
   - Call Samaritans → Opens phone dialer
5. Alert created in database
6. Staff see alert in Staff Portal
7. Staff acknowledges and resolves

### Callback Request with Phone Number
When safeguarding triggers:
- User can enter their phone number in the modal
- Creates an URGENT callback request
- Staff see it in Callbacks section with "SAFEGUARDING" tag
- Staff can call user back directly

---

## 6. FILES SUMMARY

| File | Location | Purpose |
|------|----------|---------|
| `staff-portal-safeguarding.zip` | `/app/staff-portal/` | Updated Staff Portal |
| `FEATURE_LIST.md` | `/app/` | Complete feature documentation |
| `course-structure.md` | `/app/training-portal/` | LMS course outline |
| `radio-check-theme.css` | `/app/training-portal/` | WordPress CSS theme |

---

## 7. SUPPORT CONTACTS

If something doesn't work:
1. Check browser console for errors (F12)
2. Check backend logs on Render
3. Verify API URL in `config.js` matches your backend

---

*Good luck! Get some rest. 😴*
