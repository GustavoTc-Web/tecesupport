from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver


class UserProfile(models.Model):
    ROLE_CHOICES = [
        ("client", "Client"),
        ("analyst", "Analyst"),
    ]

    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name="profile"
    )
    role = models.CharField(
        max_length=20,
        choices=ROLE_CHOICES,
        default="client"
    )

    def __str__(self):
        return f"{self.user.username} - {self.role}"
    

class UserPreference(models.Model):
    THEME_CHOICES = [
        ("dark", "Escuro"),
        ("light", "Claro"),
        ("system", "Sistema"),
    ]

    TICKETS_PER_PAGE_CHOICES = [
        (10, "10"),
        (20, "20"),
        (50, "50"),
    ]

    user = models.OneToOneField(
        User, 
        on_delete=models.CASCADE,
        related_name="preferences",
    )
    theme = models.CharField(
        max_length=10,
        choices=THEME_CHOICES,
        default="dark",
    )

    reduce_motion = models.BooleanField(
        default=False,
    )

    sidebar_collapsed = models.BooleanField(
        default=False
    )

    tickets_per_page = models.PositiveSmallIntegerField(
        choices=TICKETS_PER_PAGE_CHOICES,
        default=10,
    )

    def __str__(self):
        return f"Preferências de {self.user.username}"
    

