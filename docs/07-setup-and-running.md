# 07 — Setup & Running

## Prerequisites

- Python 3.10+ (3.10 recommended)
- Node.js 18+ (project last run on Node 24)
- Git

## 1. Clone & configure

```bash
git clone <repo-url> SkillSync
cd SkillSync
cp .env.example .env        # fill in what you need (everything has defaults)
```

### Environment variables (`.env`)

| Variable | Default | Purpose |
|----------|---------|---------|
| `DJANGO_SECRET_KEY` | — | set a long random string for production |
| `DJANGO_DEBUG` | `True` | `False` in production |
| `DJANGO_ALLOWED_HOSTS` | `localhost,127.0.0.1,.vercel.app` | comma-separated |
| `CORS_ALLOWED_ORIGINS` | `http://localhost:3000,http://127.0.0.1:3000` | frontend origins (ignored in DEBUG, which allows all) |
| `CSRF_TRUSTED_ORIGINS` | same as above | |
| `GEMINI_API_KEY` | empty | optional; enables AI analysis. Free key from Google AI Studio |
| `GEMINI_MODEL` | `gemini-1.5-flash` | |
| `ADZUNA_APP_ID` / `ADZUNA_APP_KEY` | empty | optional; **enables local Indian job listings** (free key from developer.adzuna.com). Skipped if blank |
| `ADZUNA_COUNTRY` | `in` | ISO country code for Adzuna (`in`=India, `us`, `gb`, …) |
| `REACT_APP_API_URL` | `http://127.0.0.1:8000/api` | where the frontend reaches the API |

> Without `GEMINI_API_KEY`, the app uses the built-in **offline analyser** — fully functional.

## 2. Backend (http://127.0.0.1:8000)

```bash
cd backend
python -m venv ../.venv && source ../.venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

Optional: seed the market intelligence table (otherwise it auto-populates on
first Insights load):
```bash
python manage.py refresh_skill_stats          # default sample
python manage.py refresh_skill_stats --limit 80   # bigger sample
```

Optional admin access:
```bash
python manage.py createsuperuser   # then visit /admin/
```

## 3. Frontend (http://localhost:3000)

```bash
cd frontend
npm install
npm start
```

Open **http://localhost:3000**.

### Run on a different port (e.g. to dodge browser cache)
```bash
PORT=3001 npm start    # then open http://localhost:3001
```
A new port is a new origin → zero cache, guaranteed fresh UI.

## Useful commands

```bash
# Backend
python manage.py check                 # system check
python manage.py makemigrations        # after model changes
python manage.py migrate
python manage.py refresh_skill_stats   # recompute SkillStat from live jobs

# Frontend
npm start                              # dev server (hot reload for .js)
npm run build                          # production build → frontend/build/
```

## Troubleshooting

| Symptom | Cause & fix |
|---------|-------------|
| UI changes not showing | You changed `tailwind.config.js` / `index.css` / `.env` → **restart `npm start`**. Or browser cache → open a new port / Incognito / hard reload. |
| Clicking a CTA sends you to login while logged in | Was a hardcoded landing-page link (fixed) — make sure you're on the latest frontend. |
| "ModuleNotFoundError: dj_database_url" | You're not in the venv. `source ../.venv/bin/activate`. |
| Skill stats look noisy (`r` 21%) | Old data computed before the matcher fix. Re-run `refresh_skill_stats`. |
| Salaries show "—" | Free listings rarely include pay; member-reported salaries (Insights → Salary) are the richer source. |
| Login bounces after an action | A 401 occurred; the client logs you out cleanly. Log in again with a fresh account if an old token was corrupted. |
