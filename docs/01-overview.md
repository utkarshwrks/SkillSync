# 01 — Overview & Strategy

## What is SkillSync?

SkillSync is a free, full-stack web app that helps job seekers:

1. **Understand their resume** — instant quality score, targeted fixes, and an
   ATS-friendly rewrite.
2. **Find the right jobs** — live listings aggregated from multiple free boards,
   ranked to the skills in their resume.
3. **Know their market** — real demand and pay per skill, computed from live
   listings, plus the jobs they're "one skill away" from qualifying for.
4. **Build a credible profile** — verify skills from GitHub/portfolio, track
   applications and outcomes, and share a public, data-backed skill profile.

Everything runs on free tooling. The only optional paid-ish dependency is a
**free** Google Gemini API key; without it, a deterministic offline analyser
takes over so the product never breaks.

## Who it's for

- Job seekers (especially early-career and career-switchers) who are flying
  blind through an opaque hiring process.
- Anyone who wants honest, data-backed answers to: *Is my resume good? What am I
  worth? What should I learn next? Which jobs will I actually get?*

## The problem (first principles)

The job-search market is structurally misaligned:

- **Job boards** are paid by employers, so they optimise for application
  *volume*, not candidate *success*.
- **Resume tools** sell "beat the ATS," an arms race that produces
  keyword-stuffed resumes recruiters dislike.
- **Every tool treats the résumé as the unit of work** — but the résumé is a
  lossy compression of a person's actual capability.

## The thesis & moat

> Own the **truth layer** (verified skills, real outcomes, live market
> position), and make the résumé a disposable render of it.

The durable moat is the **Outcome Data Flywheel**: most tools give advice and
never learn whether it worked. SkillSync captures the full loop —

```
resume version + skills  →  application  →  interview / rejection / hire  →  feeds back
```

— accumulating the one dataset nobody can buy: *what actually gets people hired,
right now, by skill and role.* It compounds with every user.

Three "seeds" were built to start that flywheel from day one (see
[Roadmap](./09-roadmap.md)):

1. **Outcome-capture tracker** — applications record real outcomes + per-skill
   conversion.
2. **Skill verification** — GitHub/portfolio → verified skills with a trust badge.
3. **Salary capture** — anonymous real offers → proprietary per-skill pay data.

## Design principles

1. **Degrade gracefully, always.** Every AI feature has a deterministic offline
   fallback. The Gemini free tier can break at any time and the app keeps working.
2. **No paid APIs.** Jobs, salary parsing, skill detection, scoring — all free.
3. **Capture data from day one.** Features deliver single-user value *today* while
   quietly compounding the moat for *tomorrow*.
4. **Privacy first.** User-submitted salaries are only ever served as aggregates;
   public profiles expose skills, never resume text.
