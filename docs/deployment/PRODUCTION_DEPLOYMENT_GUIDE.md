# Radio Check - Complete Deployment Guide

## Understanding the Architecture

Radio Check has **4 separate parts** that deploy differently:

```
┌─────────────────────────────────────────────────────────────────┐
│                        THE INTERNET                              │
└─────────────────────────────────────────────────────────────────┘
         │                    │                    │
         ▼                    ▼                    ▼
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│   MOBILE APP    │  │  ADMIN PORTAL   │  │  STAFF PORTAL   │
│   (iOS/Android) │  │    (Website)    │  │    (Website)    │
│                 │  │                 │  │                 │
│ Lives on user's │  │ Lives on Vercel │  │ Lives on Vercel │
│ phone - NOT on  │  │ (static files)  │  │ (static files)  │
│ any server!     │  │                 │  │                 │
└────────┬────────┘  └────────┬────────┘  └────────┬────────┘
         │                    │                    │
         │         ALL CONNECT VIA API             │
         │                    │                    │
         └────────────────────┼────────────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │    BACKEND      │
                    │   (Render.com)  │
                    │                 │
                    │  FastAPI Server │
                    │  + MongoDB      │
                    │  + WebRTC       │
                    └─────────────────┘
```

### Key Concept: The Mobile App is NOT Hosted

The mobile app:
- Gets **built** into an iOS app (.ipa) and Android app (.apk)
- Gets **published** to App Store and Google Play
- Gets **downloaded** by users onto their phones
- **Runs on their phone**, not on any server
- **Connects to your Render backend** via the internet

---

## What You Need for Production

### 1. Backend (Render.com) - REQUIRED

**Free Tier Limitations:**
- ❌ Spins down after 15 mins of no traffic (slow wake-up)
- ❌ Limited to 750 hours/month
- ❌ No custom domain SSL

**Recommended: Starter Plan ($7/month)**
- ✅ Always running (no spin-down)
- ✅ Custom domain with SSL
- ✅ 512MB RAM, shared CPU
- Good for up to ~100 concurrent users

**For Growth: Standard Plan ($25/month)**
- ✅ 2GB RAM, 1 CPU
- ✅ Better for 500+ concurrent users
- ✅ Auto-scaling available

### 2. Database (MongoDB Atlas) - REQUIRED

**Free Tier (M0):**
- ✅ 512MB storage - fine for starting
- ✅ Shared cluster
- Good for up to ~10,000 users

**Production: M10 ($57/month)**
- ✅ 10GB storage
- ✅ Dedicated cluster
- ✅ Backups

### 3. Static Sites - Admin & Staff Portals (Vercel) - REQUIRED

**Free Tier:**
- ✅ Completely free for static sites
- ✅ Unlimited bandwidth (fair use)
- ✅ Custom domains
- ✅ SSL included
- **This is fine for production!**

### 4. Mobile App - iOS & Android - SEPARATE PROCESS

**This is NOT hosted on Render or Vercel!**

---

## Mobile App Publishing Explained

### How It Works

1. **You build the app** → Creates iOS and Android files
2. **You submit to app stores** → Apple App Store & Google Play
3. **Users download from stores** → App runs on their phone
4. **App connects to your Render backend** → Via API calls

### What You Need

| Platform | Requirement | Cost | Time |
|----------|-------------|------|------|
| **iOS** | Apple Developer Account | $99/year | 1-3 days review |
| **Android** | Google Play Developer | $25 one-time | 1-7 days review |

### Building the App (Using Expo EAS)

Expo (which Radio Check uses) provides **EAS Build** - a cloud service that builds your app:

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Configure build
eas build:configure

# Build for iOS (requires Apple Developer Account)
eas build --platform ios

# Build for Android
eas build --platform android

# Submit to stores
eas submit --platform ios
eas submit --platform android
```

**Cost:** 
- Free tier: 30 builds/month
- Production: $99/month for unlimited builds

---

## Step-by-Step Production Deployment

### Step 1: Set Up Render Backend

1. Go to [render.com](https://render.com)
2. Create new "Web Service"
3. Connect your GitHub repo
4. Configure:
   - **Root Directory:** `backend`
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn server:socket_app --host 0.0.0.0 --port $PORT`
5. Add Environment Variables:
   ```
   MONGO_URL=mongodb+srv://...
   DB_NAME=veterans_support
   OPENAI_API_KEY=sk-...
   RESEND_API_KEY=re_...
   JWT_SECRET=your-secret-key
   ENCRYPTION_KEY=your-encryption-key
   ```
6. Deploy!

Your backend URL: `https://your-app-name.onrender.com`

