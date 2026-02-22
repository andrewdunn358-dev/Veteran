# Backend Architecture Guide

## Current Structure

```
/app/backend/
├── server.py           # Main monolithic file (~5500 lines)
├── encryption.py       # Field-level encryption utilities  
├── safety.py           # Veteran AI safety monitoring
├── models/
│   ├── __init__.py
│   └── schemas.py      # All Pydantic models (extracted)
├── routers/
│   ├── __init__.py
│   └── (future routers)
├── services/
│   ├── __init__.py
│   └── database.py     # Database connection utilities
└── tests/
    └── test_*.py       # Test files
```

## Target Architecture (Migration Path)

```
/app/backend/
├── server.py           # Slim entry point (~150 lines)
├── models/
│   └── schemas.py      # Pydantic models
├── routers/
│   ├── auth.py         # /auth/* endpoints
│   ├── cms.py          # /cms/* endpoints  
│   ├── buddy_finder.py # /buddy-finder/* endpoints
│   ├── staff.py        # /counsellors/*, /peer-supporters/*
│   ├── safeguarding.py # /panic-alerts/*, /safeguarding-alerts/*
│   ├── shifts.py       # /shifts/* endpoints
│   ├── ai_chat.py      # /ai-buddies/* endpoints
│   └── admin.py        # /admin/* endpoints
├── services/
│   ├── database.py     # Database connection
│   ├── email.py        # Resend email functions
│   ├── auth.py         # JWT & password utilities
│   └── safety.py       # Safety monitoring
└── tests/
```

## Migration Strategy

1. **Phase 1 (Complete)**: Extract Pydantic models to `models/schemas.py`
2. **Phase 2**: Create shared services (database, auth)
3. **Phase 3**: Extract routers one by one, starting with least dependencies
4. **Phase 4**: Update server.py to import routers

## How to Add a New Router

```python
# routers/example.py
from fastapi import APIRouter, Depends, HTTPException
from services.database import get_database
from services.auth import get_current_user, require_role
from models.schemas import ExampleModel

router = APIRouter(prefix="/example", tags=["example"])
db = get_database()

@router.get("/")
async def list_examples():
    items = await db.examples.find({}).to_list(100)
    return [{"id": str(item["_id"]), **item} for item in items]
```

## Register Router in server.py

```python
from routers import example
app.include_router(example.router, prefix="/api")
```

## Key Dependencies

- **Database**: All routers access MongoDB via `services.database.get_database()`
- **Auth**: JWT functions in server.py (will be moved to `services.auth`)
- **Safety**: Safeguarding logic remains in `safety.py`

## Notes

- The monolithic server.py works and is stable
- Migration should be done incrementally with testing after each change
- Keep backwards compatibility during migration
- Run `pytest` after each router extraction to ensure nothing breaks
