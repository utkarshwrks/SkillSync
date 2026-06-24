from django.contrib.auth import authenticate
from rest_framework import status
from rest_framework.authtoken.models import Token
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from .models import Profile
from .serializers import ProfileSerializer, RegisterSerializer, UserSerializer


def _auth_payload(user):
    token, _ = Token.objects.get_or_create(user=user)
    return {"token": token.key, "user": UserSerializer(user).data}


@api_view(["POST"])
@permission_classes([AllowAny])
def register(request):
    serializer = RegisterSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    user = serializer.save()
    return Response(_auth_payload(user), status=status.HTTP_201_CREATED)


@api_view(["POST"])
@permission_classes([AllowAny])
def login(request):
    username = request.data.get("username", "").strip()
    password = request.data.get("password", "")
    user = authenticate(username=username, password=password)
    if user is None:
        return Response(
            {"detail": "Invalid username or password."},
            status=status.HTTP_401_UNAUTHORIZED,
        )
    return Response(_auth_payload(user))


@api_view(["POST"])
def logout(request):
    Token.objects.filter(user=request.user).delete()
    return Response({"detail": "Logged out."})


@api_view(["GET"])
@permission_classes([AllowAny])
def public_profile(request, username):
    """A shareable, public skill profile — skills only, never resume text.

    Surfaces the user's latest resume skills plus live market demand for
    each, so the profile doubles as a credible, data-backed skill snapshot.
    """
    from django.contrib.auth.models import User
    from jobs.models import SkillStat
    from resumes.models import Resume

    user = User.objects.filter(username=username).first()
    if user is None:
        return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)

    resume = (
        Resume.objects.filter(user=user)
        .select_related("analysis")
        .order_by("-created_at")
        .first()
    )
    skills = resume.analysis.skills if resume else []
    profile = getattr(user, "profile", None)
    verified = {s.lower() for s in (profile.verified_skills if profile else [])}
    stat_by_name = {s.name.lower(): s for s in SkillStat.objects.all()}
    skill_market = [
        {
            "name": s,
            "share": getattr(stat_by_name.get(s.lower()), "share", None),
            "avg_salary": getattr(stat_by_name.get(s.lower()), "avg_salary", None),
            "verified": s.lower() in verified,
        }
        for s in skills
    ]
    # Verified skills the user proved but that aren't on the latest resume.
    extra_verified = [
        {"name": s, "verified": True}
        for s in (profile.verified_skills if profile else [])
        if s.lower() not in {k.lower() for k in skills}
    ]

    return Response({
        "username": user.username,
        "name": (user.get_full_name() or user.username),
        "joined": user.date_joined,
        "skill_count": len(skills),
        "skills": skill_market + extra_verified,
        "verified_count": len(verified),
        "verification_source": (profile.verification_source if profile else ""),
    })


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def verify_skills(request):
    """Verify the user's skills from a GitHub/portfolio URL (Seed 2).

    Detects which catalogue skills are evidenced at the URL, stores the
    verified set on the profile, and returns the result. Degradation-safe:
    a fetch failure returns an error string, never a 500.
    """
    from django.utils import timezone

    from resumes.models import Resume
    from .verification import verify_from_url

    url = request.data.get("url", "")

    resume = (
        Resume.objects.filter(user=request.user)
        .select_related("analysis")
        .order_by("-created_at")
        .first()
    )
    claimed = resume.analysis.skills if resume else []

    result = verify_from_url(url, claimed_skills=claimed)
    if result["error"]:
        return Response(
            {"detail": f"Could not verify from that URL: {result['error']}"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    profile, _ = Profile.objects.get_or_create(user=request.user)
    profile.verified_skills = result["verified"] or result["detected"]
    profile.verification_source = url
    profile.verified_at = timezone.now()
    profile.save(update_fields=["verified_skills", "verification_source", "verified_at"])

    return Response({
        "verified_skills": profile.verified_skills,
        "detected": result["detected"],
        "source_type": result["source_type"],
        "verified_at": profile.verified_at,
    })


@api_view(["GET", "PATCH"])
@permission_classes([IsAuthenticated])
def me(request):
    if request.method == "PATCH":
        profile, _ = Profile.objects.get_or_create(user=request.user)
        serializer = ProfileSerializer(profile, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        # Allow updating basic User fields too.
        for field in ("first_name", "last_name", "email"):
            if field in request.data:
                setattr(request.user, field, request.data[field])
        request.user.save()
    return Response(UserSerializer(request.user).data)
