"""
Root URL configuration for RecipeAI backend.
"""
from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse


from core.mongodb import check_mongo_connection


def health_check(request):
    mongo_ok, mongo_msg = check_mongo_connection()
    return JsonResponse({
        "status": "ok",
        "service": "RecipeAI API",
        "databases": {
            "sqlite": "connected",
            "mongodb": "connected" if mongo_ok else f"disconnected ({mongo_msg})",
        }
    })


urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/health/', health_check, name='health-check'),
    path('api/auth/', include('users.urls')),
    path('api/', include('recipes.urls')),
]
