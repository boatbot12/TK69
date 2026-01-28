# Hostinger Deployment Guide (Shared Hosting)

Follow these steps to deploy your LINE LIFF Influencer Platform on Hostinger "Website" plan.

## 1. Database Setup (MySQL)
1. Go to **Hostinger Panel** > **Databases** > **MySQL Databases**.
2. Create a new database, username, and password.
3. Keep these credentials for the next step.

## 2. Backend Environment (.env)
Create a `.env` file in your `backend/` folder on the server with:
```env
DEBUG=False
SECRET_KEY=your_generated_secret_key
ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com
DATABASE_URL=mysql://user:password@localhost:3306/db_name
GITHUB_TOKEN=...
GITHUB_REPO_OWNER=boatbot12
GITHUB_REPO_NAME=TK69
```

## 3. Uploading Files
### Backend
- Upload everything in the `backend/` folder (except `venv/` and `__pycache__`) to a folder on your server (e.g., `/home/u12345/backend`).
- **Crucial**: Ensure `passenger_wsgi.py` is in the same folder as `manage.py`.
- **Static Files**: Upload the generated `staticfiles/` folder.

### Frontend
- Upload the contents of `frontend/dist/` (including `.htaccess`) to your `public_html/` folder.

## 4. Hostinger Python Selector
1. Go to **Advanced** > **Python Selector**.
2. Create a new application.
3. Select **Python 3.x**.
4. Application root: Point to your `backend/` folder.
5. Application URL: point to your domain.
6. Passenger log file: `passenger.log`.

## 5. Script to run on Server (via SSH if available)
Run these inside the virtual environment created by Python Selector:
```bash
pip install -r requirements.txt
python manage.py migrate
```

> [!NOTE]
> Since shared hosting often lacks SSH, you may need to use Hostinger's **"Setup virtualenv"** or **"Manage Pip"** tools in the Python Selector UI to install `requirements.txt`.
