from django.shortcuts import render

from rest_framework import viewsets
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Ticket
from .serializers import TicketSerializer
from rest_framework.permissions import IsAuthenticated 
from apps.comments.models import Comment
from apps.comments.serializers import CommentSerializer
from rest_framework.permissions import AllowAny


@api_view(["GET"])
def health_check(request):
    return Response({"status": "ok", "service": "tecesupport"})


class TicketViewSet(viewsets.ModelViewSet):
    queryset = Ticket.objects.all().order_by("-created_at")
    serializer_class = TicketSerializer
    permission_classes = [AllowAny]
 
    def perform_create(self, serializer):
        serializer.save(author=self.request.user)


@api_view(["GET", "POST"])
def ticket_comments(request, ticket_id):
    if request.method == "GET":
        comments = Comment.objects.filter(ticket_id=ticket_id)
        serializers = CommentSerializer(comments, many=True)
        return Response(serializers.data)
    
    if request.method == "POST":
        data = request.data.copy()
        data["ticket"] = ticket_id
        data["author"] = request.user.id

        serializers = CommentSerializer(data=data)

        if serializers.is_valid():
            serializers.save()
            return Response(serializers.data, status= 201)
        
        return Response(serializers.errors, status= 400)