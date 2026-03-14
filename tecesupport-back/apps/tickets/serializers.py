from rest_framework import serializers
from .models import Ticket
from apps.comments.serializers import CommentSerializer

class TicketSerializer(serializers.ModelSerializer):
    author_username = serializers.CharField(source="author.username", read_only= True)
    assigned_to_username = serializers.CharField(source= "assigned_to.username", read_only= True)
    comments = CommentSerializer(many= True, read_only= True)

    class Meta:
        model = Ticket
        fields = [
            "id",
            "title",
            "description",
            "status",
            "priority",
            "author",
            "author_username",
            "assigned_to",
            "assigned_to_username",
            "created_at",
            "updated_at",
            "comments",
        ]
        read_only_fields = ["id", "author", "created_at", "updated_at"]