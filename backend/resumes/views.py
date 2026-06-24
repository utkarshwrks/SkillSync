import difflib

from django.http import HttpResponse
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.generics import ListAPIView
from rest_framework.response import Response

from .models import Resume, ResumeAnalysis, ResumeVersion
from .serializers import ResumeSerializer, ResumeVersionSerializer
from .services import ai, parsing, pdfgen, quality

MAX_BYTES = 5 * 1024 * 1024  # 5 MB


@api_view(["POST"])
def upload(request):
    file = request.FILES.get("resume") or request.FILES.get("file")
    if not file:
        return Response({"detail": "No file uploaded."}, status=status.HTTP_400_BAD_REQUEST)
    if file.size > MAX_BYTES:
        return Response({"detail": "File too large (max 5 MB)."}, status=status.HTTP_400_BAD_REQUEST)

    data = file.read()
    content_hash = parsing.sha256_of_bytes(data)

    # Cache hit: identical resume already analysed -> reuse, no Gemini call.
    analysis = ResumeAnalysis.objects.filter(content_hash=content_hash).first()
    if analysis is None:
        try:
            text = parsing.extract_text(data, file.name)
        except ValueError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)
        if not text.strip():
            return Response(
                {"detail": "Could not read any text from that file."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        skills = parsing.extract_skills(text)
        result = ai.analyze_resume(text, skills)
        analysis = ResumeAnalysis.objects.create(
            content_hash=content_hash,
            extracted_text=text,
            skills=skills,
            summary=result["summary"],
            score=result["score"],
            suggestions=result["suggestions"],
            fixes=result.get("fixes", []),
            improved_resume=result["improved_resume"],
            source=result["source"],
        )

    resume = Resume.objects.create(
        user=request.user, analysis=analysis, filename=file.name
    )
    return Response(ResumeSerializer(resume).data, status=status.HTTP_201_CREATED)


class ResumeListView(ListAPIView):
    serializer_class = ResumeSerializer

    def get_queryset(self):
        return Resume.objects.filter(user=self.request.user).select_related("analysis")


@api_view(["GET", "PATCH"])
def detail(request, pk):
    resume = Resume.objects.filter(user=request.user, pk=pk).select_related("analysis").first()
    if resume is None:
        return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)
    if request.method == "PATCH":
        # Save the user's in-place edits to their working copy.
        content = request.data.get("content")
        if content is not None:
            resume.edited_content = content
            resume.save(update_fields=["edited_content"])
    return Response(ResumeSerializer(resume).data)


@api_view(["GET"])
def templates(request):
    return Response({"templates": pdfgen.available_templates()})


@api_view(["POST"])
def export_pdf(request, pk):
    """Generate a formatted PDF of the improved resume in the chosen template."""
    resume = Resume.objects.filter(user=request.user, pk=pk).select_related("analysis").first()
    if resume is None:
        return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)

    template = (request.data.get("template") or pdfgen.DEFAULT_TEMPLATE).lower()
    name = request.data.get("name", "")
    contact = request.data.get("contact", "")
    # Prefer the user's edited copy, then the AI rewrite, then the original.
    content = (
        request.data.get("content")
        or resume.edited_content
        or resume.analysis.improved_resume
        or resume.analysis.extracted_text
    )

    pdf_bytes = pdfgen.build_resume_pdf(content, template=template, name=name, contact=contact)
    response = HttpResponse(pdf_bytes, content_type="application/pdf")
    safe = resume.filename.rsplit(".", 1)[0] or "resume"
    response["Content-Disposition"] = f'attachment; filename="{safe}_{template}.pdf"'
    return response


def _get_resume(request, pk):
    return (
        Resume.objects.filter(user=request.user, pk=pk)
        .select_related("analysis")
        .first()
    )


def _current_content(resume):
    """The resume's live text: user edits, else AI rewrite, else original."""
    return (
        resume.edited_content
        or resume.analysis.improved_resume
        or resume.analysis.extracted_text
    )


@api_view(["GET", "POST"])
def versions(request, pk):
    """List a resume's saved versions, or save the current content as one (#4)."""
    resume = _get_resume(request, pk)
    if resume is None:
        return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)

    if request.method == "POST":
        version = ResumeVersion.objects.create(
            resume=resume,
            label=(request.data.get("label") or "").strip(),
            tailored_for=(request.data.get("tailored_for") or "").strip(),
            # Snapshot whatever the caller sends, else the current working copy.
            content=request.data.get("content") or _current_content(resume),
        )
        return Response(
            ResumeVersionSerializer(version).data, status=status.HTTP_201_CREATED
        )

    qs = resume.versions.all()
    return Response(ResumeVersionSerializer(qs, many=True).data)


@api_view(["GET"])
def version_diff(request, pk):
    """Line-level diff between two versions (or a version vs current content).

    Query params: a=<version id> (required), b=<version id> (optional; if
    omitted, compares against the resume's current working copy).
    """
    resume = _get_resume(request, pk)
    if resume is None:
        return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)

    a_id = request.query_params.get("a")
    a = resume.versions.filter(pk=a_id).first() if a_id else None
    if a is None:
        return Response(
            {"detail": "Provide a valid version id as ?a="},
            status=status.HTTP_400_BAD_REQUEST,
        )

    b_id = request.query_params.get("b")
    if b_id:
        b = resume.versions.filter(pk=b_id).first()
        if b is None:
            return Response(
                {"detail": "Version 'b' not found."},
                status=status.HTTP_404_NOT_FOUND,
            )
        b_content, b_label = b.content, (b.label or f"version {b.id}")
    else:
        b_content, b_label = _current_content(resume), "current"

    diff = list(
        difflib.unified_diff(
            a.content.splitlines(),
            b_content.splitlines(),
            fromfile=a.label or f"version {a.id}",
            tofile=b_label,
            lineterm="",
        )
    )
    # Also a simple structured form the frontend can render without parsing.
    structured = [
        {
            "type": ("add" if line.startswith("+") and not line.startswith("+++")
                     else "remove" if line.startswith("-") and not line.startswith("---")
                     else "context"),
            "text": line,
        }
        for line in diff
        if not line.startswith("@@")
    ]
    return Response({
        "from": a.label or f"version {a.id}",
        "to": b_label,
        "unified": "\n".join(diff),
        "lines": structured,
    })


@api_view(["GET"])
def quality_report(request, pk):
    """Dual-lens (ATS + recruiter) score and evidence-based metric prompts.

    Fully offline heuristics — works even when the Gemini free tier is down.
    """
    resume = _get_resume(request, pk)
    if resume is None:
        return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)

    content = _current_content(resume)
    report = quality.dual_lens_score(content, resume.analysis.skills)
    report["metric_prompts"] = quality.metric_prompts(content)
    return Response(report)
