from django.urls import path

from . import views

urlpatterns = [
    path("", views.ResumeListView.as_view(), name="resume-list"),
    path("upload/", views.upload, name="resume-upload"),
    path("templates/", views.templates, name="resume-templates"),
    path("<int:pk>/", views.detail, name="resume-detail"),
    path("<int:pk>/export/", views.export_pdf, name="resume-export"),
    path("<int:pk>/quality/", views.quality_report, name="resume-quality"),
    path("<int:pk>/versions/", views.versions, name="resume-versions"),
    path("<int:pk>/versions/diff/", views.version_diff, name="resume-version-diff"),
]
