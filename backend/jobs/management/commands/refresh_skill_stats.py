"""Refresh the SkillStat table from the live free job feed.

Run manually or on a schedule (e.g. daily cron / Render job):

    python manage.py refresh_skill_stats
    python manage.py refresh_skill_stats --limit 80
"""

from django.core.management.base import BaseCommand

from jobs.services import market


class Command(BaseCommand):
    help = "Recompute per-skill demand and salary stats from live job listings."

    def add_arguments(self, parser):
        parser.add_argument(
            "--limit",
            type=int,
            default=50,
            help="Listings to pull per source (more = bigger sample, slower).",
        )

    def handle(self, *args, **options):
        result = market.refresh_skill_stats(limit_per_source=options["limit"])
        if result["errors"]:
            self.stdout.write(
                self.style.WARNING(f"Some sources failed: {list(result['errors'])}")
            )
        self.stdout.write(
            self.style.SUCCESS(
                f"Updated {result['updated']} skills "
                f"from {result['sample']} sampled jobs."
            )
        )
