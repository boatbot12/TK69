# Solution & Architecture Document - LINE LIFF Influencer Marketing Platform

## 1. Executive Summary

This document outlines the solution architecture for the LINE LIFF Influencer Marketing Platform, built on the Antigravity SaaS Boilerplate (Django REST Framework + React + PostgreSQL). The platform enables influencers to register, discover brand campaigns, and submit deliverables through a mobile-first interface accessed via LINE's LIFF.

---

## 2. Architecture Overview

### 2.1 High-Level Architecture

```mermaid
flowchart TB
    subgraph Client ["Client Layer"]
        LIFF[LINE LIFF App]
        React[React SPA]
    end
    
    subgraph Server ["Application Layer"]
        Nginx[Nginx Reverse Proxy]
        Gunicorn[Gunicorn WSGI]
        Django[Django REST Framework]
    end
    
    subgraph Data ["Data Layer"]
        PostgreSQL[(PostgreSQL)]
        Redis[(Redis Cache)]
        S3[S3/MinIO Storage]
    end
    
    subgraph External ["External Services"]
        LINE[LINE Platform API]
        GDrive[Google Drive API]
    end
    
    LIFF --> React
    React --> Nginx
    Nginx --> Gunicorn
    Gunicorn --> Django
    Django --> PostgreSQL
    Django --> Redis
    Django --> S3
    Django --> LINE
    Django --> GDrive
```

### 2.2 Technology Stack

| Layer | Technology | Version |
|-------|------------|---------|
| **Frontend** | React + Vite | React 18, Vite 5 |
| **Styling** | Tailwind CSS | 3.x |
| **State Management** | React Query + Context | TanStack Query 5 |
| **Backend** | Django REST Framework | Django 4.2, DRF 3.14 |
| **Database** | PostgreSQL | 15.x |
| **Cache** | Redis | 7.x |
| **File Storage** | S3-compatible | MinIO / AWS S3 |
| **Process Manager** | Gunicorn | 21.x |
| **Web Server** | Nginx | 1.24 |
| **Container** | Docker + Docker Compose | 24.x |

---

## 3. Deployment Architecture

### 3.1 Hosting Environment

| Component | Hosting | Notes |
|-----------|---------|-------|
| Application Server | VPS (Hostinger/DigitalOcean) | 2 vCPU, 4GB RAM minimum |
| Database | Managed PostgreSQL or same VPS | Recommend managed for production |
| File Storage | S3 or VPS disk | S3 recommended for scalability |
| CDN | Cloudflare (optional) | For static assets |

### 3.2 Deployment Options

#### Option A: Docker Compose (Recommended)

```mermaid
flowchart LR
    subgraph VPS ["VPS Server"]
        DC[Docker Compose]
        subgraph Containers
            N[nginx:latest]
            D[django:custom]
            R[react:custom]
            P[postgres:15]
            RD[redis:7]
        end
    end
    DC --> Containers
```

#### Option B: Traditional Setup

```mermaid
flowchart LR
    subgraph VPS ["VPS Server"]
        NG[Nginx]
        GU[Gunicorn]
        DJ[Django App]
        PG[(PostgreSQL)]
        RD[(Redis)]
    end
    NG --> GU
    GU --> DJ
    DJ --> PG
    DJ --> RD
```

### 3.3 One-Click Deployment Script

> [!TIP]
> Deployment script handles: Git pull → Build → Database migrate → Static files → Service restart

**Script Location:** `scripts/deploy.sh`

```bash
#!/bin/bash
# One-click deployment via SSH
# Usage: ./deploy.sh [environment]

set -e

ENVIRONMENT=${1:-production}
DEPLOY_DIR="/var/www/influencer-platform"

echo "🚀 Deploying to $ENVIRONMENT..."

# Pull latest code
cd $DEPLOY_DIR
git pull origin main

# Backend deployment
cd backend
source venv/bin/activate
pip install -r requirements.txt
python manage.py migrate --noinput
python manage.py collectstatic --noinput
deactivate

# Frontend build
cd ../frontend
npm ci
npm run build

# Restart services
sudo systemctl restart gunicorn
sudo systemctl restart nginx

echo "✅ Deployment complete!"
```

