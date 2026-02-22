# Developer Briefing: Admin Portal Update

## What Needs to Be Done
Replace the admin portal files on your production server with the updated versions.

## Files Changed
The entire `admin-site/` folder has been updated with new features:

| File | Changes |
|------|---------|
| `index.html` | Added CMS tab, Logs & Analytics tab, Chart.js CDN |
| `app.js` | Added WYSIWYG CMS editor, analytics charts, drag-drop |
| `styles.css` | Added phone preview styles, chart styles |
| `config.js` | No changes (keep pointing to production API) |

## Deployment Command (if using CLI)
```bash
# From the project root
scp -r admin-site/* user@your-server:/path/to/admin-portal/
```

Or if using a Git-based deployment:
```bash
git add admin-site/
git commit -m "Update admin portal with CMS editor and analytics"
git push origin main
```

## New Features Added

### 1. Visual CMS Editor
- Click the **"CMS"** tab in the admin dashboard
- Shows a phone preview of the mobile app
- Click any element to edit text, icons, colors
- Drag sections to reorder
- Add/delete sections and cards

### 2. Logs & Analytics Dashboard
- Click the **"Logs"** tab
- View charts showing activity trends
- Export data to CSV
- Filter by time period

## Testing After Deployment
1. Log in to admin portal
2. Click "CMS" tab
3. You should see a phone preview with editable content
4. Try clicking on a card to edit it

## Rollback Plan
Keep a backup of the current admin portal files before deploying:
```bash
cp -r /path/to/admin-portal /path/to/admin-portal-backup
```

## Contact
If issues occur, check:
1. Browser console (F12) for JavaScript errors
2. Network tab for API connection failures
3. Ensure `config.js` API_URL is correct
