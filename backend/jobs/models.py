"""Persistence for the jobs app.

The job *listings* themselves stay stateless (fetched live in services/),
but two things are worth saving:

  - JobApplication: a job the user decided to apply to, so we can show an
    application tracker and "close the loop" from match -> apply -> outcome.
  - SkillStat: aggregated market data (how often each skill shows up in live
    listings, and its average salary). This powers the "market-truth skill
    pricing" feature. It is computed from the SAME free job feed we already
    ingest, so it needs no paid API and never depends on Gemini.
"""

from django.contrib.auth.models import User
from django.db import models


class JobApplication(models.Model):
    """A job the user is tracking through the application process."""

    # Where the user is in the pipeline for this job. "hired" and "ghosted"
    # are terminal OUTCOMES — capturing them is what turns the tracker into
    # the seed of the outcome data flywheel (what actually gets people hired).
    STATUS_CHOICES = [
        ("saved", "Saved"),
        ("applied", "Applied"),
        ("interview", "Interviewing"),
        ("offer", "Offer"),
        ("hired", "Hired"),
        ("rejected", "Rejected"),
        ("ghosted", "Ghosted"),
    ]

    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="applications"
    )
    # We copy the job's display fields instead of linking to a row, because
    # listings are fetched live and have no database id of their own.
    title = models.CharField(max_length=255)
    company = models.CharField(max_length=255, blank=True)
    location = models.CharField(max_length=255, blank=True)
    url = models.URLField(max_length=1000, blank=True)
    source = models.CharField(max_length=50, blank=True)

    status = models.CharField(
        max_length=20, choices=STATUS_CHOICES, default="saved"
    )
    notes = models.TextField(blank=True)
    # Skills from the user's resume that matched this job when they saved it.
    # These tie an OUTCOME back to the skills that produced it — the core of
    # the data moat ("which skills actually convert to interviews/offers").
    matched_skills = models.JSONField(default=list, blank=True)

    # When the user actually applied — enables time-to-response analytics.
    applied_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-updated_at"]
        # The same user shouldn't be able to save the exact same posting twice.
        constraints = [
            models.UniqueConstraint(
                fields=["user", "url"], name="unique_user_job_url"
            )
        ]

    def __str__(self):
        return f"{self.user.username}: {self.title} ({self.status})"


class SkillStat(models.Model):
    """Aggregated demand/pay data for a single skill across live listings.

    Recomputed periodically from the free job feed (Phase 2). One row per
    skill name. `share` is the % of sampled jobs that mention this skill.
    """

    name = models.CharField(max_length=100, unique=True, db_index=True)
    # How many sampled jobs mentioned this skill, out of `sample_size` total.
    job_count = models.PositiveIntegerField(default=0)
    sample_size = models.PositiveIntegerField(default=0)
    share = models.FloatField(default=0.0)  # job_count / sample_size * 100
    # Average annual salary (USD) parsed from listings that mention it.
    # Nullable: many free listings have no salary, so this is best-effort.
    avg_salary = models.PositiveIntegerField(null=True, blank=True)
    salary_samples = models.PositiveIntegerField(default=0)

    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-share"]

    def __str__(self):
        return f"{self.name}: {self.share:.0f}% of jobs"


class SalaryReport(models.Model):
    """A user-submitted real salary/offer — the seed of proprietary pay data.

    Individual rows are NEVER exposed; only anonymised aggregates are served.
    Unlike scraped listing salaries (sparse, often stale), these are real
    member offers and compound into a pay dataset competitors can't scrape.
    """

    # Kept for de-dup/abuse control only; never returned in any response.
    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="salary_reports"
    )
    role_title = models.CharField(max_length=160, blank=True)
    skills = models.JSONField(default=list, blank=True)
    amount = models.PositiveIntegerField()  # annual
    currency = models.CharField(max_length=8, default="USD")
    location = models.CharField(max_length=160, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.role_title or 'role'}: {self.amount} {self.currency}"
