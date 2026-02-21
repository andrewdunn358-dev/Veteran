# Radio Check Marketing Website

## Deployment Instructions for 20i Hosting

This is a static HTML/CSS/JS website that can be deployed to any web host.

### Files to Upload

Upload ALL files in this folder to your `public_html` directory:

```
/public_html/
├── .htaccess
├── index.html
├── about.html
├── ai-team.html
├── contact.html
├── legal.html
├── privacy.html
├── script.js
├── styles.css
└── images/
    ├── logo.png
    ├── frankies-pod.png
    └── standing-tall.png
```

### Deployment Steps

1. **Login to 20i Control Panel**
2. **Navigate to File Manager**
3. **Go to `public_html` folder**
4. **Upload all files** from this folder
   - You can upload files individually OR
   - Upload the entire folder contents
5. **Make sure `.htaccess` is uploaded** (it may be hidden on your computer)
6. **Test the website** by visiting your domain

### Using FTP

If you prefer FTP:
1. Connect to your 20i FTP server
2. Upload contents to `/public_html/`
3. Ensure file permissions are 644 for files and 755 for folders

### Troubleshooting

- **Page not found (404)**: Make sure all HTML files are in the root of `public_html`
- **Images not loading**: Check that the `images/` folder was uploaded correctly
- **Styles not loading**: Verify `styles.css` is in `public_html` (not in a subfolder)

### No Build Process Required

This website is pure HTML/CSS/JS - no React, no Vite, no build process needed.
Just upload the files and it works!

---

**Last Updated**: February 2026
