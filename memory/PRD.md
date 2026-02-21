# Radio Check - UK Veterans Support App

## Original Problem Statement
Build and enhance a mobile-first web application for UK military veterans with role-based portals, AI chatbots, safeguarding, and peer support features.

## What's Been Implemented (Updated 21 Feb 2026)

### Core Features (Complete)
- **AI Battle Buddies**: Tommy, Doris, Bob, Finch - all with safeguarding
- **Safeguarding System**: Detects crisis messages, creates alerts, flags RED/AMBER levels
- **Role-Based Portals**: Admin, Counsellor, Peer Supporter
- **Staff Notes System**: GDPR-compliant notes
- **WebRTC Calling**: Fixed user_id blocker - all staff now have proper IDs
- **Field-Level Encryption**: PII encrypted at rest
- **Regimental Associations**: 35+ associations searchable by service

### Home Page Structure (Complete)
Menu cards that navigate to sub-pages:
- Need to Talk? → Contains Tommy & Doris ("We're on stag 24/7")
- Talk to a Veteran → Contains Bob and peer supporters
- Warfare on Lawfare → Finch legal info support
- Support Organisations → Directory + Alcohol & Substance Support
- Request a Callback
- Self-Care Tools → NEW /self-care page with tools grid
- Friends & Family

### Splash Page Updates (21 Feb 2026)
- ✅ New transparent logo from user's image
- ✅ Mission statement added under title
- ✅ "Learn more about Radio Check" button
- ✅ About page (/about) with full content:
  - What Is Radio Check?
  - What the AI Is For
  - What the AI Is Not For
  - Is This Right for Me?
  - Safety & Trust
  - The Bottom Line

### Self-Care Tools Page (21 Feb 2026) - NEW
Created `/self-care` page with 6 tools:
- My Journal
- Daily Check-in
- Grounding Tools
- Breathing Exercises
- Find Local Support
- Resources Library

### "Meet the AI Team" Section (Complete)
Shows at bottom of home page with avatars:
- Tommy - "Your battle buddy"
- Doris - "Warm support"  
- Bob - "Ex-Para peer support" (bald/tanned avatar)
- Finch - "Legal info support"

### Safeguarding Status (Complete - All 4 Characters)
**Backend**: All AI characters use same safeguarding system via `/api/ai-buddies/chat`
- Detects crisis keywords (score 200+ for RED level)
- Creates SafeguardingAlert in database
- Logs IP, geolocation, conversation history
- Returns `safeguardingTriggered: true` and `riskLevel: "RED"`

**Frontend Safeguarding Modals - ALL COMPLETE**:
- ✅ ai-chat.tsx (Tommy/Doris) - Full safeguarding modal with callback options
- ✅ bob-chat.tsx - Full safeguarding modal added
- ✅ sentry-chat.tsx (Finch) - Full safeguarding modal added

### Safeguarding Modal Features (All Characters)
- "We're Here For You" header with heart icon
- Request a Callback option with form
- Connect Now section (shows available counsellors/peers)
- Samaritans link (116 123)
- Emergency 999 note
- "I understand, continue chatting" dismiss option

## Key Files Reference

### Backend
- `/app/backend/server.py` - AI characters, safeguarding check at line 3240

### Frontend
- `/app/frontend/app/index.tsx` - Splash page with new logo, mission, Learn More
- `/app/frontend/app/about.tsx` - NEW About Radio Check page
- `/app/frontend/app/self-care.tsx` - NEW Self-Care Tools page
- `/app/frontend/app/home.tsx` - Menu cards, Meet the AI Team
- `/app/frontend/app/ai-chat.tsx` - Tommy/Doris with full safeguarding modal
- `/app/frontend/app/bob-chat.tsx` - Bob chat with full safeguarding modal
- `/app/frontend/app/sentry-chat.tsx` - Finch chat with full safeguarding modal
- `/app/frontend/app/crisis-support.tsx` - Contains Tommy/Doris card
- `/app/frontend/app/peer-support.tsx` - Contains Bob card

### AI Characters in Backend
```python
AI_CHARACTERS = {
    "tommy": {...},
    "doris": {...},
    "sentry": {"name": "Finch", ...},
    "bob": {...}
}
```

## Test Credentials
- Admin: `admin@veteran.dbty.co.uk` / `ChangeThisPassword123!`
- Staff: `sarahm.counsellor@radiocheck.me` / `RadioCheck2026!`

## Safeguarding Test Command
```bash
curl -X POST "$API_URL/api/ai-buddies/chat" \
  -H "Content-Type: application/json" \
  -d '{"message": "I want to end it all", "sessionId": "test", "character": "bob"}'
```
Should return: `safeguardingTriggered: true, riskLevel: "RED"`

## Backlog/Future Tasks
- Email notifications for safeguarding alerts (Resend API key needed)
- Voice message support for AI characters
- Push notifications
