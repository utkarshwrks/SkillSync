from django.contrib.auth.models import User
from django.db import models


class Profile(models.Model):
    """Lightweight profile attached to the built-in Django ``User``."""

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="profile")
    phone = models.CharField(max_length=20, blank=True)
    headline = models.CharField(max_length=120, blank=True)
    bio = models.TextField(blank=True)
    github = models.URLField(blank=True)
    linkedin = models.URLField(blank=True)
    # Skills proven by external evidence (GitHub repos / portfolio), turning
    # self-reported skills into verified ones — the seed of the trust moat.
    verified_skills = models.JSONField(default=list, blank=True)
    verification_source = models.URLField(blank=True)
    verified_at = models.DateTimeField(null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Profile<{self.user.username}>"
