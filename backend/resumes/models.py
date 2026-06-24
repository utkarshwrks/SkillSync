from django.contrib.auth.models import User
from django.db import models


class ResumeAnalysis(models.Model):
    """One row per *unique* resume (keyed by content hash).

    This is the cache/dedup layer: identical resume bytes -> identical
    analysis, computed once. Multiple uploads (even by different users)
    reference the same analysis, so we never re-run Gemini or re-store the
    same text twice.
    """

    content_hash = models.CharField(max_length=64, unique=True, db_index=True)
    extracted_text = models.TextField()
    skills = models.JSONField(default=list)
    summary = models.TextField(blank=True)
    score = models.PositiveSmallIntegerField(default=0)
    suggestions = models.JSONField(default=list)
    fixes = models.JSONField(default=list)
    improved_resume = models.TextField(blank=True)
    source = models.CharField(max_length=20, default="offline")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Analysis<{self.content_hash[:10]}>"


class Resume(models.Model):
    """A user's upload event, pointing at the shared analysis for its content."""

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="resumes")
    analysis = models.ForeignKey(
        ResumeAnalysis, on_delete=models.CASCADE, related_name="uploads"
    )
    filename = models.CharField(max_length=255)
    # Per-user working copy: starts as the AI's improved_resume, then holds the
    # user's in-place edits. Kept off the shared analysis so edits don't leak.
    edited_content = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.user.username} - {self.filename}"


class ResumeVersion(models.Model):
    """A saved snapshot of a resume's content at a point in time.

    Lets the user keep multiple tailored versions of one resume and diff
    them later (e.g. "the version I sent to backend roles"). Each row stores
    the full text of that version plus an optional label and the job it was
    tailored for.
    """

    resume = models.ForeignKey(
        Resume, on_delete=models.CASCADE, related_name="versions"
    )
    # Human label, e.g. "Backend roles" or "v2 - added metrics".
    label = models.CharField(max_length=120, blank=True)
    content = models.TextField()
    # Optional: the job title/company this version was tailored toward.
    tailored_for = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.resume.filename} - {self.label or self.created_at:%Y-%m-%d}"
