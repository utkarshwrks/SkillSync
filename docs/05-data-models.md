# 05 — Data Models

All models use Django's default `BigAutoField` primary key. SQLite by default.

## accounts

### `Profile` (OneToOne → `User`)
Lightweight profile attached to the built-in Django user.

| Field | Type | Notes |
|-------|------|-------|
| `user` | OneToOne(User) | `related_name="profile"` |
| `phone` | char(20) | |
| `headline` | char(120) | |
| `bio` | text | |
| `github` | url | |
| `linkedin` | url | |
| `verified_skills` | json (list) | skills proven via GitHub/portfolio |
| `verification_source` | url | the URL last verified from |
| `verified_at` | datetime (nullable) | |
| `updated_at` | datetime | auto |

## resumes

### `ResumeAnalysis`
The cache/dedup layer — **one row per unique resume**, keyed by content hash.
Identical bytes → analysed once, ever.

| Field | Type | Notes |
|-------|------|-------|
| `content_hash` | char(64), unique, indexed | sha256 of the file bytes |
| `extracted_text` | text | |
| `skills` | json (list) | detected skills |
| `summary` | text | |
| `score` | small int | 0–100 |
| `suggestions` | json (list) | |
| `fixes` | json (list) | `[{original, improved, reason}]` |
| `improved_resume` | text | full rewrite |
| `source` | char(20) | `"gemini"` or `"offline"` |
| `created_at` | datetime | |

### `Resume` (FK → User, FK → ResumeAnalysis)
A user's upload event pointing at the shared analysis for its content.

| Field | Type | Notes |
|-------|------|-------|
| `user` | FK(User) | `related_name="resumes"` |
| `analysis` | FK(ResumeAnalysis) | `related_name="uploads"` |
| `filename` | char(255) | |
| `edited_content` | text | per-user working copy of the resume |
| `created_at` | datetime | ordered `-created_at` |

### `ResumeVersion` (FK → Resume)
A saved snapshot of a resume's content for diffing.

| Field | Type | Notes |
|-------|------|-------|
| `resume` | FK(Resume) | `related_name="versions"` |
| `label` | char(120) | e.g. "Backend roles" |
| `content` | text | the snapshot |
| `tailored_for` | char(255) | optional job/company |
| `created_at` | datetime | ordered `-created_at` |

## jobs

> Job **listings** are stateless (fetched live). Only derived data is persisted.

### `JobApplication` (FK → User)
A tracked application — the seed of the outcome data flywheel.

| Field | Type | Notes |
|-------|------|-------|
| `user` | FK(User) | `related_name="applications"` |
| `title` / `company` / `location` / `url` / `source` | char/url | copied from the live listing |
| `status` | char(20) | `saved, applied, interview, offer, hired, rejected, ghosted` |
| `notes` | text | |
| `matched_skills` | json (list) | skills that matched when saved → ties outcomes to skills |
| `applied_at` | datetime (nullable) | stamped when status first leaves `saved` |
| `created_at` / `updated_at` | datetime | ordered `-updated_at` |

**Constraint:** unique `(user, url)` — no duplicate tracking of the same posting.

### `SkillStat`
Aggregated demand/pay per skill, recomputed from the live feed by
`refresh_skill_stats`. One row per skill.

| Field | Type | Notes |
|-------|------|-------|
| `name` | char(100), unique, indexed | |
| `job_count` | uint | sampled jobs mentioning the skill |
| `sample_size` | uint | total sampled jobs |
| `share` | float | `job_count / sample_size * 100` |
| `avg_salary` | uint (nullable) | best-effort annual USD |
| `salary_samples` | uint | listings that had a parseable salary |
| `updated_at` | datetime | ordered `-share` |

### `SalaryReport` (FK → User)
A user-submitted real offer. **Rows are never exposed** — only aggregates.

| Field | Type | Notes |
|-------|------|-------|
| `user` | FK(User) | for dedup/abuse control only; never returned |
| `role_title` | char(160) | |
| `skills` | json (list) | tied to the user's skills at submit time |
| `amount` | uint | annual |
| `currency` | char(8) | default `USD` |
| `location` | char(160) | |
| `created_at` | datetime | ordered `-created_at` |

## Relationship diagram

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
