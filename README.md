# Radio Check

**Mental health and peer support app for UK veterans**

## Overview

Radio Check provides veterans with immediate access to:
- 🤖 AI companions trained in military culture and mental health support
- 👥 Peer-to-peer connections via Buddy Finder
- 📞 Professional counsellor access
- 📚 UK veteran resources and benefits information
- 🆘 Crisis support with safeguarding detection

## Quick Links

| Resource | Description |
|----------|-------------|
| [PRD.md](/memory/PRD.md) | Product requirements and current status |
| [Developer Guide](/docs/guides/DEVELOPER_GUIDE.md) | Setup and development instructions |
| [API Architecture](/backend/ARCHITECTURE.md) | Backend router structure |
| [Deployment Guide](/docs/deployment/) | Production deployment instructions |
| [Compliance](/docs/compliance/) | GDPR, BACP guidelines |

## Tech Stack

- **Mobile App**: React Native (Expo)
- **Backend**: Python FastAPI
- **Database**: MongoDB
- **AI**: OpenAI GPT-4 with custom prompts
- **Admin/Staff Portals**: Static HTML/JS

## Project Structure

```
/app
├── frontend/          # React Native mobile app
├── backend/           # FastAPI server + routers
├── admin-site/        # Admin portal (static)
├── staff-portal/      # Staff portal (static)
├── website/           # Marketing website
├── docs/              # Documentation
│   ├── deployment/    # Deployment guides
│   ├── compliance/    # GDPR, BACP, safeguarding
│   └── guides/        # Developer and user guides
└── memory/            # PRD and planning docs
```

## Getting Started

```bash
# Backend
cd backend
pip install -r requirements.txt
uvicorn server:app --reload --port 8001

# Frontend
cd frontend
yarn install
yarn start
```

## Key Features

- ✅ 7 AI personas with crisis detection
- ✅ Knowledge base with UK veteran info
- ✅ WYSIWYG CMS editor
- ✅ Staff scheduling system
- ✅ GDPR compliant (data export/deletion)
- ✅ Safeguarding alerts with escalation

## Documentation

All documentation is in `/docs/`:

- **Deployment**: Server setup, hosting options, production config
- **Compliance**: GDPR audit, BACP framework, ROPA
- **Guides**: AI companions, developer setup, prompt improvement

## Contact

- Privacy: privacy@radiocheck.me
- Support: [Veterans Gateway](https://www.veteransgateway.org.uk)

---

*Built with care for those who served* 🇬🇧
