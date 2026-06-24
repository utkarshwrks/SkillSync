from django.urls import path

from . import views

urlpatterns = [
    path("register/", views.register, name="register"),
    path("login/", views.login, name="login"),
    path("logout/", views.logout, name="logout"),
    path("me/", views.me, name="me"),
    path("verify-skills/", views.verify_skills, name="verify-skills"),
    path("profile/<str:username>/", views.public_profile, name="public-profile"),
]
