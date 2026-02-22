# Production Database Cleanup Script

This script helps remove test data from the production database.

## Test Data to Remove

### Test Counsellors
Run in MongoDB shell or via API:

```javascript
// MongoDB Shell - Connect to your Render database first
// mongo "your-connection-string"

// Delete test counsellors (names containing 'Test' or created for testing)
db.counsellors.deleteMany({
  $or: [
    { name: /test/i },
    { email: /test@/i },
    { email: /@test.com/i }
  ]
});

// Delete test peer supporters
db.peer_supporters.deleteMany({
  $or: [
    { name: /test/i },
    { email: /test@/i },
    { email: /@test.com/i }
  ]
});
```

### Alternative: Use Admin API
If you have admin access, you can also delete via the API:

```bash
# First login to get token
TOKEN=$(curl -s -X POST https://veterans-support-api.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@veteran.dbty.co.uk","password":"YOUR_PASSWORD"}' | jq -r '.access_token')

# List all counsellors to identify test ones
curl -s -H "Authorization: Bearer $TOKEN" \
  https://veterans-support-api.onrender.com/api/counsellors

# List all peer supporters
curl -s -H "Authorization: Bearer $TOKEN" \
  https://veterans-support-api.onrender.com/api/peer-supporters

# Delete specific counsellor by ID
curl -X DELETE -H "Authorization: Bearer $TOKEN" \
  https://veterans-support-api.onrender.com/api/counsellors/COUNSELLOR_ID

# Delete specific peer supporter by ID
curl -X DELETE -H "Authorization: Bearer $TOKEN" \
  https://veterans-support-api.onrender.com/api/peer-supporters/PEER_ID
```

### Test Users to Look For
Common patterns for test data:
- Names: "Test User", "Test Counsellor", "John Test"
- Emails: test@..., ...@test.com, fake@..., example@...
- Phone: 000-000-0000, 123-456-7890

## Before Deleting
1. Export current data as backup
2. Review the list to ensure no real users are affected
3. Delete in small batches

## Render MongoDB Access
If using MongoDB Atlas (via Render):
1. Go to your Render dashboard
2. Find the MongoDB service
3. Get connection string from environment variables
4. Use MongoDB Compass or shell to connect

## Verification
After cleanup, verify via admin portal:
- Check Counsellors list
- Check Peer Supporters list
- Ensure only real staff remain
