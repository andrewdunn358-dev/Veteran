# Veterans Support App - Developer Technical Documentation
## Last Updated: February 2026

---

## Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [Environment Setup](#environment-setup)
3. [Security Implementation](#security-implementation)
4. [API Reference](#api-reference)
5. [Database Schema](#database-schema)
6. [Frontend Structure](#frontend-structure)
7. [Staff Portal](#staff-portal)
8. [Deployment Guide](#deployment-guide)
9. [Known Issues & Workarounds](#known-issues--workarounds)
10. [Future Development](#future-development)

---

## Architecture Overview

### Tech Stack
| Component | Technology |
|-----------|------------|
| Mobile App | React Native (Expo) + TypeScript |
| Web App | React Native Web (served via Expo) |
| Backend API | Python FastAPI |
| Database | MongoDB |
| Staff Portal | Vanilla JavaScript (static HTML) |
| AI Integration | OpenAI GPT API |
| Email | Resend API |
| Maps | OpenStreetMap + Leaflet.js |
| IP Geolocation | ip-api.com (free tier) |

### Repository Structure
```
/app
├── backend/
│   ├── server.py           # Main FastAPI application
│   ├── encryption.py       # Field-level encryption utilities
│   ├── requirements.txt    # Python dependencies
│   └── .env               # Environment variables (NOT in git)
├── frontend/
│   ├── app/               # Expo Router pages
│   │   ├── ai-chat.tsx    # AI chatbot interface
│   │   ├── live-chat.tsx  # Live chat with staff
│   │   ├── admin.tsx      # Admin dashboard
│   │   └── ...
│   └── package.json
├── staff-portal/          # Standalone static website
│   ├── index.html
│   ├── app.js
│   ├── styles.css
│   └── config.js          # API URL configuration
└── memory/
    └── PRD.md             # Product requirements document
```

---

## Environment Setup

### Backend (.env)
```bash
# MongoDB
MONGO_URL="mongodb://localhost:27017"  # Or MongoDB Atlas connection string
DB_NAME="veterans_support"

# Authentication
JWT_SECRET_KEY="your-secure-secret-key-min-32-chars"

# OpenAI (for AI chatbot)
OPENAI_API_KEY="sk-..."

# Email notifications
RESEND_API_KEY="re_..."

# CRITICAL: Field-level encryption key
# DO NOT LOSE THIS KEY - encrypted data cannot be recovered without it
ENCRYPTION_KEY="YPIvjBITueJ-eCdRI1b823ubabW4Rt639DidlHFJpR0"
```

### Frontend (.env)
```bash
EXPO_PUBLIC_BACKEND_URL="https://your-api-domain.com"
```

### Staff Portal (config.js)
```javascript
var CONFIG = {
    API_URL: 'https://your-api-domain.com'
};
```

---

## Security Implementation

### Field-Level Encryption (AES-256)

**Location:** `/app/backend/encryption.py`

**Encrypted Fields by Collection:**
| Collection | Encrypted Fields |
|------------|-----------------|
| counsellors | name, phone, sms, whatsapp |
| peer_supporters | firstName, phone, sms, whatsapp |
| callbacks | name, phone, email, message |
| notes | content, subject |
| safeguarding_alerts | ip_address, conversation_history |

**How it works:**
1. Data is encrypted BEFORE storing in MongoDB
2. Encrypted values are prefixed with `ENC:` for identification
3. Data is decrypted AFTER retrieval, before returning to client
4. Uses PBKDF2 key derivation with AES-256 Fernet encryption

**Usage in code:**
```python
from encryption import encrypt_document, decrypt_document

# Encrypting before save
encrypted_data = encrypt_document('callbacks', callback.dict())
await db.callback_requests.insert_one(encrypted_data)

# Decrypting after retrieval
callback = await db.callback_requests.find_one({"id": id})
return decrypt_document('callbacks', callback)
```

**CRITICAL:** Existing unencrypted data will remain unencrypted. Only NEW data is encrypted.

### API Endpoint Security

**Public Endpoints (no auth required):**
- `POST /api/auth/login`
- `POST /api/auth/register`
- `GET /api/counsellors/available` - Returns ONLY: id, name, specialization, status
- `GET /api/peer-supporters/available` - Returns ONLY: id, firstName, area, status
- `POST /api/callbacks` - Create callback requests
- `POST /api/live-chat/rooms` - Create chat rooms

**Protected Endpoints (require JWT):**
- `GET /api/counsellors` - Full data (admin + counsellor roles only)
- `GET /api/peer-supporters` - Full data (admin + peer roles only)
- `GET /api/callbacks` - Filtered by role
- `GET /api/safeguarding-alerts` - Admin only
- All admin endpoints

**Role Hierarchy:**
```
admin > counsellor > peer > user
```

---

## API Reference

### Authentication
```bash
# Login
POST /api/auth/login
Body: { "email": "...", "password": "..." }
Response: { "access_token": "...", "user": {...} }

# Register
POST /api/auth/register
Body: { "email": "...", "password": "...", "name": "...", "role": "user" }
```

### Live Chat System
```bash
# Create chat room (user initiates)
POST /api/live-chat/rooms
Body: { "staff_type": "any|counsellor|peer", "safeguarding_alert_id": "..." }
Response: { "room_id": "...", "status": "active" }

# Get room details (for polling staff assignment)
GET /api/live-chat/rooms/{room_id}

# Staff joins chat
POST /api/live-chat/rooms/{room_id}/join
Headers: Authorization: Bearer <token>
Body: { "staff_id": "...", "staff_name": "..." }

# Send message
POST /api/live-chat/rooms/{room_id}/messages
Body: { "text": "...", "sender": "user|staff" }

# Get messages
GET /api/live-chat/rooms/{room_id}/messages

# End chat
POST /api/live-chat/rooms/{room_id}/end

# List active rooms (staff portal)
GET /api/live-chat/rooms
Headers: Authorization: Bearer <token>
```

### Safeguarding Alerts
```bash
# Created automatically by AI chat when risk detected
# Stored data includes:
# - risk_level (GREEN/AMBER/RED)
# - risk_score (0-200+)
# - ip_address (encrypted)
# - geolocation (country, city, lat/lon)
# - conversation_history (encrypted)
# - user_agent

GET /api/safeguarding-alerts
Headers: Authorization: Bearer <token>
Query: ?status=active&level=RED
```

### Callbacks
```bash
POST /api/callbacks
Body: {
  "name": "...",
  "phone": "...",
  "email": "...",       # Optional
  "message": "...",     # Optional
  "request_type": "peer|counsellor",
  "is_urgent": false
}

GET /api/callbacks
Headers: Authorization: Bearer <token>
# Returns filtered by user role
```

---

## Database Schema

### Users Collection
```javascript
{
  id: string,
  email: string,
  password_hash: string,
  name: string,
  role: "admin" | "counsellor" | "peer" | "user",
  created_at: datetime
}
```

### Counsellors Collection
```javascript
{
  id: string,
  name: string,          // ENCRYPTED
  specialization: string,
  status: "available" | "busy" | "off",
  phone: string,         // ENCRYPTED
  sms: string,           // ENCRYPTED
  whatsapp: string,      // ENCRYPTED
  user_id: string,       // Links to users collection
  created_at: datetime
}
```

### Peer Supporters Collection
```javascript
{
  id: string,
  firstName: string,     // ENCRYPTED
  area: string,
  background: string,
  yearsService: string,
  status: "available" | "limited" | "unavailable",
  phone: string,         // ENCRYPTED
  sms: string,           // ENCRYPTED
  whatsapp: string,      // ENCRYPTED
  user_id: string,
  created_at: datetime
}
```

### Callback Requests Collection
```javascript
{
  id: string,
  name: string,          // ENCRYPTED
  phone: string,         // ENCRYPTED
  email: string,         // ENCRYPTED
  message: string,       // ENCRYPTED
  request_type: "peer" | "counsellor",
  status: "pending" | "assigned" | "completed",
  assigned_to: string,
  is_urgent: boolean,
  safeguarding_alert_id: string,
  created_at: datetime
}
```

### Safeguarding Alerts Collection
```javascript
{
  id: string,
  session_id: string,
  user_id: string,
  risk_level: "GREEN" | "AMBER" | "RED",
  risk_score: number,
  risk_factors: [string],
  status: "active" | "reviewed" | "resolved",
  ip_address: string,    // ENCRYPTED
  user_agent: string,
  geolocation: {
    country: string,
    city: string,
    lat: number,
    lon: number
  },
  conversation_history: [string],  // ENCRYPTED
  created_at: datetime
}
```

### Live Chat Rooms Collection
```javascript
{
  id: string,
  staff_id: string,      // Null until staff joins
  staff_name: string,
  staff_type: string,
  safeguarding_alert_id: string,
  ai_session_id: string,
  messages: [{
    id: string,
    text: string,
    sender: "user" | "staff",
    timestamp: datetime
  }],
  status: "active" | "ended",
  created_at: datetime,
  ended_at: datetime
}
```

---

## Frontend Structure

### Key Pages (Expo Router)
| Route | File | Description |
|-------|------|-------------|
| `/` | `index.tsx` | Splash screen |
| `/home` | `home.tsx` | Main dashboard |
| `/ai-chat` | `ai-chat.tsx` | AI chatbot (Tommy/Doris) |
| `/live-chat` | `live-chat.tsx` | Human chat interface |
| `/crisis-support` | `crisis-support.tsx` | Crisis resources |
| `/peer-support` | `peer-support.tsx` | Peer supporter list |
| `/friends-family` | `friends-family.tsx` | Resources for loved ones |
| `/admin` | `admin.tsx` | Admin dashboard |
| `/counsellor-portal` | `counsellor-portal.tsx` | Counsellor view |
| `/peer-portal` | `peer-portal.tsx` | Peer supporter view |

### AI Chat Safeguarding Flow
1. User chats with AI (Tommy or Doris)
2. Each message is analyzed for risk indicators
3. If RED level detected → SafeguardingModal appears
4. User can choose:
   - Request callback
   - Connect to live chat immediately
   - Continue with AI
5. Staff are notified via staff portal

### Platform-Specific Code
```typescript
// live-chat.tsx - Close button handling
if (Platform.OS === 'web') {
  // Use window.confirm() for web
  if (window.confirm('End chat?')) { ... }
} else {
  // Use Alert.alert() for mobile
  Alert.alert('End Chat', '...', [...])
}
```

---

## Staff Portal

### Location
`/app/staff-portal/` - Standalone static website

### Deployment
Upload these files to any static hosting (20i, Netlify, Vercel):
- `index.html`
- `app.js`
- `styles.css`
- `config.js`

**Update `config.js` with your API URL before deploying.**

### Dashboard Layout
```
┌─────────────────────────────────────────────────┐
│  Status: [Available] [Busy] [Off]  🔊 Sound     │
├─────────────────────────────────────────────────┤
│  [Panic Alerts - Counsellors only]              │
│  [Panic Button - Peers only]                    │
├───────────────────────┬─────────────────────────┤
│  SAFEGUARDING ALERTS  │  ACTIVE CALLBACKS       │
│  - Risk level badges  │  - Assigned to me       │
│  - Location map       │                         │
│  - View details       │  PENDING CALLBACKS      │
│                       │  - Claim button         │
│  LIVE CHATS           │                         │
│  - Waiting users      │  NOTES                  │
│  - Join button        │  - My notes / Shared    │
└───────────────────────┴─────────────────────────┘
```

### Real-Time Features
- Polls `/api/safeguarding-alerts` every 30 seconds
- Polls `/api/live-chat/rooms` every 5 seconds
- Sound alerts for new events (can be toggled)
- Visual banner notifications

### Role-Based Visibility
| Feature | Admin | Counsellor | Peer |
|---------|-------|------------|------|
| Panic Alerts | ✅ | ✅ | ❌ |
| Panic Button | ❌ | ❌ | ✅ |
| Safeguarding | ✅ | ✅ | ❌ |
| Live Chats | ✅ | ✅ | ✅ |
| Callbacks | ✅ | ✅ (counsellor type) | ✅ (peer type) |
| Notes | ✅ | ✅ | ✅ |

---

## Deployment Guide

### Backend (Render)
1. Connect GitHub repo to Render
2. Set environment variables (see Environment Setup)
3. **CRITICAL:** Add `ENCRYPTION_KEY` to environment
4. Build command: `pip install -r requirements.txt`
5. Start command: `uvicorn server:app --host 0.0.0.0 --port $PORT`

### Frontend (Vercel)
1. Connect GitHub repo to Vercel
2. Set `EXPO_PUBLIC_BACKEND_URL` environment variable
3. Build command: `cd frontend && npx expo export -p web`
4. Output directory: `frontend/dist`

### Staff Portal (20i / Any Static Host)
1. Download files from `/staff-portal/`
2. Update `config.js` with production API URL
3. Upload all 4 files to hosting
4. Clear browser cache after updates

### MongoDB (Atlas)
- Use MongoDB Atlas for production
- Enable TLS for connections
- Set up IP whitelist for Render IPs

---

## Known Issues & Workarounds

### 1. React Native Web Alert.alert() is Stubbed
**Issue:** `Alert.alert()` does nothing on web
**Solution:** Use `Platform.OS` check and `window.confirm()` for web
```typescript
if (Platform.OS === 'web') {
  if (window.confirm(message)) { /* action */ }
} else {
  Alert.alert(title, message, buttons)
}
```

### 2. Existing Data Not Encrypted
**Issue:** Data created before encryption was enabled remains unencrypted
**Solution:** Create a migration script to encrypt existing records, or leave as-is (only new data will be encrypted)

### 3. Staff Portal Git Sync
**Issue:** Static files may not sync properly to GitHub via Emergent platform
**Solution:** Manually copy files from the repo if needed

### 4. IP Geolocation Rate Limits
**Issue:** ip-api.com has rate limits on free tier
**Solution:** For high-traffic, upgrade to paid tier or cache results

---

## Future Development

### P1 - High Priority
1. **Training Portal Integration**
   - Webhook endpoint: `POST /api/training/progress`
   - Receive trainee progress from WordPress/LearnDash LMS

2. **Push Notifications**
   - Firebase Cloud Messaging for mobile
   - Web Push for staff portal

### P2 - Medium Priority
3. **Persistent Chat History**
   - Store AI chat sessions in MongoDB
   - Allow users to continue previous conversations

4. **Data Migration Script**
   - Encrypt existing unencrypted records
   - One-time run with safety checks

### P3 - Future Enhancements
5. In-App Human-to-Human Chat (non-crisis)
6. Favorites/Saved Contacts
7. VoIP/PBX Integration
8. Achievement Badges
9. Referral System
10. Privacy Policy & Terms pages

---

## Test Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@veteran.dbty.co.uk | ChangeThisPassword123! |
| Counsellor | drtest@test.email | (check with admin) |
| Peer | (create via admin panel) | - |

---

## Support & Contacts

- **GitHub Repository:** https://github.com/andrewdunn358-dev/Veteran
- **Backend API (Production):** https://veterans-support-api.onrender.com
- **Staff Portal (Production):** https://radiocheck.me/staff-portal/

---

*Document maintained by the development team. Update this document when making significant changes to the codebase.*
