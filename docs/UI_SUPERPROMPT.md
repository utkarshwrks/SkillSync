# SkillSync — God-Level UI Super Prompt

> Paste everything inside the fenced block below into Claude (Claude Code or a
> long-context chat). It is engineered to produce a complete, production-grade,
> multi-screen UI system for SkillSync — a large, multi-phase build.

---

```
ROLE
You are a world-class product designer + senior front-end engineer (ex-Linear,
Stripe, Vercel, Attio). You ship pixel-perfect, accessible, motion-rich React
interfaces that feel like a funded Series-A product. You write complete,
production-ready code — no placeholders, no "TODO", no truncation.

MISSION
Design and implement the COMPLETE front-end UI system for "SkillSync", an
AI-powered Career Intelligence Platform. Deliver every screen, every state, a
reusable component library, a design-token system, and elegant motion — to a
standard that would pass design review at a top-tier SaaS company. This is a
large, multi-phase task; do not stop until the whole system is built and the
production build passes.

PRODUCT (what SkillSync does — align every screen to this, it is NOT a resume tool)
SkillSync is "Career Intelligence, not another resume tool." Core jobs:
1. Resume Intelligence — upload a resume; dual-lens score (ATS + recruiter),
   evidence-based fixes (asks the user for their real metrics, never invents
   them), in-place editing, ATS-friendly PDF export.
2. Skill Verification — prove skills from GitHub/portfolio → verified badges.
3. Market Demand — per-skill demand (% of live listings) + average pay,
   computed from real job feeds (incl. India via Adzuna).
4. Salary Intelligence — listing-based + anonymous member-reported real offers.
5. Job Matching — live listings from Remotive, RemoteOK, Jobicy, Arbeitnow,
   Himalayas, Adzuna (India), The Muse; ranked to the user's skills; plus
   "reverse match" = jobs you're ONE skill away from.
6. Application Tracking — pipeline (saved→applied→interview→offer→hired, plus
   rejected/ghosted) + a personal funnel (response/interview/offer rates) and
   per-skill conversion.
7. Public Skill Profile — shareable /u/<username> with verified badges + live
   market demand (never exposes resume text).
8. The Outcome Data Flywheel — every application + outcome feeds back to make
   recommendations sharper. This is the proprietary moat; feature it.

TECH CONSTRAINTS (hard requirements)
- React 18 + React Router v6 + Tailwind CSS + Framer Motion ONLY.
- NO Three.js, NO WebGL, NO canvas 3D, NO chart libraries (build charts with
  SVG + Framer Motion), NO UI kits (no MUI/AntD/Chakra). Heroicons-style inline
  SVGs only.
- All animations GPU-friendly (animate transform/opacity/SVG path only).
- Mobile-first, fully responsive (360px → 1440px+). Fast first paint.
- Respect prefers-reduced-motion (disable ambient motion).
- Token auth: Authorization: "Token <key>"; 401 must log out cleanly (clear
  token AND user state together — never leave a half-logged-in state).

DESIGN LANGUAGE (charcoal + violet, premium, restrained)
- Feel: elegant, intelligent, trustworthy, minimal-yet-memorable. Think Linear/
  Attio/Arc/Notion. NOT crypto, NOT cyberpunk, NOT neon, NOT gaming, NOT
  glassmorphism-heavy, NOT student-portfolio.
- Background: charcoal #0A0A0A with soft layered gradients, large slow blurred
  orbs (20–40s, barely noticeable), subtle noise/grain, soft radial top light,
  generous whitespace. CSS-only ambient background.
- Color tokens:
  bg #0A0A0A · card #111111 · text #FAFAFA · muted #A1A1AA
  primary violet #7C3AED · indigo #6366F1 · purple #A855F7 · success #22C55E
  Gradients: violet→indigo→purple, used sparingly. Avoid bright cyan.
- Surfaces: solid #111 panels with hairline borders (white/6%) + refined soft
  shadows + 1px inset top highlight. Light depth, clean layering, floating
  sections. Avoid excessive glow/neon outlines.
- Typography: Sora (display) + Inter (body). Large editorial headlines, tight
  tracking, perfect readability, strong hierarchy, tabular-mono for numbers.
- Radius: 2xl on cards, xl on controls. Motion: smooth fades, soft scale,
  staggered reveals, subtle parallax, premium hover. No bounce/flash/spin-spam.

SCREENS TO DESIGN & BUILD (every one — full states for each)
For EACH screen deliver: desktop + mobile layouts, loading skeletons, empty
states, error states, success/toast feedback, hover/focus/active states, and
entrance motion.

1. Landing (marketing) — hero with an animated "Career Intelligence Flow"
   (Resume→Skills→Verification→Market→Matching→Applications→Outcomes, flowing
   connections + traveling data pulse, no fake metrics), trusted-sources strip,
   Career Intelligence Platform bento grid, "Why job search is broken"
   comparison (resume tools=keywords, boards=volume, SkillSync=outcomes),
   Outcome Data Flywheel (looping circular visual — the showpiece), Verified
   Skill Profile preview, FAQ, final CTA, footer.
2. Auth — combined login/register, social-proof side panel, inline validation,
   loading + error states, password rules, smooth mode toggle.
3. Onboarding — first-run flow: upload resume → confirm skills → connect GitHub
   to verify → set target role. Progress stepper, skippable, delightful.
4. Dashboard — command center. Resume score ring (count-up), dual-lens panel,
   evidence-based fixes (apply-in-place), editor, version history + diff, PDF
   export, quality re-check. Organize as tabs/sections so it's never a wall.
5. Jobs — recommended + search, location/country filter (India / Remote /
   Global), match-score chips, "+ Track" action, source badges, skeleton grid,
   empty + error states.
6. Insights (Skill Intelligence) — tabs: Skill pricing (your skills ranked by
   demand + pay, missing in-demand skills), One-skill-away (reverse match with
   payoff), Salary explorer (listing-based + member offers + contribute form).
   Animated SVG charts: radial, animated bars, area trends.
7. Tracker — Kanban pipeline + a personal funnel (animated counters) +
   per-skill conversion bars + outcome logging (interview/offer/hired/ghosted).
8. Profile — edit profile, GitHub/portfolio skill verification flow with
   live result, shareable public-profile link + copy.
9. Public Profile (/u/:username) — beautiful, shareable, verified badges +
   live market demand bars; OG-ready; never shows resume text.
10. Settings — account, data/privacy, danger zone. 404 + generic error page.

SHARED SYSTEM (build as reusable components)
- Navbar (auth-aware, icons per item, mobile sheet), Footer.
- AnimatedBackground (charcoal orbs + grid + noise + radial light).
- Design primitives: Button (primary/ghost/subtle, loading, icon), Panel/Card,
  Input/Textarea/Select, Chip/Tag, Badge (verified/status), Tabs, Tooltip,
  Modal/Drawer, Toast system, Skeleton, EmptyState, Avatar, ProgressStepper.
- Data-viz: RadialScore, BarMeter, AreaTrend, Funnel, Sparkline, FlywheelLoop
  — all SVG + Framer Motion, animate-on-scroll, GPU-friendly.
- Icon set: cohesive inline-SVG library (one self-describing icon per feature).
- Motion library: shared variants (fadeUp, stagger, scaleIn) + a Reveal wrapper
  + a CountUp component.

API CONTRACT (wire the UI to these real endpoints; base = /api)
Auth: POST /auth/register, /auth/login, /auth/logout; GET/PATCH /auth/me;
  POST /auth/verify-skills {url}; GET /auth/profile/<username> (public).
Resumes: GET /resumes; POST /resumes/upload (multipart); GET/PATCH
  /resumes/<id>; GET /resumes/templates; POST /resumes/<id>/export (pdf);
  GET /resumes/<id>/quality; GET/POST /resumes/<id>/versions; GET
  /resumes/<id>/versions/diff?a=&b=.
Jobs: GET /jobs?q=; GET /jobs/recommended; GET /jobs/skill-stats; GET
  /jobs/reverse-match; GET/POST /jobs/salary; GET/POST /jobs/applications;
  GET /jobs/applications/stats; PATCH/DELETE /jobs/applications/<id>.
Design realistic loading/empty/error handling for each. Use an axios client
with a token interceptor and clean 401 handling.

ACCESSIBILITY & PERFORMANCE (non-negotiable)
- Semantic HTML, labelled controls, visible focus rings, keyboard nav, ARIA on
  custom widgets (tabs, modal, menu), color-contrast AA, alt text.
- Lazy-load routes (React.lazy + Suspense), memoize charts, avoid layout
  thrash, no heavy libraries. Target instant interactions.

DELIVERABLES & FILE STRUCTURE
- tailwind.config.js (full token system, keyframes, animations).
- src/index.css (base + component classes: .panel, .btn-*, .input, .chip, etc.).
- src/lib/motion.js (variants), src/api/client.js, src/context/AuthContext.js.
- src/components/** (every primitive + data-viz + Navbar/Footer/Background).
- src/pages/** (every screen above, with all states).
- A short DESIGN.md documenting the token system, components, and motion rules.
- Each file complete and runnable. No ellipses, no "rest of code unchanged".

WORKING METHOD (do this in order; keep going until done)
1. Restate the design system + component inventory in 1 short section.
2. Build the token system (tailwind.config + index.css + motion lib).
3. Build the shared primitives + data-viz components (with usage examples).
4. Build screens one by one (Landing first, then app screens), each with full
   states and responsive + motion. After each screen, list what's done.
5. Provide the axios client + AuthContext + routing wiring.
6. End with: how to run, a screen-by-screen checklist, and any follow-ups.
Work in large, complete chunks. Do NOT summarize instead of coding. Do NOT ask
for permission to continue — continue until the entire system is delivered.

QUALITY BAR / ACCEPTANCE CRITERIA
- Looks like a funded Series-A product (Linear/Attio/Arc tier), not a hackathon.
- Charcoal+violet system applied consistently across ALL screens.
- Every screen has loading + empty + error + success states.
- Every number animates (count-up), every section reveals on scroll, every
  card has a refined hover, all motion respects reduced-motion.
- Fully responsive 360→1440px. Production build compiles with zero errors.
- No TODOs, no placeholders, no truncated files.

Begin now with step 1, then build everything. Keep going until the full UI
system is complete.
```

---

## How to use this

- **In Claude Code (this repo):** paste the block and add: *"Apply this to my
  existing SkillSync frontend in `frontend/`, reusing my current components
  where good and upgrading the rest. Build and verify after each phase."*
- **In a fresh chat:** paste the block as-is to generate the whole system from
  scratch.
- **To force depth/length:** append *"Do not stop until every screen and state
  in the spec is implemented. If you run low on space, continue in the next
  message automatically."*

## Why this elicits a 100k-token build

It enumerates **10 screens × (desktop+mobile+4 states) + a full component
library + data-viz + tokens + docs**, forbids truncation/placeholders, and
prescribes a phased "keep going until done" method — so the model produces many
complete files instead of a single page.
```
