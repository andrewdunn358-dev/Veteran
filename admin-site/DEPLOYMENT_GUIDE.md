# Admin Portal Deployment Guide

## Overview
The Admin Portal is a static HTML/CSS/JavaScript application that connects to the backend API. It needs to be deployed separately from the backend.

## Files to Deploy

Upload ALL files from the `/admin-site/` folder to your web server:

```
admin-site/
├── index.html          # Main HTML file
├── app.js              # Application JavaScript (contains CMS editor)
├── styles.css          # Styling
├── config.js           # API configuration (IMPORTANT)
├── logo.png            # Logo image
├── user_manual.pdf     # User documentation
└── README.md           # This file
```

## Configuration

### config.js
This file contains the API URL. **Do not modify** unless changing backends:

```javascript
var CONFIG = {
    API_URL: 'https://veterans-support-api.onrender.com'
};
```

## Deployment Steps

### Option 1: Simple File Upload (Recommended)
1. Download all files from the `admin-site/` folder
2. Upload to your web hosting (e.g., Netlify, Vercel, or any static host)
3. Ensure `config.js` points to your production backend URL

### Option 2: Using Git
```bash
# If you have a separate repo for admin portal
git pull origin main
# Or copy files from the main project
cp -r /path/to/project/admin-site/* /path/to/admin-deploy/
```

### Option 3: Using Netlify/Vercel
1. Connect your repository
2. Set build directory to `admin-site`
3. No build command needed (static files)
4. Deploy

## New Features in This Update

### Visual CMS Editor (WYSIWYG)
The admin portal now includes a visual "What You See Is What You Get" editor:

- **Location**: CMS tab in the dashboard
- **Features**:
  - Phone preview frame showing how content appears in the mobile app
  - Click any element to edit it
  - Drag-and-drop section reordering
  - Add/remove sections and cards
  - Real-time preview updates

### Logs & Analytics Dashboard
- Activity trend charts (calls, chats, alerts over time)
- Contact type distribution pie chart
- Exportable CSV reports
- Filterable by time period (7 days, 30 days, 90 days, 1 year)

## Troubleshooting

### CMS not loading?
1. Check browser console (F12) for errors
2. Verify `config.js` has correct API URL
3. Ensure you're logged in as an admin user
4. Try clearing browser cache (Ctrl+Shift+R)

### API connection errors?
1. Check that the backend is running
2. Verify CORS is enabled on the backend
3. Ensure `config.js` API_URL matches your backend URL

### Charts not displaying?
Chart.js is loaded from CDN. Ensure your network allows:
- `https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js`

## Version History
- **v2.0** - Added WYSIWYG CMS editor, analytics dashboard with charts
- **v1.5** - Unified staff management, resources library
- **v1.0** - Initial release

## Support
For technical issues, contact the development team or raise an issue in the project repository.
