# Veterans Support App - Shared Hosting Deployment Guide

## ⚠️ Important Note About Shared Hosting

**Shared hosting has significant limitations** for this type of application. This guide provides workarounds for proof-of-concept testing, but for production deployment, VPS hosting is strongly recommended.

---

## 🚫 Shared Hosting Limitations

### What Won't Work on Typical Shared Hosting:
- ❌ **Node.js/Expo frontend** - Most shared hosts don't support Node.js
- ❌ **Python FastAPI backend** - Shared hosting typically only supports PHP
- ❌ **MongoDB** - Most shared hosts only offer MySQL/MariaDB
- ❌ **Real-time WebSockets** - Not supported on shared hosting
- ❌ **Custom port binding** - Can't run services on ports 3000/8001

---

## ✅ Proof-of-Concept Options for Shared Hosting

### **Option 1: Static Export + External Backend** (Recommended for PoC)

**Frontend:**
1. Export Expo app as static website
2. Upload HTML/CSS/JS to shared hosting
3. Point to external API

**Backend:**
- Use **free tier services** for backend:
  - **Render.com** (Free tier: backend API)
  - **MongoDB Atlas** (Free tier: database)
  - **Vercel** (Free tier: can host simple API routes)

**Steps:**
```bash
# 1. Build static frontend
cd /app/frontend
expo export:web

# 2. Upload `web-build` folder to shared hosting
# via FTP/cPanel File Manager to: public_html/

# 3. Deploy backend to Render.com (free)
# 4. Update .env to point to Render backend URL
```

---

### **Option 2: Hybrid Approach**

**What goes where:**

```
veteran.dbty.co.uk (Shared Hosting)
├── WordPress landing page
├── Static HTML about pages
└── Link to: app.render.com (actual app)

app.onrender.com (Free Render Hosting)
├── Full Expo app
├── FastAPI backend
└── MongoDB Atlas connection
```

---

## 📋 Step-by-Step: Deploy to Shared Hosting (Static Export)

### Prerequisites:
- cPanel or FTP access to veteran.dbty.co.uk
- Render.com account (free)
- MongoDB Atlas account (free)

---

### **Phase 1: Deploy Backend to Render.com**

1. **Create Render Account:** https://render.com

2. **Create Web Service:**
   - Click "New +" → "Web Service"
   - Connect GitHub (push code from Emergent)
   - OR use "Deploy from URL"

3. **Configure Service:**
   ```
   Name: veterans-support-api
   Environment: Python 3
   Build Command: pip install -r requirements.txt
   Start Command: uvicorn server:app --host 0.0.0.0 --port $PORT
   ```

4. **Add Environment Variables:**
   ```
   MONGO_URL=mongodb+srv://[your-atlas-connection]
   DB_NAME=veterans_support
   ```

5. **Deploy** - You'll get URL like: `https://veterans-support-api.onrender.com`

---

### **Phase 2: Set Up MongoDB Atlas**

1. **Create Account:** https://mongodb.com/cloud/atlas

2. **Create Free Cluster:**
   - Choose Free Tier (M0)
   - Region: AWS - London (closest to UK)

3. **Create Database User:**
   - Username: `veteran_admin`
   - Password: [secure password]

4. **Whitelist IP:**
   - Add: `0.0.0.0/0` (allow from anywhere)
   - ⚠️ For PoC only! Restrict in production

5. **Get Connection String:**
   ```
   mongodb+srv://veteran_admin:[password]@cluster0.xxxxx.mongodb.net/veterans_support
   ```

6. **Update Render Environment:**
   - Add MONGO_URL with this connection string

---

### **Phase 3: Export & Deploy Frontend**

#### A. Build Static Export:

```bash
# On your development machine or Emergent:
cd /app/frontend

# Install dependencies
yarn install

# Build for web
expo export:web

# This creates: web-build/ folder
```

#### B. Modify for Shared Hosting:

1. **Update API URL** in `.env`:
   ```
   EXPO_PUBLIC_BACKEND_URL=https://veterans-support-api.onrender.com
   ```

2. **Rebuild:**
   ```bash
   expo export:web
   ```

#### C. Upload to Shared Hosting:

**Via cPanel File Manager:**
1. Log into cPanel
2. Go to File Manager
3. Navigate to `public_html/`
4. Upload entire `web-build/` folder contents
5. Ensure `index.html` is in root

**Via FTP (FileZilla):**
1. Connect to: `ftp.dbty.co.uk`
2. Navigate to: `/public_html/`
3. Upload `web-build/*` contents

---

### **Phase 4: Configure Domain**

1. **Point Subdomain to App:**
   ```
   # In cPanel → Subdomains:
   app.veteran.dbty.co.uk → /public_html/app/
   ```

2. **SSL Certificate:**
   - cPanel → SSL/TLS Status
   - Enable AutoSSL for: `app.veteran.dbty.co.uk`

