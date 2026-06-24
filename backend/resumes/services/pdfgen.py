"""Render an improved resume into a nicely formatted PDF (reportlab, free)."""

from __future__ import annotations

import io

from reportlab.lib.colors import HexColor
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import LETTER
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.platypus import (
    HRFlowable,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
)

TEMPLATES = {
    "modern": {"label": "Modern", "accent": "#2563eb", "font": "Helvetica"},
    "classic": {"label": "Classic", "accent": "#111827", "font": "Times-Roman"},
    "minimal": {"label": "Minimal", "accent": "#374151", "font": "Helvetica"},
}
DEFAULT_TEMPLATE = "modern"


def available_templates() -> list:
    return [{"id": key, **{k: v for k, v in val.items() if k != "font"}} for key, val in TEMPLATES.items()]


def _styles(template: str):
    cfg = TEMPLATES.get(template, TEMPLATES[DEFAULT_TEMPLATE])
    accent = HexColor(cfg["accent"])
    font = cfg["font"]
    bold = "Times-Bold" if font == "Times-Roman" else "Helvetica-Bold"
    base = getSampleStyleSheet()
    return cfg, accent, {
        "name": ParagraphStyle("Name", parent=base["Title"], fontName=bold,
                               fontSize=22, textColor=accent, spaceAfter=2),
        "contact": ParagraphStyle("Contact", parent=base["Normal"], fontName=font,
                                  fontSize=9, textColor=HexColor("#6b7280"), spaceAfter=8),
        "section": ParagraphStyle("Section", parent=base["Heading2"], fontName=bold,
                                  fontSize=12, textColor=accent, spaceBefore=10,
                                  spaceAfter=4, alignment=TA_LEFT),
        "body": ParagraphStyle("Body", parent=base["Normal"], fontName=font,
                              fontSize=10, leading=14, spaceAfter=2),
        "bullet": ParagraphStyle("Bullet", parent=base["Normal"], fontName=font,
                                fontSize=10, leading=14, leftIndent=12,
                                bulletIndent=2, spaceAfter=1),
    }


SECTION_HEADERS = {"summary", "skills", "experience", "education", "projects",
                   "certifications", "achievements", "contact"}


def build_resume_pdf(content: str, *, template: str = DEFAULT_TEMPLATE,
                     name: str = "", contact: str = "") -> bytes:
    cfg, accent, styles = _styles(template)
    buf = io.BytesIO()
    doc = SimpleDocTemplate(
        buf, pagesize=LETTER,
        leftMargin=0.7 * inch, rightMargin=0.7 * inch,
        topMargin=0.6 * inch, bottomMargin=0.6 * inch,
        title="Resume",
    )
    flow = []
    if name:
        flow.append(Paragraph(_esc(name), styles["name"]))
    if contact:
        flow.append(Paragraph(_esc(contact), styles["contact"]))
    if name or contact:
        flow.append(HRFlowable(width="100%", thickness=1.2, color=accent, spaceAfter=6))

    for raw_line in content.splitlines():
        line = raw_line.rstrip()
        if not line.strip():
            flow.append(Spacer(1, 4))
            continue
        stripped = line.strip()
        if stripped.lower().rstrip(":") in SECTION_HEADERS or (
            stripped.isupper() and len(stripped) <= 30
        ):
            flow.append(Paragraph(_esc(stripped.title()), styles["section"]))
            flow.append(HRFlowable(width="100%", thickness=0.5,
                                   color=HexColor("#d1d5db"), spaceAfter=3))
        elif stripped.startswith(("- ", "* ", "• ")):
            flow.append(Paragraph(_esc(stripped[2:].strip()), styles["bullet"], bulletText="•"))
        else:
            flow.append(Paragraph(_esc(stripped), styles["body"]))

    doc.build(flow)
    return buf.getvalue()


def _esc(text: str) -> str:
    return (text.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;"))
