"""Skill verification v1 — prove claimed skills from public evidence.

Given a GitHub profile or a portfolio URL, we gather public text (repo
languages/names/descriptions/topics, or the page's visible text) and detect
which catalogue skills genuinely show up. That turns self-reported skills into
*verified* ones — the seed of the trust moat.

All free, no API key (GitHub's unauthenticated API is enough for v1), and
fully degradation-safe: any network/parse failure returns an empty result
rather than raising.
"""

from __future__ import annotations

import re

import requests

from resumes.services.parsing import extract_skills

TIMEOUT = 10
HEADERS = {"User-Agent": "SkillSync-Verifier/1.0", "Accept": "application/json"}

_GH_RE = re.compile(r"github\.com/([A-Za-z0-9-]+)/?", re.IGNORECASE)


def _from_github(username: str) -> str:
    """Collect public text from a user's repos to detect skills in."""
    r = requests.get(
        f"https://api.github.com/users/{username}/repos",
        params={"per_page": 100, "sort": "pushed"},
        headers=HEADERS,
        timeout=TIMEOUT,
    )
    r.raise_for_status()
    parts = []
    for repo in r.json():
        if not isinstance(repo, dict):
            continue
        parts.append(repo.get("name") or "")
        parts.append(repo.get("description") or "")
        parts.append(repo.get("language") or "")
        parts.extend(repo.get("topics") or [])
    return " ".join(p.replace("-", " ") for p in parts if p)


def _from_page(url: str) -> str:
    """Fetch a portfolio page and return its visible text (tags stripped)."""
    r = requests.get(url, headers={"User-Agent": HEADERS["User-Agent"]}, timeout=TIMEOUT)
    r.raise_for_status()
    text = re.sub(r"<script.*?</script>|<style.*?</style>", " ", r.text, flags=re.DOTALL | re.IGNORECASE)
    text = re.sub(r"<[^>]+>", " ", text)
    return re.sub(r"\s+", " ", text)


def verify_from_url(url: str, claimed_skills: list | None = None) -> dict:
    """Detect verifiable skills at `url`.

    Returns {detected, verified, source_type, error}. `verified` is the subset
    that also appears in `claimed_skills` (when provided), so we can show
    "claimed AND proven" distinctly from "extra skills we found".
    """
    url = (url or "").strip()
    if not url:
        return {"detected": [], "verified": [], "source_type": "", "error": "No URL provided."}

    try:
        gh = _GH_RE.search(url)
        if gh:
            text = _from_github(gh.group(1))
            source_type = "github"
        else:
            if not url.startswith(("http://", "https://")):
                url = "https://" + url
            text = _from_page(url)
            source_type = "portfolio"
    except Exception as exc:  # noqa: BLE001 - best-effort, never raise
        return {"detected": [], "verified": [], "source_type": "", "error": str(exc)}

    detected = extract_skills(text)
    claimed = {s.lower() for s in (claimed_skills or [])}
    verified = [s for s in detected if s.lower() in claimed] if claimed else detected
    return {
        "detected": detected,
        "verified": verified,
        "source_type": source_type,
        "error": "",
    }
