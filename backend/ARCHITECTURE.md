# Backend Architecture Guide

## Current Structure (Fully Modularized)

The backend has been refactored from a monolithic `server.py` into a modular router-based architecture.

```
/app/backend/
├── server.py             # Main entry point (contains AI chat logic)
├── encryption.py         # Field-level encryption utilities  
├── safety.py             # Veteran AI safety monitoring
├── models/
│   ├── __init__.py
│   └── schemas.py        # All Pydantic models (centralized)
├── routers/
│   ├── __init__.py       # Router exports
│   ├── auth.py           # /auth/* - Authentication, JWT, push tokens
│   ├── cms.py            # /cms/* - Content Management System
│   ├── shifts.py         # /shifts/* - Staff scheduling + email notifications
│   ├── buddy_finder.py   # /buddy-finder/* - Veteran peer matching
│   ├── staff.py          # /counsellors/*, /peer-supporters/*
│   ├── organizations.py  # /organizations/* - Support orgs directory
│   ├── resources.py      # /resources/* - Educational materials
│   ├── safeguarding.py   # /panic-alerts/*, /safeguarding-alerts/*
│   ├── callbacks.py      # /callbacks/* - Callback request management
│   ├── live_chat.py      # /live-chat/* - Real-time chat rooms
│   ├── notes.py          # /notes/* - Staff case notes
│   ├── concerns.py       # /concerns/* - Family/Friends concerns
│   ├── message_queue.py  # /message-queue/* - Offline message delivery
│   ├── ai_feedback.py    # /ai-feedback/* - AI response feedback system
│   └── knowledge_base.py # /knowledge-base/* - RAG for AI characters
├── services/
│   ├── __init__.py
│   └── database.py       # Database connection utilities
└── tests/
    └── test_*.py         # Test files
```

## Router Summary

### Core Functionality
| Router | Prefix | Description |
|--------|--------|-------------|
| `auth.py` | `/auth` | User authentication, JWT tokens, push token registration |
| `cms.py` | `/cms` | CMS pages, sections, cards management |
| `shifts.py` | `/shifts` | Staff rota with email notifications |
| `buddy_finder.py` | `/buddy-finder` | Veteran peer matching and messaging |

### Staff Management
| Router | Prefix | Description |
|--------|--------|-------------|
| `staff.py` | `/counsellors`, `/peer-supporters` | Staff CRUD operations |
| `organizations.py` | `/organizations` | Support organizations directory |
| `callbacks.py` | `/callbacks` | Callback request queue |

### Safety & Alerts
| Router | Prefix | Description |
|--------|--------|-------------|
| `safeguarding.py` | `/panic-alerts`, `/safeguarding-alerts` | Emergency alerts management |
| `concerns.py` | `/concerns` | Family concerns about veterans |

### Communication
| Router | Prefix | Description |
|--------|--------|-------------|
| `live_chat.py` | `/live-chat` | Real-time chat rooms |
| `message_queue.py` | `/message-queue` | **NEW** Offline message queuing |
| `notes.py` | `/notes` | Staff case notes |

### AI System
| Router | Prefix | Description |
|--------|--------|-------------|
| `ai_feedback.py` | `/ai-feedback` | **NEW** User feedback for AI responses |
| `knowledge_base.py` | `/knowledge-base` | **NEW** RAG system for accurate AI answers |

## New Features (P1 Tasks Completed)

### 1. Push Notification System
- Token registration: `POST /api/auth/push-token`
- Token removal: `DELETE /api/auth/push-token`
- Uses Expo Push Notifications API
- Integrated with shifts for schedule notifications

### 2. Offline Message Queue
- Queue messages: `POST /api/message-queue/queue`
- Get pending: `GET /api/message-queue/pending/{user_id}`
- Acknowledge: `POST /api/message-queue/acknowledge`
- Online status: `POST /api/message-queue/online/{user_id}`

### 3. AI Feedback System
- Submit feedback: `POST /api/ai-feedback/submit`
- Quick thumbs: `POST /api/ai-feedback/thumbs`
- Report issues: `POST /api/ai-feedback/report`
- Analytics: `GET /api/ai-feedback/summary`
- Improvements: `GET /api/ai-feedback/improvements/{character}`

### 4. Knowledge Base (RAG)
- Add entries: `POST /api/knowledge-base/entries`
- Search: `POST /api/knowledge-base/search`
- AI context: `GET /api/knowledge-base/context/{query}`
- Seed data: `POST /api/knowledge-base/seed`

## Integration with AI Chat

To use the knowledge base in AI responses, call the context endpoint before generating a response:

```python
# In AI chat handler
context = await get_context_for_ai(user_message)
if context["has_relevant_info"]:
    system_prompt += f"\n\nRelevant information:\n{context['context']}"
```

## Testing

Run tests after any changes:
```bash
cd /app/backend
python -m pytest tests/
```

Test individual router:
```bash
curl http://localhost:8001/api/knowledge-base/categories
curl http://localhost:8001/api/ai-feedback/summary
curl http://localhost:8001/api/message-queue/stats
```

## Notes

- All routers use async/await for database operations
- Routers import from `services.database` for DB connection
- Models are centralized in `models/schemas.py`
- New routers are self-contained and testable independently
