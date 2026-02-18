# Radio Check - Complete Feature List
## UK Veterans Support Application
---

## 1. MOBILE APP (React Native / Expo)

### 1.1 Splash Screen
- Welcome message: "You're not alone. We're here for you."
- **Two-option routing:**
  - "Yes, connect me now" → Routes to crisis support/counsellor
  - "No, I'll explore the app" → Routes to home page
- Emergency notice: "In an emergency, always call 999"
- Privacy consent modal

### 1.2 Home Page
- **"We're on stag 24/7"** - AI Battle Buddies (Tommy & Doris) featured at top
- "About Tommy & Doris" button with modal description
- "Need to Talk?" button → Crisis support
- "Talk to Another Veteran" → Peer support
- "Request a Callback" → Callback request form
- Self-Care Tools section:
  - Mood tracker
  - Journal
  - Breathing exercises
  - Resources
- Staff Portal login link
- Settings (light/dark mode)

### 1.3 AI Battle Buddies (Tommy & Doris)
**Character Selection Screen:**
- Tommy: Male veteran persona, squaddie banter, military slang
- Doris: Female veteran/forces wife persona, warm with wit
- Each has unique avatar and personality

**Chat Features:**
- Real-time AI-powered conversation (OpenAI GPT-4o-mini)
- Squaddie banter and military slang when mood is light
- Proper support when user is struggling
- Session-based conversation history
- "Talk to a peer" and "Talk to a counsellor" quick buttons

**Safeguarding System (BACP-Aligned):**
- Weighted risk scoring (0-100+)
- Risk levels: GREEN (0-29), YELLOW (30-59), AMBER (60-89), RED (90+)
- RED indicators: suicide ideation, method references, self-harm, weapon access
- AMBER indicators: numbness, PTSD symptoms, isolation, substance misuse
- Modifiers: dark humour, minimisation, repeated indicators
- **When triggered, modal appears with:**
  - "Request a Callback" - capture phone number
  - "Connect Now" - shows available counsellors/peers
  - Samaritans link (116 123)
  - 999 emergency notice

### 1.4 Crisis Support Page
- Direct access to counsellor support
- Emergency contacts
- Back navigation to home

### 1.5 Peer Support Page
- Connect with peer supporters
- Registration form for becoming a peer

### 1.6 Callback Request
- Name and phone number form
- Choice: Counsellor or Peer callback
- Optional notes
- Creates callback in system for staff to action

### 1.7 Self-Care Tools
- **Mood Tracker**: Log daily moods with notes
- **Journal**: Private journal entries
- **Breathing Exercises**: Guided breathing techniques
- **Resources**: Curated support resources

### 1.8 Settings
- Light/Dark mode toggle
- App version info

---

## 2. BACKEND API (FastAPI + MongoDB)

### 2.1 Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - JWT login
- `POST /api/auth/forgot-password` - Password reset email
- `POST /api/auth/reset-password` - Reset with token

### 2.2 AI Battle Buddies
- `GET /api/ai-buddies/characters` - Get character info
- `POST /api/ai-buddies/chat` - Chat with AI (includes safeguarding check)
- `POST /api/ai-buddies/reset` - Reset session

### 2.3 Safeguarding Alerts
- `GET /api/safeguarding-alerts` - List alerts (counsellors/admins)
- `PATCH /api/safeguarding-alerts/{id}/acknowledge` - Acknowledge alert
- `PATCH /api/safeguarding-alerts/{id}/resolve` - Resolve with notes

### 2.4 Callbacks
- `POST /api/callbacks` - Create callback request
- `GET /api/callbacks` - List callbacks (filtered by role)
- `PATCH /api/callbacks/{id}/take` - Take callback
- `PATCH /api/callbacks/{id}/release` - Release callback
- `PATCH /api/callbacks/{id}/complete` - Complete callback

### 2.5 Panic Alerts
- `POST /api/panic-alert` - Create panic alert (peers)
- `GET /api/panic-alerts` - List alerts (counsellors/admins)
- `PATCH /api/panic-alerts/{id}/acknowledge` - Acknowledge
- `PATCH /api/panic-alerts/{id}/resolve` - Resolve

