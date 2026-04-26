# GitFit

GitFit is a simple full-stack workout tracker and progress analyzer.

## Tech Stack

- Backend: FastAPI + MongoDB (pymongo)
- Auth: JWT (python-jose) + passlib (bcrypt)
- Frontend: HTML + CSS + Vanilla JS + Bootstrap
- Charts: Chart.js

## Run as a Developer

### 1. Prerequisites

1. Python 3.9+
2. MongoDB running locally at mongodb://localhost:27017

On macOS (Homebrew), if MongoDB is not installed yet:

brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
mongosh --quiet --eval "db.runCommand({ ping: 1 })"

Expected result from the last command:

{ ok: 1 }

### 2. Setup Python environment

From the project root:

cd /Users/parmindersingh/GitFit
python3 -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
pip install -r backend/requirements.txt

### 3. Configure environment variables

export MONGO_URI="mongodb://localhost:27017"
export MONGO_DB_NAME="gitfit"
export JWT_SECRET_KEY="replace-this-with-a-strong-secret"
export ACCESS_TOKEN_EXPIRE_MINUTES="1440"

### 4. Start backend (development mode)

From project root (recommended):

python -m uvicorn main:app --app-dir backend --reload --host 127.0.0.1 --port 8000

Backend URLs:

- API: http://127.0.0.1:8000
- Swagger docs: http://127.0.0.1:8000/docs

### 5. Start frontend

In a new terminal:

cd /Users/parmindersingh/GitFit/frontend
python3 -m http.server 5500

Open in browser:

- http://127.0.0.1:5500/register.html
- http://127.0.0.1:5500/login.html
- http://127.0.0.1:5500/dashboard.html
- http://127.0.0.1:5500/profile.html

## Test as a Real User (Manual End-to-End)

Use this checklist to validate the product behavior like a normal user.

### 1. Register and Login

1. Open register page and create a new account.
2. Confirm you are redirected to the dashboard after registration.
3. Logout and login again with the same credentials.

Expected:

- Registration works for new email.
- Login returns to dashboard.
- Invalid credentials show an error.

### 2. Update Profile

1. Open Profile page.
2. Update name, weight, and height.
3. Save profile.
4. Refresh page.

Expected:

- Success message appears.
- Updated values persist after refresh.

### 3. Add Workouts

1. On dashboard, select a muscle group.
2. Select an exercise from the dropdown (no custom text input).
3. Add sets, reps, and weight.
4. Submit workout.
5. Add another workout for the same exercise with higher weight.

Expected:

- Workout appears in the table.
- Newest entries are shown first.
- Highest weight row for that exercise is marked as PR.

### 4. Verify Progress Analyzer

1. In Progress Analyzer, choose an exercise.
2. Check the chart line points.

Expected:

- Chart X-axis shows dates.
- Chart Y-axis shows weight.
- Data is plotted in ascending date order.

### 5. Delete Workout

1. Click Delete on one workout row.
2. Confirm deletion.

Expected:

- Row is removed from table.
- Progress chart refreshes accordingly.

### 6. Authentication Guard

1. Logout.
2. Try opening dashboard/profile directly.

Expected:

- You are redirected to login when not authenticated.

## API Endpoints

Auth:

- POST /register
- POST /login

Profile:

- GET /profile
- PUT /profile

Workouts:

- POST /workouts
- GET /workouts
- GET /workouts/{exercise_name}
- DELETE /workouts/{id}

## Troubleshooting

- If you run mongodb://localhost:27017 directly in terminal, you will get "no such file or directory". That value is a connection string, not a command.
- If backend fails to start, ensure your virtual environment is active and dependencies are installed from backend/requirements.txt.
- If auth/register fails unexpectedly, reinstall dependencies to ensure bcrypt==4.0.1 is installed.