---

## 4. Database Schema

### 4.1 Entity Relationship Diagram

```mermaid
erDiagram
    User ||--o| InfluencerProfile : has
    User ||--o{ CampaignApplication : applies
    Campaign ||--o{ CampaignApplication : has
    InfluencerProfile ||--o{ Interest : selects
    
    User {
        int id PK
        string line_user_id UK
        string display_name
        string picture_url
        string status
        datetime created_at
        datetime updated_at
    }
    
    InfluencerProfile {
        int id PK
        int user_id FK
        string full_name_th
        string full_name_en
        string phone
        string email
        date date_of_birth
        string house_no
        string village
        string moo
        string soi
        string road
        string sub_district
        string district
        string province
        string zipcode
        boolean allow_boost
        decimal boost_price
        boolean allow_original_file
        decimal original_file_price
        string id_card_front
        string id_card_back
        string bank_book
        datetime created_at
        datetime updated_at
    }
    
    Interest {
        int id PK
        string name
        string icon
        boolean is_active
    }
    
    InfluencerInterest {
        int id PK
        int profile_id FK
        int interest_id FK
    }
    
    Campaign {
        int id PK
        string title
        text description
        string brand_name
        string brand_logo
        decimal budget_min
        decimal budget_max
        date application_deadline
        date content_deadline
        string status
        json requirements
        datetime created_at
        datetime updated_at
    }
    
    CampaignApplication {
        int id PK
        int campaign_id FK
        int user_id FK
        string status
        json submission_data
        text admin_notes
        datetime applied_at
        datetime updated_at
    }
```

### 4.2 Core Models

#### User Model (Extended from Django's AbstractUser)

```python
class User(AbstractUser):
    line_user_id = models.CharField(max_length=50, unique=True, db_index=True)
    display_name = models.CharField(max_length=100)
    picture_url = models.URLField(blank=True)
    status = models.CharField(
        max_length=20,
        choices=[
            ('NEW', 'New'),
            ('PENDING', 'Pending Approval'),
            ('APPROVED', 'Approved'),
            ('REJECTED', 'Rejected'),
        ],
        default='NEW'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
```

#### InfluencerProfile Model

> [!NOTE]
> Thai address is stored in separate columns for flexibility in querying and display.

| Column | Type | Description |
|--------|------|-------------|
| `house_no` | VARCHAR(50) | House number |
| `village` | VARCHAR(100) | Village/Building name |
| `moo` | VARCHAR(20) | Moo (Village number) |
| `soi` | VARCHAR(100) | Soi (Lane) |
| `road` | VARCHAR(100) | Road name |
| `sub_district` | VARCHAR(100) | ตำบล/แขวง |
| `district` | VARCHAR(100) | อำเภอ/เขต |
| `province` | VARCHAR(100) | จังหวัด |
| `zipcode` | VARCHAR(5) | Postal code |

#### Campaign Model

```python
class Campaign(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField()
    brand_name = models.CharField(max_length=100)
    brand_logo = models.ImageField(upload_to='brands/')
    budget_min = models.DecimalField(max_digits=10, decimal_places=2)
    budget_max = models.DecimalField(max_digits=10, decimal_places=2)
    application_deadline = models.DateField()
    content_deadline = models.DateField()
    status = models.CharField(
        max_length=20,
        choices=[
            ('DRAFT', 'Draft'),
            ('OPEN', 'Open for Applications'),
            ('IN_PROGRESS', 'In Progress'),
            ('CLOSED', 'Closed'),
        ],
        default='DRAFT'
    )
    requirements = models.JSONField(default=dict)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
```

#### CampaignApplication Model

> [!IMPORTANT]
> The `status` field implements a state machine for tracking application progress.

