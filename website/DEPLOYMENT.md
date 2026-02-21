# Radio Check Marketing Website - Deployment Guide for 20i (Apache)

## Quick Deploy

A ZIP file has been created for easy deployment:
**File:** `/app/radiocheck-website.zip` (3.7MB)

### Steps:
1. Download the ZIP file from this project
2. Log into your 20i control panel
3. Go to File Manager for radiocheck.me
4. Upload `radiocheck-website.zip` to the `public_html` folder
5. Extract the ZIP file in place
6. Delete the ZIP file after extraction

**Important:** Upload the contents TO the `public_html` root, not INTO a subfolder.

## Manual Deploy (FTP)

If you prefer FTP:

1. Connect to your 20i FTP server
2. Navigate to `public_html/`
3. Upload ALL files from `/app/website/dist/`:
   - `index.html`
   - `.htaccess` (hidden file - make sure to include it!)
   - `assets/` folder (contains CSS and JS)
   - `images/` folder (contains all images)

## File Structure After Deployment

Your `public_html/` should look like:
```
public_html/
├── index.html
├── .htaccess
├── assets/
│   ├── index-*.css
│   └── index-*.js
└── images/
    ├── logo.png
    ├── tommy.png
    ├── doris.png
    ├── bob.png
    ├── finch.png
    ├── margie.png
    ├── hugo.png
    ├── frankies-pod.png
    └── standing-tall.png
```

## Troubleshooting

### 404 Errors on Pages
- Make sure `.htaccess` file is uploaded (it's a hidden file)
- Check that `mod_rewrite` is enabled on your hosting
- Verify `.htaccess` is in the root `public_html/` folder

### Images Not Loading
- Ensure the `images/` folder is in `public_html/` root (not a subfolder)
- Check file permissions (should be 644 for files, 755 for folders)

### Site Shows Blank Page
- Check browser console for errors (F12 → Console)
- Verify all files in `assets/` folder uploaded correctly

## HTTPS Setup

The `.htaccess` file has HTTPS redirect commented out. To enable:
1. Make sure SSL certificate is active on 20i
2. Edit `.htaccess` and uncomment the HTTPS lines:
```apache
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
```

## What's Included

### Pages
- **Home** (`/`) - Hero, features, CTAs
- **About the App** (`/about`) - What Radio Check is/isn't
- **Meet the AI Team** (`/ai-team`) - All 6 AI companions with bios
- **Contact** (`/contact`) - Contact form
- **Legal** (`/legal`) - Terms & disclaimers
- **Privacy** (`/privacy`) - Privacy policy & GDPR

### AI Characters Included
1. Tommy - Your Battle Buddy
2. Doris - Warm Support
3. Bob - Ex-Para Peer Support
4. Finch - Crisis & PTSD Support
5. Margie - Alcohol & Substance Support
6. Hugo - Self-Help & Wellness Guide

### All Images Included Locally
- Radio Check logo
- All 6 AI character avatars
- Sponsor logos (Frankie's Pod, Standing Tall)

**No external dependencies** - the website works completely standalone.

## External Links

These link to your main app (update if needed):
- Staff Portal button → `https://app.radiocheck.me/login`
- Open the App button → `https://app.radiocheck.me`
