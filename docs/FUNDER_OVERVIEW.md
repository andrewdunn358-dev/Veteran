# Radio Check - Project Overview & Development Summary

## For Funders & Stakeholders

---

## 1. WHAT IS RADIO CHECK?

**Radio Check** is a comprehensive mental health and peer support mobile application specifically designed for UK military veterans, serving personnel, and their families.

The name "Radio Check" comes from military communications - it's a way of asking "Are you there? Are you okay?" - which perfectly captures the app's purpose: checking in on veterans' wellbeing and providing support when they need it.

### Target Users
- UK Military Veterans
- Currently Serving Personnel
- Reservists
- Military Families
- Blue Light Services Personnel

---

## 2. THE PROBLEM WE'RE SOLVING

**The Challenge:**
- 1 in 4 veterans experience mental health issues
- Many veterans feel isolated after leaving service
- Traditional mental health services can feel intimidating or have long waiting times
- Veterans often prefer speaking to people who understand military culture
- Crisis support needs to be available 24/7

**Our Solution:**
A mobile app that provides immediate, veteran-friendly mental health support through:
- AI companions trained to understand military culture
- Peer-to-peer connections
- Professional counsellor access
- Self-help tools
- Crisis intervention

---

## 3. COMPLETE FEATURE LIST

### ✅ CURRENTLY WORKING FEATURES

#### A. AI Support Companions (7 Characters)
| Character | Role | Speciality |
|-----------|------|------------|
| Tommy | Peer Support | General veteran support, first point of contact |
| Doris | Wise Elder | Life experience, family matters |
| Bob | Buddy | Casual chat, day-to-day struggles |
| Finch (Sentry) | Crisis Support | Mental health crisis, PTSD |
| Margie | Addiction Support | Substance use, recovery |
| Hugo | Youth Support | Younger veterans, transition issues |
| Rita | Family Support | Relationships, family dynamics |

**Key AI Features:**
- Available 24/7
- GDPR-compliant consent before each chat
- Crisis detection (automatically flags concerning messages)
- Trained on UK veteran-specific knowledge base
- Clear disclaimers that AI is not a replacement for professional help
- Direct links to crisis helplines in every chat

#### B. Mental Health Screening Tools
- **PHQ-9** - Clinical depression screening (9 questions)
- **GAD-7** - Clinical anxiety screening (7 questions)
- Score interpretation with severity levels
- Option to share results with a counsellor
- Automatic crisis warnings for high scores
- Links to appropriate resources based on score

#### C. Mood Tracking & Check-ins
- Daily mood check-in with emoji scale
- Historical mood graph over time
- Trend analysis (improving/stable/declining)
- Streak tracking for daily check-ins
- Period filters (7 days, 30 days, all time)

#### D. Self-Care Tools
- **Breathing Exercises** - Box breathing, 4-7-8 technique
- **Grounding Techniques** - 5-4-3-2-1 sensory exercise
- **Personal Journal** - Private thoughts diary
- **Resources Library** - Helpful information and guides

#### E. Staff Support System
- **Request a Callback** - Veterans can request a call from trained staff
- **Live Chat** - Real-time text chat with counsellors/peers
- **Peer-to-Peer Audio Calls** - Voice calls with support workers
- **Panic Button (SOS)** - Emergency alert to staff

#### F. Buddy Finder
- Connect with other veterans
- Filter by service branch, location, interests
- Peer matching algorithm
- Secure messaging between buddies

#### G. Podcasts Section
- Curated veteran mental health podcasts
- Embedded YouTube player
- Auto-updating from podcast RSS feeds
- 8 recommended veteran podcasts

