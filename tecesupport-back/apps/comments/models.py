from django.db import models
from django.contrib.auth.models import User
from apps.tickets.models import Ticket

class Comment(models.Model):
    ticket = models.ForeignKey(
        Ticket, 
        on_delete= models.CASCADE, 
        related_name="comments"
    )

    author = models.ForeignKey(
        User,
        on_delete=models.CASCADE
    )
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Comentário de {self.author.username} no Ticket {self.ticket.id}"
    
    