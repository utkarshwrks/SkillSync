"""Market intelligence computed from the FREE live job feed.

Two features live here, and neither needs a paid API or Gemini:

  - Skill pricing (#5): how often each skill appears across live listings and
    its average salary -> stored in the SkillStat table.
  - Reverse matching (#2): jobs the user could qualify for by learning just
    one more skill, with the payoff (demand + pay) of that missing skill.

Everything is best-effort. If the feed is down, we simply keep whatever
SkillStat rows we already have.
"""

from __future__ import annotations

import re

from resumes.services.parsing import extract_skills

from . import sources


def detect_skills(job: dict) -> list:
    """Skills from our catalogue that this job mentions.

    Reuses the resume-side matcher so job skills and resume skills are
    detected identically (same vocabulary, same word-boundary rules).
    """
    blob = " ".join([
        job.get("title", ""),
        job.get("description", ""),
        " ".join(job.get("tags", [])),
    ])
    return extract_skills(blob)


# --- Salary parsing ---------------------------------------------------------
# Best-effort: free listings rarely include salary, and formats vary wildly.
# We look for things like "$120k", "$120,000", "$100k - $150k" and take the
# midpoint of any range. Values are treated as annual USD.
_SALARY_RE = re.compile(
    r"\$\s?(\d{2,3}(?:,\d{3})?|\d{2,3})\s?(k|,000)?"
    r"(?:\s?[-–to]+\s?\$?\s?(\d{2,3}(?:,\d{3})?|\d{2,3})\s?(k|,000)?)?",
    re.IGNORECASE,
)


def _to_annual(num: str, unit: str | None) -> int | None:
    """Turn a matched ('120', 'k') pair into an annual figure, or None."""
    value = int(num.replace(",", ""))
    if unit and unit.lower() == "k":
        value *= 1000
    # Reject anything outside a plausible annual-salary band so we don't pick
    # up hourly rates, equity, or random dollar amounts in the text.
    return value if 10_000 <= value <= 1_000_000 else None


def parse_salary(text: str) -> int | None:
    """Extract a single representative annual salary from free text."""
    for m in _SALARY_RE.finditer(text or ""):
        low = _to_annual(m.group(1), m.group(2))
        high = _to_annual(m.group(3), m.group(4)) if m.group(3) else None
        if low and high:
            return (low + high) // 2
        if low:
            return low
    return None


# --- Stats computation ------------------------------------------------------
def compute_skill_stats(jobs: list) -> dict:
    """Aggregate per-skill demand + average salary from a batch of jobs.

    Returns {skill: {job_count, salary_total, salary_samples}} plus the
    total sample size under the special key "__sample__".
    """
    stats: dict = {}
    sample = 0
    for job in jobs:
        skills = detect_skills(job)
        if not skills:
            continue
        sample += 1
        salary = parse_salary(
            " ".join([
                job.get("title", ""),
                job.get("salary_text", ""),
                job.get("description", ""),
            ])
        )
        for skill in skills:
            row = stats.setdefault(
                skill, {"job_count": 0, "salary_total": 0, "salary_samples": 0}
            )
            row["job_count"] += 1
            if salary:
                row["salary_total"] += salary
                row["salary_samples"] += 1
    stats["__sample__"] = sample
    return stats


def refresh_skill_stats(limit_per_source: int = 50) -> dict:
    """Fetch the live feed, recompute stats, and upsert SkillStat rows.

    Safe to call from a view or a cron command. Returns a small summary.
    On a total feed failure it leaves existing rows untouched.
    """
    # Local import so the module stays importable even mid-migration.
    from jobs.models import SkillStat

    jobs, errors = sources.fetch_all("", limit_per_source=limit_per_source)
    if not jobs:
        return {"updated": 0, "sample": 0, "errors": errors}

    stats = compute_skill_stats(jobs)
    sample = stats.pop("__sample__", 0)
    if sample == 0:
        return {"updated": 0, "sample": 0, "errors": errors}

    updated = 0
    for skill, row in stats.items():
        avg = (
            row["salary_total"] // row["salary_samples"]
            if row["salary_samples"]
            else None
        )
        SkillStat.objects.update_or_create(
            name=skill,
            defaults={
                "job_count": row["job_count"],
                "sample_size": sample,
                "share": round(row["job_count"] / sample * 100, 1),
                "avg_salary": avg,
                "salary_samples": row["salary_samples"],
            },
        )
        updated += 1
    return {"updated": updated, "sample": sample, "errors": errors}


# --- Reverse matching (#2): "you're one skill away" -------------------------
def reverse_match(jobs: list, user_skills: list, max_missing: int = 1) -> list:
    """Jobs the user could qualify for by learning a few more skills.

    For each job we detect its catalogue skills, then compare against the
    user's skills. We keep jobs where the user already matches at least one
    skill and is missing no more than `max_missing` -> the "almost there"
    opportunities. Each result lists the missing skill(s) so the frontend can
    show the payoff (demand + pay) of closing that gap.
    """
    have = {s.lower() for s in user_skills}
    out = []
    for job in jobs:
        required = detect_skills(job)
        if not required:
            continue
        matched = [s for s in required if s.lower() in have]
        missing = [s for s in required if s.lower() not in have]
        # Already-qualified jobs (missing == 0) belong to normal matching,
        # not the "one skill away" view; skip those and the hopeless ones.
        if not matched or not (0 < len(missing) <= max_missing):
            continue
        enriched = dict(job)
        enriched["matched_skills"] = matched
        enriched["missing_skills"] = missing
        out.append(enriched)
    # Most-qualified first (most matched skills, fewest missing).
    out.sort(key=lambda j: (len(j["matched_skills"]), -len(j["missing_skills"])),
             reverse=True)
    return out
