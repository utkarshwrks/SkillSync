from django.shortcuts import render

def index(request):
    return render(request, 'index.html')  # Serve the React build file