### 2.6 Staff Notes
- `POST /api/notes` - Create note
- `GET /api/notes` - List notes (own + shared)
- `GET /api/notes/{id}` - Get note
- `PATCH /api/notes/{id}` - Update note
- `DELETE /api/notes/{id}` - Delete note
- `GET /api/staff-users` - List staff for sharing

### 2.7 Staff Management
- `GET /api/counsellors/available` - Available counsellors
- `GET /api/peer-supporters/available` - Available peers
- `PATCH /api/admin/counsellors/{id}/status` - Update status
- `PATCH /api/admin/peer-supporters/{id}/status` - Update status

### 2.8 Peer Support Registration
- `POST /api/peer-support/register` - Register interest
- `GET /api/peer-support/registrations` - List registrations

### 2.9 Resources & Organizations
- `GET /api/resources` - List resources
- `GET /api/organizations` - List organizations

---

## 3. STAFF PORTAL (Static HTML/JS)

### 3.1 Login
- Email/password authentication
- Role-based access (admin, counsellor, peer)

### 3.2 Dashboard
- Overview of pending items
- Quick actions

### 3.3 Safeguarding Alerts Section
- List of active/acknowledged alerts
- Risk level badges (RED/AMBER with scores)
- Triggered indicators display
- Session ID and timestamp
- Acknowledge and Resolve actions
- Auto-refresh every 30 seconds
- Pulsing animation for active alerts

### 3.4 Panic Alerts Section
- List of panic alerts from peers
- Acknowledge and resolve actions

### 3.5 Callbacks Section
- List of callback requests
- Take, release, complete actions
- Filter by status

### 3.6 Notes Section
- Create notes (private or shared)
- Link notes to callbacks
- Share with specific staff members

### 3.7 Status Toggle
- Set yourself as available/unavailable

---

## 4. ADMIN SITE (Static HTML/JS)

### 4.1 Admin Functions
- User management
- Staff status management
- Settings configuration
- Notification email setup

---

## 5. TRAINING PORTAL ASSETS

### 5.1 Course Structure (10 Modules)
1. Introduction to Peer Support
2. Understanding Veterans' Challenges
3. Active Listening Skills
4. Communication Techniques
5. Recognising Warning Signs
6. Safeguarding & Escalation
7. Self-Care for Supporters
8. Resources & Signposting
9. Practical Scenarios
10. Assessment & Certification

### 5.2 CSS Themes
- `radio-check-theme.css` - For WordPress/Astra/Tutor LMS
- `formalms-theme.css` - For FormaLMS

---

## 6. INTEGRATIONS

### 6.1 OpenAI
- GPT-4o-mini for AI chat
- Configured via OPENAI_API_KEY

### 6.2 Resend (Email)
- Password reset emails
- Peer registration notifications
- Safeguarding alert emails

### 6.3 MongoDB
- All data storage
- Collections: users, counsellors, peer_supporters, callbacks, panic_alerts, safeguarding_alerts, notes, settings, etc.

---

## 7. SECURITY & COMPLIANCE

### 7.1 Authentication
- JWT-based authentication
- Password hashing (bcrypt)
- Role-based access control

### 7.2 Safeguarding
- BACP-aligned triage system
- Weighted risk scoring
- Automatic escalation
- Audit trail via database logging

### 7.3 Data Protection
- No personal data sent to external servers without consent
- Local storage for preferences
- Anonymous AI chat sessions

---

## 8. DEPLOYMENT ARCHITECTURE

| Component | Platform |
|-----------|----------|
| Mobile App | Vercel (Expo Web) |
| Backend API | Render |
| Database | MongoDB Atlas |
| Admin Site | 20i Hosting |
| Staff Portal | 20i Hosting |
| Training Portal | WordPress (user-hosted) |

---

## 9. ENVIRONMENT VARIABLES

### Backend (.env)
```
MONGO_URL=mongodb+srv://...
DB_NAME=veteran_support
OPENAI_API_KEY=sk-...
RESEND_API_KEY=re_...
JWT_SECRET=...
FRONTEND_URL=https://...
```

### Frontend (.env)
```
EXPO_PUBLIC_BACKEND_URL=https://...
```

---

## 10. CREDENTIALS

- **Admin**: admin@veteran.dbty.co.uk / ChangeThisPassword123!
- **Test Counsellor**: drtest@test.email / (user-defined)

---

*Last Updated: February 2026*
*Version: 2.0*
