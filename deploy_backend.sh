#!/bin/bash

# Configuration
PROJECT_ID="kt69-85563"
REGION="asia-southeast1"
SERVICE_NAME="influencer-backend"

echo "🚀 Preparing to deploy $SERVICE_NAME to $PROJECT_ID ($REGION)..."

# Enable necessary services
echo "🔌 Enabling Cloud Build API..."
gcloud services enable cloudbuild.googleapis.com --project $PROJECT_ID

# Create env.yaml from .env
echo "📝 Creating env.yaml for safe deployment..."
if [ -f backend/.env ]; then
    rm -f env.yaml
    touch env.yaml
    while IFS='=' read -r key value || [ -n "$key" ]; do
        # Skip comments and empty lines
        [[ $key =~ ^#.* ]] && continue
        [[ -z $key ]] && continue
        
        # Strip quotes if present (both double and single)
        value=${value%\"}
        value=${value#\"}
        value=${value%\'}
        value=${value#\'}
        
        # Write to yaml: key: "value"
        # Escape double quotes in value if any? simpler to just echo
        echo "$key: \"$value\"" >> env.yaml
    done < backend/.env
else
    echo "⚠️ backend/.env not found, skipping env vars."
fi

# Deploy
echo "📦 Deploying to Cloud Run..."
gcloud run deploy $SERVICE_NAME \
    --project $PROJECT_ID \
    --region $REGION \
    --source ./backend \
    --allow-unauthenticated \
    --env-vars-file env.yaml

echo "✅ Deployment command finished."
