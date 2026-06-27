from django.db import models
from django.contrib.auth.models import User

class Ticket(models.Model): 

    STATUS_CHOICES = [
        ("open", "Open"),
        ("in_progress", "In Progress"),
        ("resolved", "Resolved"),
        ("closed", "Closed"),
    ]

    PRIORITY_CHOICES = [
        ("low", "Low"),
        ("medium", "Medium"),
        ("high", "High"),
    ]

    title = models.CharField(max_length=255)
    description = models.TextField(default="")

    status = models.CharField(
        max_length=20, 
        choices= STATUS_CHOICES,
        default="open"
    )

    priority = models.CharField(
        max_length=20,
        choices= PRIORITY_CHOICES,
        default="medium"
    )
    
    author = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="tickets_created"
    )

    
    assigned_to = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="tickets_assigned"
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    contact_phone1 = models.CharField(max_length=20)
    contact_phone2 = models.CharField(max_length=20, blank=True, null=True)

    def __str__(self):
        return self.title
    

class TicketHistory(models.Model):
    ticket = models.ForeignKey (
        Ticket,
        on_delete=models.CASCADE,
        related_name="histories"
    )

    user = models.ForeignKey(
        User, 
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )

    action = models.CharField(max_length=50)
    description = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
       