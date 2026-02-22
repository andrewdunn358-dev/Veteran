# Backend Architecture Guide

## Current Structure (Modularized)

The backend has been refactored from a monolithic `server.py` into a modular router-based architecture.

```
/app/backend/
├── server.py             # Main entry point (~6000 lines, contains AI chat logic)
├── encryption.py         # Field-level encryption utilities  
├── safety.py             # Veteran AI safety monitoring
├── models/
│   ├── __init__.py
│   └── schemas.py        # All Pydantic models (centralized)
├── routers/
│   ├── __init__.py       # Router exports
│   ├── auth.py           # /auth/* - Authentication & user management
│   ├── cms.py            # /cms/* - Content Management System
│   ├── shifts.py         # /shifts/* - Staff scheduling with push notifications
│   ├── buddy_finder.py   # /buddy-finder/* - Veteran peer matching
│   ├── staff.py          # /counsellors/*, /peer-supporters/* - Staff management
│   ├── organizations.py  # /organizations/* - Support orgs directory
│   ├── resources.py      # /resources/* - Educational materials
│   ├── safeguarding.py   # /panic-alerts/*, /safeguarding-alerts/*
│   ├── callbacks.py      # /callbacks/* - Callback request management
│   ├── live_chat.py      # /live-chat/* - Real-time chat rooms
│   ├── notes.py          # /notes/* - Staff case notes
│   └── concerns.py       # /concerns/* - Family/Friends concerns
├── services/
│   ├── __init__.py
│   └── database.py       # Database connection utilities
└── tests/
    └── test_*.py         # Test files
```

## Migration Status

### ✅ Completed (Routers Created)
- **auth.py** - User authentication, JWT, password management
- **cms.py** - Pages, sections, cards for CMS
- **shifts.py** - Staff scheduling with push notifications
- **buddy_finder.py** - Veteran peer matching and messaging
- **staff.py** - Counsellors and peer supporters CRUD
- **organizations.py** - Support organizations with seed data
- **resources.py** - Educational resources library
- **safeguarding.py** - Panic and safeguarding alerts
- **callbacks.py** - Callback request queue
- **live_chat.py** - Real-time chat rooms
- **notes.py** - Staff notes system
- **concerns.py** - Family/friends concerns

### 🔄 Remaining in server.py (Complex logic to migrate later)
- **AI Chat** (`/ai-buddies/*`) - Contains AI character prompts and safety monitoring
- **Admin Analytics** (`/admin/*`) - Chat analytics, prompt versions
- **WebRTC** (`/webrtc/*`) - Online staff, active calls
- **Content Seeding** (`/content/*`, `/cms/seed`) - Default content setup
- **Setup** (`/setup/*`) - Initial admin setup

## How to Use Routers

Routers are standalone modules. To use one in server.py:

```python
from routers import staff, organizations, resources

# Include with /api prefix
app.include_router(staff.router, prefix="/api")
app.include_router(organizations.router, prefix="/api")
app.include_router(resources.router, prefix="/api")
```

## Adding a New Router

1. Create file in `/routers/` (e.g., `new_feature.py`)
2. Define router with prefix and tags:
   ```python
   from fastapi import APIRouter
   from services.database import get_database
   
   router = APIRouter(prefix="/new-feature", tags=["new-feature"])
   ```
3. Add endpoints
4. Update `routers/__init__.py` to export
5. Include in server.py: `app.include_router(new_feature.router, prefix="/api")`

## Key Dependencies

- **Database**: All routers use `services.database.get_database()`
- **Auth**: JWT functions available from `routers.auth`
- **Models**: All schemas in `models.schemas`

## Testing

Run tests after any changes:
```bash
cd /app/backend
python -m pytest tests/
```

## Notes

- The monolithic server.py still works and is stable
- New features should be added to appropriate routers
- AI chat logic remains in server.py due to its complexity and tight integration with safety monitoring
- Routers use async/await for all database operations
