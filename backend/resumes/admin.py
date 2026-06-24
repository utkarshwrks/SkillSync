from django.contrib import admin

from .models import Resume, ResumeAnalysis, ResumeVersion


@admin.register(ResumeAnalysis)
class ResumeAnalysisAdmin(admin.ModelAdmin):
    list_display = ("content_hash", "score", "source", "created_at")
    search_fields = ("content_hash",)


@admin.register(Resume)
class ResumeAdmin(admin.ModelAdmin):
    list_display = ("user", "filename", "created_at")
    search_fields = ("filename", "user__username")


@admin.register(ResumeVersion)
class ResumeVersionAdmin(admin.ModelAdmin):
    list_display = ("resume", "label", "tailored_for", "created_at")
    search_fields = ("label", "tailored_for", "resume__filename")
