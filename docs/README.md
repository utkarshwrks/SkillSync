# SkillSync — Documentation

> Resume intelligence & skill-based job matching. Upload a resume, get a quality
> score plus targeted improvements and an ATS-friendly rewrite, then discover
> jobs ranked to your skills — and build a verified, data-backed career profile.
> **All using free Python libraries (no paid APIs required).**

This is the complete documentation for the project. Start here.

## Table of contents

| Doc | What's inside |
|-----|---------------|
| [01 — Overview & Strategy](./01-overview.md) | What SkillSync is, who it's for, the product thesis and competitive moat |
| [02 — Architecture](./02-architecture.md) | Tech stack, repo layout, request lifecycle, design principles |
| [03 — Features](./03-features.md) | Every feature explained, end to end |
| [04 — API Reference](./04-api-reference.md) | Every endpoint: method, auth, params, responses |
| [05 — Data Models](./05-data-models.md) | All Django models and their relationships |
| [06 — Frontend](./06-frontend.md) | Pages, components, routing, design system, animations |
| [07 — Setup & Running](./07-setup-and-running.md) | Install, configure, run locally, troubleshooting |
| [08 — Deployment](./08-deployment.md) | Deploying frontend (Vercel) and backend |
| [09 — Roadmap](./09-roadmap.md) | What's built, what's seeded, what's next |

## TL;DR

- **Backend:** Django 5 + Django REST Framework (token auth), SQLite by default.
- **Frontend:** React 18 + React Router + Tailwind CSS + Framer Motion.
- **AI:** Google Gemini free tier (optional) with a built-in **offline analyser fallback** — the app fully works without any API key.
- **Jobs:** aggregated live from Remotive, Jobicy, RemoteOK, Arbeitnow & Himalayas (all free).
- **Design:** dark, web3-grade UI — animated aurora background, glass cards, gradient accents, motion throughout.

## The one-line thesis

Competitors optimise the **résumé** (a lossy artifact). SkillSync is building the
layer underneath it — **verified skills, real outcomes, and live market truth** —
so the résumé becomes a disposable render of a richer, queryable profile. See
[Overview & Strategy](./01-overview.md).
