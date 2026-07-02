from django.urls import path
from .views import RegisterView, ChangePasswordView, CurrentUserView, UserPreferenceView

urlpatterns = [
    path("register/", RegisterView.as_view(), name="register"),
    path("me/", CurrentUserView.as_view(), name="current-user"),
    path(
        "change-password/",
        ChangePasswordView.as_view(),
        name="change-password",
    ),
    path(
        "preferences/",
        UserPreferenceView.as_view(),
        name="user-preferences",
    ),
]
