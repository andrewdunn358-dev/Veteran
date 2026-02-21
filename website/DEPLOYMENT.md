# Radio Check Marketing Website - Deployment Guide

## Overview
This is the marketing website for Radio Check, to be deployed at **radiocheck.me**.

## Technology Stack
- React 18 with TypeScript
- Vite (build tool)
- Tailwind CSS
- React Router (client-side routing)

## Build & Deploy Instructions

### 1. Build the Website
```bash
cd /app/website
yarn install
yarn build
```

The built files will be in `/app/website/dist/`

### 2. Deploy to 20i Hosting

#### Option A: Manual Upload
1. Log in to your 20i control panel
2. Navigate to File Manager for radiocheck.me
3. Upload all files from `/app/website/dist/` to the root directory
4. Ensure the `.htaccess` file is included (see below)

#### Option B: FTP Upload
1. Use an FTP client (FileZilla, etc.)
2. Connect to your 20i FTP server
3. Upload all files from `/app/website/dist/` to `public_html/`

### 3. Configure SPA Routing

For proper client-side routing, create an `.htaccess` file in the root:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

### 4. SSL Certificate
20i should provide a free SSL certificate. Ensure HTTPS is enforced:

```apache
# Add to .htaccess
RewriteEngine On
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
```

## File Structure
```
dist/
├── index.html       # Main HTML file
├── assets/
│   ├── index-*.css  # Compiled CSS
│   └── index-*.js   # Compiled JavaScript
└── .htaccess        # Apache routing config
```

## Pages Included
- `/` - Home page (hero, features, CTA)
- `/about` - About the app (what it is, what it isn't)
- `/ai-team` - Meet the AI Team (all 6 AI companions)
- `/contact` - Contact form and information
- `/legal` - Terms of use and disclaimers
- `/privacy` - Privacy policy and GDPR information

## External Links Configured
- **Staff Portal**: Links to `https://app.radiocheck.me/login`
- **Open the App**: Links to `https://app.radiocheck.me`
- **Frankie's Pod**: https://www.youtube.com/@FrankiesPod
- **Standing Tall**: https://www.standingtall.co.uk/

## Contact Form
The contact form currently shows a success message on submission. To make it functional:

1. Set up an email endpoint on your backend
2. Or integrate with a service like Formspree, Netlify Forms, or similar
3. Update `/app/website/src/pages/Contact.tsx` to POST to your endpoint

## Customization
- Colors are defined in `/app/website/tailwind.config.js`
- Logo and image URLs are in the component files
- Update contact emails in Contact.tsx and Privacy.tsx

## Notes
- The website matches the app's color scheme (navy blue, teal, etc.)
- Fully responsive (mobile, tablet, desktop)
- Includes all required legal pages (GDPR, disclaimers)
- Staff portal access is available via the navigation