#### H. Staff Portal (Web)
- Staff login and dashboard
- View and manage shifts
- Callback queue management
- Case notes system
- Team visibility (who's on duty)
- **Shift swap/cover requests**

#### I. Admin Portal (Web)
- Complete staff management (counsellors & peer supporters)
- **Staff Rota Dashboard** - Who's on shift, coverage gaps
- **Swap Request Approval** - Approve/reject shift changes
- Content Management System (CMS)
- Safeguarding alerts dashboard
- Compliance and audit logging
- Analytics and reporting

#### J. Compliance & Safety Features
- **GDPR Compliant** - Data export, deletion, consent management
- **BACP Aligned** - Ethical framework compliance
- **Cookie Consent** - On all web portals
- **AI Disclaimers** - Clear on every AI chat
- **Crisis Numbers** - Prominent on every support page
- **Safeguarding Alerts** - Automatic flagging system
- **Data Retention** - Automated cleanup per retention policies
- **Report an Issue** - Complaints and feedback system

#### K. Notifications & Reminders
- Email reminders to staff (24hr and 1hr before shifts)
- Push notification infrastructure (ready for activation)

---

### ⏳ FEATURES READY BUT NEED CONFIGURATION

| Feature | Status | What's Needed |
|---------|--------|---------------|
| Push Notifications | Infrastructure built | Expo account setup |
| SMS Reminders | API ready | Twilio account |
| Email Notifications | Working | Production email domain |

---

### 🔜 PLANNED FUTURE FEATURES

| Feature | Description | Priority |
|---------|-------------|----------|
| Welsh Language | Full app translation | Medium |
| CBT Courses | Structured therapy modules | Medium |
| Video Calls | Face-to-face with counsellors | Low |
| App Store Release | iOS & Android publishing | High |
| Offline Mode | Access when no internet | Medium |

---

## 4. TECHNICAL ARCHITECTURE

### How It's Built

```
┌─────────────────────────────────────────────────────────┐
│                    MOBILE APP                           │
│              (React Native + Expo)                      │
│         iOS, Android, and Web compatible                │
└─────────────────────┬───────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────┐
│                  BACKEND API                            │
│              (Python + FastAPI)                         │
│    • User Authentication    • AI Chat Processing       │
│    • Staff Management       • Shift Scheduling         │
│    • Safeguarding Alerts    • Callback Queue           │
│    • Live Chat (WebSocket)  • Audio Calls (WebRTC)     │
└─────────────────────┬───────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────┐
│                   DATABASE                              │
│                   (MongoDB)                             │
│    • User profiles          • Chat history             │
│    • Mood entries           • Shifts & schedules       │
│    • Safeguarding logs      • Audit trail              │
└─────────────────────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────┐
│               THIRD-PARTY SERVICES                      │
│  • OpenAI (AI chat)         • Resend (emails)          │
│  • YouTube (podcasts)       • MongoDB Atlas (database) │
└─────────────────────────────────────────────────────────┘
```

### Where It's Hosted
| Component | Platform | Cost |
|-----------|----------|------|
| Mobile App / Web | Vercel | Free tier |
| Backend API | Render | Free tier |
| Database | MongoDB Atlas / Render | Free tier |
| Admin Portal | 20i Hosting | Existing hosting |
| Staff Portal | 20i Hosting | Existing hosting |

---

## 5. DEVELOPMENT EFFORT BREAKDOWN

### What Has Been Built

| Area | Components | Complexity |
|------|------------|------------|
| **Mobile App** | 40+ screens, full navigation | High |
| **AI System** | 7 AI characters, knowledge base, crisis detection | High |
| **Backend API** | 18 API routers, 200+ endpoints | High |
| **Staff Portal** | Complete dashboard, real-time features | Medium |
| **Admin Portal** | Full CMS, analytics, compliance tools | Medium |
| **Marketing Site** | Landing page, about, contact | Low |

### Key Development Sessions

| Session | Work Completed |
|---------|----------------|
| Initial Build | Core app structure, authentication, basic AI chat |
| AI Enhancement | 7 AI personas, knowledge base integration |
| Staff System | Shift scheduling, callbacks, live chat |
| Audio Calls | Peer-to-peer WebRTC voice calls |
| CMS | Dynamic content management |
| Compliance | GDPR, BACP, consent management |
| Podcasts | YouTube integration, RSS feeds |
| Screening | PHQ-9, GAD-7 clinical tools |
| Shift Swaps | Cover request system |
| Rota Dashboard | Staff visibility, coverage tracking |

### Lines of Code (Approximate)
- **Frontend (React Native)**: ~25,000 lines
- **Backend (Python)**: ~8,000 lines
- **Admin Portal**: ~3,000 lines
- **Staff Portal**: ~2,500 lines
- **Total**: ~38,500 lines of code

---

## 6. WHAT THE APP CANNOT DO

### Important Limitations

| Limitation | Explanation |
|------------|-------------|
| **Not a Medical Device** | Cannot diagnose or treat conditions |
| **AI is Not a Therapist** | AI companions provide support, not therapy |
| **Not a Replacement for 999** | Emergency situations need emergency services |
| **No Video Therapy** | Currently text/voice only |
| **Not Yet on App Stores** | Needs submission to Apple/Google |
| **Requires Internet** | No offline mode yet |
| **UK Focused** | Crisis numbers and services are UK-specific |

### Clear User Disclaimers
- All AI chats begin with consent and disclaimers
- Crisis numbers displayed prominently
- Users advised to seek professional help for serious concerns
- Data is not shared with NHS or other services without consent

---

## 7. SAFEGUARDING & COMPLIANCE

### Built-In Safety Measures

1. **Crisis Detection**
   - AI monitors for concerning keywords
   - Automatic alerts to safeguarding team
   - Immediate crisis resources shown

2. **Audit Trail**
   - All interactions logged
   - Compliance dashboard for oversight
   - Data retention policies enforced

3. **Staff Verification**
   - All staff must be approved by admin
   - Role-based access control
   - Activity logging

4. **Data Protection**
   - GDPR compliant
   - Right to data export
   - Right to deletion
   - Consent management
   - Data retention automation

---

## 8. HOW IT WOULD BE USED

### User Journey Example

```
1. Veteran downloads app
         ↓
2. Creates account (or uses anonymously)
         ↓
3. Daily check-in: "How are you feeling today?"
         ↓
4. If struggling → Chat with AI companion (Tommy)
         ↓
5. If needs more support → Request callback from staff
         ↓
6. If in crisis → Panic button → Immediate staff alert
         ↓
7. Ongoing → Uses self-care tools, tracks mood, connects with buddies
```

### Staff Journey Example

```
1. Staff member logs into portal
         ↓
2. Views today's shifts and callbacks
         ↓
3. Sees who else is on duty
         ↓
4. Handles callback queue
         ↓
5. Can request cover if needed (swap system)
         ↓
6. Receives email reminders before shifts
```

---

## 9. RUNNING COSTS (ESTIMATED)

### Current (Development/Testing)
| Service | Monthly Cost |
|---------|--------------|
| Vercel | £0 (free tier) |
| Render | £0 (free tier) |
| MongoDB | £0 (free tier) |
| OpenAI API | ~£10-50 depending on usage |
| Resend (email) | £0 (free tier) |
| 20i Hosting | Existing |
| **Total** | **~£10-50/month** |

### Production (Full Launch)
| Service | Monthly Cost |
|---------|--------------|
| Vercel Pro | ~£15 |
| Render Starter | ~£5 |
| MongoDB | ~£0-20 |
| OpenAI API | ~£50-200 |
| Resend | ~£20 |
| SMS (Twilio) | ~£30-100 |
| **Total** | **~£120-360/month** |

---

## 10. NEXT STEPS FOR LAUNCH

### Immediate (Before Public Use)
- [ ] Submit to Apple App Store
- [ ] Submit to Google Play Store
- [ ] Set up production email domain
- [ ] Configure push notifications
- [ ] Security audit
- [ ] User testing with veterans

### Short-Term
- [ ] Train staff on portal usage
- [ ] Set up monitoring and alerts
- [ ] Create user guides
- [ ] Establish safeguarding procedures

### Medium-Term
- [ ] Welsh language support
- [ ] NHS integration discussions
- [ ] Expand AI knowledge base
- [ ] Add structured therapy courses

---

## 11. SUMMARY

**Radio Check is a fully functional mental health support app** built specifically for UK veterans. It combines:

- **Immediate AI support** - 24/7 availability
- **Human connection** - Staff and peer support
- **Clinical tools** - PHQ-9, GAD-7 screening
- **Self-help resources** - Breathing, grounding, journaling
- **Professional oversight** - Admin dashboard, safeguarding

**The technology is built and working.** What's needed now is:
1. Funding for production hosting and AI costs
2. Staff training
3. App store submissions
4. Marketing and outreach to veterans

---

*Document prepared: February 2026*
*For questions: [Your Contact Details]*
