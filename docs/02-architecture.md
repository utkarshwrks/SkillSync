# 02 — Architecture

## Tech stack

| Layer | Technology |
|-------|-----------|
| Backend | Django 5, Django REST Framework, token auth |
| Database | SQLite (default), Postgres-ready via `dj_database_url` |
| Static files | WhiteNoise (compressed manifest storage) |
| AI (optional) | Google Gemini free tier (`google-generativeai`) |
| Resume parsing | `pdfplumber` (PDF), `python-docx` (DOCX), plain text |
| PDF export | server-side PDF generation (`pdfgen` service) |
| Jobs | live HTTP aggregation (`requests`, concurrent) |
| Frontend | React 18, React Router v6, Tailwind CSS, Framer Motion, Axios |
| Deploy | Vercel (frontend), any WSGI host (backend) |

## Repository layout

```
SkillSync/
├── .env.example              # documents every environment variable
├── vercel.json               # deploys the React frontend
├── docs/                     # ← this documentation
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
│   └── build.sh              # collectstatic + migrate
└── frontend/
    └── src/
        ├── api/client.js     # axios client (token interceptor, 401 handling)
        ├── context/AuthContext.js
        ├── lib/motion.js     # shared Framer Motion variants
        ├── components/       # Navbar, Footer, JobCard, Icon, panels, etc.
        └── pages/            # Landing, Auth, Dashboard, Jobs, Insights, Tracker, Profile, PublicProfile
```

## Backend app responsibilities

- **`accounts`** — register/login/logout, current user (`me`), profile editing,
  skill verification, and the public profile endpoint.
- **`resumes`** — upload + dedup (content-hash cache), parsing, AI/offline
  analysis, in-place fixes, dual-lens quality report, version snapshots + diff,
  and PDF export.
- **`jobs`** — live job search & recommendations, market skill stats, reverse
  matching, salary capture/aggregation, and the application tracker + funnel.

## Request lifecycle (example: upload a resume)

```
React (Dashboard) ──POST /api/resumes/upload/ (multipart + token)──▶ Django
                                                                      │
                          parsing.extract_text / extract_skills ◀─────┤
                          ai.analyze_resume (Gemini OR offline) ◀──────┤
                          cache by content hash (ResumeAnalysis) ◀─────┤
                          create Resume row for the user ◀─────────────┤
React ◀──────────────── JSON (score, summary, fixes, skills, ...) ─────┘
```

## Key design choices

- **Content-hash caching** (`ResumeAnalysis`): identical resume bytes → analysed
  once, ever. Multiple uploads (even by different users) reference one analysis,
  so Gemini is never called twice for the same content.
- **Stateless job listings**: listings are fetched live, never stored. Only the
  *derived* data worth keeping is persisted (`SkillStat`, `JobApplication`,
  `SalaryReport`).
- **Shared skill vocabulary**: `resumes/services/parsing.py` defines the skill
  catalogue and matcher used by *both* resume parsing and job-side skill
  detection, so they're always consistent.
- **Graceful degradation everywhere**: external calls (Gemini, job boards,
  GitHub) are wrapped; failures return empty/fallback results, never 500s.

## Authentication

- DRF **TokenAuthentication** (+ SessionAuthentication for the browsable API).
- Token stored in `localStorage` as `skillsync_token`, attached to every request
  by the Axios interceptor.
- On any `401`, the client clears the token **and** fires a
  `skillsync:unauthorized` event so `AuthContext` resets the user in lockstep —
  preventing the "half-logged-in" state. See [Frontend](./06-frontend.md).
