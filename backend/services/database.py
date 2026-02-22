"""
Database configuration and connection utilities.
Provides shared database access for all routers.
"""

import os
from motor.motor_asyncio import AsyncIOMotorClient
from pathlib import Path
from dotenv import load_dotenv

ROOT_DIR = Path(__file__).parent.parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB Configuration
MONGO_URL = os.environ.get('MONGO_URL')
DB_NAME = os.environ.get('DB_NAME', 'veterans_support')

# Global database client
_client = None
_db = None


def get_database():
    """Get the database instance. Creates connection if not exists."""
    global _client, _db
    if _db is None:
        _client = AsyncIOMotorClient(MONGO_URL)
        _db = _client[DB_NAME]
    return _db


def get_client():
    """Get the MongoDB client instance."""
    global _client
    if _client is None:
        _client = AsyncIOMotorClient(MONGO_URL)
    return _client


# Convenience function for getting the db
db = property(lambda self: get_database())
