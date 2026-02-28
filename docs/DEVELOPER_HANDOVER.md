# Radio Check - Developer Handover Document

## Last Updated: December 2025

---

## Executive Summary

**Radio Check** is a comprehensive mental health and peer support platform for UK military veterans. This document provides everything a new developer needs to understand, maintain, and extend the codebase.

---

## Table of Contents

1. [System Architecture](#system-architecture)
2. [Backend Deep Dive](#backend-deep-dive)
3. [API Router Reference](#api-router-reference)
4. [Frontend Architecture](#frontend-architecture)
5. [Real-Time Communication](#real-time-communication)
6. [AI Safety System](#ai-safety-system)
7. [Governance System](#governance-system)
8. [Database Collections](#database-collections)
9. [Static Portals](#static-portals)
10. [Deployment Architecture](#deployment-architecture)
11. [Critical Configurations](#critical-configurations)
12. [Troubleshooting Guide](#troubleshooting-guide)

---

## 1. System Architecture

### High-Level Overview

```
                              ┌─────────────────────────────────────┐
                              │         Production Hosting          │
                              ├─────────────────────────────────────┤
┌──────────────┐              │  Vercel     Render      20i        │
│   User App   │──────────────│  (Frontend) (Backend)  (Portals)   │
│  (Expo Web)  │              │                                     │
└──────────────┘              │  ↓           ↓          ↓          │
       │                      │  React      FastAPI    Static      │
       │                      │  Native     + Socket   HTML/JS     │
       ▼                      └─────────────────────────────────────┘
┌──────────────┐                           │
│  Staff App   │                           │
│  (WebView)   │                           ▼
└──────────────┘              ┌─────────────────────────────────────┐
                              │         MongoDB Atlas               │
                              │  (veterans_support database)        │
                              └─────────────────────────────────────┘
```

### Tech Stack

| Component | Technology | Purpose |
|-----------|------------|---------|
| **User App** | React Native (Expo) | Cross-platform veteran interface |
| **Backend** | Python FastAPI | REST API + business logic |
| **Real-Time** | Socket.IO (python-socketio) | WebRTC signaling, live chat |
| **Database** | MongoDB | Document storage |
| **AI** | OpenAI GPT-4 | AI companion personas |
| **Email** | Resend | Transactional notifications |
| **Admin/Staff Portals** | Vanilla JS | Static sites hosted on 20i |

### Repository Structure

```
/app
├── backend/
│   ├── server.py                # Main FastAPI app + ALL core routes
│   ├── webrtc_signaling.py      # Socket.IO handlers for calls/chat
│   ├── governance_router.py     # Clinical governance API
│   ├── governance.py            # Governance models & helpers
│   ├── enhanced_safety_layer.py # Multi-layer AI safety analysis
│   ├── safety.py                # Base safety monitoring
│   ├── encryption.py            # AES-256 field encryption
│   └── requirements.txt
│
├── frontend/
│   ├── app/                     # Expo Router screens
│   │   ├── _layout.tsx          # Root layout + navigation
│   │   ├── index.tsx            # Entry point + age gate
│   │   ├── home.tsx             # Main dashboard
│   │   ├── chat/[characterId].tsx  # AI companion chat
│   │   ├── unified-chat.tsx     # Generic AI chat
│   │   ├── live-chat.tsx        # Human-to-human chat
│   │   ├── peer-support.tsx     # Peer finder + WebRTC calls
│   │   ├── local-services.tsx   # Local organizations finder
│   │   └── ...
│   ├── hooks/
│   │   ├── useWebRTCCallWeb.ts  # WebRTC hook for browser calls
│   │   └── useAgeGate.ts        # Age verification hook
│   ├── contexts/
│   │   └── AgeGateContext.tsx   # Age state management
│   └── components/
│       ├── AgeGateModal.tsx     # DOB collection modal
│       └── ui/                  # Shadcn-style components
│
├── staff-portal/                # STATIC - Hosted on 20i
│   ├── index.html
│   ├── app.js                   # Main logic
│   ├── webrtc-phone.js          # WebRTC implementation
│   ├── styles.css
│   └── config.js                # API URL configuration
│
├── admin-site/                  # STATIC - Hosted on 20i
│   ├── index.html
│   ├── app.js
│   └── styles.css
│
└── docs/                        # Documentation
    ├── guides/
    ├── compliance/
    └── deployment/
```

---

## 2. Backend Deep Dive

### Main Server (`server.py`)

The `server.py` file is the heart of the backend (5000+ lines). It contains:

| Section | Lines (approx) | Purpose |
|---------|----------------|---------|
| Rate Limiting | 54-143 | IP-based request throttling |
| JWT Auth | 144-152 | Token configuration |
| AI Prompts | 162-1250 | 8 AI persona system prompts |
| MongoDB Setup | 1252-1271 | Database connection |
| Pydantic Models | 1278-1605 | Data validation classes |
| CMS Models | 1458-1540 | Content management |
| Auth Routes | 1740-1960 | Login, register, password reset |
| User Routes | 1960-2100 | User CRUD operations |
| Staff Routes | 2100-2500 | Counsellor/Peer management |
| AI Chat Route | 2700-2950 | `/api/ai-buddies/chat` |
| Live Chat Routes | 3400-3600 | Human chat room management |
| CMS Routes | 3600-4000 | Page/section/card management |
| Callback Routes | 4700-4900 | Callback request handling |
| Settings Routes | 3317-3350 | Site configuration |

### Key Design Patterns

**1. Role-Based Access Control**
```python
# In server.py
def require_role(*allowed_roles):
    """Dependency that checks user has required role"""
    async def role_checker(credentials: HTTPAuthorizationCredentials = Depends(security)):
        user = await get_current_user(credentials)
        if user["role"] not in allowed_roles:
            raise HTTPException(status_code=403, detail="Insufficient permissions")
        return user
    return role_checker

# Usage
@api_router.get("/admin/users")
async def list_users(user: dict = Depends(require_role("admin"))):
    ...
```

**2. MongoDB Helpers (avoiding ObjectId issues)**
```python
# Always exclude _id from responses
result = await db.collection.find({}, {"_id": 0}).to_list(100)

# Or use projection
user = await db.users.find_one({"id": user_id}, {"_id": 0, "password_hash": 0})
```

**3. Field-Level Encryption**
```python
from encryption import encrypt_document, decrypt_document

# Before saving
encrypted = encrypt_document('callbacks', data.dict())
await db.callbacks.insert_one(encrypted)

# After retrieval
doc = await db.callbacks.find_one({"id": id})
return decrypt_document('callbacks', doc)
```

### Router Breakdown

The backend uses modular routers:

```python
# server.py - Main app includes governance router
from governance_router import governance_router, set_db as set_governance_db

app = FastAPI()
api_router = APIRouter(prefix="/api")

# Include sub-routers
api_router.include_router(governance_router)  # /api/governance/*

# All other routes are defined directly in server.py
```

---

## 3. API Router Reference

### Authentication (`/api/auth/*`)

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/auth/login` | POST | No | User login |
| `/api/auth/register` | POST | No | New user registration |
| `/api/auth/forgot-password` | POST | No | Request password reset |
| `/api/auth/reset-password` | POST | No | Complete password reset |
| `/api/auth/change-password` | POST | Yes | Change own password |

### AI Chat (`/api/ai-buddies/*`)

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/ai-buddies/chat` | POST | No | Send message to AI companion |
| `/api/ai-buddies/characters` | GET | No | List available AI personas |

**Request Body for `/api/ai-buddies/chat`:**
```json
{
  "message": "How are you?",
  "session_id": "uuid-string",
  "character": "tommy|doris|bob|finch|margie|hugo|rita|catherine",
  "is_under_18": false
}
```

### Live Chat (`/api/live-chat/*`)

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/live-chat/rooms` | POST | No | Create new chat room |
| `/api/live-chat/rooms` | GET | Yes | List active rooms |
| `/api/live-chat/rooms/{id}` | GET | No | Get room details |
| `/api/live-chat/rooms/{id}/join` | POST | Yes | Staff joins room |
| `/api/live-chat/rooms/{id}/messages` | GET | No | Get room messages |
| `/api/live-chat/rooms/{id}/messages` | POST | No | Send message |
| `/api/live-chat/rooms/{id}/end` | POST | No | End chat session |

### Staff Management

**Counsellors (`/api/counsellors/*`):**

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/counsellors` | GET | Yes (admin) | List all counsellors |
| `/api/counsellors` | POST | Yes (admin) | Create counsellor |
| `/api/counsellors/available` | GET | No | **PUBLIC** - Safe list |
| `/api/counsellors/{id}` | PUT | Yes | Update counsellor |
| `/api/counsellors/{id}/status` | PUT | Yes | Update status |

**Peer Supporters (`/api/peer-supporters/*`):**

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/peer-supporters` | GET | Yes (admin) | List all peers |
| `/api/peer-supporters` | POST | Yes (admin) | Create peer |
| `/api/peer-supporters/available` | GET | No | **PUBLIC** - Safe list |
| `/api/peer-supporters/{id}` | PUT | Yes | Update peer |
| `/api/peer-supporters/{id}/status` | PUT | Yes | Update status |

### Governance (`/api/governance/*`)

**File:** `governance_router.py`

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/governance/hazards` | GET | List hazard register |
| `/api/governance/hazards` | POST | Create new hazard |
| `/api/governance/hazards/{id}` | PUT | Update hazard |
| `/api/governance/hazards/initialize` | POST | Seed default hazards |
| `/api/governance/incidents` | GET | List incidents |
| `/api/governance/incidents` | POST | Create incident + email notification |
| `/api/governance/incidents/{num}` | PUT | Update incident |
| `/api/governance/kpis` | GET | Calculate KPI metrics |
| `/api/governance/peer-reports` | GET/POST | Moderation queue |
| `/api/governance/cso/approvals` | GET/POST | CSO approval workflow |
| `/api/governance/export` | GET | Export audit data (JSON) |

### Safeguarding Alerts (`/api/safeguarding-alerts/*`)

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/safeguarding-alerts` | GET | Yes | List alerts with filters |
| `/api/safeguarding-alerts/{id}` | GET | Yes | Get single alert |
| `/api/safeguarding-alerts/{id}` | PUT | Yes | Update alert status |

### Callbacks (`/api/callbacks/*`)

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/callbacks` | POST | No | Submit callback request |
| `/api/callbacks` | GET | Yes | List callbacks (filtered by role) |
| `/api/callbacks/{id}/take` | POST | Yes | Claim a callback |
| `/api/callbacks/{id}/complete` | POST | Yes | Mark complete |
| `/api/callbacks/{id}/release` | POST | Yes | Release back to queue |

### Settings (`/api/settings`)

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/settings` | GET | No | Get site settings |
| `/api/settings` | PUT | Yes (admin) | Update settings |

**Available Settings:**
```json
{
  "site_name": "Veterans Support",
  "logo_url": null,
  "peer_registration_notification_email": "admin@radiocheck.me",
  "admin_notification_email": "admin@radiocheck.me",
  "cso_email": "admin@radiocheck.me"
}
```

---

## 4. Frontend Architecture

### Expo Router Pages

| Route | File | Purpose |
|-------|------|---------|
| `/` | `index.tsx` | Entry + splash + age gate |
| `/home` | `home.tsx` | Main dashboard with feature cards |
| `/chat/[characterId]` | `chat/[characterId].tsx` | AI persona chat |
| `/unified-chat` | `unified-chat.tsx` | Generic AI chat |
| `/live-chat` | `live-chat.tsx` | Human-to-human chat |
| `/peer-support` | `peer-support.tsx` | Peer finder + call initiation |
| `/crisis-support` | `crisis-support.tsx` | Emergency contacts |
| `/local-services` | `local-services.tsx` | Organization finder |
| `/self-care` | `self-care.tsx` | Wellness tools |
| `/portal` | `portal.tsx` | Staff/admin WebView wrapper |

### Key Hooks

**`useWebRTCCallWeb.ts`**
```typescript
// Manages WebRTC peer connections for browser-based calls
const {
  socket,            // Socket.IO instance
  localStream,       // User's audio stream
  remoteStream,      // Staff's audio stream
  callStatus,        // 'idle'|'calling'|'ringing'|'connected'|'ended'
  registerWithServer,// Register as callable client
  initiateCall,      // Start outbound call
  endCall,           // Hang up
  acceptCall,        // Accept incoming call
  rejectCall,        // Decline incoming call
} = useWebRTCCallWeb();
```

**`useAgeGate.ts`**
```typescript
// Manages age verification state
const {
  isOver18,          // boolean | null (not yet answered)
  isUnder18,         // boolean
  setAge,            // (dob: Date) => void
  clearAge,          // Reset age state
  showAgeModal,      // boolean - should modal be visible
} = useAgeGate();
```

### Context Providers

**`AgeGateContext.tsx`**
- Wraps the entire app
- Provides age state to all components
- Stores DOB in AsyncStorage (device-local, not sent to server)

### Safeguarding Flow

1. User sends message to AI
2. Backend runs multi-layer safety analysis
3. If HIGH/IMMINENT risk detected:
   - Response includes `showSafeguardingPopup: true`
   - Frontend shows `SafeguardingModal`
4. User chooses:
   - "Call a Supporter" → navigates to `/peer-support` with call setup
   - "Chat with a Supporter" → navigates to `/live-chat`
   - "Request Callback" → shows callback form
5. Staff portal receives notification via Socket.IO

---

## 5. Real-Time Communication

### Socket.IO Server (`webrtc_signaling.py`)

**Namespace:** Default (`/`)

**Events Emitted by Server:**
| Event | Payload | Description |
|-------|---------|-------------|
| `call_initiated` | `{call_id, caller_id, caller_name}` | New call started |
| `call_accepted` | `{call_id}` | Call was answered |
| `call_rejected` | `{call_id}` | Call was declined |
| `call_ended` | `{call_id}` | Call terminated |
| `webrtc_offer` | `{call_id, from_id, sdp}` | SDP offer relay |
| `webrtc_answer` | `{call_id, from_id, sdp}` | SDP answer relay |
| `webrtc_ice_candidate` | `{call_id, from_id, candidate}` | ICE candidate relay |
| `incoming_chat_request` | `{room_id, user_id, session_id}` | New chat waiting |
| `chat_room_joined` | `{room_id, staff_name}` | Staff joined chat |
| `chat_message` | `{room_id, sender, text}` | New message |

**Events Listened by Server:**
| Event | Handler | Purpose |
|-------|---------|---------|
| `connect` | `handle_connect` | Track connected clients |
| `disconnect` | `handle_disconnect` | Clean up on leave |
| `register` | `handle_register` | Register user/staff ID |
| `call_initiate` | `handle_call_initiate` | Start a call |
| `call_accept` | `handle_call_accept` | Answer call |
| `call_reject` | `handle_call_reject` | Decline call |
| `call_end` | `handle_call_end` | Hang up |
| `webrtc_offer` | `handle_webrtc_offer` | Relay SDP offer |
| `webrtc_answer` | `handle_webrtc_answer` | Relay SDP answer |
| `webrtc_ice_candidate` | `handle_ice_candidate` | Relay ICE |
| `request_human_chat` | `handle_request_human_chat` | User wants chat |
| `accept_chat_request` | `handle_accept_chat_request` | Staff accepts |
| `chat_message` | `handle_chat_message` | Send message |

### WebRTC Call Flow

```
User (peer-support.tsx)              Server                 Staff (webrtc-phone.js)
         │                              │                              │
         │──────register {userId}──────►│                              │
         │                              │                              │
         │                              │◄───register {staffId}────────│
         │                              │                              │
         │◄─────registration_success────│                              │
         │                              │                              │
    [Staff initiates call from portal]  │                              │
         │                              │◄────call_initiate────────────│
         │                              │     {target_id, caller_id}   │
         │                              │                              │
         │◄────call_initiated───────────│                              │
         │    {call_id, caller_name}    │                              │
         │                              │                              │
    [User clicks Accept]                │                              │
         │─────call_accept──────────────►│                              │
         │    {call_id, from_id}        │                              │
         │                              │                              │
         │                              │─────call_accepted────────────►│
         │                              │                              │
         │                              │◄────webrtc_offer─────────────│
         │◄────webrtc_offer─────────────│     {call_id, sdp}           │
         │    {call_id, sdp}            │                              │
         │                              │                              │
         │─────webrtc_answer────────────►│                              │
         │    {call_id, sdp}            │                              │
         │                              │─────webrtc_answer────────────►│
         │                              │                              │
    [ICE candidates exchanged both ways]│                              │
         │                              │                              │
    [Audio connection established]      │                              │
```

---

## 6. AI Safety System

### Multi-Layer Architecture

**File:** `enhanced_safety_layer.py`

```
                    User Message
                         │
                         ▼
             ┌───────────────────────┐
             │  Layer 1: Keywords    │◄── 400+ crisis terms
             │  (Fast initial scan)  │
             └───────────────────────┘
                         │
                         ▼
             ┌───────────────────────┐
             │  Layer 2: Patterns    │◄── Regex for phrases
             │  (Contextual match)   │    like "end it all"
             └───────────────────────┘
                         │
                         ▼
             ┌───────────────────────┐
             │  Layer 3: Session     │◄── Trend analysis
             │  (Escalation detect)  │    across messages
             └───────────────────────┘
                         │
                         ▼
             ┌───────────────────────┐
             │  Layer 4: Dependency  │◄── Over-reliance
             │  (AI attachment)      │    detection
             └───────────────────────┘
                         │
        ┌────────────────┴────────────────┐
        ▼                                 ▼
   ┌─────────┐                      ┌─────────┐
   │ is_under│                      │ Normal  │
   │   _18   │                      │  User   │
   └────┬────┘                      └────┬────┘
        │                                │
   risk_multiplier = 1.3            risk_multiplier = 1.0
        │                                │
        └────────────────┬───────────────┘
                         ▼
                 Final Risk Score
```

### Risk Levels

| Level | Score Range | Response |
|-------|-------------|----------|
| GREEN | 0-15 | Normal conversation |
| YELLOW | 16-30 | Increased monitoring |
| AMBER | 31-50 | Soft crisis resources |
| RED | 51-100 | Safeguarding popup |
| IMMINENT | 100+ | Immediate resources + alert |

### Age Multiplier

When `is_under_18: true` is passed to the chat endpoint:
- All risk scores multiplied by **1.3**
- Lower threshold for triggering safeguarding
- Additional logging for governance

---

## 7. Governance System

### Purpose

NHS DCB0129-aligned clinical safety infrastructure for:
- Formal hazard tracking
- Incident logging with email alerts
- KPI monitoring
- Peer moderation
- CSO approval workflows

### Key Files

| File | Purpose |
|------|---------|
| `governance.py` | Pydantic models, enums, helper functions |
| `governance_router.py` | FastAPI routes for governance |

### Hazard Log

Pre-populated with 7 core hazards (H1-H7):

| ID | Hazard | Severity |
|----|--------|----------|
| H1 | AI fails to detect suicidal ideation | Catastrophic |
| H2 | AI over-escalates benign content | Minor |
| H3 | Staff miss urgent alert | Major |
| H4 | Under-18 falsely declares 18+ | Moderate |
| H5 | Peer messaging abuse | Moderate |
| H6 | System outage during crisis | Major |
| H7 | AI safety drift after update | Major |

### Email Notifications

**Triggers:**
1. New incident created → Emails CSO + Admin based on severity level
2. CSO approval requested → Emails CSO

**Configuration:**
- Set via `/api/settings` endpoint
- Emails: `cso_email`, `admin_notification_email`
- Uses Resend API (requires verified domain)

---

## 8. Database Collections

### Core Collections

| Collection | Purpose |
|------------|---------|
| `users` | Authentication accounts |
| `counsellors` | Counsellor profiles |
| `peer_supporters` | Peer profiles |
| `organizations` | Support organizations |
| `callback_requests` | Callback queue |
| `safeguarding_alerts` | Crisis event logs |
| `live_chat_rooms` | Chat sessions |
| `settings` | Site configuration |

### Governance Collections

| Collection | Purpose |
|------------|---------|
| `hazards` | Hazard register |
| `incidents` | Incident log |
| `peer_reports` | Moderation queue |
| `cso_approvals` | CSO workflow |
| `governance_audit` | All governance events |
| `user_moderation` | User ban/warn status |

### CMS Collections

| Collection | Purpose |
|------------|---------|
| `cms_pages` | Page definitions |
| `cms_sections` | Page sections |
| `cms_cards` | Section cards |
| `page_content` | Legacy content |
| `resources` | Resource library |

---

## 9. Static Portals

### Staff Portal (`staff-portal/`)

**Purpose:** Dashboard for counsellors and peers to manage support requests.

**Key Files:**
| File | Purpose |
|------|---------|
| `index.html` | UI structure |
| `app.js` | Main application logic |
| `webrtc-phone.js` | WebRTC calling implementation |
| `styles.css` | Styling |
| `config.js` | API URL configuration |

**Features:**
- Real-time safeguarding alerts
- Live chat management
- Callback queue
- WebRTC calling
- Status management
- Incident reporting

### Admin Portal (`admin-site/`)

**Purpose:** Administrative control panel.

**Features:**
- User management
- Staff management
- CMS content editing
- Governance dashboard (Hazards, KPIs, Incidents)
- Settings configuration
- Rota/shift management

### Deployment (MANUAL)

Both portals are static sites hosted on 20i:
1. Download files from repository
2. Update `config.js` with production API URL
3. Upload via FTP/cPanel to 20i hosting
4. Clear browser cache

**Important:** Changes to these portals cannot be tested in the preview environment. They must be uploaded to production hosting for verification.

---

## 10. Deployment Architecture

### Production Setup

| Component | Host | URL |
|-----------|------|-----|
| Frontend | Vercel | app.radiocheck.me |
| Backend | Render | api.radiocheck.me |
| Admin Portal | 20i | admin.radiocheck.me |
| Staff Portal | 20i | staff.radiocheck.me |
| Database | MongoDB Atlas | (connection string) |

### Environment Variables

**Backend (.env):**
```
MONGO_URL="mongodb+srv://..."
DB_NAME="veterans_support"
JWT_SECRET_KEY="..."
OPENAI_API_KEY="sk-..."
RESEND_API_KEY="re_..."
ENCRYPTION_KEY="..."
```

**Frontend (.env):**
```
EXPO_PUBLIC_BACKEND_URL="https://api.radiocheck.me"
```

**Staff Portal (config.js):**
```javascript
var CONFIG = {
    API_URL: 'https://api.radiocheck.me'
};
```

---

## 11. Critical Configurations

### TURN Server (WebRTC)

```javascript
// In webrtc-phone.js and useWebRTCCallWeb.ts
{
    urls: 'turn:free.expressturn.com:3478',
    username: '000000002087494108',
    credential: 'VGqVfeznpN8ZxyueC6MSG71Sso8='
}
```

### Email Settings (Database)

```json
{
  "_id": "site_settings",
  "cso_email": "admin@radiocheck.me",
  "admin_notification_email": "admin@radiocheck.me",
  "peer_registration_notification_email": "admin@radiocheck.me"
}
```

### Encryption Key

**CRITICAL:** The `ENCRYPTION_KEY` in backend `.env` encrypts sensitive fields. If lost, encrypted data cannot be recovered.

---

## 12. Troubleshooting Guide

### Common Issues

**1. WebRTC calls not connecting**
- Check TURN server credentials haven't expired
- Verify both parties registered with Socket.IO
- Check browser console for ICE candidate errors
- Ensure `call_id` is synced (common mismatch issue)

**2. Email notifications not sending**
- Verify Resend API key is valid
- Check domain is verified in Resend dashboard
- Review backend logs for specific errors

**3. MongoDB connection failures**
- For Atlas: Check IP whitelist includes Render IPs
- For local: Ensure mongod is running
- Check `MONGO_URL` format is correct

**4. Staff portal not updating**
- Browser cache - force refresh (Ctrl+Shift+R)
- Verify config.js API URL is correct
- Check CORS settings in backend

**5. Age gate not working**
- AsyncStorage requires HTTPS in production
- Check browser dev tools > Application > Local Storage

### Debug Commands

```bash
# Check backend logs
tail -100 /var/log/supervisor/backend.err.log

# Test API endpoint
curl https://api.radiocheck.me/api/settings

# Check MongoDB connection
mongosh "mongodb://localhost:27017" --eval "db.adminCommand('ping')"

# Verify JWT token
python3 -c "import jwt; print(jwt.decode('TOKEN_HERE', options={'verify_signature': False}))"
```

---

## Quick Reference Card

### Test Credentials
| Role | Email | Password |
|------|-------|----------|
| Admin | admin@veteran.dbty.co.uk | ChangeThisPassword123! |
| Staff | sharon@radiocheck.me | ChangeThisPassword123! |

### Key API Endpoints
| Purpose | Endpoint |
|---------|----------|
| Login | `POST /api/auth/login` |
| AI Chat | `POST /api/ai-buddies/chat` |
| Create Incident | `POST /api/governance/incidents` |
| Get KPIs | `GET /api/governance/kpis` |
| Update Settings | `PUT /api/settings` |

### Important Files
| What | Where |
|------|-------|
| Main Backend | `/app/backend/server.py` |
| Socket.IO | `/app/backend/webrtc_signaling.py` |
| Governance | `/app/backend/governance_router.py` |
| AI Safety | `/app/backend/enhanced_safety_layer.py` |
| WebRTC Hook | `/app/frontend/hooks/useWebRTCCallWeb.ts` |

---

*Document Version: 1.0*
*Last Updated: December 2025*
*Next Review: March 2026*
