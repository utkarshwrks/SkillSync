"""Resume text extraction and skill detection — all free, no external APIs."""

from __future__ import annotations

import hashlib
import io
import re

# A pragmatic, extensible catalogue of skills/keywords we look for in resumes.
SKILL_KEYWORDS = [
    # Languages
    "python", "java", "javascript", "typescript", "c", "c++", "c#", "go", "golang",
    "rust", "ruby", "php", "swift", "kotlin", "scala", "r", "matlab", "sql", "bash",
    # Web / frameworks
    "react", "react native", "next.js", "node.js", "express", "django", "flask",
    "fastapi", "spring", "spring boot", "angular", "vue", "svelte", "tailwind",
    "bootstrap", "html", "css", "sass", "graphql", "rest", "redux",
    # Data / ML
    "pandas", "numpy", "scikit-learn", "tensorflow", "pytorch", "keras",
    "machine learning", "deep learning", "nlp", "computer vision", "data analysis",
    "data science", "matplotlib", "power bi", "tableau", "excel", "statistics",
    # Cloud / DevOps
    "aws", "azure", "gcp", "docker", "kubernetes", "terraform", "jenkins",
    "ci/cd", "git", "github", "gitlab", "linux", "nginx", "ansible",
    # Databases
    "mysql", "postgresql", "postgres", "mongodb", "redis", "sqlite", "elasticsearch",
    "firebase", "dynamodb", "oracle",
    # Misc / soft
    "agile", "scrum", "jira", "rest api", "microservices", "oop", "data structures",
    "algorithms", "system design", "testing", "selenium", "communication",
    "leadership", "project management", "teamwork", "problem solving",
]


def sha256_of_bytes(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def extract_text(data: bytes, filename: str) -> str:
    """Extract plain text from PDF / DOCX / TXT bytes."""
    ext = filename.rsplit(".", 1)[-1].lower() if "." in filename else ""
    if ext == "pdf":
        return _extract_pdf(data)
    if ext in {"docx", "doc"}:
        return _extract_docx(data)
    if ext in {"txt", "md", "rtf"}:
        return data.decode("utf-8", errors="ignore")
    raise ValueError("Unsupported file type. Upload a PDF, DOCX, or TXT file.")


def _extract_pdf(data: bytes) -> str:
    import pdfplumber

    parts = []
    with pdfplumber.open(io.BytesIO(data)) as pdf:
        for page in pdf.pages:
            parts.append(page.extract_text() or "")
    return "\n".join(parts).strip()


def _extract_docx(data: bytes) -> str:
    from docx import Document

    doc = Document(io.BytesIO(data))
    return "\n".join(p.text for p in doc.paragraphs).strip()


def extract_skills(text: str) -> list:
    """Return the catalogue skills that appear in the resume text."""
    lowered = text.lower()
    found = []
    for skill in SKILL_KEYWORDS:
        # Word-boundary match so "r" / "go" / "c" don't match inside other
        # words. "&" and "-" are treated as boundaries too, so single-letter
        # skills don't false-positive on "R&D", "C-level", etc.
        pattern = r"(?<![a-z0-9+#.&-]){}(?![a-z0-9+#&-])".format(re.escape(skill))
        if re.search(pattern, lowered):
            found.append(skill)
    # De-duplicate while preserving order.
    return list(dict.fromkeys(found))
