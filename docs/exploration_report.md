# Project Exploration: LINE LIFF Influencer Marketing Platform

## 🌟 Overview
This project is a mobile-first influencer marketing platform built with **Django REST Framework** (Backend) and **React** (Frontend), specifically designed to run within the **LINE LIFF** (LINE Front-end Framework) environment.

## 🛠 Tech Stack
- **Backend**: Django 4.2, DRF, PostgreSQL, Redis, LINE Messaging API.
- **Frontend**: React 18, Vite, Tailwind CSS, TanStack Query.
- **Authentication**: LINE LIFF v2 (ID Token verification) + JWT.

## 📁 System Components

### 1. Backend Applications (`backend/apps/`)
- **`users`**: Custom `User` model with status flow (`NEW` → `PENDING` → `APPROVED`/`REJECTED`).
- **`influencers`**: Manages detailed profiles, Thai address data, and social media account connections.
- **`campaigns`**: Core logic for marketing campaigns and the application state machine (`WAITING` ... `COMPLETED`).
- **`finance`**: Wallet system, immutable transaction ledger, and agency fee tracking.
- **`support`**: Ticket system integrated with GitHub Issues.

### 2. Frontend Structure (`frontend/src/`)
- **`App.jsx`**: Controls routing based on the user's status (`NEW` users see registration, `APPROVED` users see jobs).
- **`pages/`**: Contains separate interfaces for:
    - **Influencers**: Job Dashboard, Campaign Detail, Profile Management.
    - **Admins**: Influencer Approvals, Work/Submission Approvals, Campaign Management, Finance Dashboard.

## 🔄 Core Workflows

### Registration Flow
1. **Login**: User authenticates via LINE.
2. **Setup**: If status is `NEW`, user completes a 3-step registration (Interests, Conditions, Personal Info).
3. **Approval**: Status becomes `PENDING`. Admin reviews and moves to `APPROVED`.

### Campaign & Submission Flow
- Influencer applies to an `OPEN` campaign.
- Once application is approved, status progresses through:
  `Script Submission` → `Draft Submission` → `Final Content` → `Insight Submission`.
- Each status change triggers a **LINE Notification** to the user.

### Financial Process
- When a job is completed, the system records the transaction.
- Credits are added to the influencer's wallet.
- Agency fees (10%) are tracked internally but not deducted from the influencer's payout.

## 📂 Key Files for Development
- `backend/apps/campaigns/models.py`: Campaign application logic.
- `frontend/src/App.jsx`: Global routing and auth protection.
- `docs/solution-architecture.md`: Visual diagrams and detailed schema.