```python
class CampaignApplication(models.Model):
    campaign = models.ForeignKey(Campaign, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    status = models.CharField(
        max_length=30,
        choices=[
            ('WAITING', 'Waiting for Approval'),
            ('APPROVED', 'Application Approved'),
            ('WORK_IN_PROGRESS', 'Working on Content'),
            ('SUBMITTED_SCRIPT', 'Script Submitted'),
            ('SCRIPT_APPROVED', 'Script Approved'),
            ('SUBMITTED_DRAFT', 'Draft Submitted'),
            ('DRAFT_APPROVED', 'Draft Approved'),
            ('SUBMITTED_FINAL', 'Final Submitted'),
            ('COMPLETED', 'Campaign Completed'),
            ('REJECTED', 'Application Rejected'),
        ],
        default='WAITING'
    )
    submission_data = models.JSONField(default=dict)
    admin_notes = models.TextField(blank=True)
    applied_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
```

**submission_data JSON Structure:**

```json
{
  "script": {
    "link": "https://docs.google.com/...",
    "submitted_at": "2026-01-15T10:00:00Z",
    "status": "approved",
    "feedback": "Great script!"
  },
  "draft": {
    "link": "https://drive.google.com/...",
    "submitted_at": "2026-01-16T14:00:00Z",
    "status": "pending"
  },
  "final": null
}
```

---

## 5. API Architecture

### 5.1 API Endpoint Structure

```
/api/v1/
├── auth/
│   ├── line-login/          POST - Authenticate via LINE
│   └── me/                   GET  - Current user profile
├── register/
│   ├── submit/               POST - Submit registration
│   └── interests/            GET  - List available interests
├── profile/
│   └── [id]/                 GET/PUT - User profile
├── campaigns/
│   ├── [list]/               GET  - List campaigns
│   ├── [id]/                 GET  - Campaign detail
│   └── [id]/apply/           POST - Apply to campaign
├── applications/
│   ├── [list]/               GET  - User's applications
│   ├── [id]/submit/          POST - Submit work
│   └── [id]/                 GET  - Application detail
├── validate-drive-link/      POST - Google Drive link validator
└── admin/
    ├── users/                GET  - List users for approval
    ├── users/[id]/approve/   POST - Approve user
    └── applications/[id]/    PUT  - Update application status
```

### 5.2 Authentication Flow

```mermaid
sequenceDiagram
    participant User
    participant LIFF
    participant Frontend
    participant Backend
    participant LINE API
    
    User->>LIFF: Open App
    LIFF->>Frontend: Initialize with ID Token
    Frontend->>Backend: POST /auth/line-login/ {id_token}
    Backend->>LINE API: Verify Token
    LINE API-->>Backend: User Profile
    Backend-->>Frontend: JWT Token + User Data
    Frontend->>Frontend: Store Token, Redirect by Status
```

---

## 6. Frontend Architecture

### 6.1 Component Structure

```
src/
├── components/
│   ├── common/              # Shared UI components
│   │   ├── Button.jsx
│   │   ├── Card.jsx
│   │   ├── Input.jsx
│   │   └── LoadingSpinner.jsx
│   ├── layout/              # Layout components
│   │   ├── Header.jsx
│   │   ├── BottomNav.jsx
│   │   └── PageContainer.jsx
│   ├── registration/        # Registration wizard components
│   │   ├── StepInterests.jsx
│   │   ├── StepWorkConditions.jsx
│   │   ├── StepPersonalInfo.jsx
│   │   └── ProgressBar.jsx
│   └── campaign/            # Campaign components
│       ├── CampaignCard.jsx
│       ├── CampaignTimeline.jsx
│       └── SubmissionForm.jsx
├── pages/
│   ├── Register.jsx
│   ├── Waiting.jsx
│   ├── Jobs.jsx
│   ├── CampaignDetail.jsx
│   └── Profile.jsx
├── contexts/
│   ├── AuthContext.jsx
│   └── LiffContext.jsx
├── hooks/
│   ├── useLiff.js
│   ├── useAuth.js
│   └── useLocalStorage.js
├── services/
│   ├── api.js
│   └── liff.js
└── utils/
    ├── thaiAddress.js
    └── validation.js
```

