# Hostinger Deployment Guide (Frontend)

This guide covers deploying the React (Vite) Frontend to Hostinger Shared Hosting.

## 1. Build the Application
Run this command in the `frontend/` directory:
```bash
npm run build
```
This will create a `dist/` folder.

## 2. Verify `.htaccess`
Ensure that `frontend/dist/.htaccess` exists (it should be copied from `frontend/public/` during build). This file ensures that React Router works correctly on Apache.

## 3. Upload to Hostinger
1. Access your Hostinger Control Panel (hPanel).
2. Go to **Files** > **File Manager**.
3. Navigate to `public_html/`.
4. Upload all files from the `frontend/dist/` directory into `public_html/`.

## 4. Update API Configuration
If your backend URL changes, update `frontend/.env.production` and run `npm run build` again before uploading.

Current Production URL: `https://influencer-backend-757677293282.asia-southeast1.run.app/api/v1`
