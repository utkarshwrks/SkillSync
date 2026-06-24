"""Resume quality scoring — fully offline, no Gemini, no paid API.

Two features live here:

  - Dual-lens score (#6): most tools optimise only for ATS keyword matching,
    which pushes people toward keyword-stuffed resumes that recruiters hate.
    We score BOTH lenses separately and flag where over-optimising for one
    hurts the other.
  - Evidence-based metric prompts (#3): instead of inventing numbers, we find
    bullets that lack a measurable result and ask the user for THEIR real
    number, so the rewrite stays truthful.

These are deterministic heuristics, so they keep working even when the Gemini
free tier is down.
"""

from __future__ import annotations

import re

ACTION_VERBS = {
    "built", "led", "designed", "developed", "automated", "implemented",
    "optimised", "optimized", "delivered", "launched", "engineered", "improved",
    "created", "managed", "reduced", "increased", "shipped", "drove", "owned",
    "architected", "migrated", "scaled", "wrote", "tested", "deployed",
}

# Weak openers that read as passive / low-impact to a human recruiter.
WEAK_OPENERS = {"responsible", "worked", "helped", "tasked", "involved", "assisted"}

SECTION_KEYWORDS = ("experience", "education", "skills", "project", "summary")


def _bullets(text: str) -> list:
    """Return the bullet-like lines from the resume (cleaned of markers)."""
    out = []
    for raw in text.splitlines():
        line = raw.strip()
        body = line.lstrip("-*• ").strip()
        # Treat as a bullet if explicitly marked, or a multi-word non-header line.
        marked = line.startswith(("-", "*", "•"))
        if body and len(body.split()) >= 3 and not body.isupper() and (marked or len(body.split()) >= 5):
            out.append(body)
    return out


def _has_metric(line: str) -> bool:
    return bool(re.search(r"\d+%|\$\s?\d|\b\d{2,}\b|\bx\d+\b", line))


def dual_lens_score(text: str, skills: list) -> dict:
    """Score the resume for ATS parsing AND human readability, separately."""
    text = (text or "").strip()
    lowered = text.lower()
    words = text.split()
    word_count = len(words) or 1
    bullets = _bullets(text)

    sections = {kw: kw in lowered for kw in SECTION_KEYWORDS}
    has_contact = bool(re.search(r"[\w.+-]+@[\w-]+\.\w+", text)) or bool(
        re.search(r"\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b", text)
    )

    # --- ATS lens: can a machine parse it and match keywords? ---
    ats = 30
    ats += sum(8 for present in sections.values() if present)  # up to +40
    ats += min(len(skills) * 2, 20)                            # keyword coverage
    ats += 10 if has_contact else 0
    ats_notes = []
    missing_sections = [s for s, present in sections.items() if not present]
    if missing_sections:
        ats_notes.append(
            "Add standard section headers so ATS can categorise content: "
            + ", ".join(missing_sections) + "."
        )
    if not has_contact:
        ats_notes.append("Include a parseable email or phone number near the top.")
    if len(skills) < 6:
        ats_notes.append("List more relevant tools/skills to improve keyword match.")
    ats = max(20, min(ats, 100))

    # --- Recruiter lens: does a human enjoy reading it? ---
    rec = 50
    if bullets:
        led = sum(1 for b in bullets if b.split()[0].lower().strip(":") in ACTION_VERBS)
        weak = sum(1 for b in bullets if b.split()[0].lower().strip(":") in WEAK_OPENERS)
        quantified = sum(1 for b in bullets if _has_metric(b))
        long_bullets = sum(1 for b in bullets if len(b.split()) > 28)

        rec += int(led / len(bullets) * 25)            # reward action verbs
        rec += int(quantified / len(bullets) * 20)     # reward measurable impact
        rec -= int(weak / len(bullets) * 20)           # penalise passive phrasing
        rec -= int(long_bullets / len(bullets) * 15)   # penalise rambling bullets
    else:
        led = quantified = 0

    rec_notes = []
    if bullets and led / len(bullets) < 0.6:
        rec_notes.append("Lead more bullets with action verbs (Built, Led, Reduced).")
    if bullets and quantified / len(bullets) < 0.4:
        rec_notes.append("Add measurable results to more bullets so impact is concrete.")

    # --- Conflict detection: ATS optimisation that hurts the human read ---
    conflicts = []
    # Keyword stuffing: skills make up a large share of the whole document.
    skill_mentions = sum(lowered.count(s.lower()) for s in skills)
    density = skill_mentions / word_count
    if density > 0.12 and len(words) > 50:
        conflicts.append(
            "High keyword density looks like ATS keyword-stuffing — it can read "
            "as spammy to recruiters. Weave skills into achievement bullets instead."
        )
        rec -= 10
    # A bare "skills soup" line with many comma-separated terms repeated elsewhere.
    if re.search(r"(?:\b[\w+#.]+\b,\s*){8,}", text):
        conflicts.append(
            "A very long comma-separated skills list helps ATS but tires the "
            "human eye — group skills into a few labelled categories."
        )

    rec = max(20, min(rec, 100))

    return {
        "ats_score": ats,
        "recruiter_score": rec,
        "ats_notes": ats_notes,
        "recruiter_notes": rec_notes,
        "conflicts": conflicts,
    }


def metric_prompts(text: str, limit: int = 6) -> list:
    """Bullets lacking a measurable result, each with a targeted question.

    We never invent numbers — we ask the user for theirs, so the resulting
    rewrite stays factual. Returns [{bullet, question}].
    """
    prompts = []
    for body in _bullets(text):
        if len(prompts) >= limit:
            break
        if _has_metric(body):
            continue
        verb = body.split()[0].lower().strip(":")
        # Tailor the question to what the bullet seems to describe.
        if any(w in body.lower() for w in ("user", "customer", "client", "audience")):
            question = "How many users/customers did this affect?"
        elif any(w in body.lower() for w in ("performance", "speed", "latency", "load", "optimis", "optimiz", "reduc")):
            question = "By what % did it improve performance (e.g. cut latency 35%)?"
        elif any(w in body.lower() for w in ("revenue", "cost", "sales", "saved", "budget")):
            question = "What was the $ or % impact on revenue/cost?"
        elif any(w in body.lower() for w in ("team", "led", "managed", "mentor")):
            question = "How many people, and over what timeframe?"
        else:
            question = "What number quantifies the result (scale, %, count, or time)?"
        prompts.append({"bullet": body, "question": question})
    return prompts
