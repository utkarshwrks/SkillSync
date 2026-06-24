"""WSGI config for the SkillSync project."""

import os

from django.core.wsgi import get_wsgi_application

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")

application = get_wsgi_application()

# Serverless platforms (e.g. Vercel) look for a module-level ``app``.
app = application
