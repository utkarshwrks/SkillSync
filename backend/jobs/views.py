from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response

from resumes.models import Resume

from .models import JobApplication, SalaryReport, SkillStat
from .serializers import JobApplicationSerializer
from .services import market, recommend, sources


def _latest_skills(user) -> list:
    resume = (
        Resume.objects.filter(user=user)
        .select_related("analysis")
        .order_by("-created_at")
        .first()
    )
    return resume.analysis.skills if resume else []


@api_view(["GET"])
def search(request):
    """Search jobs across all free sources. Ranked by resume skills if available."""
    query = request.query_params.get("q", "").strip()
    jobs, errors = sources.fetch_all(query)
    skills = _latest_skills(request.user)
    if skills:
        jobs = recommend.rank(jobs, skills)
    return Response({
        "query": query,
        "count": len(jobs),
        "skills_used": skills,
        "results": jobs,
        "source_errors": errors,
    })


@api_view(["GET"])
def recommended(request):
    """Jobs tailored to the user's most recent resume."""
    skills = _latest_skills(request.user)
    if not skills:
        return Response({
            "count": 0, "skills_used": [], "results": [],
            "detail": "Upload a resume first to get personalised recommendations.",
        })
    # Query the strongest skills so sources return relevant listings.
    query = " ".join(skills[:1])
    jobs, errors = sources.fetch_all(query)
    ranked = recommend.rank(jobs, skills)
    # Surface the best matches first.
    ranked = [j for j in ranked if j["match_score"] > 0] or ranked
    return Response({
        "count": len(ranked),
        "skills_used": skills,
        "results": ranked[:40],
        "source_errors": errors,
    })


@api_view(["GET"])
def skill_stats(request):
    """Market-truth skill pricing (#5): demand + pay per skill.

    Returns the most in-demand skills overall, and — if the user has a
    resume — the same stats filtered to *their* skills so they can see which
    of their skills are most valuable and which in-demand skills they lack.

    The stats are precomputed (management command / cron). If the table is
    empty (e.g. first run), we populate it once on the fly so the feature
    works out of the box.
    """
    if not SkillStat.objects.exists():
        market.refresh_skill_stats()

    def serialize(stat):
        return {
            "name": stat.name,
            "share": stat.share,
            "job_count": stat.job_count,
            "sample_size": stat.sample_size,
            "avg_salary": stat.avg_salary,
        }

    top = [serialize(s) for s in SkillStat.objects.all()[:25]]

    skills = _latest_skills(request.user)
    have = {s.lower() for s in skills}
    your_skills, missing_top = [], []
    if skills:
        by_name = {s.name.lower(): s for s in SkillStat.objects.all()}
        your_skills = [
            serialize(by_name[s.lower()]) for s in skills if s.lower() in by_name
        ]
        your_skills.sort(key=lambda s: s["share"], reverse=True)
        # In-demand skills the user is missing -> learning targets.
        missing_top = [
            serialize(s)
            for s in SkillStat.objects.all()
            if s.name.lower() not in have
        ][:10]

    return Response({
        "top_skills": top,
        "your_skills": your_skills,
        "missing_in_demand": missing_top,
        "updated_at": (
            SkillStat.objects.order_by("-updated_at").values_list(
                "updated_at", flat=True
            ).first()
        ),
    })


@api_view(["GET"])
def reverse_match(request):
    """Reverse matching (#2): jobs you're one skill away from qualifying for.

    Each result carries the missing skill(s); we attach the market stats for
    each missing skill so the user sees the payoff of learning it.
    """
    skills = _latest_skills(request.user)
    if not skills:
        return Response({
            "count": 0, "skills_used": [], "results": [],
            "detail": "Upload a resume first to see what you're one skill away from.",
        })

    query = " ".join(skills[:1])
    jobs, errors = sources.fetch_all(query)
    matches = market.reverse_match(jobs, skills, max_missing=1)

    # Annotate each missing skill with its market stat (demand + pay).
    stat_by_name = {s.name.lower(): s for s in SkillStat.objects.all()}
    for job in matches:
        job["missing_skill_stats"] = [
            {
                "name": name,
                "share": stat_by_name[name.lower()].share,
                "avg_salary": stat_by_name[name.lower()].avg_salary,
            }
            for name in job.get("missing_skills", [])
            if name.lower() in stat_by_name
        ]

    return Response({
        "count": len(matches),
        "skills_used": skills,
        "results": matches[:30],
        "source_errors": errors,
    })


@api_view(["GET", "POST"])
def applications(request):
    """List the user's tracked applications, or start tracking a new job."""
    if request.method == "POST":
        data = {
            "title": request.data.get("title", ""),
            "company": request.data.get("company", ""),
            "location": request.data.get("location", ""),
            "url": request.data.get("url", ""),
            "source": request.data.get("source", ""),
            "status": request.data.get("status", "saved"),
            "notes": request.data.get("notes", ""),
            "matched_skills": request.data.get("matched_skills", []),
        }
        serializer = JobApplicationSerializer(data=data)
        serializer.is_valid(raise_exception=True)
        # Tolerate "already tracking this URL" by returning the existing row.
        existing = JobApplication.objects.filter(
            user=request.user, url=data["url"]
        ).first()
        if existing and data["url"]:
            return Response(
                JobApplicationSerializer(existing).data, status=status.HTTP_200_OK
            )
        obj = serializer.save(user=request.user)
        return Response(
            JobApplicationSerializer(obj).data, status=status.HTTP_201_CREATED
        )

    qs = JobApplication.objects.filter(user=request.user)
    return Response(JobApplicationSerializer(qs, many=True).data)


