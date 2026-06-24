# 06 — Frontend

React 18 SPA, React Router v6, Tailwind CSS, Framer Motion, Axios.

## Routing (`src/App.js`)

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

Protected routes are wrapped in `ProtectedRoute`, which waits for auth to load
then redirects to `/login` if there's no user. `AnimatedBackground` renders once,
behind everything.

## Pages

- **Landing** — hero + feature grid (auth-aware CTAs: "Analyse my resume" when
  logged out, "Go to my dashboard" when logged in), steps, final CTA.
- **Auth** — combined login/register with mode toggle.
- **Dashboard** — upload + history sidebar; analysis column with an assessment
  card and **tabs**: Fixes · Quality · Editor · Export.
- **Jobs** — Recommended/Search tabs; job cards with a "+ Track" button.
- **Insights** — tabs: Skill pricing · One skill away · Salary explorer
  (with animated tab transitions).
- **Tracker** — funnel stats (animated counters) + Kanban columns + per-skill
  conversion bars.
- **Profile** — edit profile, skill verification, public-profile share link.
- **PublicProfile** — read-only shareable skill profile with verified badges.

## Components

| Component | Purpose |
|-----------|---------|
| `Navbar` | top nav with feature icons; mobile menu |
| `Footer` | site footer |
| `AnimatedBackground` | fixed aurora blobs + panning grid + vignette |
| `Icon` | inline-SVG icon set (one per feature) |
| `JobCard` | a single job listing + "+ Track" action |
| `QualityPanel` | dual-lens score, conflicts, metric prompts |
| `VersionsPanel` | save/list/diff resume versions |
| `Reveal` | scroll-into-view fade/stagger wrapper |
| `CountUp` | animated number counter (on scroll into view) |
| `Loader` | loading spinner |
| `ProtectedRoute` | auth gate |

## State & data

- **`AuthContext`** — holds `user`, `loading`, and `login/register/logout`.
  On mount, validates the stored token via `/auth/me/`. Listens for
  `skillsync:unauthorized` to reset the user in lockstep with the token.
- **`api/client.js`** — Axios instance (60s timeout). Request interceptor
  attaches `Authorization: Token …` from `localStorage` (`skillsync_token`).
  Response interceptor: on `401`, clears the token and dispatches
  `skillsync:unauthorized`.

> **Auth bug history:** the client used to clear the token on 401 but leave the
> in-memory user set → a "half-logged-in" state where the next action bounced you
> to login. Fixed by resetting token + user together via the event.

## Design system

Defined in `tailwind.config.js` + `src/index.css`.

- **Palette** — deep `#04050a` canvas; `brand` indigo→violet, `aqua` cyan,
  `plum` violet accents; glass surfaces.
- **Fonts** — Inter (body), Sora (display), mono for stats.
- **Component classes** — `.card` (glass, hover lift + glow), `.card-glow`
  (rotating gradient-ring border), `.btn-primary` (gradient + hover shimmer
  sweep), `.btn-ghost`, `.input`, `.chip`, `.gradient-text` (animated),
  `.stat-num` (tabular mono), `.icon-badge`, `.link-underline`.
- **Animations** — `aurora-a/b`, `grid-pan`, `gradient-move`, `glow-pulse`,
  `spin-slow`, `rise-in`. All ambient motion is disabled under
  `prefers-reduced-motion`.
- **Motion primitives** — `src/lib/motion.js` (`fadeUp`, `stagger`, `scaleIn`)
  used via the `Reveal` component.

## Important dev note

`tailwind.config.js`, `src/index.css`, and `.env` are **read once at dev-server
start** — they do **not** hot-reload. After changing any of them, restart
`npm start`. Regular component (`.js`) edits hot-reload fine.