### Step 2: Set Up MongoDB Atlas

1. Go to [mongodb.com/atlas](https://mongodb.com/atlas)
2. Create free cluster
3. Get connection string
4. Add to Render environment variables

### Step 3: Deploy Admin & Staff Portals to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Import from GitHub
3. For Admin Portal:
   - **Root Directory:** `admin-site`
   - **Framework:** Other (static)
4. For Staff Portal:
   - **Root Directory:** `staff-portal`
   - **Framework:** Other (static)
5. Update `config.js` in each to point to your Render backend URL

### Step 4: Configure Mobile App for Production

Edit `/frontend/app.json`:
```json
{
  "expo": {
    "extra": {
      "apiUrl": "https://your-app-name.onrender.com"
    }
  }
}
```

Or use environment variables in your API calls.

### Step 5: Build Mobile App

```bash
cd frontend

# Install EAS CLI
npm install -g eas-cli

# Login
eas login

# Build Android (easier to start)
eas build --platform android --profile production

# Build iOS (requires Apple Developer Account)
eas build --platform ios --profile production
```

### Step 6: Submit to App Stores

**Android (Google Play):**
1. Create [Google Play Developer Account](https://play.google.com/console) ($25)
2. Create new app
3. Upload the .aab file from EAS Build
4. Fill in store listing, screenshots, etc.
5. Submit for review (usually 1-3 days)

**iOS (App Store):**
1. Create [Apple Developer Account](https://developer.apple.com) ($99/year)
2. Create App ID in App Store Connect
3. EAS can submit directly: `eas submit --platform ios`
4. Fill in store listing in App Store Connect
5. Submit for review (usually 1-2 days)

---

## Keeping Everything In Sync

### When You Update Code in Emergent:

1. **Backend changes** → Push to GitHub → Render auto-deploys
2. **Admin/Staff portal changes** → Push to GitHub → Vercel auto-deploys
3. **Mobile app changes** → Rebuild with EAS → Submit update to stores

### Automatic Deployments (Recommended Setup):

```
GitHub Repository
       │
       ├──► Render (backend) - Auto-deploys on push
       │
       ├──► Vercel (admin-site) - Auto-deploys on push
       │
       ├──► Vercel (staff-portal) - Auto-deploys on push
       │
       └──► Manual trigger for mobile app builds
```

### Mobile App Updates:

- **Small updates**: Can use Expo's OTA (Over-The-Air) updates - instant, no store review
- **Big updates**: Need new build and store submission

```bash
# OTA update (instant, no store review)
eas update --branch production

# Full rebuild (requires store review)
eas build --platform all --profile production
eas submit --platform all
```

---

## Cost Summary

### Minimum Production Setup (Starting Out):

| Service | Plan | Cost |
|---------|------|------|
| Render | Starter | $7/month |
| MongoDB Atlas | M0 Free | $0 |
| Vercel | Free | $0 |
| Apple Developer | Required for iOS | $99/year |
| Google Play | One-time | $25 |
| **Total Year 1** | | **$208** |
| **Total Year 2+** | | **$183/year** |

### Recommended Production Setup (Growing):

| Service | Plan | Cost |
|---------|------|------|
| Render | Standard | $25/month |
| MongoDB Atlas | M10 | $57/month |
| Vercel | Free | $0 |
| Expo EAS | Production | $99/month |
| Apple Developer | | $99/year |
| Google Play | | $25 one-time |
| **Total Year 1** | | **$2,297** |

---

## FAQ

**Q: If I change the backend, do I need to update the mobile app?**
A: Usually no! The mobile app calls your API. As long as you don't change API endpoints, existing apps keep working.

**Q: How do users get app updates?**
A: 
- Small updates: Use Expo OTA - instant, automatic
- Big updates: Submit to app stores, users update via App Store/Play Store

**Q: Can I test the mobile app before publishing?**
A: Yes! Use:
- Expo Go app (for development)
- TestFlight (iOS beta testing)
- Internal testing track (Android beta testing)

**Q: What if Render is slow on free tier?**
A: Upgrade to Starter ($7/mo) - the spin-down on free tier makes first requests slow (10-30 seconds).

**Q: Do I need to republish the app if I change admin portal?**
A: No! Admin portal is a separate website. Just redeploy to Vercel.

---

## Next Steps

1. ✅ Keep developing in Emergent
2. When ready for production:
   - Set up Render (backend)
   - Set up Vercel (admin/staff portals)
   - Create developer accounts (Apple/Google)
   - Build and submit mobile app
3. Use "Save to GitHub" in Emergent to push code
4. Connect GitHub to Render/Vercel for auto-deploy

Would you like help with any specific step?
