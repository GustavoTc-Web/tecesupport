from django.urls import path, include
from .views import health_check
from rest_framework.routers import DefaultRouter
from .views import TicketViewSet, health_check
from .views import ticket_comments



router = DefaultRouter()
router.register(r"tickets", TicketViewSet, basename="ticket")

urlpatterns = [
    path("health/", health_check),
    path("", include(router.urls)),
    path("tickets/<int:ticket_id>/comments/", ticket_comments, name= "ticket-comments"),
]