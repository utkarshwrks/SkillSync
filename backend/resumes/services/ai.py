"""Resume analysis via Google Gemini, with a deterministic offline fallback.

Produces:
  - a score + summary,
  - high-level suggestions,
  - line-level **fixes** (original -> improved) the user can apply in place,
  - an improved_resume that PRESERVES the original structure and length.

The result is cached per unique resume (by content hash) at the database layer,
so Gemini is only ever called once for a given resume.
"""

from __future__ import annotations

import json
import re

from django.conf import settings

ACTION_VERBS = [
    "Built", "Led", "Designed", "Developed", "Automated", "Implemented",
    "Optimised", "Delivered", "Launched", "Engineered", "Improved", "Created",
]

PROMPT = """You are an expert resume editor. Improve the resume below by editing it
IN PLACE. Respond with STRICT JSON only (no markdown fences), with these keys:
{{
  "summary": "2-3 sentence overall assessment",
  "score": <integer 0-100>,
  "suggestions": ["high-level advice", ... 4 to 7 items],
  "fixes": [
     {{"original": "an exact line/bullet copied from the resume",
       "improved": "the edited version - KEEP IT ROUGHLY THE SAME LENGTH so it fits the same space",
       "reason": "short why"}},
     ... 4 to 8 concrete edits
  ],
  "improved_resume": "the FULL resume rewritten with the fixes applied, keeping the SAME sections, SAME order and SIMILAR length. Use SECTION HEADERS in CAPS and '- ' bullets. Do not invent experience."
}}

RULES:
- Edit in place. Do NOT add new sections or pad length.
- If you shorten or remove weak wording, tighten the line - never leave it longer than the original.
- Keep the candidate's real facts; only improve phrasing, impact and metrics.

RESUME:
\"\"\"
{resume}
\"\"\"
"""


def analyze_resume(text: str, skills: list) -> dict:
    text = (text or "").strip()
    if not text:
        return _fallback("", skills)

    api_key = getattr(settings, "GEMINI_API_KEY", "")
    if not api_key:
        return _fallback(text, skills)

    try:
        import google.generativeai as genai

        genai.configure(api_key=api_key)
        model = genai.GenerativeModel(settings.GEMINI_MODEL)
        response = model.generate_content(PROMPT.format(resume=text[:12000]))
        return _coerce(response.text, text, skills)
    except Exception:
        return _fallback(text, skills)


def _coerce(raw: str, text: str, skills: list) -> dict:
    cleaned = re.sub(r"^```(?:json)?|```$", "", raw.strip(), flags=re.MULTILINE).strip()
    match = re.search(r"\{.*\}", cleaned, flags=re.DOTALL)
    if match:
        try:
            data = json.loads(match.group(0))
            fixes = [
                {
                    "original": str(f.get("original", "")).strip(),
                    "improved": str(f.get("improved", "")).strip(),
                    "reason": str(f.get("reason", "")).strip(),
                }
                for f in data.get("fixes", [])
                if str(f.get("improved", "")).strip()
            ]
            return {
                "summary": str(data.get("summary", "")).strip(),
                "score": int(data.get("score", 0) or 0),
                "suggestions": [str(s).strip() for s in data.get("suggestions", []) if str(s).strip()],
                "fixes": fixes,
                "improved_resume": str(data.get("improved_resume", "")).strip() or text,
                "source": "gemini",
            }
        except (json.JSONDecodeError, ValueError, TypeError):
            pass
    return _fallback(text, skills)


# --- Offline analyser -------------------------------------------------------
def _fallback(text: str, skills: list) -> dict:
    words = len(text.split())
    has_numbers = bool(re.search(r"\d+%|\$\d|\b\d{2,}\b", text))
    sections = {kw: kw in text.lower()
                for kw in ("experience", "education", "skills", "project", "summary")}

    score = 40 + min(len(skills) * 3, 30) + (10 if has_numbers else 0)
    score += sum(4 for present in sections.values() if present)
    score = max(20, min(score, 95))

    suggestions = []
    if not has_numbers:
        suggestions.append("Quantify achievements with concrete metrics (e.g. 'cut load time by 35%').")
    if not sections["summary"]:
        suggestions.append("Add a 2-3 line professional summary tailored to your target role.")
    if not sections["project"]:
        suggestions.append("Include a Projects section with links and the technologies used.")
    if len(skills) < 6:
        suggestions.append("Expand your Skills section with the tools and frameworks you use.")
    suggestions += [
        "Lead each bullet with a strong action verb (Built, Led, Designed).",
        "Keep formatting and tense consistent; one or two lines per bullet.",
        "Mirror keywords from the job description to pass ATS screening.",
    ]

    fixes = _offline_fixes(text)
    improved = _apply_fixes(text, fixes) if fixes else text

    return {
        "summary": (
            f"This resume surfaces {len(skills)} recognised skills across "
            f"{sum(sections.values())} standard sections. Strengthen impact with "
            "metrics and sharper, action-led bullets."
        ),
        "score": score,
        "suggestions": suggestions[:6],
        "fixes": fixes,
        "improved_resume": improved,
        "source": "offline",
    }


def _offline_fixes(text: str) -> list:
    """Propose concrete in-place edits to weak bullet lines (length-preserving)."""
    fixes = []
    for raw in text.splitlines():
        line = raw.strip()
        if len(fixes) >= 6:
            break
        # Target bullet-like or sentence lines, skip headers/short tokens.
        is_bullet = line.startswith(("-", "*", "•"))
        body = line.lstrip("-*• ").strip()
        if not body or len(body.split()) < 4 or body.isupper():
            continue

        improved, reason = body, ""
        first = body.split()[0].rstrip(":")
        if first.lower() in {"responsible", "worked", "helped", "tasked", "involved"}:
            # Strip the passive lead-in ("responsible for", "worked on", ...).
            rest = re.sub(r"^\w+\s+(for|on|with|in|to)?\s*", "", body, count=1).strip()
            rest = _degerund(rest)
            improved = rest[0].upper() + rest[1:] if rest else body
            reason = "Start with a strong action verb instead of a passive phrase."
        elif first[:1].isalpha() and first[0].islower():
            improved = body[0].upper() + body[1:]
            reason = "Capitalise the start of the bullet for consistency."
        if not re.search(r"\d", body):
            # Add a metric prompt without lengthening much.
            if not improved.rstrip().endswith("."):
                improved = improved.rstrip(".") + " (add a metric, e.g. +30%)"
                reason = (reason + " Add a measurable result.").strip()

        if improved != body:
            prefix = "- " if is_bullet else ""
            fixes.append({
                "original": line,
                "improved": f"{prefix}{improved}",
                "reason": reason or "Tighten and strengthen this line.",
            })
    return fixes


_GERUND_PAST = {
    "building": "Built", "developing": "Developed", "designing": "Designed",
    "leading": "Led", "managing": "Managed", "creating": "Created",
    "implementing": "Implemented", "improving": "Improved", "testing": "Tested",
    "maintaining": "Maintained", "writing": "Wrote", "automating": "Automated",
}


def _degerund(text: str) -> str:
    """Turn a leading gerund ('building APIs') into past tense ('Built APIs')."""
    if not text:
        return text
    words = text.split()
    past = _GERUND_PAST.get(words[0].lower())
    if past:
        return " ".join([past] + words[1:])
    return text


def _apply_fixes(text: str, fixes: list) -> str:
    result = text
    for fix in fixes:
        if fix["original"] and fix["original"] in result:
            result = result.replace(fix["original"], fix["improved"], 1)
    return result