### 6.2 State Management Strategy

| State Type | Solution | Scope |
|------------|----------|-------|
| Auth/User | Context API | Global |
| API Data | React Query | Per-component |
| Form Data | Local State + localStorage | Per-page |
| UI State | Local State | Per-component |

---

## 7. Security Considerations

### 7.1 Authentication & Authorization

| Concern | Mitigation |
|---------|------------|
| Token Security | HTTP-only cookies for JWT (if web) or secure storage |
| LINE Token Validation | Server-side verification with LINE API |
| API Authorization | Permission-based access decorators |
| Rate Limiting | Django Ratelimit for API endpoints |

### 7.2 Data Protection

| Data Type | Protection |
|-----------|------------|
| PII (ID Cards) | Encrypted at rest, access-logged |
| Passwords | N/A (LINE OAuth only) |
| Database | TLS connections, encrypted backups |
| File Uploads | Virus scanning, type validation |

---

## 8. Scalability Considerations

### 8.1 Horizontal Scaling Path

```mermaid
flowchart LR
    subgraph Current ["Phase 1: Single VPS"]
        V1[VPS with All Services]
    end
    
    subgraph Future ["Phase 2: Scaled"]
        LB[Load Balancer]
        A1[App Server 1]
        A2[App Server 2]
        DB[(Managed DB)]
        S3[Managed S3]
        CDN[CDN]
    end
    
    Current --> Future
```

### 8.2 Performance Optimization

| Area | Strategy |
|------|----------|
| Database | Indexing on frequently queried fields, query optimization |
| API | Response caching with Redis |
| Frontend | Code splitting, lazy loading, service worker |
| Static Assets | CDN delivery, asset compression |

---

## 9. Development Environment

### 9.1 Local Setup

```bash
# Clone repository
git clone <repo-url>
cd influencer-platform

# Backend setup
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
python manage.py migrate
python manage.py runserver

# Frontend setup (new terminal)
cd frontend
npm install
npm run dev
```

### 9.2 Environment Variables

**Backend (.env):**

```env
# Django
DEBUG=True
SECRET_KEY=your-secret-key
ALLOWED_HOSTS=localhost,127.0.0.1

# Database
DATABASE_URL=postgres://user:pass@localhost:5432/influencer_db

# LINE
LINE_CHANNEL_ID=your-channel-id
LINE_CHANNEL_SECRET=your-channel-secret

# Storage (optional for dev)
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_STORAGE_BUCKET_NAME=
```

**Frontend (.env):**

```env
VITE_API_URL=http://localhost:8000/api/v1
VITE_LIFF_ID=your-liff-id
VITE_MOCK_LIFF=true  # Enable mock LIFF for local dev
```

---

## 10. Monitoring & Logging

### 10.1 Logging Strategy

| Log Type | Tool | Retention |
|----------|------|-----------|
| Application Logs | Django Logger → File | 30 days |
| Access Logs | Nginx | 7 days |
| Error Tracking | Sentry (optional) | 90 days |

### 10.2 Health Checks

```python
# /api/health/
{
    "status": "healthy",
    "database": "connected",
    "redis": "connected",
    "timestamp": "2026-01-16T12:00:00Z"
}
```

---

## 11. Appendix

### A. Infrastructure Cost Estimate

| Resource | Provider | Est. Monthly Cost (USD) |
|----------|----------|-------------------------|
| VPS (2 vCPU, 4GB) | Hostinger | $15-25 |
| Managed PostgreSQL | - | Included or $15/mo |
| S3 Storage (10GB) | AWS/Cloudflare R2 | $1-5 |
| Domain + SSL | Cloudflare | Free |
| **Total** | | **~$20-50/mo** |

### B. Third-Party Integrations

| Service | Purpose | SDK/API |
|---------|---------|---------|
| LINE LIFF | Authentication, In-app browser | LIFF SDK v2 |
| Google Drive | Link validation | HEAD request (no API key needed) |
| thai-address-database | Address autocomplete | npm package |
