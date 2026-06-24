"""Aggregate job/internship listings from several FREE sources (no paid APIs).

Sources are queried concurrently and each is wrapped so a single failure
(network, layout change, rate limit) degrades gracefully. Every source returns
a list of normalised dicts with the same shape.
"""

from __future__ import annotations

import concurrent.futures
import re

import requests

TIMEOUT = 12
HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 "
        "(KHTML, like Gecko) Chrome/124.0 Safari/537.36"
    ),
    "Accept": "application/json",
}


def _normalise(*, title, company, location, url, source, tags=None, description=""):
    return {
        "title": (title or "").strip() or "Untitled role",
        "company": (company or "").strip() or "Unknown",
        "location": (location or "").strip() or "Remote",
        "url": (url or "").strip(),
        "source": source,
        "tags": [str(t).strip() for t in (tags or []) if str(t).strip()][:8],
        "description": _clean(description)[:280],
        # Salary often appears deeper in the description than the 280-char
        # preview. Keep a small snippet around any "$" so salary parsing
        # (market.parse_salary) still works without bloating the payload.
        "salary_text": _salary_snippet(_clean(description)),
    }


def _clean(html: str) -> str:
    return re.sub(r"\s+", " ", re.sub(r"<[^>]+>", " ", html or "")).replace("&amp;", "&").strip()


def _salary_snippet(text: str, width: int = 60) -> str:
    """Return text around the first '$' so salary survives description clipping."""
    idx = text.find("$")
    if idx == -1:
        return ""
    return text[max(0, idx - width): idx + width]


def _matches(query: str, *fields) -> bool:
    if not query:
        return True
    blob = " ".join(str(f) for f in fields).lower()
    return all(term in blob for term in query.lower().split())


# --- Individual free sources ------------------------------------------------
def from_remotive(query: str = "", limit: int = 20) -> list:
    params = {"limit": limit}
    if query:
        params["search"] = query
    r = requests.get("https://remotive.com/api/remote-jobs", params=params,
                     headers=HEADERS, timeout=TIMEOUT)
    r.raise_for_status()
    return [
        _normalise(title=j.get("title"), company=j.get("company_name"),
                   location=j.get("candidate_required_location"), url=j.get("url"),
                   source="Remotive", tags=j.get("tags"), description=j.get("description"))
        for j in r.json().get("jobs", [])[:limit]
    ]


def from_jobicy(query: str = "", limit: int = 20) -> list:
    params = {"count": limit}
    if query:
        params["tag"] = query.split()[0]
    r = requests.get("https://jobicy.com/api/v2/remote-jobs", params=params,
                     headers=HEADERS, timeout=TIMEOUT)
    r.raise_for_status()
    out = []
    for j in r.json().get("jobs", []):
        if not _matches(query, j.get("jobTitle"), j.get("jobExcerpt"), j.get("jobIndustry")):
            continue
        out.append(_normalise(
            title=j.get("jobTitle"), company=j.get("companyName"),
            location=j.get("jobGeo"), url=j.get("url"), source="Jobicy",
            tags=[j.get("jobIndustry"), j.get("jobType")],
            description=j.get("jobExcerpt") or j.get("jobDescription"),
        ))
    return out[:limit]


def from_arbeitnow(query: str = "", limit: int = 20) -> list:
    r = requests.get("https://www.arbeitnow.com/api/job-board-api",
                     headers=HEADERS, timeout=TIMEOUT)
    r.raise_for_status()
    out = []
    for j in r.json().get("data", []):
        if not _matches(query, j.get("title"), " ".join(j.get("tags", [])), j.get("description")):
            continue
        out.append(_normalise(
            title=j.get("title"), company=j.get("company_name"),
            location=j.get("location"), url=j.get("url"), source="Arbeitnow",
            tags=j.get("tags"), description=j.get("description"),
        ))
        if len(out) >= limit:
            break
    return out


def from_remoteok(query: str = "", limit: int = 20) -> list:
    r = requests.get("https://remoteok.com/api", headers=HEADERS, timeout=TIMEOUT)
    r.raise_for_status()
    out = []
    for j in r.json():
        if not isinstance(j, dict) or not j.get("position"):
            continue
        if not _matches(query, j.get("position"), " ".join(j.get("tags", [])), j.get("description")):
            continue
        out.append(_normalise(
            title=j.get("position"), company=j.get("company"),
            location=j.get("location") or "Remote", url=j.get("url"),
            source="RemoteOK", tags=j.get("tags"), description=j.get("description"),
        ))
        if len(out) >= limit:
            break
    return out


