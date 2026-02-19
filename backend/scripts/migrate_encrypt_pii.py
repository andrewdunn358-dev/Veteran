"""
Data Migration Script: Encrypt Existing PII
============================================
This one-off script encrypts all existing unencrypted PII in the production database.

IMPORTANT: 
- Run this script ONCE after deploying the encryption feature
- Backup your database before running
- This is idempotent - already encrypted fields (prefixed with 'ENC:') will be skipped

Usage:
    python scripts/migrate_encrypt_pii.py

Environment:
    Requires MONGO_URL and ENCRYPTION_KEY to be set in /app/backend/.env
"""

import os
import sys
from pathlib import Path
import asyncio
from datetime import datetime

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))

from dotenv import load_dotenv
load_dotenv(Path(__file__).parent.parent / '.env')

from motor.motor_asyncio import AsyncIOMotorClient
from encryption import encrypt_field, ENCRYPTED_FIELDS
import certifi

# MongoDB connection
mongo_url = os.environ.get('MONGO_URL')
db_name = os.environ.get('DB_NAME', 'veterans_support')

if not mongo_url:
    print("ERROR: MONGO_URL not set in environment")
    sys.exit(1)

if not os.environ.get('ENCRYPTION_KEY'):
    print("ERROR: ENCRYPTION_KEY not set in environment")
    sys.exit(1)

# Connect to MongoDB
if 'mongodb+srv' in mongo_url or 'mongodb.net' in mongo_url:
    client = AsyncIOMotorClient(mongo_url, tlsCAFile=certifi.where())
else:
    client = AsyncIOMotorClient(mongo_url)

db = client[db_name]


async def migrate_collection(collection_name: str, fields: list) -> dict:
    """
    Migrate a single collection by encrypting specified fields.
    Returns stats about the migration.
    """
    if not fields:
        return {"collection": collection_name, "skipped": "no encrypted fields defined"}
    
    stats = {
        "collection": collection_name,
        "total_documents": 0,
        "documents_updated": 0,
        "fields_encrypted": 0,
        "already_encrypted": 0,
        "errors": []
    }
    
    collection = db[collection_name]
    cursor = collection.find({})
    
    async for doc in cursor:
        stats["total_documents"] += 1
        doc_id = doc.get("_id")
        updates = {}
        
        for field in fields:
            value = doc.get(field)
            if value and isinstance(value, str):
                # Skip if already encrypted
                if value.startswith('ENC:'):
                    stats["already_encrypted"] += 1
                    continue
                
                # Encrypt the field
                encrypted_value = encrypt_field(value)
                if encrypted_value != value:  # Encryption succeeded
                    updates[field] = encrypted_value
                    stats["fields_encrypted"] += 1
        
        # Apply updates if any
        if updates:
            try:
                await collection.update_one(
                    {"_id": doc_id},
                    {"$set": updates}
                )
                stats["documents_updated"] += 1
            except Exception as e:
                stats["errors"].append(f"Doc {doc_id}: {str(e)}")
    
    return stats


async def run_migration():
    """
    Run the full migration across all collections with encrypted fields.
    """
    print("=" * 60)
    print("PII Encryption Migration Script")
    print("=" * 60)
    print(f"Database: {db_name}")
    print(f"Started at: {datetime.utcnow().isoformat()}")
    print("-" * 60)
    
    # Collections to migrate
    collections_to_migrate = {
        "counsellors": ENCRYPTED_FIELDS.get("counsellors", []),
        "peer_supporters": ENCRYPTED_FIELDS.get("peer_supporters", []),
        "callbacks": ENCRYPTED_FIELDS.get("callbacks", []),
        "notes": ENCRYPTED_FIELDS.get("notes", []),
        "safeguarding_alerts": ENCRYPTED_FIELDS.get("safeguarding_alerts", []),
        "concerns": ["your_name", "your_email", "your_phone", "veteran_name", "concerns"],
    }
    
    all_stats = []
    total_updated = 0
    total_encrypted = 0
    
    for collection_name, fields in collections_to_migrate.items():
        print(f"\nMigrating collection: {collection_name}")
        print(f"  Fields to encrypt: {', '.join(fields) if fields else 'None'}")
        
        stats = await migrate_collection(collection_name, fields)
        all_stats.append(stats)
        
        if "skipped" not in stats:
            total_updated += stats["documents_updated"]
            total_encrypted += stats["fields_encrypted"]
            
            print(f"  Total documents: {stats['total_documents']}")
            print(f"  Documents updated: {stats['documents_updated']}")
            print(f"  Fields encrypted: {stats['fields_encrypted']}")
            print(f"  Already encrypted: {stats['already_encrypted']}")
            
            if stats["errors"]:
                print(f"  Errors: {len(stats['errors'])}")
                for error in stats["errors"][:5]:  # Show first 5 errors
                    print(f"    - {error}")
    
    print("\n" + "=" * 60)
    print("MIGRATION SUMMARY")
    print("=" * 60)
    print(f"Total documents updated: {total_updated}")
    print(f"Total fields encrypted: {total_encrypted}")
    print(f"Completed at: {datetime.utcnow().isoformat()}")
    print("=" * 60)
    
    return all_stats


async def verify_migration():
    """
    Verify that the migration was successful by checking sample documents.
    """
    print("\n" + "=" * 60)
    print("VERIFICATION")
    print("=" * 60)
    
    # Check each collection
    for collection_name, fields in ENCRYPTED_FIELDS.items():
        if not fields:
            continue
            
        collection = db[collection_name]
        sample = await collection.find_one({})
        
        if sample:
            print(f"\n{collection_name}:")
            for field in fields:
                value = sample.get(field)
                if value and isinstance(value, str):
                    is_encrypted = value.startswith('ENC:')
                    status = "✓ Encrypted" if is_encrypted else "✗ NOT Encrypted"
                    print(f"  {field}: {status}")


if __name__ == "__main__":
    print("\n" + "!" * 60)
    print("WARNING: This will modify your database!")
    print("Make sure you have a backup before proceeding.")
    print("!" * 60)
    
    response = input("\nType 'ENCRYPT' to proceed: ")
    
    if response.strip() != "ENCRYPT":
        print("Aborted.")
        sys.exit(0)
    
    # Run migration
    asyncio.run(run_migration())
    
    # Verify
    verify = input("\nRun verification check? (y/n): ")
    if verify.lower() == 'y':
        asyncio.run(verify_migration())
    
    print("\nMigration complete!")
