# UK Veterans Support App - Product Requirements Document

## Original Problem Statement
Build and enhance a mobile-first web application for UK military veterans providing crisis support, counselling, peer support, callback request functionality, and AI-powered companionship with comprehensive BACP-aligned safeguarding.

## What's Been Implemented (Feb 2026)

### Safeguarding Triage System (BACP-Aligned)
- **Weighted risk scoring** (0-100+)
- Risk levels: GREEN (0-29), YELLOW (30-59), AMBER (60-89), RED (90+)
- **RED indicators**: suicide ideation, method references, self-harm, weapon access
- **AMBER indicators**: numbness, PTSD, isolation, substance misuse, hopelessness
- **Modifiers**: dark humour, minimisation, repeated indicators
- Session-based tracking for escalation on repeated distress

### Enhanced Safeguarding Modal
When triggered, modal now offers:
- **Request a Callback** - User enters phone number → Staff can call them back
- **Connect Now** - Shows available counsellors/peers for live connect
- **Samaritans** - Direct dial to 116 123
- **999 notice** - Emergency reminder
- "I understand, continue chatting" - Acknowledge and continue

### Tommy & Doris AI Personalities
- **Squaddie banter** - Military slang, take the piss (gently)
- Tommy: "Alright mucker", NAAFI corner energy
- Doris: "Kettle's on", warm with wit
- Both drop banter immediately for serious topics

### Staff Portal Updates
- **Safeguarding Alerts section** with:
  - Risk level badges (RED/AMBER + score)
  - Triggered indicators
  - Acknowledge/Resolve actions
  - Auto-refresh (30 seconds)
  - Pulsing animation for active alerts

### UI Updates
- Splash screen: Two-option question "Do you need to speak with someone right now?"
- Home page: "We're on stag 24/7" title for AI Buddies
- "Your Support Network" subtitle under Radio Check

## Files to Deploy

| File | Location | Action |
|------|----------|--------|
| `staff-portal-safeguarding.zip` | `/app/staff-portal/` | Upload to 20i hosting |
| `FEATURE_LIST.md` | `/app/` | Reference document |
| `DEPLOYMENT_INSTRUCTIONS.md` | `/app/` | Morning setup guide |

## Key API Endpoints

### Safeguarding
- `POST /api/ai-buddies/chat` - Returns `safeguardingTriggered`, `riskLevel`, `riskScore`
- `GET /api/safeguarding-alerts` - List alerts (staff only)
- `PATCH /api/safeguarding-alerts/{id}/acknowledge`
- `PATCH /api/safeguarding-alerts/{id}/resolve`

### Availability Check
- `GET /api/counsellors/available` - Available counsellors
- `GET /api/peer-supporters/available` - Available peers

## Credentials
- Admin: admin@veteran.dbty.co.uk / ChangeThisPassword123!

## Completed This Session
- [x] BACP-aligned weighted safeguarding scoring
- [x] Expanded crisis keywords (informal, angry, indirect)
- [x] Session-based risk tracking with escalation
- [x] Callback request with phone capture in modal
- [x] Live connect to available staff
- [x] Staff portal safeguarding alerts with risk badges
- [x] Tommy & Doris squaddie banter personalities
- [x] Feature list documentation
- [x] Deployment instructions

## Upcoming Tasks
- LMS course setup in WordPress/Tutor
- Training Portal API for progress tracking
- Push notifications for safeguarding alerts (future)

## Future Tasks
- Persistent AI chat history
- VoIP/PBX integration
- In-app human-to-human chat
