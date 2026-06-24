from django.contrib import admin

from .models import JobApplication, SalaryReport, SkillStat


@admin.register(JobApplication)
class JobApplicationAdmin(admin.ModelAdmin):
    list_display = ("user", "title", "company", "status", "updated_at")
    list_filter = ("status", "source")
    search_fields = ("title", "company", "user__username")


@admin.register(SkillStat)
class SkillStatAdmin(admin.ModelAdmin):
    list_display = ("name", "share", "job_count", "sample_size", "avg_salary", "updated_at")
    search_fields = ("name",)


@admin.register(SalaryReport)
class SalaryReportAdmin(admin.ModelAdmin):
    list_display = ("role_title", "amount", "currency", "location", "created_at")
    search_fields = ("role_title", "location")
