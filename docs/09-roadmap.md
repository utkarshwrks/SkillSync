# 09 — Roadmap

The product is sequenced around one principle: **capture the right data from day
one while competitors capture none.** Features are grouped into tiers by what
they depend on.

## ✅ Built

**Core**
- Resume analysis (Gemini + offline fallback), in-place fixes, ATS PDF export
- Job aggregation (5 free boards) + skill-based ranking

**Skill intelligence (moat)**
- #5 Market-truth skill pricing
- #2 Reverse matching ("one skill away")
- Salary explorer (listing-based + member-reported)

**Resume quality**
- #6 Dual-lens ATS + recruiter score (with conflict detection)
- #3 Evidence-based metric prompts
- #4 Version history + diff

**Career profile & data seeds**
- Seed 1 — Outcome-capture tracker (funnel + per-skill conversion)
- Seed 2 — Skill verification (GitHub/portfolio → verified badges)
- Seed 3 — Salary capture (anonymous real offers)
- Public shareable skill profile

**UX**
- Web3-grade dark theme, animated aurora background, icons per feature,
  motion/transitions, count-up stats, decluttered dashboard tabs
- Consistent auth (fixed half-logged-in bug)

## 🌱 Tier 1 — seeds collecting data now
The three seeds above deliver single-user value today **and** accumulate the
datasets that unlock Tier 2. Nothing else to do here but grow usage.

## ⏳ Tier 2 — unlocks once seeds have enough data
These are buildable on the same data the seeds capture, once there's volume:
- **Pre-apply verdict** — honest odds before you apply (needs outcome data)
- **Rejection autopsy** — infer likely rejection reasons from patterns
- **Peer benchmarking** — "people with your skills who got hired added X"
- **Outcome-tied advice** — "what actually got people like you hired"

## 🚀 Tier 3 — needs scale / capital / partnerships
- **Reverse marketplace** — verified candidates, employers query you
- **Employer-side truth API** — sell verified skill signals to recruiters (B2B)
- **AI apply-and-negotiate agent**
- **Guaranteed-outcome learning paths** with partners

## Known limitations / data-quality notes

- **Salaries are sparse** from free listings; member-reported salaries are the
  richer long-term source. Demand % is always solid.
- **Skill vocabulary** is a curated catalogue (`parsing.SKILL_KEYWORDS`); the
  matcher excludes `&`/`-` boundaries to avoid false positives (e.g. `R&D`).
  Re-run `refresh_skill_stats` after any vocab change.
- **Gemini free tier** can rate-limit/break at any time — by design, everything
  falls back to the offline analyser.

## "If a billion-dollar company launched tomorrow"

They would **not** build a better résumé editor. They'd build the **verified
professional-identity + outcome graph** that makes the résumé obsolete: a
queryable verified skill identity, a two-sided liquidity engine (employers query
candidates), and a proprietary outcome dataset no incumbent has — because their
business models never captured it. SkillSync's seeds are the first bricks of
exactly that.
