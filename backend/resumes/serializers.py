from rest_framework import serializers

from .models import Resume, ResumeAnalysis, ResumeVersion


class ResumeVersionSerializer(serializers.ModelSerializer):
    class Meta:
        model = ResumeVersion
        fields = ["id", "label", "content", "tailored_for", "created_at"]
        read_only_fields = ["id", "created_at"]


class AnalysisSerializer(serializers.ModelSerializer):
    class Meta:
        model = ResumeAnalysis
        fields = [
            "skills", "summary", "score", "suggestions", "fixes",
            "improved_resume", "source",
        ]


class ResumeSerializer(serializers.ModelSerializer):
    skills = serializers.JSONField(source="analysis.skills", read_only=True)
    summary = serializers.CharField(source="analysis.summary", read_only=True)
    score = serializers.IntegerField(source="analysis.score", read_only=True)
    suggestions = serializers.JSONField(source="analysis.suggestions", read_only=True)
    fixes = serializers.JSONField(source="analysis.fixes", read_only=True)
    improved_resume = serializers.CharField(source="analysis.improved_resume", read_only=True)
    original_text = serializers.CharField(source="analysis.extracted_text", read_only=True)
    source = serializers.CharField(source="analysis.source", read_only=True)
    # The live, editable copy (falls back to the AI rewrite if untouched).
    content = serializers.SerializerMethodField()

    class Meta:
        model = Resume
        fields = [
            "id", "filename", "created_at", "skills", "summary", "score",
            "suggestions", "fixes", "improved_resume", "original_text",
            "content", "source",
        ]

    def get_content(self, obj):
        return obj.edited_content or obj.analysis.improved_resume or obj.analysis.extracted_text
