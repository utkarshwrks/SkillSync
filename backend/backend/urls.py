from django.contrib import admin
from django.urls import path, include, re_path
from django.views.generic import TemplateView
from django.conf import settings
from django.conf.urls.static import static
urlpatterns = [
    # Django app URLs
    path('admin/', admin.site.urls),
    path('', include('home.urls')),
]
