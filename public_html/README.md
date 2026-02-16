# Veterans Support Admin Portal

A standalone HTML/CSS/JS admin portal for managing the Veterans Support application.

## Features

- **Counsellors Management**: Add, edit, delete counsellors and update their availability status
- **Peer Supporters Management**: Add, edit, delete peer supporters and update their availability status  
- **Organizations Management**: Add, edit, delete support organizations
- **User Management**: Add, edit, delete staff accounts and reset passwords
- **Content Management (CMS)**: Edit all site-wide text content
- **Test Email**: Verify SMTP configuration

## Deployment on 20i

### Step 1: Download the Files
Download the entire `admin-site` folder containing:
- `index.html` - Main HTML file
- `styles.css` - All styling
- `config.js` - Configuration (API URL)
- `app.js` - Application logic

### Step 2: Configure the API URL
Open `config.js` and update the `API_URL` to point to your Render backend:

```javascript
const CONFIG = {
    API_URL: 'https://veterans-support-api.onrender.com',
    VERSION: '1.0.0'
};
```

### Step 3: Upload to 20i
1. Log into your 20i control panel
2. Navigate to File Manager or use FTP
3. Upload all 4 files to your desired directory (e.g., `/public_html/admin/`)
4. Access via: `https://yourdomain.com/admin/`

### Step 4: (Optional) Add Basic Auth for Extra Security
You can add `.htaccess` and `.htpasswd` files for additional password protection:

**.htaccess:**
```apache
AuthType Basic
AuthName "Admin Area"
AuthUserFile /path/to/.htpasswd
Require valid-user
```

## Login Credentials
- **Email**: admin@veteran.dbty.co.uk
- **Password**: ChangeThisPassword123!

## Security Notes

1. **HTTPS Required**: Always use HTTPS for the admin portal
2. **JWT Tokens**: Authentication uses JWT tokens stored in localStorage
3. **Session Timeout**: Tokens expire after 24 hours (configurable in backend)
4. **Admin Only**: Only users with `role: admin` can access this portal

## Browser Support

- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

## Troubleshooting

### "Login Failed" Error
- Check the API_URL in config.js is correct
- Ensure the backend is running and accessible
- Verify admin credentials

### "Network Error"
- Check CORS settings on the backend allow your domain
- Verify the API URL doesn't have a trailing slash

### Data Not Loading
- Check browser console for errors
- Verify your admin token hasn't expired (re-login)
- Ensure backend API is responding

## File Structure

```
admin-site/
├── index.html    # Main HTML structure
├── styles.css    # All CSS styling
├── config.js     # API configuration
├── app.js        # JavaScript application
└── README.md     # This file
```

## Customization

### Changing Colors
Edit the CSS variables in `styles.css`:

```css
:root {
    --primary: #4a90d9;      /* Main blue */
    --success: #22c55e;      /* Green for available */
    --warning: #f59e0b;      /* Orange for busy/limited */
    --danger: #ef4444;       /* Red for off/unavailable */
}
```

### Adding New Features
The codebase is modular. To add new functionality:
1. Add HTML structure in `index.html`
2. Style it in `styles.css`
3. Add JavaScript logic in `app.js`

## Support

For issues with this admin portal, contact: [YOUR_SUPPORT_EMAIL]
# Veterans Support Admin Portal

A standalone HTML/CSS/JS admin portal for managing the Veterans Support application.

## Features

- **Counsellors Management**: Add, edit, delete counsellors and update their availability status
- **Peer Supporters Management**: Add, edit, delete peer supporters and update their availability status  
- **Organizations Management**: Add, edit, delete support organizations
- **User Management**: Add, edit, delete staff accounts and reset passwords
- **Content Management (CMS)**: Edit all site-wide text content
- **Test Email**: Verify SMTP configuration

## Deployment on 20i

### Step 1: Download the Files
Download the entire `admin-site` folder containing:
- `index.html` - Main HTML file
- `styles.css` - All styling
- `config.js` - Configuration (API URL)
- `app.js` - Application logic

### Step 2: Configure the API URL
Open `config.js` and update the `API_URL` to point to your Render backend:

```javascript
const CONFIG = {
    API_URL: 'https://veterans-support-api.onrender.com',
    VERSION: '1.0.0'
};
```

### Step 3: Upload to 20i
1. Log into your 20i control panel
2. Navigate to File Manager or use FTP
3. Upload all 4 files to your desired directory (e.g., `/public_html/admin/`)
4. Access via: `https://yourdomain.com/admin/`

### Step 4: (Optional) Add Basic Auth for Extra Security
You can add `.htaccess` and `.htpasswd` files for additional password protection:

**.htaccess:**
```apache
AuthType Basic
AuthName "Admin Area"
AuthUserFile /path/to/.htpasswd
Require valid-user
```

## Login Credentials
- **Email**: admin@veteran.dbty.co.uk
- **Password**: ChangeThisPassword123!

## Security Notes

1. **HTTPS Required**: Always use HTTPS for the admin portal
2. **JWT Tokens**: Authentication uses JWT tokens stored in localStorage
3. **Session Timeout**: Tokens expire after 24 hours (configurable in backend)
4. **Admin Only**: Only users with `role: admin` can access this portal

## Browser Support

- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

## Troubleshooting

### "Login Failed" Error
- Check the API_URL in config.js is correct
- Ensure the backend is running and accessible
- Verify admin credentials

### "Network Error"
- Check CORS settings on the backend allow your domain
- Verify the API URL doesn't have a trailing slash

### Data Not Loading
- Check browser console for errors
- Verify your admin token hasn't expired (re-login)
- Ensure backend API is responding

## File Structure

```
admin-site/
├── index.html    # Main HTML structure
├── styles.css    # All CSS styling
├── config.js     # API configuration
├── app.js        # JavaScript application
└── README.md     # This file
```

## Customization

### Changing Colors
Edit the CSS variables in `styles.css`:

```css
:root {
    --primary: #4a90d9;      /* Main blue */
    --success: #22c55e;      /* Green for available */
    --warning: #f59e0b;      /* Orange for busy/limited */
    --danger: #ef4444;       /* Red for off/unavailable */
}
```

### Adding New Features
The codebase is modular. To add new functionality:
1. Add HTML structure in `index.html`
2. Style it in `styles.css`
3. Add JavaScript logic in `app.js`

## Support

For issues with this admin portal, contact: [YOUR_SUPPORT_EMAIL]