@api_view(["PATCH", "DELETE"])
def application_detail(request, pk):
    """Update an application's status/notes, or stop tracking it."""
    obj = JobApplication.objects.filter(user=request.user, pk=pk).first()
    if obj is None:
        return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)

    if request.method == "DELETE":
        obj.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    serializer = JobApplicationSerializer(obj, data=request.data, partial=True)
    serializer.is_valid(raise_exception=True)
    obj = serializer.save()
    # Stamp the first time this job reaches "applied" (or any later stage),
    # so we can measure time-to-response for the data flywheel.
    if obj.applied_at is None and obj.status not in ("saved",):
        from django.utils import timezone
        obj.applied_at = timezone.now()
        obj.save(update_fields=["applied_at"])
    return Response(JobApplicationSerializer(obj).data)


# Stages that count as "the user actually applied".
_APPLIED_STAGES = {"applied", "interview", "offer", "hired", "rejected", "ghosted"}
# Stages that represent a positive employer response.
_RESPONSE_STAGES = {"interview", "offer", "hired"}


@api_view(["GET"])
def application_stats(request):
    """Personal application funnel + per-skill conversion.

    Delivers value to a single user immediately (their own funnel), and is the
    seed of the outcome data flywheel: it ties outcomes back to the skills that
    produced them. Aggregates grow more meaningful as data accumulates.
    """
    apps = list(JobApplication.objects.filter(user=request.user))
    applied = [a for a in apps if a.status in _APPLIED_STAGES]
    responded = [a for a in apps if a.status in _RESPONSE_STAGES]
    interviews = [a for a in apps if a.status in ("interview", "offer", "hired")]
    offers = [a for a in apps if a.status in ("offer", "hired")]
    hired = [a for a in apps if a.status == "hired"]
    ghosted = [a for a in apps if a.status == "ghosted"]

    def rate(part, whole):
        return round(len(part) / len(whole) * 100, 1) if whole else 0.0

    # Per-skill conversion: of applications mentioning a skill, how many got a
    # response? This is the first brick of "which skills actually convert".
    skill_funnel = {}
    for a in applied:
        got = a.status in _RESPONSE_STAGES
        for s in a.matched_skills or []:
            row = skill_funnel.setdefault(s, {"applied": 0, "responded": 0})
            row["applied"] += 1
            if got:
                row["responded"] += 1
    skill_conversion = sorted(
        (
            {
                "skill": s,
                "applied": r["applied"],
                "responded": r["responded"],
                "response_rate": rate([1] * r["responded"], [1] * r["applied"]),
            }
            for s, r in skill_funnel.items()
        ),
        key=lambda x: (x["response_rate"], x["applied"]),
        reverse=True,
    )

    return Response({
        "totals": {
            "tracked": len(apps),
            "applied": len(applied),
            "interviews": len(interviews),
            "offers": len(offers),
            "hired": len(hired),
            "ghosted": len(ghosted),
        },
        "rates": {
            "response_rate": rate(responded, applied),
            "interview_rate": rate(interviews, applied),
            "offer_rate": rate(offers, applied),
        },
        "skill_conversion": skill_conversion[:15],
    })


# Don't surface an aggregate computed from too few people (privacy + noise).
_MIN_SALARY_SAMPLE = 3


@api_view(["GET", "POST"])
def salary(request):
    """Submit a real offer, or read anonymised member-reported pay (Seed 3).

    POST stores one report. GET returns ONLY aggregates — never individual
    rows — and suppresses any bucket below a minimum sample size.
    """
    if request.method == "POST":
        try:
            amount = int(request.data.get("amount") or 0)
        except (TypeError, ValueError):
            amount = 0
        if not (1_000 <= amount <= 10_000_000):
            return Response(
                {"detail": "Enter a realistic annual amount."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        SalaryReport.objects.create(
            user=request.user,
            role_title=(request.data.get("role_title") or "").strip()[:160],
            skills=request.data.get("skills") or [],
            amount=amount,
            currency=(request.data.get("currency") or "USD").strip()[:8],
            location=(request.data.get("location") or "").strip()[:160],
        )
        return Response({"detail": "Thanks — added to the anonymous dataset."},
                        status=status.HTTP_201_CREATED)

    reports = list(SalaryReport.objects.all())
    total = len(reports)
    if total < _MIN_SALARY_SAMPLE:
        return Response({
            "sample_size": total,
            "ready": False,
            "detail": "Not enough reports yet — be one of the first to contribute.",
            "by_skill": [],
        })

    def median(values):
        s = sorted(values)
        n = len(s)
        mid = n // 2
        return s[mid] if n % 2 else (s[mid - 1] + s[mid]) // 2

    amounts = [r.amount for r in reports]

    # Per-skill medians, suppressing thin buckets.
    buckets = {}
    for r in reports:
        for s in r.skills or []:
            buckets.setdefault(s, []).append(r.amount)
    by_skill = sorted(
        (
            {"skill": s, "median": median(v), "samples": len(v)}
            for s, v in buckets.items()
            if len(v) >= _MIN_SALARY_SAMPLE
        ),
        key=lambda x: x["median"],
        reverse=True,
    )

    return Response({
        "sample_size": total,
        "ready": True,
        "overall_median": median(amounts),
        "overall_min": min(amounts),
        "overall_max": max(amounts),
        "by_skill": by_skill[:20],
    })
