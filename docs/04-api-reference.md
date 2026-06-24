# 04 — API Reference

Base URL: `http://127.0.0.1:8000/api` (configurable via `REACT_APP_API_URL`).

**Auth:** most endpoints require a token header:
```
Authorization: Token <your-token>
```
Tokens are returned by `register` / `login`. Endpoints marked **Public** need no token.

---

## Health

### `GET /api/health/` — Public
Returns `{"status": "ok", "service": "skillsync-api"}`.

---

## Auth & profile (`/api/auth/`)

### `POST /api/auth/register/` — Public
Body: `{ username, email, password, confirm_password, phone? }`
→ `201 { token, user }`

### `POST /api/auth/login/` — Public
Body: `{ username, password }` → `200 { token, user }` · `401` on bad credentials.

### `POST /api/auth/logout/`
Deletes the user's token. → `200 { detail }`

### `GET /api/auth/me/`
Returns the current user (incl. nested `profile`).

### `PATCH /api/auth/me/`
Body: any of `first_name, last_name, email, phone, headline, bio, github, linkedin`
→ updated user.

### `POST /api/auth/verify-skills/`
Body: `{ url }` (GitHub profile or portfolio URL). Detects evidenced skills,
stores the verified set on the profile.
→ `200 { verified_skills, detected, source_type, verified_at }` · `400` on fetch failure.

### `GET /api/auth/profile/<username>/` — Public
Shareable skill profile. **Never** returns resume text.
→ `200 { username, name, joined, skill_count, skills:[{name, share, avg_salary, verified}], verified_count, verification_source }`
· `404` if user not found.

---

## Resumes (`/api/resumes/`)

### `GET /api/resumes/`
List the current user's resumes (each enriched with analysis fields).

### `POST /api/resumes/upload/`
Multipart form, field `resume` (or `file`). Max 5 MB; PDF/DOCX/TXT.
→ `201` resume object: `{ id, filename, created_at, skills, summary, score, suggestions, fixes, improved_resume, original_text, content, source }`
· `400` on bad/empty/oversized file.

### `GET /api/resumes/<id>/`
Single resume (owner only). `404` otherwise.

### `PATCH /api/resumes/<id>/`
Body: `{ content }` — saves the user's edited working copy.

### `GET /api/resumes/templates/`
→ `{ templates: [{ id, label }, ...] }`

### `POST /api/resumes/<id>/export/`
Body: `{ template?, name?, contact?, content? }` → **PDF** (`application/pdf`).

### `GET /api/resumes/<id>/quality/`
Dual-lens quality report (offline).
→ `{ ats_score, recruiter_score, ats_notes:[], recruiter_notes:[], conflicts:[], metric_prompts:[{bullet, question}] }`

### `GET /api/resumes/<id>/versions/`
List saved versions: `[{ id, label, content, tailored_for, created_at }]`

### `POST /api/resumes/<id>/versions/`
Body: `{ label?, tailored_for?, content? }` (defaults to current working copy).
→ `201` version object.

### `GET /api/resumes/<id>/versions/diff/?a=<id>&b=<id>`
`a` required (version id); `b` optional (omit → compares against current content).
→ `{ from, to, unified, lines:[{type:"add"|"remove"|"context", text}] }`
· `400` if `a` missing.

---

## Jobs & market (`/api/jobs/`)

### `GET /api/jobs/?q=<query>`
Search all free boards; ranked by resume skills if available.
→ `{ query, count, skills_used, results:[job...], source_errors }`

A `job` looks like:
`{ title, company, location, url, source, tags:[], description, salary_text, match_score, matched_skills:[] }`

### `GET /api/jobs/recommended/`
Jobs tailored to the user's latest resume skills.

### `GET /api/jobs/skill-stats/`
Market-truth pricing. Auto-populates on first call if empty.
→ `{ top_skills:[{name, share, job_count, sample_size, avg_salary}], your_skills:[...], missing_in_demand:[...], updated_at }`

### `GET /api/jobs/reverse-match/`
"One skill away" jobs. Each result carries `missing_skills` and
`missing_skill_stats:[{name, share, avg_salary}]`.

### `GET /api/jobs/salary/`
Anonymised aggregates only; suppressed below 3 reports.
→ ready: `{ sample_size, ready:true, overall_median, overall_min, overall_max, by_skill:[{skill, median, samples}] }`
→ not ready: `{ sample_size, ready:false, detail, by_skill:[] }`

### `POST /api/jobs/salary/`
Body: `{ amount (1k–10M), role_title?, skills?, currency?, location? }` → `201`.

### `GET /api/jobs/applications/`
List the user's tracked applications.

### `POST /api/jobs/applications/`
Body: `{ title, company?, location?, url?, source?, status?, notes?, matched_skills? }`.
Duplicate `url` for the same user returns the existing row (`200`) instead of erroring.
→ `201` (or `200` if duplicate).

### `GET /api/jobs/applications/stats/`
Personal funnel + per-skill conversion.
→ `{ totals:{tracked, applied, interviews, offers, hired, ghosted}, rates:{response_rate, interview_rate, offer_rate}, skill_conversion:[{skill, applied, responded, response_rate}] }`

### `PATCH /api/jobs/applications/<id>/`
Body: any of `status, notes, ...`. Stamps `applied_at` the first time status
leaves `saved`.

### `DELETE /api/jobs/applications/<id>/`
→ `204`.

---

## Status codes

| Code | Meaning |
|------|---------|
| 200 / 201 / 204 | success |
| 400 | bad input (validation) |
| 401 | missing/invalid token → client logs you out |
| 404 | not found or not owned by you |
