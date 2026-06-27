from rest_framework import status, viewsets
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import Ticket, TicketHistory
from .serializers import TicketSerializer
from apps.comments.models import Comment
from apps.comments.serializers import CommentSerializer


@api_view(["GET"])
def health_check(request):
    return Response({"status": "ok", "service": "tecesupport"})


class TicketViewSet(viewsets.ModelViewSet):
    serializer_class = TicketSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        if hasattr(user, "profile") and user.profile.role == "analyst":
            return Ticket.objects.all().order_by("-created_at")

        return Ticket.objects.filter(author=user).order_by("-created_at")

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)

    def is_analyst(self, user):
        return hasattr(user, "profile") and user.profile.role == "analyst"

    @action(detail=True, methods=["post"])
    def assign_to_me(self, request, pk=None):
        if not self.is_analyst(request.user):
            return Response(
                {"detail": "Apenas analistas podem assumir chamados."},
                status=status.HTTP_403_FORBIDDEN,
            )

        ticket = self.get_object()
        ticket.assigned_to = request.user
        ticket.status = "in_progress"
        ticket.save()

        TicketHistory.objects.create(
            ticket=tickey,
            user=request.user,
            action="assign",
            description=f"{request.user.username} assumiu o chamado"
            )

        serializer = self.get_serializer(ticket)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=True, methods=["patch"])
    def update_priority(self, request, pk=None):
        if not self.is_analyst(request.user):
            return Response(
                {"detail": "Apenas analistas podem alterar prioridade."},
                status=status.HTTP_403_FORBIDDEN,
            )

        ticket = self.get_object()
        priority = request.data.get("priority")
        old_priority = ticket.priority

        valid_priorities = ["low", "medium", "high"]

        if priority not in valid_priorities:
            return Response(
                {"detail": "Prioridade inválida."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        ticket.priority = priority
        ticket.save()

        TicketHistory.objects.create(
            ticket=ticket,
            user=request.user, 
            action="priority_change",
            description=(
                f"{request.user.username} alterou a prioridade "
                f"de {old_priority} para {priority}"
            )
        )

        serializer = self.get_serializer(ticket)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=True, methods=["patch"])
    def update_status(self, request, pk=None):
        if not self.is_analyst(request.user):
            return Response(
                {"detail": "Apenas analistas podem alterar status."},
                status=status.HTTP_403_FORBIDDEN,
            )

        ticket = self.get_object()
        next_status = request.data.get("status")
        old_status = ticket.status

        valid_statuses = ["open", "in_progress", "resolved", "closed"]

        if next_status not in valid_statuses:
            return Response(
                {"detail": "Status invalido."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        ticket.status = next_status
        ticket.save()

        TicketHistory.objects.create(
            ticket=ticket,
            user=request.user,
            action="status_change",
            description=(
                f"{request.user.username} alterou o status "
                f"de {old_status} para {next_status}"
            )
        )

        serializer = self.get_serializer(ticket)
        return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def ticket_comments(request, ticket_id):
    user = request.user

    try:
        ticket = Ticket.objects.get(id=ticket_id)
    except Ticket.DoesNotExist:
        return Response(
            {"detail": "Ticket não encontrado."},
            status=status.HTTP_404_NOT_FOUND
        )

    is_analyst = hasattr(user, "profile") and user.profile.role == "analyst"

    if not is_analyst and ticket.author != user:
        return Response(
            {"detail": "Você não tem permissão para acessar este ticket."},
            status=status.HTTP_403_FORBIDDEN
        )

    if request.method == "GET":
        comments = Comment.objects.filter(ticket=ticket).order_by("created_at")
        serializer = CommentSerializer(comments, many=True)
        return Response(serializer.data)

    data = request.data.copy()
    data["ticket"] = ticket.id
    data["author"] = user.id

    serializer = CommentSerializer(data=data)

    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)



