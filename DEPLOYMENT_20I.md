# Veterans Support App - 20i Hosting Deployment Guide

## 📌 20i Hosting Specifics

20i is a UK-based shared hosting provider with cPanel. This guide is tailored for their platform.

---

## ⚠️ Important: 20i Limitations for Full-Stack Apps

**What 20i Supports:**
- ✅ PHP (native)
- ✅ Static HTML/CSS/JavaScript
- ✅ MySQL/MariaDB databases
- ✅ SSL certificates (free Let's Encrypt)
- ✅ cPanel access

**What 20i DOESN'T Support:**
- ❌ Node.js applications (Expo frontend)
- ❌ Python applications (FastAPI backend)
- ❌ MongoDB
- ❌ Custom process management (PM2, systemd)
- ❌ WebSockets / real-time features

---

## ✅ Recommended Deployment Strategy for 20i

### **Hybrid Approach - Best for Proof of Concept**

```
20i Hosting (veteran.dbty.co.uk)
├── Static landing page (WordPress or HTML)
├── About pages
└── Link to actual app →

Free External Services
├── Render.com - Backend API (Python/FastAPI)
├── MongoDB Atlas - Database
└── Vercel/Netlify - Frontend (Static export)
   OR keep on Render.com
```

---

## 🚀 Step-by-Step Deployment

### **Phase 1: Deploy Backend to Render.com (Free)**

#### 1.1 Create Render Account
- Go to: https://render.com
- Sign up with GitHub (recommended)

#### 1.2 Push Code to GitHub
```bash
# On your local machine or from Emergent export:
git init
git add .
git commit -m "Initial veterans support app"
git remote add origin https://github.com/YOUR_USERNAME/veterans-support
git push -u origin main
```

#### 1.3 Create Web Service on Render
1. Click "New +" → "Web Service"
2. Connect your GitHub repository
3. Configure:
   - **Name:** veterans-support-api
   - **Environment:** Python 3
   - **Region:** Frankfurt (closest to UK)
   - **Branch:** main
   - **Build Command:** `pip install -r backend/requirements.txt`
   - **Start Command:** `cd backend && uvicorn server:app --host 0.0.0.0 --port $PORT`

#### 1.4 Add Environment Variables on Render
```
MONGO_URL=mongodb+srv://[will-add-from-atlas]
DB_NAME=veterans_support
JWT_SECRET_KEY=[your-secret-key]
```

#### 1.5 Deploy
- Click "Create Web Service"
- Wait for build (~2-3 minutes)
- You'll get a URL like: `https://veterans-support-api.onrender.com`

---

### **Phase 2: Set Up MongoDB Atlas (Free)**

#### 2.1 Create MongoDB Atlas Account
- Go to: https://www.mongodb.com/cloud/atlas/register
- Sign up (free)

#### 2.2 Create Free Cluster
1. Choose FREE tier (M0)
2. Select provider: **AWS**
3. Select region: **eu-west-2 (London)** - closest to UK
4. Cluster name: **veterans-support**
5. Click "Create Cluster"

#### 2.3 Create Database User
1. Go to "Database Access"
2. Click "Add New Database User"
3. Authentication Method: Password
   - Username: `veteran_admin`
   - Password: Generate secure password (save it!)
4. Database User Privileges: "Read and write to any database"
5. Click "Add User"

#### 2.4 Whitelist IP Addresses
1. Go to "Network Access"
2. Click "Add IP Address"
3. Click "Allow Access from Anywhere" (0.0.0.0/0)
   - ⚠️ For PoC only! Restrict in production
4. Click "Confirm"

#### 2.5 Get Connection String
1. Go to "Database" → Click "Connect"
2. Choose "Connect your application"
3. Copy the connection string:
   ```
   mongodb+srv://veteran_admin:<password>@veterans-support.xxxxx.mongodb.net/veterans_support?retryWrites=true&w=majority
   ```
4. Replace `<password>` with your actual password

#### 2.6 Update Render Environment Variable
- Go back to Render dashboard
- Click your service → "Environment"
- Update `MONGO_URL` with the connection string
- Click "Save Changes" (service will redeploy)

---

### **Phase 3: Initialize Database**

#### 3.1 Create Default Admin User
```bash
# Call the setup endpoint:
curl -X POST https://veterans-support-api.onrender.com/api/setup/init
```

**Response:**
```json
{
  "message": "System initialized successfully",
  "admin_email": "admin@veteran.dbty.co.uk",
  "default_password": "ChangeThisPassword123!",
  "warning": "Please change the default password immediately!"
}
```

#### 3.2 Test Login
```bash
curl -X POST https://veterans-support-api.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@veteran.dbty.co.uk","password":"ChangeThisPassword123!"}'
```

You should get a JWT token back!

---

### **Phase 4: Deploy Frontend**

#### Option A: Static Export to 20i (Simplest)

```bash
# Build static version
cd frontend
yarn install
EXPO_PUBLIC_BACKEND_URL=https://veterans-support-api.onrender.com yarn export:web

# This creates: web-build/ folder
```

**Upload to 20i:**
1. Log into 20i cPanel
2. Go to File Manager
3. Navigate to `public_html/`
4. Create folder: `app/`
5. Upload all files from `web-build/` to `app/`
6. Access at: `https://veteran.dbty.co.uk/app/`

#### Option B: Deploy Frontend to Vercel (Recommended)
1. Sign up at https://vercel.com
2. Connect GitHub
3. Import your repository
4. Configure:
   - Framework Preset: Other
   - Root Directory: `frontend`
   - Build Command: `expo export:web`
   - Output Directory: `web-build`
   - Environment Variables:
     ```
     EXPO_PUBLIC_BACKEND_URL=https://veterans-support-api.onrender.com
     ```
5. Deploy → You get: `https://veterans-support.vercel.app`

---

### **Phase 5: Set Up 20i WordPress Landing Page**

#### 5.1 Install WordPress on 20i
1. Log into 20i Control Panel
2. Go to "One-Click Installs" → WordPress
3. Domain: veteran.dbty.co.uk
4. Install directory: Leave blank (root)
5. Click "Install"

#### 5.2 Configure WordPress
1. Choose a simple theme (Twenty Twenty-Four recommended)
2. Create pages:
   - Home (with big button linking to app)
   - About
   - Contact

#### 5.3 Add App Link
On your home page, add a prominent button:
```html
<a href="https://veterans-support.vercel.app" 
   class="button-primary" 
   style="font-size: 1.5em; padding: 20px 40px;">
   Launch Support App
</a>
```

---

### **Phase 6: Configure Subdomains on 20i**

#### Option 1: Point Subdomain to Vercel
1. In 20i Control Panel → Domains
2. Click "DNS" for veteran.dbty.co.uk
3. Add CNAME record:
   - Name: `app`
   - Points to: `cname.vercel-dns.com`
   - TTL: 3600

4. In Vercel dashboard:
   - Go to your project → Settings → Domains
   - Add custom domain: `app.veteran.dbty.co.uk`
   - Follow verification steps

#### Option 2: Admin Subdomain (If you build admin panel)
1. In 20i → Subdomains
2. Create: `admin.veteran.dbty.co.uk`
3. Point to: Your admin panel hosting (Render or separate)

---

### **Phase 7: SSL Configuration**

#### 7.1 20i SSL (for WordPress site)
1. Go to 20i Control Panel → SSL/TLS
2. Enable "Let's Encrypt SSL"
3. Select: veteran.dbty.co.uk
4. Click "Install"
5. Enable "Force HTTPS"

#### 7.2 Vercel SSL (Automatic)
- Vercel automatically provisions SSL
- Works for both vercel.app and custom domains
- No configuration needed

---

## 📋 Complete URL Structure

```
veteran.dbty.co.uk
├── WordPress landing page (20i hosting)
├── SSL enabled
└── Big button → "Launch App"

app.veteran.dbty.co.uk
├── Actual Veterans Support App
├── Hosted on Vercel
├── Connected to Render backend
└── SSL automatic

admin.veteran.dbty.co.uk (Optional - Phase 2)
├── Admin dashboard
└── Manage counsellors, peers, organizations
```

---

## 💰 Cost Breakdown

```
20i Hosting (WordPress)       : £X/month (you already have it)
Render.com (Backend)           : £0 (free tier, 750 hours/month)
MongoDB Atlas (Database)       : £0 (free tier, 512MB)
Vercel (Frontend)              : £0 (free tier)
Domain (veteran.dbty.co.uk)    : £0 (already owned)
SSL Certificates               : £0 (Let's Encrypt free)

Total Additional Cost          : £0/month
```

**Free Tier Limitations:**
- Render: Service sleeps after 15 mins inactivity (30sec wake time)
- MongoDB Atlas: 512MB storage (plenty for testing)
- Vercel: 100GB bandwidth/month (sufficient for PoC)

---

## 🔧 20i-Specific Configuration Files

### .htaccess (for WordPress root)
Place in `/public_html/.htaccess`:

```apache
# Force HTTPS
RewriteEngine On
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

# Security headers
Header set X-Content-Type-Options "nosniff"
Header set X-Frame-Options "SAMEORIGIN"
Header set X-XSS-Protection "1; mode=block"

# Disable directory browsing
Options -Indexes

# Protect wp-config.php
<Files wp-config.php>
order allow,deny
deny from all
</Files>
```

---

## ✅ Deployment Checklist

**Backend (Render.com):**
- [ ] GitHub repository created
- [ ] Render web service created
- [ ] MongoDB Atlas cluster created
- [ ] Database user created
- [ ] IP whitelist configured (0.0.0.0/0)
- [ ] Connection string added to Render
- [ ] Service deployed successfully
- [ ] `/api/setup/init` called to create admin
- [ ] Test login working

**Frontend (Vercel):**
- [ ] Static export built successfully
- [ ] Vercel project created
- [ ] Environment variables set
- [ ] Custom domain configured
- [ ] SSL certificate active
- [ ] App loads correctly
- [ ] API calls working

**20i WordPress:**
- [ ] WordPress installed
- [ ] Theme configured
- [ ] Landing page created
- [ ] App link button added
- [ ] SSL certificate installed
- [ ] Force HTTPS enabled

**DNS:**
- [ ] app.veteran.dbty.co.uk CNAME added
- [ ] DNS propagation complete (24-48 hours)
- [ ] Both HTTP and HTTPS working

---

## 🧪 Testing

### Test Backend:
```bash
# Health check
curl https://veterans-support-api.onrender.com/api/

# Login
curl -X POST https://veterans-support-api.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@veteran.dbty.co.uk","password":"ChangeThisPassword123!"}'

# Get counsellors (public)
curl https://veterans-support-api.onrender.com/api/counsellors
```

### Test Frontend:
1. Visit: https://app.veteran.dbty.co.uk
2. Click "I NEED HELP NOW"
3. Verify counsellors appear
4. Test phone/SMS/WhatsApp links
5. Try peer support registration

### Test Landing Page:
1. Visit: https://veteran.dbty.co.uk
2. Verify SSL padlock in browser
3. Click "Launch App" button
4. Should redirect to app.veteran.dbty.co.uk

---

## 🆘 Troubleshooting

### Problem: Render service shows "Build Failed"
**Solution:**
```bash
# Check requirements.txt has all dependencies
cd backend
pip freeze > requirements.txt

# Commit and push
git add requirements.txt
git commit -m "Update requirements"
git push
```

### Problem: MongoDB connection fails
**Solution:**
- Verify IP whitelist includes 0.0.0.0/0
- Check connection string format
- Ensure password has no special characters that need encoding
- Test connection using MongoDB Compass locally

### Problem: Frontend can't reach backend
**Solution:**
- Check EXPO_PUBLIC_BACKEND_URL is correct
- Verify CORS is enabled in backend (already configured)
- Check browser console for specific errors
- Try backend URL directly in browser

### Problem: 20i subdomain not working
**Solution:**
- DNS takes 24-48 hours to propagate
- Check DNS with: `nslookup app.veteran.dbty.co.uk`
- Verify CNAME record is correct
- Clear browser cache

### Problem: First load very slow on Render
**Solution:**
- Render free tier sleeps after 15 mins
- First request takes ~30 seconds to wake
- Upgrade to Render paid tier (£7/month) for always-on
- OR use a cron job to ping every 14 mins (keeps awake)

---

## 🚀 Upgrade Path (When Ready for Production)

### Current Setup (Free PoC):
- Good for: Testing, demos, feedback gathering
- Limitations: Sleep delays, limited storage, no SLA

### Production Upgrade (~£12/month):
1. **Move to VPS:** DigitalOcean/Linode (£10-12/month)
   - Full Node.js + Python + MongoDB on same server
   - No sleep delays
   - Better performance
   - Full control

2. **Keep 20i for WordPress** landing page only

3. **Point app subdomain to VPS:**
   - `app.veteran.dbty.co.uk` → VPS IP address
   - Run everything from one server

---

## 📞 Support Resources

**20i Support:**
- Phone: 0800 612 2524
- Email: support@20i.com
- Knowledge Base: https://www.20i.com/support

**Render Support:**
- Docs: https://render.com/docs
- Community: https://community.render.com

**MongoDB Atlas:**
- Docs: https://docs.atlas.mongodb.com
- Support: https://support.mongodb.com

**Vercel:**
- Docs: https://vercel.com/docs
- Support: https://vercel.com/support

---

## 🎯 Quick Start Summary

1. **Backend:** Deploy to Render.com (Python API)
2. **Database:** MongoDB Atlas (free tier)
3. **Frontend:** Build static → Upload to Vercel OR 20i
4. **Landing:** WordPress on 20i
5. **DNS:** Point app.veteran.dbty.co.uk to frontend
6. **Test:** Verify all features work
7. **Go Live:** Share with stakeholders

**Total Time:** ~2-3 hours first time
**Total Cost:** £0/month for proof of concept

---

## ✅ You're Ready!

Follow these steps in order, and you'll have your Veterans Support App live on veteran.dbty.co.uk within a few hours.

The 20i hosting will serve your WordPress landing page, while the actual app runs on professional platforms designed for modern web applications.

**Need help?** Each platform has excellent documentation and support. Start with Render and MongoDB Atlas - they have the best free tier experiences.
