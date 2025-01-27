from django.contrib import admin
from django.urls import path, include, re_path
from django.views.generic import TemplateView

urlpatterns = [
    # Django app URLs
    path('admin/', admin.site.urls),
    path('', include('home.urls')),
]
