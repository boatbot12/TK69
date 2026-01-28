#!/bin/bash

# Ultra-minimal entrypoint - just start Gunicorn immediately
# Migrations and seeding should be run manually or via a separate job

# Run migrations
echo "[$(date -u +'%Y-%m-%dT%H:%M:%SZ')] Running database migrations..."
python manage.py migrate --noinput

echo "[$(date -u +'%Y-%m-%dT%H:%M:%SZ')] Starting Gunicorn on port $PORT..."
exec gunicorn config.wsgi:application --bind 0.0.0.0:$PORT --workers 2 --timeout 120 --access-logfile - --error-logfile -
