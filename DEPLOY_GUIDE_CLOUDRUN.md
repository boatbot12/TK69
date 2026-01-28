# Deploying Backend to Google Cloud Run

This guide explains how to deploy the Django backend to Google Cloud Run using the `deploy_backend.sh` script.

## Pre-requisites

1.  **Google Cloud CLI (`gcloud`)**: Must be installed and authenticated.
    ```bash
    gcloud auth login
    ```
2.  **Project ID**: Your active project is `kt69-85563`.
3.  **Environment Variables**: Ensure `backend/.env` exists and contains necessary variables.
    - `DATABASE_URL` (Note: Cloud Run requires a connection string or Cloud SQL proxy. SQLite will be reset on every restart)
    - `SECRET_KEY`
    - `DEBUG=False`

## Easy Deployment

Run the included helper script from the root directory:

```bash
bash deploy_backend.sh
```

This script will:
1.  Enable Cloud Build API (if needed).
2.  Convert `backend/.env` to `env.yaml` (handling special characters).
3.  Build the Docker container using Cloud Build.
4.  Deploy the service `influencer-backend` to `asia-southeast1`.

## Manual Deployment Command

If you prefer to run the command manually:

```bash
gcloud run deploy influencer-backend \
    --project kt69-85563 \
    --region asia-southeast1 \
    --source ./backend \
    --allow-unauthenticated \
    --env-vars-file env.yaml
```

## Important Notes

-   **Database**: This deployment currently uses SQLite (if configured in `Dockerfile`), which **loses data** when the container restarts. For production, please set up **Cloud SQL** (PostgreSQL/MySQL) and update `DATABASE_URL` in `.env`.
-   **Static Files**: WhiteNoise is configured to serve static files.
-   **Media Files**: Local storage is ephemeral. Use Google Cloud Storage for persistent media uploads (configure `GS_BUCKET_NAME` in `.env`).

## Troubleshooting

-   **Build Failures**: Check the Cloud Build logs URL provided in the terminal.
-   **500 Errors**: Check Cloud Run logs:
    ```bash
    gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=influencer-backend" --limit 20
    ```
