# Google Cloud Platform (GCP) Deployment Guide

This guide covers deploying the Django Backend to Google Cloud Run.

## 1. Project Setup
1. Create a project in [GCP Console](https://console.cloud.google.com/).
2. Enable APIs:
   - Cloud Run
   - Cloud Build
   - Artifact Registry
   - Cloud SQL Admin (if using Cloud SQL)

## 2. Database Setup (Cloud SQL - Recommended)
1. Create a MySQL instance in Cloud SQL.
2. Create a database (e.g., `influencer_db`).
3. Create a user and password.
4. **Note External IP** or use **Cloud SQL Auth Proxy** (Recommended).

## 3. Deployment using Cloud Build
Run the following command from the `backend/` directory:
```bash
gcloud builds submit --config cloudbuild.yaml .
```
This will:
1. Build the Docker image.
2. Push it to Google Container Registry.
3. Deploy it to Cloud Run.

## 4. Environment Variables in Cloud Run
After deployment, go to **Cloud Run** > **influencer-backend** > **Edit & Deploy New Revision**.
Add these Variables:
- `DATABASE_URL`: `mysql://user:password@1.2.3.4:3306/db_name`
- `SECRET_KEY`: (A random long string)
- `DEBUG`: `False`
- `ALLOWED_HOSTS`: `*` (or your domain)

## 5. Media/Static Storage
- **Static**: Handled by `collectstatic` in `entrypoint.sh` and served via WhiteNoise (if configured).
- **Media**: GCP Cloud Run has an ephemeral filesystem. For persistent media (like user uploads), consider using **Google Cloud Storage**.
