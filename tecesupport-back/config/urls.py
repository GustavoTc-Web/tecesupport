from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from apps.users.views import CustomTokenObtainPairView

urlpatterns = [
    path("admin/", admin.site.urls),

    # autenticaÃ§Ã£o
    path("api/login/", CustomTokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("api/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),

    #apps
    path("api/", include("apps.tickets.urls")),
    path("api/comments", include("apps.comments.urls")),
    path("api/users/", include("apps.users.urls")),
]
