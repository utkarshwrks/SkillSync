from django.urls import path
from . import views
from .views import USAJobsView

urlpatterns= [
    path('',views.index),
    path('convert-to-cv/', views.convert_to_cv, name='convert_to_cv'),  # Route for resume upload and suggestions 
    path('api/jobs/', USAJobsView.as_view(), name='job-list'), 
    path('fetch-internships/', views.fetch_internships_view, name='fetch_internships'),
    path('fetch-jobs/',views.fetch_jobs_view,name='fetch_jobs'),
    path("fetch-ijobs/", views.job_search_view, name="fetch_ijobs"),
    #KaustubhSen
    path('/upload/', views.upload_resume, name='upload'),
    path('register/', views.register, name='register'),
    path('login/', views.login_user, name='login'),
    path('logout/', views.logout_user, name='logout'),
    path('download/<int:resume_id>/', views.download_resume, name='download_resume'),
    path('save_resume_pdf/', views.save_resume_pdf, name='save_resume_pdf'),
    path('resume_editor/', views.resume_editor, name='resume_editor'),
]