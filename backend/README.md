# Django Backend - LINE LIFF Influencer Platform

## Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

## Environment Variables

Copy `.env.example` to `.env` and fill in your values.

## API Endpoints

- `POST /api/v1/auth/line-login/` - Authenticate via LINE
- `GET /api/v1/auth/me/` - Get current user
- `GET /api/v1/register/interests/` - List interests
- `POST /api/v1/register/submit/` - Submit registration
- `GET /api/v1/campaigns/` - List campaigns
- `GET /api/v1/campaigns/{id}/` - Campaign detail
- `POST /api/v1/campaigns/{id}/apply/` - Apply to campaign
- `POST /api/v1/applications/{id}/submit/` - Submit work
- `POST /api/v1/validate-drive-link/` - Validate Google Drive link
