# Radio Check - UK Veterans Mental Health Support Platform

## Product Overview
Radio Check is a comprehensive mental health and peer support application designed specifically for UK military veterans. The platform provides 24/7 access to AI-powered support, live chat with trained counsellors and peer supporters, and emergency callback services.

## Core Architecture
- **Frontend**: React/Expo web application
- **Backend**: Python FastAPI with MongoDB
- **Admin Portal**: Vanilla JS/HTML (hosted on 20i)
- **Staff Portal**: Vanilla JS/HTML (hosted on 20i)
- **Hosting**: Frontend on Vercel, Backend on Render

## Key Integrations
1. **Twilio Voice SDK** - Browser-to-phone calling for staff (WORKING)
2. **ExpressTURN** - WebRTC NAT traversal for in-app calls
3. **OpenAI GPT-4o-mini** - AI chat personas
4. **Resend** - Email notifications
5. **Socket.IO** - Real-time messaging and signaling

## AI Characters (10 total)
1. **Frankie** - PTI Physical Training Instructor with 12-week programme & gamification
2. **Tommy** - Battle buddy, straight-talking support
3. **Rachel** (formerly Doris) - Nurturing, compassionate presence
4. **Bob** - Down-to-earth ex-Para
5. **Finch** - Military law expertise
6. **Hugo** - Wellbeing coach & services navigator
7. **Margie** - Addiction support
8. **Rita** - Family support
9. **Catherine** - Self-care & mindfulness

## Main App Sections
1. **Need to Talk?** - Crisis support (Primary)
2. **The Gym** (NEW) - Frankie's 12-week fitness programme
3. **Talk to a Veteran** - Peer support
4. **Warfare on Lawfare** - Historical investigations
5. **Support Organisations** - Directory
6. **Self-Care Tools** - Journal, grounding, breathing
7. **Friends & Family** - Support for loved ones
8. **Addictions** - Substance support
9. **Criminal Justice Support** - Prison/leaving support
10. **Recommended Podcasts** - Veteran stories
11. **Request a Callback** - We'll call you back

## Implemented Features
- [x] AI Chat Personas (9 characters + Frankie)
- [x] Live Chat with staff
- [x] Callback request system
- [x] Safeguarding alert system with geolocation
- [x] Case management system
- [x] Staff rota/availability system
- [x] WebRTC in-app calling
- [x] Twilio browser-to-phone calling
- [x] Staff portal with tabbed interface
- [x] Admin content management system
- [x] Panic button (peer to counsellor escalation)
- [x] Session timeout and security
- [x] **The Gym** - Full fitness feature with:
  - 12-week progressive programme (3 phases)
  - Standards Score gamification
  - 6 Badges to earn
  - Military Challenge Ladder
  - Veteran fitness resources
  - Progress tracking (localStorage)

## Current Status (March 2026)

### Recently Implemented (This Session)
- **Frankie PTI Character** - Full AI persona with PTI banter
- **The Gym Page** - Complete fitness feature
- **Rachel Name Fix** - Doris → Rachel throughout

### Pending Issues
- **Live Chat UI** - Messages not visible in staff portal (fix ready, needs 20i upload)
- **Vercel Build** - Lock file conflict resolved

## File Structure
```
/app
├── backend/
│   ├── server.py              # FRANKIE_SYSTEM_PROMPT
│   ├── routers/
│   │   ├── ai_characters.py
│   │   └── cms.py
│   └── enhanced_safety_layer.py
├── frontend/
│   ├── app/
│   │   ├── home.tsx           # The Gym card added
│   │   └── gym.tsx            # NEW - The Gym page
│   └── public/images/
│       └── frankie.png        # Frankie avatar
├── staff-portal/              # Needs upload to 20i
└── memory/
    └── PRD.md
```

## Backlog (P1/P2)
- [ ] Add Frankie to external website AI Team
- [ ] Convert Expo to Next.js
- [ ] Welsh Language Support
- [ ] Mood Tracker Journal
- [ ] Appointment Booking System
- [ ] CBT Courses

## Key Credentials/Config
- Twilio credentials in backend/.env
- Staff portal: staffportal.radiocheck.me (20i)
- Production API: veterans-support-api.onrender.com
