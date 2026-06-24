# SkillSync

Resume intelligence & skill-based job matching. Upload a resume, get a quality
score plus targeted improvements and an exportable, ATS-friendly rewrite, then
discover jobs ranked to the skills in your resume — all using **free** Python
libraries (no paid APIs required).

- **Backend:** Django 5 + Django REST Framework (token auth)
- **Frontend:** React 18 + React Router + Tailwind CSS + Framer Motion
- **AI:** Google Gemini free tier (optional) with a built-in offline analyser fallback
- **Jobs:** aggregated from Remotive, Jobicy, RemoteOK, Arbeitnow & Himalayas (all free)

## 📚 Full documentation

Complete docs live in [`docs/`](./docs/README.md):

| Doc | |
|-----|--|
| [Overview & Strategy](./docs/01-overview.md) | what it is, the product thesis & moat |
| [Architecture](./docs/02-architecture.md) | stack, layout, request flow |
| [Features](./docs/03-features.md) | every feature explained |
| [API Reference](./docs/04-api-reference.md) | every endpoint |
| [Data Models](./docs/05-data-models.md) | all models + relationships |
| [Frontend](./docs/06-frontend.md) | pages, components, design system |
| [Setup & Running](./docs/07-setup-and-running.md) | install, run, troubleshoot |
| [Deployment](./docs/08-deployment.md) | Vercel + backend |
| [Roadmap](./docs/09-roadmap.md) | built / seeded / next |

---

## Project structure

```
SkillSync/
├── .env.example          # documents every environment variable
├── vercel.json           # deploys the React frontend
├── backend/
│   ├── config/           # Django project (settings, urls, wsgi/asgi)
│   ├── accounts/         # auth: register / login / profile (Django User + token)
│   ├── resumes/          # upload, parsing, hash-cached AI analysis, PDF export
│   ├── jobs/             # multi-source job aggregation + skill ranking
│   ├── requirements.txt
│   ├── Procfile          # gunicorn entrypoint for production
│   └── build.sh          # collectstatic + migrate for Render/Railway
└── frontend/
    └── src/
        ├── api/          # axios client (token interceptor)
        ├── context/      # auth context
        ├── components/   # Navbar, Footer, JobCard, …
        └── pages/        # Landing, Auth, Dashboard, Jobs, Profile
```

## Configuration

All secrets and API keys live in a single git-ignored `.env` at the repo root.
Copy the template and fill in what you need:

```bash
cp .env.example .env
```

Everything works out of the box with the defaults. Add a free
[Gemini API key](https://aistudio.google.com/app/apikey) to `GEMINI_API_KEY`
to enable AI-powered suggestions; without it the app uses a built-in offline
analyser.

## Running locally

**Backend** (http://127.0.0.1:8000)

```bash
cd backend
python -m venv ../.venv && source ../.venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

**Frontend** (http://localhost:3000)

```bash
cd frontend
npm install
npm start
```

## Key features

- **Hash-based caching** — identical resumes are analysed once. The result is
  stored per content hash and reused across uploads/users, so Gemini is never
  called twice for the same file and storage stays small. Same resume → same
  suggestions, every time.
- **Templated PDF export** — download an improved resume in `Modern`, `Classic`,
  or `Minimal` templates (rendered with reportlab).
- **Skill-based job matching** — resume skills are extracted locally and used to
  rank live listings from multiple free job boards.
- **Graceful degradation** — missing API keys or a flaky job source never break
  a request.

## Deployment

The project is built to be deployed with env-var configuration:

- `DATABASE_URL` switches from SQLite to Postgres/MySQL.
- `DJANGO_DEBUG=False`, `DJANGO_SECRET_KEY`, and `DJANGO_ALLOWED_HOSTS` for prod.
- WhiteNoise serves static files; `gunicorn config.wsgi` is the prod server.

**Frontend → Vercel:** `vercel.json` builds `frontend/` and serves the SPA.
Set `REACT_APP_API_URL` to your deployed backend URL.

**Backend → Render / Railway:** use `backend/build.sh` as the build command and
the `Procfile`'s `web` process. Set the environment variables from `.env.example`.

## API overview

| Method | Endpoint                      | Description                          |
|--------|-------------------------------|--------------------------------------|
| POST   | `/api/auth/register/`         | Create account, returns token        |
| POST   | `/api/auth/login/`            | Log in, returns token                |
| GET    | `/api/auth/me/`               | Current user + profile               |
| POST   | `/api/resumes/upload/`        | Upload & analyse a resume            |
| GET    | `/api/resumes/`               | List your resumes                    |
| GET    | `/api/resumes/templates/`     | Available PDF templates              |
| POST   | `/api/resumes/{id}/export/`   | Download improved resume as PDF      |
| GET    | `/api/jobs/?q=`               | Search jobs (ranked by resume)       |
| GET    | `/api/jobs/recommended/`      | Jobs tailored to your latest resume  |
