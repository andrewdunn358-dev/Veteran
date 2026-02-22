# Radio Check - Complete System Documentation
## UK Armed Forces Mental Health & Peer Support Platform

**Version:** 2.0  
**Last Updated:** February 2026  
**Classification:** Internal Documentation

---

# Table of Contents

1. [Executive Summary](#executive-summary)
2. [Vision & Purpose](#vision--purpose)
3. [Platform Overview](#platform-overview)
4. [Technical Architecture](#technical-architecture)
5. [AI Battle Buddies](#ai-battle-buddies)
6. [User Roles & Access](#user-roles--access)
7. [Core Features](#core-features)
8. [Safeguarding System](#safeguarding-system)
9. [Legal & GDPR Compliance](#legal--gdpr-compliance)
10. [Security Architecture](#security-architecture)
11. [Data Architecture](#data-architecture)
12. [API Reference](#api-reference)
13. [Deployment & Infrastructure](#deployment--infrastructure)
14. [Design Philosophy](#design-philosophy)
15. [Future Roadmap](#future-roadmap)

---

# Executive Summary

**Radio Check** is a comprehensive mental health and peer support platform designed specifically for UK Armed Forces veterans and serving personnel. The platform combines AI-powered companions, human peer support, professional counsellor access, and family support resources into a single, accessible application.

### Key Statistics
- **8 AI Battle Buddies** with distinct personalities
- **3 User Portals** (Mobile App, Staff Portal, Admin Portal)
- **5 User Roles** (User, Counsellor, Peer Supporter, Staff, Admin)
- **Multi-layered safeguarding** with real-time risk assessment
- **GDPR compliant** with full data subject rights

### Core Problem Solved
Veterans and serving personnel often struggle to seek help due to stigma, accessibility issues, or not knowing where to turn. Radio Check provides:
- **24/7 AI support** - Always available, no waiting
- **Peer connection** - Talk to someone who understands
- **Professional access** - Connect with trained counsellors
- **Family support** - Resources for loved ones
- **Crisis intervention** - Automated safeguarding when needed

---

# Vision & Purpose

## The "Radio Check" Concept

In military communications, a "radio check" is a routine call to confirm the communication link is working. It's a simple check-in that says "I'm here, can you hear me?"

This platform extends that concept to mental health: **a simple way to check in, be heard, and know someone is there.**

## Target Audience

### Primary Users
- **Veterans** - Those who have completed military service
- **Serving Personnel** - Active duty across all branches
- **Reservists** - Part-time service members

### Secondary Users
- **Partners & Spouses** - Living with military life's challenges
- **Parents** - Supporting children in/after service
- **Adult Children** - Dealing with a parent's service impact
- **Close Family** - Anyone affected by military connection

### Service Branches Supported
- British Army
- Royal Navy
- Royal Air Force
- Royal Marines
- Reserve Forces

## Design Philosophy

### 1. Accessibility First
- Mobile-first design for on-the-go access
- Simple, intuitive interfaces
- Works on low bandwidth connections
- No complex registration barriers

### 2. Military-Aware
- Language and tone that resonates with service culture
- Understanding of ranks, regiments, and traditions
- Awareness of deployment cycles and transition challenges
- No "civvy" disconnect

### 3. Safety by Design
- Safeguarding built into every interaction
- Crisis resources always visible
- Escalation paths clear and immediate
- No AI "hallucination" risks for crisis situations

### 4. Privacy Respecting
- Minimal data collection
- Local storage where possible
- Full GDPR compliance
- Anonymity options available

---

# Platform Overview

## Three-Portal Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        RADIO CHECK PLATFORM                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │  MOBILE APP  │  │ STAFF PORTAL │  │ ADMIN PORTAL │          │
│  │   (Expo/RN)  │  │    (HTML)    │  │    (HTML)    │          │
│  │              │  │              │  │              │          │
│  │ • AI Chat    │  │ • Calendar   │  │ • User Mgmt  │          │
│  │ • Buddy Find │  │ • Shifts     │  │ • CMS Editor │          │
│  │ • Resources  │  │ • Callbacks  │  │ • Analytics  │          │
│  │ • Self-Care  │  │ • Notes      │  │ • Logs       │          │
│  │ • Journal    │  │              │  │ • Safeguard  │          │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘          │
│         │                 │                 │                   │
│         └────────────────┼────────────────┘                    │
│                          │                                      │
│                    ┌─────▼─────┐                                │
│                    │  FastAPI  │                                │
│                    │  Backend  │                                │
│                    └─────┬─────┘                                │
│                          │                                      │
│         ┌────────────────┼────────────────┐                    │
│         │                │                │                     │
│    ┌────▼────┐     ┌─────▼─────┐    ┌─────▼─────┐             │
│    │ MongoDB │     │  OpenAI   │    │  Resend   │             │
│    │   Atlas │     │   API     │    │   Email   │             │
│    └─────────┘     └───────────┘    └───────────┘             │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## User Journey

```
New User                    Returning User              Crisis User
    │                            │                          │
    ▼                            ▼                          ▼
┌─────────┐               ┌─────────┐               ┌─────────┐
│  Home   │               │  Login  │               │  Home   │
│  Page   │               │         │               │  Page   │
└────┬────┘               └────┬────┘               └────┬────┘
     │                         │                         │
     ▼                         ▼                         ▼
┌─────────┐               ┌─────────┐               ┌─────────┐
│  Browse │               │Dashboard│               │  PANIC  │
│AI Buddy │               │         │               │  BUTTON │
└────┬────┘               └────┬────┘               └────┬────┘
     │                         │                         │
     ▼                         ▼                         ▼
┌─────────┐               ┌─────────┐               ┌─────────┐
│  Chat   │               │Continue │               │ Crisis  │
│  Start  │               │  Chat   │               │Resources│
└────┬────┘               └────┬────┘               └────┬────┘
     │                         │                         │
     ▼                         ▼                         ▼
┌─────────┐               ┌─────────┐               ┌─────────┐
│Safeguard│◄──────────────│Safeguard│◄──────────────│  Alert  │
│ Monitor │               │ Monitor │               │ Created │
└─────────┘               └─────────┘               └─────────┘
```

---

# Technical Architecture

## Technology Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Mobile App** | React Native + Expo | Cross-platform mobile experience |
| **Web Portals** | HTML5 + Vanilla JS | Staff and Admin interfaces |
| **Backend** | Python + FastAPI | API server |
| **Database** | MongoDB Atlas | Document storage |
| **AI** | OpenAI GPT-4 | Conversational AI |
| **Email** | Resend | Transactional emails |
| **Auth** | JWT + bcrypt | Secure authentication |
| **Encryption** | AES-256 (Fernet) | Field-level encryption |
| **Hosting** | Render | Cloud deployment |

## Backend Structure

```
/app/backend/
├── server.py              # Main FastAPI application (~5500 lines)
├── encryption.py          # AES-256 field encryption
├── safety.py              # Enhanced safeguarding AI
├── .env                   # Environment configuration
│
├── models/
│   └── schemas.py         # All Pydantic data models
│
├── routers/               # Modular API routes (ready for migration)
│   ├── auth.py           # Authentication endpoints
│   ├── cms.py            # Content management
│   ├── buddy_finder.py   # Peer matching
│   └── shifts.py         # Staff scheduling
│
├── services/
│   └── database.py       # MongoDB connection utilities
│
└── ARCHITECTURE.md        # Migration documentation
```

## Frontend Structure

```
/app/frontend/             # React Native Expo App
├── app/                   # Screen components
│   ├── (tabs)/           # Tab-based navigation
│   │   ├── home.tsx
│   │   ├── self-care.tsx
│   │   ├── family-friends.tsx
│   │   ├── buddy-finder.tsx
│   │   └── my-availability.tsx
│   ├── ai-chat.tsx       # AI conversation screen
│   ├── login.tsx
│   └── ...
├── src/
│   ├── context/          # React context (Theme, Auth)
│   ├── hooks/            # Custom hooks (useCMS, etc.)
│   └── components/       # Shared components
└── assets/               # Images, fonts

/app/admin-site/           # Admin Portal (Static HTML)
├── index.html
├── app.js                # Main application logic
├── styles.css
└── config.js             # API URL configuration

/app/staff-portal/         # Staff Portal (Static HTML)
├── index.html
├── app.js
├── styles.css
└── config.js

/app/website/              # Marketing Website
├── index.html
├── about.html
├── privacy.html
├── legal.html
└── ai-team.html
```

## Database Collections

| Collection | Purpose | Key Fields |
|------------|---------|------------|
| `users` | User accounts | id, email, password_hash, role, name |
| `counsellors` | Counsellor profiles | id, user_id, name, specialization, status |
| `peer_supporters` | Peer supporter profiles | id, user_id, service_branch, regiment |
| `buddy_profiles` | Buddy Finder profiles | id, user_id, display_name, region, interests |
| `buddy_messages` | Peer messages | from_profile_id, to_profile_id, message |
| `shifts` | Staff availability | user_id, date, start_time, end_time |
| `callback_requests` | Callback queue | name, phone, reason, status |
| `safeguarding_alerts` | Risk alerts | session_id, risk_level, message |
| `panic_alerts` | Emergency alerts | user_id, location, status |
| `cms_pages` | CMS pages | slug, title, sections |
| `cms_sections` | Page sections | page_slug, title, cards |
| `cms_cards` | Content cards | section_id, title, icon, route |
| `call_logs` | Call history | caller_id, contact_type, duration |
| `chat_sessions` | AI chat logs | session_id, character, messages |
| `notes` | Staff notes | author_id, title, content |
| `concerns` | User concerns | user_id, concern_type, severity |

---

# AI Battle Buddies

## Overview

Radio Check features **8 distinct AI companions**, each with unique personalities designed to connect with different user preferences and needs. All share the same core safeguarding protocols but differ in communication style.

## Character Profiles

### 1. Tommy 🎖️
**Archetype:** The Reliable Squaddie Mate
- **Age:** 40s
- **Tone:** Warm, steady, uses military banter
- **Best For:** Veterans who want someone who "gets it"
- **Language:** "Alright mucker", "What's the crack?", "Brew's on"
- **Speciality:** Understanding service culture, transition struggles

### 2. Doris 🫖
**Archetype:** The Nurturing Safe Space
- **Age:** 60s
- **Tone:** Warm, motherly, creates safety
- **Best For:** Those needing gentle, unconditional support
- **Language:** "Hello love", "Kettle's on", "There there"
- **Speciality:** Creating emotional safety, non-judgmental listening

### 3. Hugo 🧘
**Archetype:** The Wellbeing Coach
- **Age:** 35
- **Tone:** Calm, encouraging, practical
- **Best For:** Those seeking lifestyle and mental health guidance
- **Language:** Professional but friendly, wellness-focused
- **Speciality:** Breathing exercises, routines, resilience building

### 4. Rita 👩‍👧
**Archetype:** The Family Support Companion
- **Age:** 60
- **Tone:** Warm, grounded, deeply empathetic
- **Best For:** Partners, spouses, parents of military personnel
- **Language:** "Hello love", understanding, validating
- **Speciality:** Military family life, relationship strain, being "the one at home"
- **Inspiration:** Rita Restorick (peace advocate)

### 5. Bob 🔧
**Archetype:** The Down-to-Earth Mate
- **Age:** 50s
- **Tone:** Honest, direct, no-nonsense
- **Best For:** Those who want straight talk
- **Language:** Plain speaking, Northern English
- **Speciality:** Cutting through, practical advice

### 6. Margie 🌸
**Archetype:** The Wise Elder
- **Age:** 70s
- **Tone:** Wise, patient, experienced
- **Best For:** Those needing perspective and wisdom
- **Language:** Gentle, thoughtful, measured
- **Speciality:** Life experience, perspective, patience

### 7. Finch (Sentry) 🦅
**Archetype:** The Watchful Guardian
- **Age:** Ageless
- **Tone:** Steady, observant, supportive
- **Best For:** Those who need a calm, consistent presence
- **Language:** Clear, measured, reassuring
- **Speciality:** Stability, consistency, being present

### 8. Smudge 👨‍⚖️ (Internal)
**Archetype:** The Legal Navigator
- **Age:** 45
- **Tone:** Professional, knowledgeable, accessible
- **Best For:** Those with legal/policy questions
- **Language:** Clear explanations of complex topics
- **Speciality:** UK law, MOD policy, veteran rights
- **Note:** Does NOT give legal advice, only information

## AI Safety Framework

All AI companions operate under strict safety protocols:

```
┌─────────────────────────────────────────────────────────────┐
│                    AI SAFETY LAYERS                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Layer 1: SYSTEM PROMPT                                      │
│  ├── Character personality                                   │
│  ├── Boundaries (no medical/legal advice)                    │
│  ├── Safeguarding instructions                              │
│  └── Crisis resource list                                    │
│                                                              │
│  Layer 2: REAL-TIME MONITORING                              │
│  ├── Keyword detection (RED/AMBER/YELLOW indicators)        │
│  ├── Pattern recognition                                     │
│  ├── Session history analysis                                │
│  └── Risk score calculation (0-200+)                         │
│                                                              │
│  Layer 3: ENHANCED SAFETY CHECK                             │
│  ├── Secondary AI analysis                                   │
│  ├── Dual-confirmation for high risk                        │
│  └── Override capability                                     │
│                                                              │
│  Layer 4: RESPONSE INJECTION                                 │
│  ├── Crisis resources added to RED responses                │
│  ├── Tone adjustment for serious topics                      │
│  └── Professional signposting                                │
│                                                              │
│  Layer 5: ESCALATION                                        │
│  ├── Safeguarding alert creation                            │
│  ├── Staff notification                                      │
│  └── Audit trail                                             │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## What AI Buddies CAN Do
- Listen and validate feelings
- Provide emotional support
- Share coping strategies
- Guide breathing/grounding exercises
- Signpost to resources
- Detect crisis and escalate
- Maintain conversation context
- Adapt tone to user needs

## What AI Buddies CANNOT Do
- Give medical diagnoses
- Prescribe treatment
- Provide legal advice
- Replace human professionals
- Access personal records
- Contact emergency services directly
- Make decisions for users

---

# User Roles & Access

## Role Hierarchy

```
┌─────────────────────────────────────────────────────────────┐
│                         ADMIN                                │
│  • Full system access                                        │
│  • User management                                           │
│  • CMS control                                               │
│  • Analytics & logs                                          │
│  • Safeguarding oversight                                    │
└─────────────────────┬───────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────┐
│                    STAFF (Counsellor/Peer)                   │
│  • View assigned callbacks                                   │
│  • Manage own availability                                   │
│  • Create notes                                              │
│  • Acknowledge alerts (counsellors)                          │
└─────────────────────┬───────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────┐
│                         USER                                 │
│  • Access AI chat                                            │
│  • Use Buddy Finder                                          │
│  • Request callbacks                                         │
│  • View resources                                            │
│  • Manage own data (GDPR)                                    │
└─────────────────────────────────────────────────────────────┘
```

## Permission Matrix

| Feature | User | Peer | Counsellor | Admin |
|---------|------|------|------------|-------|
| AI Chat | ✅ | ✅ | ✅ | ✅ |
| Buddy Finder | ✅ | ✅ | ✅ | ✅ |
| Request Callback | ✅ | ✅ | ✅ | ✅ |
| View Own Shifts | ❌ | ✅ | ✅ | ✅ |
| Manage Shifts | ❌ | ✅ | ✅ | ✅ |
| View Callbacks | ❌ | ✅ | ✅ | ✅ |
| Create Notes | ❌ | ✅ | ✅ | ✅ |
| View Alerts | ❌ | ❌ | ✅ | ✅ |
| Acknowledge Alerts | ❌ | ❌ | ✅ | ✅ |
| User Management | ❌ | ❌ | ❌ | ✅ |
| CMS Management | ❌ | ❌ | ❌ | ✅ |
| View Analytics | ❌ | ❌ | ❌ | ✅ |
| Export Data | Own | Own | Own | All |
| Delete Users | ❌ | ❌ | ❌ | ✅ |

---

# Core Features

## 1. AI Chat System

### How It Works
1. User selects an AI character
2. Greeting generated based on character personality
3. Each message passes through safeguarding check
4. OpenAI generates contextual response
5. Response reviewed for safety
6. Crisis resources injected if needed
7. Message delivered to user
8. Session stored for continuity

### Technical Flow
```
User Message
     │
     ▼
┌────────────┐
│Safeguarding│──▶ Risk Score Calculated
│   Check    │
└─────┬──────┘
      │
      ▼ (if safe)
┌────────────┐
│  OpenAI    │──▶ GPT-4 with character prompt
│   API      │
└─────┬──────┘
      │
      ▼
┌────────────┐
│  Response  │──▶ Add crisis resources if needed
│  Enhance   │
└─────┬──────┘
      │
      ▼
┌────────────┐
│   Store    │──▶ Chat session logged
│  Session   │
└─────┬──────┘
      │
      ▼
User Response
```

## 2. Buddy Finder

### Purpose
Connect veterans with each other based on shared experiences, location, and interests.

### Features
- **Profile Creation** - Display name, region, service branch, regiment, interests
- **Browse Profiles** - Filter by region and branch
- **Messaging** - Send messages to other veterans
- **Inbox** - View received and sent messages
- **GDPR Consent** - Required before profile creation

### Privacy Features
- Display names (not real names)
- Region-level location only
- Opt-in system
- Message control
- Profile deactivation

## 3. Staff Calendar/Availability

### Purpose
Allow counsellors and peer supporters to manage their availability for callbacks.

### Features
- **Monthly Calendar View** - Visual shift overview
- **Shift Creation** - Add availability slots
- **Email Notifications** - Automated via Resend
- **Push Notifications** - Alert on shift changes (planned)
- **Coverage View** - Admin sees total coverage

## 4. Content Management System (CMS)

### Visual Editor (WYSIWYG)
The admin portal includes a visual editor that shows a phone preview of app content.

### Features
- **Phone Preview Frame** - See content as it appears in app
- **Click-to-Edit** - Select any element to modify
- **Drag-and-Drop** - Reorder sections by dragging
- **Color Pickers** - Customize card colors
- **Icon Selection** - Choose from icon library
- **Multiple Page Types** - Standard, article, landing, resources
- **Section Types** - Cards, hero, text, accordion, stats

### Page Structure
```
CMS Page
├── Slug (URL identifier)
├── Title
├── Page Type
├── Sections[]
│   ├── Section Type
│   ├── Title
│   ├── Subtitle
│   └── Cards[]
│       ├── Title
│       ├── Description
│       ├── Icon
│       ├── Color
│       └── Action (route/URL/phone)
└── Visibility
```

## 5. Analytics Dashboard

### Charts
- **Activity Trends** - Line chart showing calls, chats, alerts over 7 days
- **Contact Types** - Doughnut chart showing counsellor/peer/org/crisis distribution

### Log Tables
- **Call Logs** - Who called whom, when, duration
- **Chat Logs** - AI chat sessions
- **Safeguarding Alerts** - Risk detections
- **Panic Alerts** - Emergency button activations
- **Callback Requests** - Request queue

### Export
- CSV export for all log types
- Filterable by date range

## 6. Resources & Support Directory

### Organization Categories
- Crisis Lines
- Mental Health Charities
- Veterans Organizations
- Housing Support
- Employment Support
- Addiction Services
- Family Support

### Features
- Click-to-call phone numbers
- Website links
- Category filtering
- Admin-managed via CMS

---

# Safeguarding System

## Risk Scoring Model

The platform uses a weighted scoring system based on BACP ethical framework and UK safeguarding principles.

### Risk Levels

| Level | Score | Response |
|-------|-------|----------|
| 🟢 GREEN | 0-49 | Normal conversation continues |
| 🟡 YELLOW | 50-89 | Gentle check-in, resources offered |
| 🟠 AMBER | 90-139 | Direct support offered, resources prominent |
| 🔴 RED | 140+ | Crisis response, immediate resources, alert created |

### Indicator Categories

**RED Indicators (+100-150 points)**
- Direct suicidal statements
- Active self-harm disclosure
- Immediate danger indicators
- Plan with method/timeline

**AMBER Indicators (+70-90 points)**
- Hopelessness expressions
- Giving away possessions
- Feeling trapped
- Isolation indicators

**YELLOW Indicators (+30-50 points)**
- Sleep disturbances
- Appetite changes
- Loss of interest
- General distress

### Session Tracking
- Risk accumulates across session
- Repeated indicators increase score (+20)
- Pattern recognition across messages
- Last 20 messages analyzed per session

## Crisis Resources (UK)

When RED level detected, these resources are automatically provided:

| Service | Number | Availability |
|---------|--------|--------------|
| Samaritans | 116 123 | 24/7, free |
| Combat Stress | 0800 138 1619 | 24/7 |
| Veterans Gateway | 0808 802 1212 | 24/7 |
| SSAFA | 0800 260 6767 | 24/7 |
| NHS 111 | 111 | 24/7 |
| Emergency | 999 | 24/7 |

## Safeguarding Alert Structure

```json
{
  "id": "uuid",
  "session_id": "chat-session-id",
  "user_id": "user-or-anonymous",
  "risk_level": "RED",
  "risk_score": 165,
  "message": "The triggering message",
  "ai_response": "The AI's response",
  "risk_factors": {
    "suicidal_ideation": true,
    "hopelessness": true,
    "isolation": false
  },
  "crisis_resources": {...},
  "status": "active|acknowledged|resolved",
  "acknowledged_by": "counsellor-id",
  "acknowledged_at": "timestamp",
  "notes": "Staff notes",
  "created_at": "timestamp"
}
```

---

# Legal & GDPR Compliance

## Regulatory Framework

Radio Check operates under:
- **UK GDPR** (UK General Data Protection Regulation)
- **Data Protection Act 2018**
- **ICO Guidelines**
- **BACP Ethical Framework** (for safeguarding)

## Lawful Basis for Processing

| Data Type | Lawful Basis | Article |
|-----------|--------------|---------|
| Account data | Contract | 6(1)(b) |
| Chat data (AI) | Consent | 6(1)(a) |
| Safeguarding data | Vital interests | 6(1)(d) |
| Health data | Vital interests | 9(2)(c) |
| Analytics | Legitimate interest | 6(1)(f) |

## Special Category Data

Radio Check processes **special category data** under Article 9:
- **Health data** (mental health conversations)
- **Military service history**

Protected under:
- Article 9(2)(c): Vital interests (safeguarding)
- Article 9(2)(g): Substantial public interest

## Data Subject Rights Implementation

| Right | Article | Implementation |
|-------|---------|----------------|
| Access | 15 | `GET /api/auth/my-data/export` |
| Rectification | 16 | Profile edit functionality |
| Erasure | 17 | `DELETE /api/auth/me` |
| Restriction | 18 | Account deactivation |
| Portability | 20 | JSON export endpoint |
| Object | 21 | Contact privacy@radiocheck.me |

## Data Retention Policy

| Data Type | Retention Period | Justification |
|-----------|------------------|---------------|
| Account data | While active | Contract |
| AI chat logs | 7 years | Safeguarding |
| Callback requests | 90 days after resolution | Service delivery |
| Safeguarding alerts | 7 years | Legal requirement |
| Buddy messages | Until deletion | User control |

## Third-Party Processors

| Processor | Data Shared | Purpose | DPA Status |
|-----------|-------------|---------|------------|
| OpenAI | Chat messages | AI responses | Required |
| MongoDB Atlas | All data | Storage | Standard |
| Render | All data | Hosting | Standard |
| Resend | Email addresses | Notifications | Required |

## Privacy Policy

Full privacy policy available at: `/website/privacy.html`

Covers:
- What data we collect
- How we use it
- How we protect it
- Your rights
- How to contact us
- ICO complaint process

## GDPR Compliance Status

**Current Rating: 🟡 PARTIALLY COMPLIANT (8/10)**

### ✅ Implemented
- Privacy policy
- Data encryption (AES-256)
- Password hashing (bcrypt)
- GDPR consent (Buddy Finder)
- Data export endpoint
- Account deletion endpoint
- Safeguarding protocols

### ⚠️ In Progress
- Data retention automation
- Audit logging
- Cookie consent banner
- DPIA documentation
- ROPA documentation

---

# Security Architecture

## Authentication

```
┌─────────────────────────────────────────────────────────────┐
│                   AUTHENTICATION FLOW                        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. User submits email + password                           │
│                     │                                        │
│                     ▼                                        │
│  2. Server verifies against bcrypt hash                     │
│                     │                                        │
│                     ▼                                        │
│  3. JWT token generated (24hr expiry)                       │
│     - Contains: user_id, email, role                        │
│     - Signed with: SECRET_KEY                               │
│                     │                                        │
│                     ▼                                        │
│  4. Token returned to client                                │
│                     │                                        │
│                     ▼                                        │
│  5. Client stores in secure storage                         │
│                     │                                        │
│                     ▼                                        │
│  6. Subsequent requests include:                            │
│     Authorization: Bearer <token>                           │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Encryption

### At Rest
- **Database:** MongoDB Atlas encryption
- **Sensitive Fields:** AES-256 (Fernet) encryption
- **Encrypted Fields:**
  - SIP passwords
  - Contact details (counsellors/peers)
  - Other PII as marked

### In Transit
- **HTTPS:** Enforced on all endpoints
- **TLS 1.3:** Modern encryption protocol

## Password Security

```python
# Password hashing with bcrypt
hashed = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())

# Verification
bcrypt.checkpw(input_password.encode('utf-8'), stored_hash.encode('utf-8'))
```

## Role-Based Access Control

```python
@api_router.get("/admin/users")
async def get_users(current_user: User = Depends(require_role("admin"))):
    # Only admins can access
```

## Security Headers

Recommended for production:
```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Content-Security-Policy: default-src 'self'
Strict-Transport-Security: max-age=31536000
```

---

# Data Architecture

## MongoDB Schema Design

### Users Collection
```javascript
{
  _id: ObjectId,
  id: "uuid",
  email: "user@example.com",
  password_hash: "bcrypt-hash",
  role: "user|counsellor|peer|admin",
  name: "Display Name",
  created_at: ISODate,
  push_token: "expo-push-token"  // For notifications
}
```

### Safeguarding Alerts Collection
```javascript
{
  _id: ObjectId,
  id: "uuid",
  session_id: "chat-session-id",
  user_id: "user-id-or-anonymous",
  risk_level: "RED|AMBER|YELLOW|GREEN",
  risk_score: 165,
  message: "Triggering message content",
  ai_response: "AI's response to the message",
  risk_factors: {
    suicidal_ideation: true,
    hopelessness: true,
    isolation: false
  },
  crisis_resources: {
    samaritans: "116 123",
    combat_stress: "0800 138 1619"
  },
  status: "active|acknowledged|resolved",
  acknowledged_by: "staff-user-id",
  acknowledged_at: ISODate,
  resolved_at: ISODate,
  notes: "Staff notes about follow-up",
  audit_trail: [
    { action: "created", by: "system", at: ISODate },
    { action: "acknowledged", by: "staff-id", at: ISODate }
  ],
  created_at: ISODate
}
```

### CMS Structure
```javascript
// cms_pages
{
  id: "uuid",
  slug: "home",
  title: "Home",
  page_type: "standard",
  is_visible: true,
  nav_order: 0
}

// cms_sections
{
  id: "uuid",
  page_slug: "home",
  section_type: "cards",
  title: "Quick Access",
  subtitle: "Get support now",
  order: 0
}

// cms_cards
{
  id: "uuid",
  section_id: "section-uuid",
  title: "Talk to Someone",
  description: "Connect with a counsellor",
  icon: "phone",
  color: "#3b82f6",
  route: "/counsellors"
}
```

## Data Flow

```
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│  Client  │────▶│  FastAPI │────▶│ MongoDB  │────▶│  OpenAI  │
│  (App)   │◀────│  Server  │◀────│  Atlas   │     │   API    │
└──────────┘     └──────────┘     └──────────┘     └──────────┘
     │                │                │                │
     │                │                │                │
     ▼                ▼                ▼                ▼
  Local            Logs &          Encrypted       Chat prompts
  Storage          Metrics         Storage         (no PII)
```

---

# API Reference

## Authentication Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/login` | Login, get JWT | No |
| POST | `/api/auth/register` | Create user | Admin |
| GET | `/api/auth/me` | Get current user | Yes |
| POST | `/api/auth/change-password` | Change password | Yes |
| POST | `/api/auth/forgot-password` | Request reset | No |
| POST | `/api/auth/reset-password` | Reset with token | No |

## GDPR Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/auth/my-data/export` | Export all personal data | Yes |
| GET | `/api/auth/my-data/categories` | See what data exists | Yes |
| DELETE | `/api/auth/me` | Delete own account | Yes |

## AI Chat Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/ai-buddies/characters` | List all AI characters | No |
| POST | `/api/ai-buddies/chat` | Send message to AI | No |
| GET | `/api/ai-buddies/greeting/{character}` | Get character greeting | No |

## CMS Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/cms/pages` | List all pages | No |
| GET | `/api/cms/pages/{slug}` | Get page with sections | No |
| POST | `/api/cms/pages` | Create page | Admin |
| PUT | `/api/cms/pages/{slug}` | Update page | Admin |
| DELETE | `/api/cms/pages/{slug}` | Delete page | Admin |
| POST | `/api/cms/sections` | Create section | Admin |
| PUT | `/api/cms/sections/reorder` | Reorder sections | Admin |
| POST | `/api/cms/cards` | Create card | Admin |

## Buddy Finder Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/buddy-finder/profiles` | List profiles | No |
| POST | `/api/buddy-finder/signup` | Create profile | Yes |
| GET | `/api/buddy-finder/inbox` | Get messages | Yes |
| POST | `/api/buddy-finder/message` | Send message | Yes |
| GET | `/api/buddy-finder/regions` | List UK regions | No |
| GET | `/api/buddy-finder/branches` | List service branches | No |

## Staff Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/shifts` | List shifts | Staff |
| POST | `/api/shifts` | Create shift | Staff |
| GET | `/api/callback-requests` | List callbacks | Staff |
| PUT | `/api/callback-requests/{id}/status` | Update status | Staff |
| GET | `/api/counsellors/public` | List available | No |

## Admin Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/auth/users` | List all users | Admin |
| DELETE | `/api/auth/users/{id}` | Delete user | Admin |
| GET | `/api/safeguarding-alerts` | List alerts | Admin |
| GET | `/api/call-logs` | List call logs | Admin |
| GET | `/api/organizations/export/csv` | Export organizations | Admin |

---

# Deployment & Infrastructure

## Production Environment

| Component | Service | URL |
|-----------|---------|-----|
| Backend API | Render | veterans-support-api.onrender.com |
| Mobile App | Expo | app.radiocheck.me |
| Admin Portal | Static | radiocheck.me/admin-portal |
| Staff Portal | Static | radiocheck.me/staff-portal |
| Website | Static | radiocheck.me |
| Database | MongoDB Atlas | (cluster URL) |

## Environment Variables

### Backend (.env)
```
MONGO_URL=mongodb+srv://...
DB_NAME=veterans_support
JWT_SECRET_KEY=your-secret-key
OPENAI_API_KEY=sk-...
RESEND_API_KEY=re_...
ENCRYPTION_KEY=your-encryption-key
AI_BUDDIES_DISABLED=false
```

### Frontend (.env)
```
EXPO_PUBLIC_BACKEND_URL=https://veterans-support-api.onrender.com
```

### Static Portals (config.js)
```javascript
const CONFIG = {
    API_URL: 'https://veterans-support-api.onrender.com'
};
```

## Deployment Process

1. **Code Changes** - Made in development environment
2. **Push to GitHub** - Using "Save to GitHub" feature
3. **Render Auto-Deploy** - Triggered by GitHub push
4. **Static Files** - Manually upload to hosting
5. **Database** - No migration needed (MongoDB)

## Preview vs Production

| Aspect | Preview | Production |
|--------|---------|------------|
| Purpose | Testing | Live users |
| URL | *.preview.emergentagent.com | radiocheck.me |
| Data | Test data | Real data |
| API Keys | May be missing | All configured |
| Updates | Instant | Via deployment |

**CRITICAL:** Never change production config to preview URLs!

---

# Design Philosophy

## Why These Choices?

### Why React Native + Expo?
- Cross-platform (iOS + Android) from single codebase
- Rapid development
- Easy updates via OTA
- Good offline support
- Native feel

### Why FastAPI?
- Modern Python framework
- Async support (important for AI calls)
- Auto-documentation (Swagger)
- Type hints (Pydantic)
- High performance

### Why MongoDB?
- Flexible schema (evolving requirements)
- Easy to scale
- Good for document-style data
- Atlas managed service

### Why Static HTML for Portals?
- Simple deployment
- No build step
- Fast loading
- Works anywhere
- Easy to maintain

### Why Multiple AI Characters?
- Different users connect with different personalities
- Reduces stigma ("chatting with Tommy" vs "therapy")
- Allows for specialized support (Rita for families)
- Increases engagement

### Why Comprehensive Safeguarding?
- Legal requirement for health-adjacent services
- Ethical responsibility
- User safety paramount
- Audit trail for accountability

---

# Future Roadmap

## Planned Features

### Phase 1: Infrastructure (Q1 2026)
- [ ] Complete backend modularization
- [ ] Implement data retention automation
- [ ] Add comprehensive audit logging
- [ ] Cookie consent implementation

### Phase 2: Engagement (Q2 2026)
- [ ] Push notifications (Expo Push)
- [ ] Offline message queue
- [ ] Chat session continuity
- [ ] Mood tracking journal

### Phase 3: Expansion (Q3 2026)
- [ ] Video calling (WebRTC)
- [ ] Group support sessions
- [ ] Peer matching algorithm
- [ ] Mobile app store release

### Phase 4: Analytics (Q4 2026)
- [ ] Advanced analytics dashboard
- [ ] AI conversation insights
- [ ] Outcome tracking
- [ ] Impact reporting

## Technical Debt

- [ ] Migrate monolithic server.py to modular routers
- [ ] Add comprehensive test suite
- [ ] Implement CI/CD pipeline
- [ ] Performance optimization
- [ ] Accessibility audit (WCAG 2.1)

---

# Appendices

## A. Crisis Resources (UK)

| Organization | Phone | Website |
|--------------|-------|---------|
| Samaritans | 116 123 | samaritans.org |
| Combat Stress | 0800 138 1619 | combatstress.org.uk |
| Veterans Gateway | 0808 802 1212 | veteransgateway.org.uk |
| SSAFA | 0800 260 6767 | ssafa.org.uk |
| Help for Heroes | 0300 303 9888 | helpforheroes.org.uk |
| Royal British Legion | 0808 802 8080 | britishlegion.org.uk |
| NHS 111 | 111 | nhs.uk |
| Emergency | 999 | - |

## B. Glossary

| Term | Definition |
|------|------------|
| Battle Buddy | AI companion character |
| CMS | Content Management System |
| GDPR | General Data Protection Regulation |
| JWT | JSON Web Token (authentication) |
| MOD | Ministry of Defence |
| PII | Personally Identifiable Information |
| Radio Check | Military term for communication check |
| Safeguarding | Protocols to protect vulnerable users |
| SSAFA | Soldiers, Sailors, Airmen and Families Association |

## C. Contact Information

- **Technical Issues:** support@radiocheck.me
- **Privacy Requests:** privacy@radiocheck.me
- **General Inquiries:** hello@radiocheck.me
- **ICO (Complaints):** ico.org.uk

---

**Document Version:** 2.0  
**Last Updated:** February 2026  
**Author:** Radio Check Development Team  
**Classification:** Internal Documentation

---

*"Service doesn't end when the uniform comes off—and neither should support."*
