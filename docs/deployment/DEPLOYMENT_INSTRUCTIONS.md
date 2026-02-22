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

## 2. NEW FEATURES ADDED

### Friends & Family Section
- Accessible from home page via "Friends & Family" card
- **Raise a Concern** form for worried family/friends
- **Signs to Look For** - educational content
- **Support Services** - Op Courage, Combat Stress, Men's Sheds, etc.
- **Armed Forces Covenant** info

### Enhanced Safeguarding Indicators
Now detects:
- **Addiction**: gambling, drinking to cope, drug use
- **Offending/Legal**: prison, court, anger issues, assault
- **Self-care deterioration**: not eating, not showering
- **Sleep changes**: insomnia, sleeping all day
- **Pride/Stigma barriers**: "too proud", "sign of weakness", "others had it worse"

### API Endpoints Added
- `POST /api/concerns` - Submit concern (public)
- `GET /api/concerns` - List concerns (staff only)
- `PATCH /api/concerns/{id}/status` - Update concern status

---

## 3. FEATURE LIST DOCUMENT

### File Location
`/app/FEATURE_LIST.md`

### What to Do
- Download this file
- Upload to your admin site or documentation area
- This is your complete reference for all app features

---

## 4. TRAINING PORTAL (WordPress + Tutor LMS)

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

## 5. VERIFY EVERYTHING WORKS

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
- [ ] Modal appears with callback/connect options
- [ ] Click "Request Callback" → Form appears
- [ ] Enter phone number and submit

#### Friends & Family Test
- [ ] Navigate to /family-friends or click card on home page
- [ ] See "Worried About Someone?" intro
- [ ] Click "Raise a Concern" → Form appears
- [ ] Fill in test data and submit
- [ ] Check Staff Portal for new concern

#### Staff Portal Test
- [ ] Login as admin
- [ ] See Safeguarding Alerts section (red border)
- [ ] Alerts show risk level (RED/AMBER) and score
- [ ] Click Acknowledge → Status changes
- [ ] Click Resolve → Can add notes

---

## 6. FILES SUMMARY

| File | Location | Purpose |
|------|----------|---------|
| `staff-portal-safeguarding.zip` | `/app/staff-portal/` | Updated Staff Portal |
| `FEATURE_LIST.md` | `/app/` | Complete feature documentation |
| `DEPLOYMENT_INSTRUCTIONS.md` | `/app/` | This file - setup guide |
| `course-structure.md` | `/app/training-portal/` | LMS course outline |
| `radio-check-theme.css` | `/app/training-portal/` | WordPress CSS theme |

---

## 7. NEW PAGES ADDED

| Page | URL | Purpose |
|------|-----|---------|
| Friends & Family | `/family-friends` | Support for concerned family/friends |

---

## 8. SUPPORT SERVICES INCLUDED

The Friends & Family page includes links to:
- **Op Courage** (NHS) - 0300 323 0137
- **Combat Stress** - 0800 138 1619
- **SSAFA** - 0800 260 6767
- **Royal British Legion** - 0808 802 8080
- **Men's Sheds** - menssheds.org.uk
- **Samaritans** - 116 123
- **Armed Forces Covenant** - armedforcescovenant.gov.uk

---

*Good luck! Get some rest. 😴*
