# UK Veterans Support App - Product Requirements Document

## Original Problem Statement
Build and enhance a mobile-first web application for UK military veterans providing crisis support, counselling, peer support, callback request functionality, and AI-powered companionship with comprehensive BACP-aligned safeguarding.

## What's Been Implemented (Feb 2026)

### NEW: Friends & Family Section
**Purpose**: Support for concerned loved ones
- **Raise a Concern form** - Family/friends can report worries
- **Signs to Look For** - Education on warning signs
- **Support Services** - Op Courage, Combat Stress, Men's Sheds, SSAFA, RBL
- **Armed Forces Covenant** info

### Enhanced Safeguarding Indicators
Now detects:
- **Addiction**: gambling, drinking to cope, drug use, "can't stop drinking"
- **Offending/Legal**: prison, court cases, anger issues, assault charges
- **Self-care deterioration**: not eating, not showering, letting go
- **Sleep changes**: insomnia, sleeping all day, "awake all night"
- **Isolation**: pushing people away, not leaving house, avoiding everyone
- **Pride/Stigma barriers**: "too proud to ask", "sign of weakness", "others had it worse", "real men don't"

### Safeguarding Modal Enhanced
When triggered offers:
- **Request a Callback** - Captures phone number for staff to call back
- **Connect Now** - Shows available counsellors/peers online
- **Samaritans** - Direct dial 116 123
- **999 notice**

### Tommy & Doris - Squaddie Personalities
- Proper military banter and slang
- "Alright mucker", "brew", "scran", "threaders"
- Drops banter immediately for serious topics

## Files to Deploy

| File | Location | Action |
|------|----------|--------|
| `staff-portal-safeguarding.zip` | `/app/staff-portal/` | Upload to 20i hosting |
| `FEATURE_LIST.md` | `/app/` | Complete reference |
| `DEPLOYMENT_INSTRUCTIONS.md` | `/app/` | Morning setup guide |

## New API Endpoints

### Family/Friends Concerns
- `POST /api/concerns` - Submit concern (public)
- `GET /api/concerns` - List concerns (staff only)
- `PATCH /api/concerns/{id}/status` - Update status

## New Pages

| Page | URL |
|------|-----|
| Friends & Family | `/family-friends` |

## Credentials
- Admin: admin@veteran.dbty.co.uk / ChangeThisPassword123!

## Completed This Session
- [x] BACP-aligned weighted safeguarding scoring
- [x] Addiction and offending behaviour detection
- [x] Self-care and sleep change detection
- [x] Pride/stigma barrier detection
- [x] Friends & Family page with Raise a Concern
- [x] Signs to Look For education
- [x] Support services (Op Courage, Men's Sheds, etc.)
- [x] Armed Forces Covenant info
- [x] Concern API endpoints
- [x] Feature list documentation
- [x] Deployment instructions

## Upcoming Tasks
- Add Concerns section to Staff Portal
- LMS course setup in WordPress/Tutor
- Push notifications for safeguarding alerts

## Future Tasks
- Grounding techniques page
- Local mental health team finder
- Persistent AI chat history
