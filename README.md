# CRIC PRO | Cricket Tournament Management System

A full-stack, real-time cricket scoring and tournament management platform built with modern performance and aesthetics in mind.

## Tech Stack
- **Backend**: FastAPI (Python)
- **Database**: SQLite with SQLAlchemy ORM
- **Security**: JWT (Jose) & Bcrypt Hashing
- **Frontend**: Vanilla HTML/JS with Tailwind CSS (Premium Glassmorphic Dark UI)

## Key Features
- **Admin Dashboard**: Secure JWT-based authentication for tournament organizers.
- **Dynamic CRUD**: Full management of Tournaments, Teams, and Players.
- **Intelligent Scoring Engine**: Real-time ball-by-ball entry with automated statistics (Strike Rate, Economy, Match Total).
- **Match Scheduling**: Schedule upcoming fixtures with location and date/time tracking.
- **Tournament Leaderboard**: Top-scorer and top-bowler rankings calculated instantly.

## Setup Instructions

### 1. Backend Setup
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```
The API documentation will be available at [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs).

### 2. Frontend Setup
You can serve the `frontend/` directory using any HTTP server:
```bash
cd frontend
python -m http.server 5000
```
Open [http://localhost:5000/index.html](http://localhost:5000/index.html) in your browser.

---

## Important: Initial Admin Setup
Before using the Admin Dashboard (`admin.html`), you must register the initial admin account:
1. Go to `http://127.0.0.1:8000/docs`.
2. Locate the `POST /auth/setup-admin` endpoint.
3. Register with a username and password.
4. Log in through the frontend to start managing your tournament.
