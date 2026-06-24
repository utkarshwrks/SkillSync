# 03 — Features

Every feature works **with or without** a Gemini key (offline fallback) and uses
**no paid APIs**.

## Core

### Resume analysis & in-place fixes
Upload PDF/DOCX/TXT → text + skills extracted → quality score, summary,
high-level suggestions, and line-level **fixes** (original → improved). Powered
by Gemini when a key is present, otherwise a deterministic offline analyser that
detects weak/passive bullets, missing metrics, and structure.
- API: `POST /api/resumes/upload/`, `GET/PATCH /api/resumes/<id>/`
- UI: Dashboard → upload, then **Fixes** tab

### ATS-friendly PDF export
Render the improved/edited resume into a clean, templated PDF.
- API: `GET /api/resumes/templates/`, `POST /api/resumes/<id>/export/`
- UI: Dashboard → **Export** tab

### Job aggregation & skill ranking
Live listings from Remotive, Jobicy, RemoteOK, Arbeitnow & Himalayas, fetched
concurrently, de-duplicated, and ranked by how well they match your resume skills.
- API: `GET /api/jobs/`, `GET /api/jobs/recommended/`
- UI: **Jobs** page

## Skill intelligence (the moat)

### #5 — Market-truth skill pricing
Per-skill demand (% of live listings) and average salary, computed from the same
free feed. Shows *your* skills ranked by demand, in-demand skills you're missing,
and the top market skills.
- API: `GET /api/jobs/skill-stats/`; refresh via `python manage.py refresh_skill_stats`
- UI: **Insights → Skill pricing**

### #2 — Reverse matching ("one skill away")
Surfaces jobs you'd qualify for by learning **one** more skill, with the payoff
(demand % + salary) of that missing skill.
- API: `GET /api/jobs/reverse-match/`
- UI: **Insights → One skill away**

### Salary explorer
Listing-based pay ranking **plus** member-reported real offers (see Salary
capture below).
- UI: **Insights → Salary explorer**

## Resume quality

### #6 — Dual-lens ATS + recruiter score
Scores the resume on **two** axes — ATS parseability/keyword coverage **and**
human recruiter readability — and flags conflicts (e.g. keyword stuffing that
helps ATS but reads as spammy). Fully offline.
- API: `GET /api/resumes/<id>/quality/`
- UI: Dashboard → **Quality** tab

### #3 — Evidence-based metric prompts
Finds bullets lacking a measurable result and asks a targeted question for *your*
real number — never invents metrics.
- Included in the quality report; UI: Dashboard → **Quality** tab

### #4 — Resume version history & diff
Snapshot tailored copies of a resume, label them, and view a line-level diff
between versions (or a version vs the current working copy).
- API: `GET/POST /api/resumes/<id>/versions/`, `GET /api/resumes/<id>/versions/diff/`
- UI: Dashboard → **Editor** tab

## Career profile & loop-closing (the data seeds)

### Seed 1 — Outcome-capture tracker
Track every job through `saved → applied → interview → offer → hired`, plus
`rejected`/`ghosted`. Computes a **personal funnel** (response/interview/offer
rates) and **per-skill conversion** — the first brick of the outcome flywheel.
- API: `GET/POST /api/jobs/applications/`, `PATCH/DELETE /api/jobs/applications/<id>/`,
  `GET /api/jobs/applications/stats/`
- UI: **Tracker** page; "+ Track" button on job cards

### Seed 2 — Skill verification
Paste a GitHub profile or portfolio URL → confirms which claimed skills are
backed by real work → ✓ badge on the public profile. No API key needed.
- API: `POST /api/auth/verify-skills/`
- UI: **Profile → Verify your skills**

### Seed 3 — Salary capture
Members log real offers anonymously, building proprietary per-skill pay data.
Only aggregates are ever returned, and buckets below a minimum sample size are
suppressed.
- API: `GET/POST /api/jobs/salary/`
- UI: **Insights → Salary explorer → Add anonymously**

### Public skill profile
A shareable `/u/<username>` page showing skills (with verified badges + live
market demand) — never resume text.
- API: `GET /api/auth/profile/<username>/`
- UI: `/u/<username>`; share link on the Profile page