3. **Test:**
   - Visit: `https://app.veteran.dbty.co.uk`

---

## 🔧 Configuration Files Needed

### `.htaccess` (for shared hosting root)

Place in `/public_html/.htaccess`:

```apache
# Force HTTPS
RewriteEngine On
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

# Handle React Router (for SPA)
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ /index.html [L]

# CORS Headers (if needed)
Header set Access-Control-Allow-Origin "*"
Header set Access-Control-Allow-Methods "GET, POST, OPTIONS"
```

---

## 💰 Cost Breakdown (Proof of Concept)

```
Shared Hosting (existing)     : £0 (already paid)
Render.com Free Tier          : £0
MongoDB Atlas Free Tier       : £0
Domain (existing)             : £0

Total Monthly Cost            : £0
```

**Free Tier Limits:**
- Render: 750 hours/month (enough for PoC)
- MongoDB Atlas: 512MB storage (plenty for testing)
- Both services sleep after inactivity (wake on request)

---

## ⚡ Quick Start Commands

```bash
# 1. Clone from Emergent (when ready)
git clone [your-repo]

# 2. Set up backend on Render
# (Use Render dashboard - automatic from Git)

# 3. Build frontend
cd frontend
yarn install
yarn build:web

# 4. Upload to shared hosting
# (Use FTP/cPanel as described above)

# 5. Test
curl https://veterans-support-api.onrender.com/api/
# Should return: {"message": "UK Veterans Support API"}
```

---

## 🚀 Upgrade Path (When Ready for Production)

### Move to VPS (~£10/month):

**DigitalOcean/Linode Setup:**
1. Single $12/month droplet
2. Full control over Node.js, Python, MongoDB
3. No limitations
4. Better performance
5. Easier maintenance

**What You Get:**
- ✅ Real-time features work properly
- ✅ No sleep/wake delays
- ✅ Better security
- ✅ Faster response times
- ✅ Custom domains easily configured

---

## 📝 Known Issues with Shared Hosting Approach

### 1. **First Load Delay**
   - Render free tier "sleeps" after 15 mins inactivity
   - First request takes ~30 seconds to wake up
   - **Solution:** Upgrade to Render paid tier (£7/month - always on)

### 2. **Limited Scalability**
   - Free tiers have rate limits
   - Can't handle high traffic
   - **Solution:** This is PoC only - upgrade before public launch

### 3. **Static Export Limitations**
   - Some Expo features may not work
   - No server-side rendering
   - **Solution:** Test thoroughly, document any issues

### 4. **CORS Issues**
   - Browser may block API calls
   - **Solution:** Configure CORS properly in FastAPI (already done)

---

## 🆘 Troubleshooting

### Problem: Can't access app at veteran.dbty.co.uk
**Solution:**
- Check DNS propagation (can take 24-48 hours)
- Verify SSL certificate is installed
- Check .htaccess is uploaded correctly

### Problem: API calls fail with CORS error
**Solution:**
- Ensure Render backend has CORS configured
- Check browser console for specific error
- Verify API URL in frontend .env

### Problem: Render service shows "Build Failed"
**Solution:**
- Check `requirements.txt` is correct
- Verify Python version compatibility
- Check Render build logs for specific error

### Problem: MongoDB connection fails
**Solution:**
- Verify IP whitelist includes 0.0.0.0/0
- Check connection string is correct
- Test connection using MongoDB Compass

---

## 📞 Need Help?

**Common Resources:**
- Render Docs: https://render.com/docs
- MongoDB Atlas Docs: https://docs.atlas.mongodb.com
- Expo Web Docs: https://docs.expo.dev/guides/customizing-webpack

---

## ✅ Checklist Before Going Live

- [ ] Backend deployed to Render
- [ ] MongoDB Atlas configured
- [ ] Frontend built and uploaded
- [ ] SSL certificate active
- [ ] Test all crisis support buttons work
- [ ] Test peer support registration works
- [ ] Verify all phone/SMS/WhatsApp links work
- [ ] Test on mobile device
- [ ] Backup MongoDB data
- [ ] Document admin credentials securely

---

**Note:** This is a **proof-of-concept deployment**. For production use with real veterans, strongly consider:
1. VPS hosting for better reliability
2. Paid tiers for 24/7 availability
3. Professional security audit
4. GDPR compliance review
5. Backup and disaster recovery plan

---

## 🎯 Recommended Production Stack

When ready to go live properly:

```
Domain: veteran.dbty.co.uk
Hosting: DigitalOcean Droplet (£10/month)
    ├── Nginx (web server)
    ├── Node.js (Expo frontend)
    ├── Python (FastAPI backend)
    ├── MongoDB (database)
    ├── PM2 (process management)
    └── Let's Encrypt SSL (free)

Backups: DigitalOcean Volumes (£1/month per 10GB)
CDN: Cloudflare (free tier)
Monitoring: UptimeRobot (free)
```

**Total Cost: ~£12/month** with full control and reliability.
