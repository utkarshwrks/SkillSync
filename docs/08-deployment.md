# 08 — Deployment

The frontend and backend deploy separately.

## Frontend → Vercel

`vercel.json` already configures the build:

```json
{
  "buildCommand": "cd frontend && npm install && npm run build",
  "outputDirectory": "frontend/build",
  "devCommand": "cd frontend && npm start",
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

Steps:
1. Push to the connected Git repo (Vercel auto-deploys), or run `vercel --prod`.
2. **Set `REACT_APP_API_URL`** in Vercel's environment variables to your deployed
   backend URL, e.g. `https://your-backend.onrender.com/api`.
   - ⚠️ The local default is `http://127.0.0.1:8000/api`, which **does not exist
     in production**. If you skip this, the deployed site can't reach the API and
     login/everything fails. This is the #1 deploy gotcha.
3. Redeploy after changing env vars.

> **Note:** local changes only appear on the deployed site **after you commit,
> push, and Vercel rebuilds.** Editing files locally does not update the live site.

## Backend → any WSGI host (Render / Railway / Fly / etc.)

Files provided:
- `backend/Procfile` — `gunicorn` entrypoint.
- `backend/build.sh` — `collectstatic` + `migrate`.
- `backend/requirements.txt` — dependencies.

Steps:
1. Create a web service pointing at `backend/`.
2. Build command: `./build.sh` (or `pip install -r requirements.txt && python manage.py collectstatic --noinput && python manage.py migrate`).
3. Start command (from `Procfile`): `gunicorn config.wsgi`.
4. Set environment variables:
   - `DJANGO_SECRET_KEY` (long random string)
   - `DJANGO_DEBUG=False`
   - `DJANGO_ALLOWED_HOSTS=your-backend-domain`
   - `CORS_ALLOWED_ORIGINS=https://your-frontend.vercel.app`
   - `CSRF_TRUSTED_ORIGINS=https://your-frontend.vercel.app`
   - `GEMINI_API_KEY` (optional)
   - `DATABASE_URL` (optional; Postgres via `dj_database_url`. Defaults to SQLite.)
5. WhiteNoise serves static files; no extra static host needed.

## Keeping market data fresh (production)

`SkillStat` auto-populates on first Insights load, but for fresh data schedule:
```bash
python manage.py refresh_skill_stats --limit 80
```
as a daily cron / scheduled job on the backend host.

## Post-deploy checklist

- [ ] `REACT_APP_API_URL` points at the real backend
- [ ] Backend `CORS_ALLOWED_ORIGINS` / `CSRF_TRUSTED_ORIGINS` include the frontend domain
- [ ] `DJANGO_DEBUG=False` and a real `DJANGO_SECRET_KEY`
- [ ] `migrate` has run (pending migrations: `jobs`, `resumes`, `accounts`)
- [ ] (optional) `refresh_skill_stats` scheduled
