from django.urls import path

from . import views

urlpatterns = [
    path("", views.search, name="job-search"),
    path("recommended/", views.recommended, name="job-recommended"),
    path("skill-stats/", views.skill_stats, name="job-skill-stats"),
    path("reverse-match/", views.reverse_match, name="job-reverse-match"),
    path("salary/", views.salary, name="job-salary"),
    path("applications/", views.applications, name="job-applications"),
    path("applications/stats/", views.application_stats, name="job-application-stats"),
    path("applications/<int:pk>/", views.application_detail, name="job-application-detail"),
]