def from_himalayas(query: str = "", limit: int = 20) -> list:
    r = requests.get("https://himalayas.app/jobs/api", params={"limit": 50},
                     headers=HEADERS, timeout=TIMEOUT)
    r.raise_for_status()
    out = []
    for j in r.json().get("jobs", []):
        locs = j.get("locationRestrictions") or []
        if not _matches(query, j.get("title"), j.get("excerpt"), " ".join(j.get("categories", []))):
            continue
        out.append(_normalise(
            title=j.get("title"), company=j.get("companyName"),
            location=", ".join(locs) if locs else "Remote",
            url=j.get("applicationLink") or j.get("guid") or "https://himalayas.app/jobs",
            source="Himalayas", tags=j.get("categories"),
            description=j.get("excerpt") or j.get("description"),
        ))
        if len(out) >= limit:
            break
    return out


# --- India-focused sources --------------------------------------------------
def from_adzuna(query: str = "", limit: int = 20) -> list:
    """Local on-site + remote jobs by country (defaults to India).

    Adzuna has a dedicated per-country API with real local listings — the
    best free source for the Indian market (Bengaluru, Hyderabad, Pune, …).
    Requires a FREE app id + key; without them this source is simply skipped,
    so the app keeps working out of the box.
    """
    from django.conf import settings

    app_id = getattr(settings, "ADZUNA_APP_ID", "")
    app_key = getattr(settings, "ADZUNA_APP_KEY", "")
    country = (getattr(settings, "ADZUNA_COUNTRY", "in") or "in").lower()
    if not (app_id and app_key):
        return []  # no key configured → skip silently

    params = {
        "app_id": app_id,
        "app_key": app_key,
        "results_per_page": min(limit, 50),
        "content-type": "application/json",
    }
    if query:
        params["what"] = query
    r = requests.get(
        f"https://api.adzuna.com/v1/api/jobs/{country}/search/1",
        params=params, headers={"User-Agent": HEADERS["User-Agent"]}, timeout=TIMEOUT,
    )
    r.raise_for_status()
    out = []
    for j in r.json().get("results", []):
        out.append(_normalise(
            title=j.get("title"),
            company=(j.get("company") or {}).get("display_name"),
            location=(j.get("location") or {}).get("display_name") or "India",
            url=j.get("redirect_url"),
            source="Adzuna",
            tags=[(j.get("category") or {}).get("label")],
            description=j.get("description"),
        ))
        if len(out) >= limit:
            break
    return out


def from_themuse(query: str = "", limit: int = 20) -> list:
    """Free, no-key board with location metadata — used here to surface
    India-located roles (and "Flexible/Remote" ones)."""
    r = requests.get("https://www.themuse.com/api/public/jobs",
                     params={"page": 0}, headers=HEADERS, timeout=TIMEOUT)
    r.raise_for_status()
    out = []
    for j in r.json().get("results", []):
        locs = [l.get("name", "") for l in (j.get("locations") or [])]
        loc_str = ", ".join(locs) or "Flexible"
        # Keep India-located or remote/flexible roles; honour the search query.
        india = any("india" in l.lower() or "remote" in l.lower() or "flexible" in l.lower() for l in locs) or not locs
        if not india:
            continue
        if not _matches(query, j.get("name"), loc_str, (j.get("contents") or "")):
            continue
        out.append(_normalise(
            title=j.get("name"), company=(j.get("company") or {}).get("name"),
            location=loc_str, url=(j.get("refs") or {}).get("landing_page"),
            source="The Muse", tags=[c.get("name") for c in (j.get("categories") or [])],
            description=j.get("contents"),
        ))
        if len(out) >= limit:
            break
    return out


SOURCES = {
    "remotive": from_remotive,
    "jobicy": from_jobicy,
    "remoteok": from_remoteok,
    "arbeitnow": from_arbeitnow,
    "himalayas": from_himalayas,
    "adzuna": from_adzuna,      # India (and other countries) — needs free key
    "themuse": from_themuse,    # India-located + flexible roles, no key
}


def fetch_all(query: str = "", limit_per_source: int = 15) -> tuple:
    """Query every source concurrently, swallow individual failures, dedupe."""
    collected, errors = [], {}

    def run(item):
        name, fn = item
        try:
            return name, fn(query, limit_per_source), None
        except Exception as exc:  # noqa: BLE001 - sources are best-effort
            return name, [], str(exc)

    with concurrent.futures.ThreadPoolExecutor(max_workers=len(SOURCES)) as pool:
        for name, jobs, err in pool.map(run, SOURCES.items()):
            collected.extend(jobs)
            if err:
                errors[name] = err

    seen, unique = set(), []
    for job in collected:
        key = (job["title"].lower(), job["company"].lower())
        if key in seen:
            continue
        seen.add(key)
        unique.append(job)
    return unique, errors
