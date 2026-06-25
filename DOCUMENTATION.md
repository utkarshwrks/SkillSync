<!--
  SkillSync — Complete Project Documentation (single file)
  Everything about the project: what it is, every feature, architecture,
  data models, the full API, the frontend, setup, and deployment.
  Granular per-topic docs also live in ./docs/.
-->

# 📘 SkillSync — Complete Documentation

> **Career Intelligence, not just another resume tool.**
> Upload a resume → get an honest dual-lens score and evidence-based fixes →
> discover live jobs ranked to your skills → know your real market demand & pay →
> verify your skills and track every application's outcome. All on free tooling.

**Live**
- 🌐 Frontend (Vercel): `https://skillsync-topaz.vercel.app`
- ⚙️ Backend API (Render): `https://skillsync-backend-qx9u.onrender.com/api`
- 📦 Repo: `https://github.com/utkarshwrks/SkillSync`

---

## Table of contents

1. [Overview & Strategy](#1--overview--strategy)
2. [Feature Catalogue (everything)](#2--feature-catalogue-everything)
3. [Architecture](#3--architecture)
4. [Tech Stack](#4--tech-stack)
5. [Data Models](#5--data-models)
6. [API Reference](#6--api-reference)
7. [Frontend](#7--frontend)
8. [Setup & Running (local)](#8--setup--running-local)
9. [Deployment (production)](#9--deployment-production)
10. [Roadmap](#10--roadmap)
11. [Known Limitations](#11--known-limitations)

---

## 1 — Overview & Strategy

### What is SkillSync?

SkillSync is a free, full-stack web app that helps job seekers:

1. **Understand their resume** — instant dual-lens quality score, targeted fixes, and an ATS-friendly rewrite.
2. **Find the right jobs** — live listings aggregated from multiple free boards, ranked to the skills in their resume.
3. **Know their market** — real demand and pay per skill, computed from live listings, plus the jobs they're "one skill away" from qualifying for.
4. **Build a credible profile** — verify skills from GitHub/portfolio, track applications and outcomes, and share a public, data-backed skill profile.

Everything runs on free tooling. The only optional paid-ish dependency is a **free** Google Gemini API key; without it, a deterministic offline analyser takes over so the product never breaks.

### Who it's for

- Job seekers (especially early-career and career-switchers) flying blind through an opaque hiring process.
- Anyone who wants honest, data-backed answers to: *Is my resume good? What am I worth? What should I learn next? Which jobs will I actually get?*

### The problem (first principles)

- **Job boards** are paid by employers, so they optimise for application *volume*, not candidate *success*.
- **Resume tools** sell "beat the ATS" — an arms race that produces keyword-stuffed resumes recruiters dislike.
- **Every tool treats the résumé as the unit of work** — but the résumé is a lossy compression of a person's actual capability.

### The thesis & moat

> Own the **truth layer** (verified skills, real outcomes, live market position), and make the résumé a disposable render of it.

The durable moat is the **Outcome Data Flywheel** — most tools give advice and never learn whether it worked. SkillSync captures the full loop:

```
resume version + skills  →  application  →  interview / rejection / hire  →  feeds back
```

…accumulating the one dataset nobody can buy: *what actually gets people hired, right now, by skill and role.*

Three **data seeds** start that flywheel from day one:
1. **Outcome-capture tracker** — applications record real outcomes + per-skill conversion.
2. **Skill verification** — GitHub/portfolio → verified skills with a trust badge.
3. **Salary capture** — anonymous real offers → proprietary per-skill pay data.

### Design principles

1. **Degrade gracefully, always.** Every AI feature has a deterministic offline fallback.
2. **No paid APIs.** Jobs, salary parsing, skill detection, scoring — all free.
3. **Capture data from day one.** Features deliver single-user value *today* while compounding the moat for *tomorrow*.
4. **Privacy first.** User-submitted salaries are only served as aggregates; public profiles expose skills, never resume text.

---

## 2 — Feature Catalogue (everything)

Every feature works **with or without** a Gemini key and uses **no paid APIs**.

### 🧠 Core

| Feature | What it does | API | UI |
|---|---|---|---|
| **Resume analysis & in-place fixes** | Upload PDF/DOCX/TXT → extract text + skills → quality score, summary, suggestions, and line-level fixes (original → improved). Gemini-powered, with deterministic offline fallback. | `POST /api/resumes/upload/`, `GET/PATCH /api/resumes/<id>/` | Dashboard → upload, **Fixes** tab |
| **ATS-friendly PDF export** | Render the improved/edited resume into a clean, templated PDF. | `GET /api/resumes/templates/`, `POST /api/resumes/<id>/export/` | Dashboard → **Export** tab |
| **Job aggregation & skill ranking** | Live listings from Remotive, Jobicy, RemoteOK, Arbeitnow, Himalayas (+ Adzuna India), fetched concurrently, de-duplicated, ranked by resume-skill match. | `GET /api/jobs/`, `GET /api/jobs/recommended/` | **Jobs** page |

### 📊 Skill intelligence (the moat)

| Feature | What it does | API | UI |
|---|---|---|---|
| **#5 Market-truth skill pricing** | Per-skill demand (% of live listings) + average salary, from the same free feed. Shows your skills ranked by demand, in-demand skills you're missing, and top market skills. | `GET /api/jobs/skill-stats/` | **Insights → Skill pricing** |
| **#2 Reverse matching ("one skill away")** | Surfaces jobs you'd qualify for by learning **one** more skill, with the payoff (demand % + salary) of that skill. | `GET /api/jobs/reverse-match/` | **Insights → One skill away** |
| **Salary explorer** | Listing-based pay ranking **plus** member-reported real offers. | `GET/POST /api/jobs/salary/` | **Insights → Salary explorer** |

### 📝 Resume quality

| Feature | What it does | API | UI |
|---|---|---|---|
| **#6 Dual-lens ATS + recruiter score** | Scores on **two** axes — ATS parseability/keyword coverage **and** human recruiter readability — flagging conflicts (e.g. keyword stuffing). Fully offline. | `GET /api/resumes/<id>/quality/` | Dashboard → **Quality** tab |
| **#3 Evidence-based metric prompts** | Finds bullets lacking a measurable result and asks a targeted question for *your* real number — never invents metrics. | (part of quality report) | Dashboard → **Quality** tab |
| **#4 Version history & diff** | Snapshot tailored copies of a resume, label them, view a line-level diff (version vs version, or vs current). | `GET/POST /api/resumes/<id>/versions/`, `GET /api/resumes/<id>/versions/diff/` | Dashboard → **Editor** tab |

### 🌱 Career profile & data seeds

| Feature | What it does | API | UI |
|---|---|---|---|
| **Seed 1 — Outcome-capture tracker** | Track jobs through `saved → applied → interview → offer → hired` (+ `rejected`/`ghosted`). Computes a personal funnel (response/interview/offer rates) + per-skill conversion. | `GET/POST /api/jobs/applications/`, `PATCH/DELETE /api/jobs/applications/<id>/`, `GET /api/jobs/applications/stats/` | **Tracker** page; "+ Track" on job cards |
| **Seed 2 — Skill verification** | Paste a GitHub/portfolio URL → confirms which claimed skills are backed by real work → ✓ badge. No API key needed. | `POST /api/auth/verify-skills/` | **Profile → Verify your skills** |
| **Seed 3 — Salary capture** | Members log real offers anonymously → proprietary per-skill pay data. Only aggregates returned; small buckets suppressed. | `GET/POST /api/jobs/salary/` | **Insights → Salary explorer → Add anonymously** |
| **Public skill profile** | Shareable `/u/<username>` page showing skills (verified badges + live market demand) — never resume text. | `GET /api/auth/profile/<username>/` | `/u/<username>` |

---

## 3 — Architecture

### Repository layout

```
SkillSync/
├── .env.example              # documents every environment variable
├── vercel.json               # deploys the React frontend
├── render.yaml               # Render blueprint: backend web service + Postgres
├── DOCUMENTATION.md          # ← this file
├── docs/                     # granular per-topic docs
├── backend/
│   ├── config/               # Django project: settings, urls, wsgi/asgi
│   ├── accounts/             # auth, profile, skill verification, public profile
│   │   └── verification.py   # GitHub/portfolio skill verification service
│   ├── resumes/              # upload, parsing, AI analysis, quality, versions, PDF
│   │   └── services/
│   │       ├── parsing.py    # text extraction + skill detection (shared vocab)
│   │       ├── ai.py         # Gemini analysis + offline fallback
│   │       ├── quality.py    # dual-lens score + evidence-based metric prompts
│   │       └── pdfgen.py     # templated PDF export
│   ├── jobs/                 # aggregation, ranking, market intel, tracker, salary
│   │   ├── services/
│   │   │   ├── sources.py    # free job-board adapters + concurrent fetch
│   │   │   ├── recommend.py  # skill-based job ranking
│   │   │   └── market.py     # skill stats, salary parse, reverse match
│   │   └── management/commands/refresh_skill_stats.py
│   ├── requirements.txt
│   ├── Procfile              # gunicorn entrypoint
│   ├── build.sh              # collectstatic + migrate
│   └── runtime.txt           # pinned Python version
└── frontend/
    └── src/
        ├── api/client.js     # axios client (token interceptor, 401 handling)
        ├── context/AuthContext.js
        ├── lib/motion.js     # shared Framer Motion variants
        ├── components/       # Navbar, Footer, JobCard, Icon, panels, etc.
        └── pages/            # Landing, Auth, Dashboard, Jobs, Insights, Tracker, Profile, PublicProfile
```

### Backend app responsibilities

- **`accounts`** — register/login/logout, current user (`me`), profile editing, skill verification, public profile endpoint.
- **`resumes`** — upload + dedup (content-hash cache), parsing, AI/offline analysis, in-place fixes, dual-lens quality report, version snapshots + diff, PDF export.
- **`jobs`** — live job search & recommendations, market skill stats, reverse matching, salary capture/aggregation, application tracker + funnel.

### Request lifecycle (example: upload a resume)

```
React (Dashboard) ──POST /api/resumes/upload/ (multipart + token)──▶ Django
                                                                      │
                          parsing.extract_text / extract_skills ◀─────┤
                          ai.analyze_resume (Gemini OR offline) ◀──────┤
                          cache by content hash (ResumeAnalysis) ◀─────┤
                          create Resume row for the user ◀─────────────┤
React ◀──────────────── JSON (score, summary, fixes, skills, ...) ─────┘
```

### Key design choices

- **Content-hash caching** (`ResumeAnalysis`): identical resume bytes → analysed once, ever. Gemini is never called twice for the same content.
- **Stateless job listings**: listings are fetched live, never stored. Only *derived* data worth keeping is persisted (`SkillStat`, `JobApplication`, `SalaryReport`).
- **Shared skill vocabulary**: `resumes/services/parsing.py` defines the catalogue + matcher used by *both* resume parsing and job-side skill detection, so they stay consistent.
- **Graceful degradation everywhere**: external calls (Gemini, job boards, GitHub) are wrapped; failures return empty/fallback results, never 500s.

### Authentication

- DRF **TokenAuthentication** (+ SessionAuthentication for the browsable API).
- Token stored in `localStorage` as `skillsync_token`, attached to every request by the Axios interceptor.
- On any `401`, the client clears the token **and** fires a `skillsync:unauthorized` event so `AuthContext` resets the user in lockstep — preventing the "half-logged-in" state.

---

## 4 — Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Django 5, Django REST Framework, token auth |
| Database | SQLite (local default), **Postgres** in production via `dj_database_url` |
| Static files | WhiteNoise (compressed manifest storage) |
| AI (optional) | Google Gemini free tier (`google-generativeai`) + offline fallback |
| Resume parsing | `pdfplumber` (PDF), `python-docx` (DOCX), plain text |
| PDF export | server-side generation (`reportlab` via `pdfgen` service) |
| Jobs | live HTTP aggregation (`requests`, concurrent), `feedparser`, `beautifulsoup4` |
| Frontend | React 18, React Router v6, Tailwind CSS, Framer Motion, Axios |
| Hosting | **Vercel** (frontend) + **Render** (backend + Postgres) |

---

## 5 — Data Models

All models use Django's default `BigAutoField` primary key.

### accounts · `Profile` (OneToOne → User)

| Field | Type | Notes |
|-------|------|-------|
| `user` | OneToOne(User) | `related_name="profile"` |
| `phone` | char(20) | |
| `headline` | char(120) | |
| `bio` | text | |
| `github` | url | |
| `linkedin` | url | |
| `verified_skills` | json (list) | skills proven via GitHub/portfolio |
| `verification_source` | url | URL last verified from |
| `verified_at` | datetime (nullable) | |
| `updated_at` | datetime | auto |

### resumes · `ResumeAnalysis` (content-hash cache — one row per unique resume)

| Field | Type | Notes |
|-------|------|-------|
| `content_hash` | char(64), unique, indexed | sha256 of file bytes |
| `extracted_text` | text | |
| `skills` | json (list) | detected skills |
| `summary` | text | |
| `score` | small int | 0–100 |
| `suggestions` | json (list) | |
| `fixes` | json (list) | `[{original, improved, reason}]` |
| `improved_resume` | text | full rewrite |
| `source` | char(20) | `"gemini"` or `"offline"` |
| `created_at` | datetime | |

### resumes · `Resume` (FK → User, FK → ResumeAnalysis)

| Field | Type | Notes |
|-------|------|-------|
| `user` | FK(User) | `related_name="resumes"` |
| `analysis` | FK(ResumeAnalysis) | `related_name="uploads"` |
| `filename` | char(255) | |
| `edited_content` | text | per-user working copy |
| `created_at` | datetime | ordered `-created_at` |

### resumes · `ResumeVersion` (FK → Resume)

| Field | Type | Notes |
|-------|------|-------|
| `resume` | FK(Resume) | `related_name="versions"` |
| `label` | char(120) | e.g. "Backend roles" |
| `content` | text | the snapshot |
| `tailored_for` | char(255) | optional job/company |
| `created_at` | datetime | ordered `-created_at` |

### jobs · `JobApplication` (FK → User)

| Field | Type | Notes |
|-------|------|-------|
| `user` | FK(User) | `related_name="applications"` |
| `title` / `company` / `location` / `url` / `source` | char/url | copied from the live listing |
| `status` | char(20) | `saved, applied, interview, offer, hired, rejected, ghosted` |
| `notes` | text | |
| `matched_skills` | json (list) | ties outcomes to skills |
| `applied_at` | datetime (nullable) | stamped when status first leaves `saved` |
| `created_at` / `updated_at` | datetime | ordered `-updated_at` |

**Constraint:** unique `(user, url)` — no duplicate tracking of the same posting.

### jobs · `SkillStat` (global, not user-scoped)

| Field | Type | Notes |
|-------|------|-------|
| `name` | char(100), unique, indexed | |
| `job_count` | uint | sampled jobs mentioning the skill |
| `sample_size` | uint | total sampled jobs |
| `share` | float | `job_count / sample_size * 100` |
| `avg_salary` | uint (nullable) | best-effort annual USD |
| `salary_samples` | uint | listings with a parseable salary |
| `updated_at` | datetime | ordered `-share` |

### jobs · `SalaryReport` (FK → User — rows never exposed, only aggregates)

| Field | Type | Notes |
|-------|------|-------|
| `user` | FK(User) | for dedup/abuse control only; never returned |
| `role_title` | char(160) | |
| `skills` | json (list) | tied to user's skills at submit time |
| `amount` | uint | annual |
| `currency` | char(8) | default `USD` |
| `location` | char(160) | |
| `created_at` | datetime | ordered `-created_at` |

### Relationship diagram

```
User ──1:1── Profile
 │
 ├──1:N── Resume ──N:1── ResumeAnalysis  (content-hash cache, shared)
 │           └──1:N── ResumeVersion
 │
 ├──1:N── JobApplication
 └──1:N── SalaryReport

SkillStat  (global, not user-scoped)
```

---

## 6 — API Reference

Base URL: `https://skillsync-backend-qx9u.onrender.com/api` (local: `http://127.0.0.1:8000/api`, configurable via `REACT_APP_API_URL`).

**Auth:** most endpoints require `Authorization: Token <your-token>`. Tokens come from `register` / `login`. Endpoints marked **Public** need no token.

### Health
- `GET /api/health/` — **Public** → `{"status": "ok", "service": "skillsync-api"}`

### Auth & profile (`/api/auth/`)
| Method & path | Auth | Body / params → response |
|---|---|---|
| `POST /register/` | Public | `{username, email, password, confirm_password, phone?}` → `201 {token, user}` |
| `POST /login/` | Public | `{username, password}` → `200 {token, user}` · `401` bad creds |
| `POST /logout/` | Token | deletes token → `200 {detail}` |
| `GET /me/` | Token | current user (incl. nested `profile`) |
| `PATCH /me/` | Token | any of `first_name, last_name, email, phone, headline, bio, github, linkedin` → updated user |
| `POST /verify-skills/` | Token | `{url}` → `200 {verified_skills, detected, source_type, verified_at}` · `400` on fetch failure |
| `GET /profile/<username>/` | Public | `200 {username, name, joined, skill_count, skills:[{name, share, avg_salary, verified}], verified_count, verification_source}` · `404` |

### Resumes (`/api/resumes/`)
| Method & path | Body / params → response |
|---|---|
| `GET /` | list current user's resumes (enriched with analysis fields) |
| `POST /upload/` | multipart field `resume`/`file`, max 5 MB, PDF/DOCX/TXT → `201 {id, filename, created_at, skills, summary, score, suggestions, fixes, improved_resume, original_text, content, source}` · `400` |
| `GET /<id>/` | single resume (owner only) · `404` |
| `PATCH /<id>/` | `{content}` — save edited working copy |
| `GET /templates/` | `{templates:[{id, label}, ...]}` |
| `POST /<id>/export/` | `{template?, name?, contact?, content?}` → **PDF** (`application/pdf`) |
| `GET /<id>/quality/` | `{ats_score, recruiter_score, ats_notes:[], recruiter_notes:[], conflicts:[], metric_prompts:[{bullet, question}]}` |
| `GET /<id>/versions/` | `[{id, label, content, tailored_for, created_at}]` |
| `POST /<id>/versions/` | `{label?, tailored_for?, content?}` → `201` version |
| `GET /<id>/versions/diff/?a=<id>&b=<id>` | `a` required, `b` optional (omit → vs current) → `{from, to, unified, lines:[{type:"add"\|"remove"\|"context", text}]}` · `400` if `a` missing |

### Jobs & market (`/api/jobs/`)
| Method & path | Body / params → response |
|---|---|
| `GET /?q=<query>` | search all free boards, ranked by resume skills → `{query, count, skills_used, results:[job...], source_errors}` |
| `GET /recommended/` | jobs tailored to the user's latest resume skills |
| `GET /skill-stats/` | `{top_skills:[{name, share, job_count, sample_size, avg_salary}], your_skills:[...], missing_in_demand:[...], updated_at}` (auto-populates if empty) |
| `GET /reverse-match/` | "one skill away" jobs; each carries `missing_skills` + `missing_skill_stats:[{name, share, avg_salary}]` |
| `GET /salary/` | ready: `{sample_size, ready:true, overall_median, overall_min, overall_max, by_skill:[{skill, median, samples}]}` · not ready (<3): `{sample_size, ready:false, detail, by_skill:[]}` |
| `POST /salary/` | `{amount (1k–10M), role_title?, skills?, currency?, location?}` → `201` |
| `GET /applications/` | list user's tracked applications |
| `POST /applications/` | `{title, company?, location?, url?, source?, status?, notes?, matched_skills?}` → `201` (or `200` if duplicate url) |
| `GET /applications/stats/` | `{totals:{tracked, applied, interviews, offers, hired, ghosted}, rates:{response_rate, interview_rate, offer_rate}, skill_conversion:[{skill, applied, responded, response_rate}]}` |
| `PATCH /applications/<id>/` | any of `status, notes, ...`; stamps `applied_at` when status first leaves `saved` |
| `DELETE /applications/<id>/` | → `204` |

A **job** object: `{title, company, location, url, source, tags:[], description, salary_text, match_score, matched_skills:[]}`

### Status codes
| Code | Meaning |
|------|---------|
| 200 / 201 / 204 | success |
| 400 | bad input (validation) |
| 401 | missing/invalid token → client logs you out |
| 404 | not found or not owned by you |

---

## 7 — Frontend

React 18 SPA · React Router v6 · Tailwind CSS · Framer Motion · Axios.

### Routing (`src/App.js`)
| Path | Page | Access |
|------|------|--------|
| `/` | Landing | public |
| `/login` | Auth (login/register) | public |
| `/u/:username` | PublicProfile | public |
| `/dashboard` | Dashboard | protected |
| `/jobs` | Jobs | protected |
| `/insights` | Insights | protected |
| `/tracker` | Tracker | protected |
| `/profile` | Profile | protected |
| `/settings` | Settings | protected |
| `/onboarding` | Onboarding | protected |

Protected routes are wrapped in `ProtectedRoute` (waits for auth to load, redirects to `/login` if no user). `AnimatedBackground` renders once, behind everything.

### Pages
- **Landing** — hero + feature grid (auth-aware CTAs), steps, final CTA.
- **Auth** — combined login/register with mode toggle.
- **Dashboard** — upload + history sidebar; analysis column with tabs: Fixes · Quality · Editor · Export.
- **Jobs** — Recommended/Search tabs; job cards with "+ Track".
- **Insights** — tabs: Skill pricing · One skill away · Salary explorer.
- **Tracker** — funnel stats (animated counters) + Kanban columns + per-skill conversion bars.
- **Profile** — edit profile, skill verification, public-profile share link.
- **PublicProfile** — read-only shareable skill profile with verified badges.
- **Settings / Onboarding** — account settings and first-run flow.

### Components
`Navbar`, `Footer`, `AnimatedBackground`, `Icon`, `JobCard`, `QualityPanel`, `VersionsPanel`, `Reveal`, `CountUp`, `Loader`, `ProtectedRoute`, `Toast`, `WarpSplash`, `charts`, `scroll3d`, `ui`.

### State & data
- **`AuthContext`** — holds `user`, `loading`, `login/register/logout`. On mount validates the stored token via `/auth/me/`. Listens for `skillsync:unauthorized` to reset user in lockstep with the token.
- **`api/client.js`** — Axios instance (60s timeout). Request interceptor attaches `Authorization: Token …` from `localStorage`. Response interceptor: on `401`, clears token + dispatches `skillsync:unauthorized`.

### Design system
- **Palette** — deep `#04060f` space canvas; `brand` indigo→blue, `aqua` cyan, accent violet; glass surfaces.
- **Fonts** — Inter (body), Sora (display), mono for stats.
- **Component classes** — `.card`, `.card-glow`, `.btn-primary` (gradient + hover shimmer), `.btn-ghost`, `.input`, `.chip`, `.gradient-text`, `.stat-num`, `.icon-badge`, `.link-underline`.
- **Animations** — `aurora-a/b`, `grid-pan`, `gradient-move`, `glow-pulse`, `spin-slow`, `rise-in`, `twinkle`. All GPU-composited (transform/opacity); disabled under `prefers-reduced-motion`.
- **Motion primitives** — `src/lib/motion.js` (`fadeUp`, `stagger`, `scaleIn`) used via `Reveal`.

> **Dev note:** `tailwind.config.js`, `src/index.css`, and `.env` are read once at dev-server start — they don't hot-reload. Restart `npm start` after editing them.

---

## 8 — Setup & Running (local)

### Prerequisites
- Python 3.10+ · Node.js 18+ · Git

### 1. Clone & configure
```bash
git clone https://github.com/utkarshwrks/SkillSync.git SkillSync
cd SkillSync
cp .env.example .env        # everything has sensible defaults
```

#### Environment variables (`.env`)
| Variable | Default | Purpose |
|----------|---------|---------|
| `DJANGO_SECRET_KEY` | — | long random string for production |
| `DJANGO_DEBUG` | `True` | `False` in production |
| `DJANGO_ALLOWED_HOSTS` | `localhost,127.0.0.1,.vercel.app` | comma-separated (Render host auto-added) |
| `CORS_ALLOWED_ORIGINS` | `http://localhost:3000,http://127.0.0.1:3000` | frontend origins (ignored in DEBUG) |
| `CSRF_TRUSTED_ORIGINS` | same as above | |
| `GEMINI_API_KEY` | empty | optional; enables AI analysis (free from Google AI Studio) |
| `GEMINI_MODEL` | `gemini-1.5-flash` | |
| `ADZUNA_APP_ID` / `ADZUNA_APP_KEY` | empty | optional; enables Indian job listings (free from developer.adzuna.com) |
| `ADZUNA_COUNTRY` | `in` | ISO country code |
| `DATABASE_URL` | sqlite | Postgres in production via `dj_database_url` |
| `REACT_APP_API_URL` | `http://127.0.0.1:8000/api` | where the frontend reaches the API |

> Without `GEMINI_API_KEY`, the built-in **offline analyser** runs — fully functional.

### 2. Backend → http://127.0.0.1:8000
```bash
cd backend
python -m venv ../.venv && source ../.venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```
Optional: seed market intelligence (otherwise auto-populates on first Insights load):
```bash
python manage.py refresh_skill_stats           # default sample
python manage.py refresh_skill_stats --limit 80 # bigger sample
python manage.py createsuperuser                # admin at /admin/
```

### 3. Frontend → http://localhost:3000
```bash
cd frontend
npm install
npm start
```
Run on a different port to dodge cache: `PORT=3001 npm start`.

### Useful commands
```bash
python manage.py check                 # system check
python manage.py makemigrations        # after model changes
python manage.py refresh_skill_stats   # recompute SkillStat from live jobs
npm run build                          # production build → frontend/build/
```

---

## 9 — Deployment (production)

The frontend and backend deploy **separately from the same repo** (monorepo).

### Backend → Render (Blueprint)
`render.yaml` at the repo root defines a **Python web service + Postgres** in one click.

1. Render → **New → Blueprint** → connect `utkarshwrks/SkillSync`.
2. Render reads `render.yaml` → creates `skillsync-backend` (Python 3, root dir `backend`) and `skillsync-db` (Postgres).
3. Auto-wired: `DATABASE_URL`, generated `DJANGO_SECRET_KEY`, `DJANGO_DEBUG=False`, `DJANGO_ALLOWED_HOSTS`. The Render host is also auto-trusted via `RENDER_EXTERNAL_HOSTNAME` in `settings.py`.
4. Set manually (in the dashboard): `GEMINI_API_KEY` (optional), and **after the frontend is live** → `CORS_ALLOWED_ORIGINS` + `CSRF_TRUSTED_ORIGINS` = your Vercel URL.
5. Build `./build.sh` (pip install + collectstatic + migrate), start `gunicorn config.wsgi:application`, health check `/api/health/`. WhiteNoise serves static files.

### Frontend → Vercel
`vercel.json` already configures the build (`cd frontend && npm run build`, output `frontend/build`, SPA rewrites).

1. Vercel → import `utkarshwrks/SkillSync` (keep **Root Directory = repo root**).
2. Add env var `REACT_APP_API_URL = https://skillsync-backend-qx9u.onrender.com/api`.
3. Deploy → get the Vercel URL.

### Connect them (CORS) — required
On Render `skillsync-backend` → **Environment**, set:
```
CORS_ALLOWED_ORIGINS = https://skillsync-topaz.vercel.app
CSRF_TRUSTED_ORIGINS = https://skillsync-topaz.vercel.app
```
Save → backend auto-redeploys.

### Continuous deployment
Both platforms watch `main`. Any `git push` to `main` auto-redeploys (Render on backend changes, Vercel on frontend changes).

### Keeping market data fresh
`SkillStat` auto-populates on first Insights load. For fresh data, schedule a daily job:
```bash
python manage.py refresh_skill_stats --limit 80
```

### Post-deploy checklist
- [ ] `REACT_APP_API_URL` points at the real backend (`…/api`)
- [ ] Backend `CORS_ALLOWED_ORIGINS` / `CSRF_TRUSTED_ORIGINS` include the Vercel domain
- [ ] `DJANGO_DEBUG=False` and a real `DJANGO_SECRET_KEY`
- [ ] `migrate` has run (apps: `accounts`, `resumes`, `jobs`)
- [ ] (optional) `refresh_skill_stats` scheduled

> ⚠️ Free Render instances sleep after ~15 min idle — the first request after sleep can take ~50s (cold start).

---

## 10 — Roadmap

### ✅ Built
- **Core:** resume analysis (Gemini + offline), in-place fixes, ATS PDF export, job aggregation (5+ free boards) + skill ranking.
- **Skill intelligence:** #5 market-truth pricing, #2 reverse matching, salary explorer.
- **Resume quality:** #6 dual-lens score (with conflict detection), #3 evidence-based metric prompts, #4 version history + diff.
- **Data seeds:** outcome tracker (funnel + per-skill conversion), skill verification, salary capture, public skill profile.
- **UX:** space-grade dark theme, animated background, per-feature icons, count-up stats, consistent auth.

### 🌱 Tier 1 — seeds collecting data now
The three seeds deliver single-user value today **and** accumulate the datasets that unlock Tier 2.

### ⏳ Tier 2 — unlocks once seeds have volume
- **Pre-apply verdict** — honest odds before you apply.
- **Rejection autopsy** — infer likely rejection reasons from patterns.
- **Peer benchmarking** — "people with your skills who got hired added X".
- **Outcome-tied advice** — "what actually got people like you hired".

### 🚀 Tier 3 — needs scale / capital / partnerships
- Reverse marketplace (employers query verified candidates).
- Employer-side truth API (sell verified skill signals, B2B).
- AI apply-and-negotiate agent.
- Guaranteed-outcome learning paths with partners.

---

## 11 — Known Limitations

- **Salaries are sparse** from free listings; member-reported salaries are the richer long-term source. Demand % is always solid.
- **Skill vocabulary** is a curated catalogue (`parsing.SKILL_KEYWORDS`); the matcher excludes `&`/`-` boundaries to avoid false positives (e.g. `R&D`). Re-run `refresh_skill_stats` after any vocab change.
- **Gemini free tier** can rate-limit/break at any time — by design everything falls back to the offline analyser.
- **Free hosting cold starts** — Render free tier sleeps after inactivity; first request after sleep is slow.

---

*Granular per-topic docs live in [`./docs/`](./docs/). This file is the single consolidated reference.*
