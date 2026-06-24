"""Score and rank aggregated jobs against a user's resume skills."""

from __future__ import annotations


def score_job(job: dict, skills: list) -> int:
    if not skills:
        return 0
    haystack = " ".join([
        job.get("title", ""),
        job.get("description", ""),
        " ".join(job.get("tags", [])),
    ]).lower()
    matched = [s for s in skills if s.lower() in haystack]
    # Title matches are worth more than description matches.
    title = job.get("title", "").lower()
    bonus = sum(2 for s in skills if s.lower() in title)
    return len(matched) * 3 + bonus, matched


def rank(jobs: list, skills: list) -> list:
    ranked = []
    for job in jobs:
        score, matched = score_job(job, skills)
        enriched = dict(job)
        enriched["match_score"] = score
        enriched["matched_skills"] = matched
        ranked.append(enriched)
    ranked.sort(key=lambda j: j["match_score"], reverse=True)
    return ranked
