# Radio Check - Complete Production Deployment Guide

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    PRODUCTION SETUP                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   ┌──────────────┐    ┌──────────────┐    ┌──────────────┐  │
│   │   Vercel     │    │   Render     │    │   20i        │  │
│   │  (Frontend)  │───▶│  (Backend)   │◀───│  (Portals)   │  │
│   │              │    │              │    │              │  │
│   │ app.radio    │    │ veterans-    │    │ admin.radio  │  │
│   │ check.me     │    │ support-api  │    │ check.me     │  │
│   │              │    │ .onrender    │    │              │  │
│   │              │    │ .com         │    │ staff.radio  │  │
│   │              │    │              │    │ check.me     │  │
│   └──────────────┘    └──────────────┘    └──────────────┘  │
│                              │                               │
│                              ▼                               │
│                       ┌──────────────┐                      │
│                       │   MongoDB    │                      │
│                       │   Atlas      │                      │
│                       └──────────────┘                      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## 1. Backend (Render)

### Environment Variables Required

| Variable | Description | Example |
|----------|-------------|---------|
| `MONGO_URL` | MongoDB connection string | `mongodb+srv://...` |
| `DB_NAME` | Database name | `veterans_support` |
| `JWT_SECRET_KEY` | JWT signing key (64 chars) | `8d94aadaa2b36a...` |
| `CORS_ORIGINS` | Allowed origins | `*` |
| `OPENAI_API_KEY` | OpenAI API key | `sk-proj-...` |
| `RESEND_API_KEY` | Resend email API key | `re_...` |
| `SENDER_EMAIL` | Email sender address | `noreply@radiocheck.me` |
| `FRONTEND_URL` | Frontend URL for emails | `https://app.radiocheck.me` |
| `ENCRYPTION_KEY` | PII encryption key | `base64 encoded key` |

### Cron Jobs Setup

#### Option A: Render Cron Jobs (Recommended)

1. Go to Render Dashboard → Your Service → Settings → Cron Jobs
2. Add a new cron job:
   - **Name**: `shift_reminders`
   - **Command**: `cd backend && python cron_runner.py shift_reminders`
   - **Schedule**: `*/15 * * * *` (every 15 minutes)
   - **Root Directory**: Leave empty (uses repo root)

3. Add another for data retention (optional):
   - **Name**: `data_retention`
   - **Command**: `cd backend && python cron_runner.py data_retention`
   - **Schedule**: `0 3 * * *` (daily at 3 AM)

#### Option B: External Cron Service (cron-job.org)

If Render cron isn't available on your plan:

1. Create account at https://cron-job.org
2. Add job pointing to: `POST https://veterans-support-api.onrender.com/api/shifts/send-reminders`
3. Schedule: Every 15 minutes
4. No authentication required (endpoint is public but safe)

## 2. Frontend (Vercel)

### Environment Variables Required

| Variable | Description | Value |
|----------|-------------|-------|
| `EXPO_PUBLIC_BACKEND_URL` | Production backend | `https://veterans-support-api.onrender.com` |

### IMPORTANT: Failsafe Protection

The frontend now has a built-in failsafe (`/frontend/src/config/api.ts`) that:
- Detects if the configured URL is a preview/development URL
- Automatically falls back to the production backend in production builds
- Logs warnings if the failsafe activates

This prevents misconfigured deployments from breaking the app.

### Deployment Steps

1. Ensure `EXPO_PUBLIC_BACKEND_URL` is set in Vercel Environment Variables
2. **IMPORTANT**: After changing any environment variable, trigger a **Redeploy**
   - Environment variables are only injected at build time
   - Go to Deployments → ... menu → Redeploy

## 3. Admin & Staff Portals (20i)

### Files to Upload

**Admin Portal**: Upload contents of `/admin-site/` to `admin.radiocheck.me`
**Staff Portal**: Upload contents of `/staff-portal/` to `staff.radiocheck.me`

### Configuration (config.js)

Both portals have a `config.js` file that MUST point to the production backend:

```javascript
var CONFIG = {
    API_URL: 'https://veterans-support-api.onrender.com'
};
```

⚠️ **NEVER** change this to a preview URL.

## 4. Troubleshooting

### Login Issues (401 Errors)

1. **Check JWT_SECRET_KEY**:
   - Must be the same value on Render as was used to create tokens
   - If you changed it, users need to log out and log back in

2. **Check CORS**:
   - Ensure `CORS_ORIGINS` includes your domain or is set to `*`

3. **Check token format**:
   - Portals should send: `Authorization: Bearer <token>`
   - Token should come from login response field `token` (not `access_token`)

### AI Buddies Not Showing

1. Check the API endpoint: `GET /api/ai-buddies/characters`
2. Ensure the response includes characters with `id: 'tommy'` and `id: 'doris'`
3. Check browser console for errors

### Cron Jobs Not Running

1. Check Render logs for cron execution
2. Verify the command works manually:
   ```bash
   cd backend && python cron_runner.py shift_reminders
   ```
3. Ensure all required environment variables are set

## 5. Quick Reference URLs

| Service | URL |
|---------|-----|
| Production App | https://app.radiocheck.me |
| Admin Portal | https://admin.radiocheck.me |
| Staff Portal | https://staff.radiocheck.me |
| Backend API | https://veterans-support-api.onrender.com |
| Marketing Site | https://radiocheck.me |

## 6. Test Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@veteran.dbty.co.uk | ChangeThisPassword123! |

---
*Last Updated: February 2026*
