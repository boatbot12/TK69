# LINE LIFF Influencer Marketing Platform

A mobile-first web application for influencer marketing, built on Django REST Framework + React + PostgreSQL.

## Project Structure

```
├── backend/                 # Django REST Framework API
│   ├── apps/
│   │   ├── api/            # API endpoints
│   │   ├── campaigns/      # Campaign models
│   │   ├── influencers/    # Influencer profiles
│   │   └── users/          # Custom user model
│   ├── config/             # Django settings
│   └── requirements.txt
├── frontend/               # React + Vite
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── contexts/       # Auth & LIFF contexts
│   │   ├── hooks/          # Custom hooks
│   │   ├── pages/          # Page components
│   │   ├── services/       # API services
│   │   └── utils/          # Utilities
│   └── package.json
└── docs/                   # Documentation
    ├── requirement.md
    ├── solution-architecture.md
    ├── technical-spec.md
    └── stories.md
```

## Quick Start

### Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env      # Configure your settings
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

### Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env      # Configure your settings
npm run dev
```

## Features

- **LINE LIFF Authentication** - Login via LINE with mock mode for development
- **3-Step Registration Wizard** - Interest selection, work conditions, personal info
- **Thai Address Autocomplete** - Using thai-address-database
- **Campaign Dashboard** - Sorted by priority (Active > Pending > Open > Closed)
- **Campaign Timeline** - Visual progress tracking (Brief → Script → Draft → Final)
- **Google Drive Validator** - Check if links are publicly accessible
- **Admin Approval System** - User and content approval workflows

## Tech Stack

- **Backend**: Django 4.2, Django REST Framework, PostgreSQL
- **Frontend**: React 18, Vite, Tailwind CSS
- **Authentication**: LINE LIFF SDK, JWT
- **File Storage**: Local/S3

## Documentation

- [Requirements](docs/requirement.md)
- [Solution Architecture](docs/solution-architecture.md)
- [Technical Specification](docs/technical-spec.md)
- [User Stories](docs/stories.md)

## License

MIT
