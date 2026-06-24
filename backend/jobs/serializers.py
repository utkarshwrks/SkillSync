from rest_framework import serializers

from .models import JobApplication


class JobApplicationSerializer(serializers.ModelSerializer):
    class Meta:
        model = JobApplication
        fields = [
            "id", "title", "company", "location", "url", "source",
            "status", "notes", "matched_skills", "applied_at",
            "created_at", "updated_at",
        ]
        read_only_fields = ["id", "applied_at", "created_at", "updated_at"]
