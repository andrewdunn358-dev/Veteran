# Radio Check - UK Veterans Support App

## Original Problem Statement
Build and enhance a mobile-first web application for UK military veterans with role-based portals, AI chatbots, safeguarding, and peer support features.

## What's Been Implemented

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
- Self-Care Tools
- Friends & Family

### "Meet the AI Team" Section (Complete)
Shows at bottom of home page with avatars:
- Tommy - "Your battle buddy"
- Doris - "Warm support"  
- Bob - "Ex-Para peer support" (bald/tanned avatar)
- Finch - "Legal info support"

### Safeguarding Status
**Backend**: All AI characters use same safeguarding system via `/api/ai-buddies/chat`
- Detects crisis keywords (score 235 for RED level)
- Creates SafeguardingAlert in database
- Logs IP, geolocation, conversation history
- Returns `safeguardingTriggered: true` and `riskLevel: "RED"`

**Frontend Safeguarding Modals**:
- ✅ ai-chat.tsx (Tommy/Doris) - Full safeguarding modal with callback options
- ⚠️ bob-chat.tsx - Safeguarding state added, needs modal UI
- ⚠️ sentry-chat.tsx (Finch) - Needs safeguarding state and modal

## REMAINING WORK - Safeguarding UI

### bob-chat.tsx needs:
1. Add safeguarding modal UI (copy from ai-chat.tsx)
2. Add styles for safeguarding modal

### sentry-chat.tsx needs:
1. Add safeguarding state variables
2. Check for safeguardingTriggered in response
3. Add safeguarding modal UI
4. Add styles for safeguarding modal

## Key Files Reference

### Backend
- `/app/backend/server.py` - AI characters, safeguarding check at line 3240

### Frontend
- `/app/frontend/app/home.tsx` - Menu cards, Meet the AI Team
- `/app/frontend/app/ai-chat.tsx` - Tommy/Doris with full safeguarding modal
- `/app/frontend/app/bob-chat.tsx` - Bob chat (needs safeguarding modal)
- `/app/frontend/app/sentry-chat.tsx` - Finch chat (needs safeguarding)
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
  -d '{"message": "I cant cope anymore", "sessionId": "test", "character": "bob"}'
```
Should return: `safeguardingTriggered: true, riskLevel: "RED"`
