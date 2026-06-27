from rest_framework import serializers
from .models import Ticket, TicketHistory


class TicketHistorySerializer(serializers.ModelSerializer):
    user_username = serializers.SerializerMethodField()
    user_name = serializers.SerializerMethodField()

    class Meta:
        model = TicketHistory
        fields = [
            "id",
            "action",
            "description",
            "created_at",
            "user_username",
            "user_name",
        ]

    def get_user_username(self, obj):
        return obj.user.username if obj.user else None

    def get_user_name(self, obj):
        if not obj.user:
            return None

        full_name = f"{obj.user.first_name} {obj.user.last_name}".strip()
        return full_name if full_name else obj.user.username


class TicketSerializer(serializers.ModelSerializer):
    author_email = serializers.SerializerMethodField()
    author_username = serializers.SerializerMethodField()
    assigned_to_name = serializers.SerializerMethodField()
    histories = TicketHistorySerializer(many=True, read_only=True)

    class Meta:
        model = Ticket
        fields = [
            "id",
            "title",
            "description",
            "status",
            "priority",
            "author",
            "author_email",
            "author_username",
            "assigned_to",
            "assigned_to_name",
            "created_at",
            "updated_at",
            "contact_phone1",
            "contact_phone2",
            "histories",
        ]
        read_only_fields = [
            "id", 
            "author", 
            "status",
            "priority",
            "assigned_to",
            "created_at", 
            "updated_at",
            "histories",
        ]
        
    def get_author_email(self, obj):
        return obj.author.email if obj.author else None
    
    def get_author_username(self, obj):
        return obj.author.username if obj.author else None

    def get_assigned_to_name(self, obj):
        if obj.assigned_to:
            full_name = f"{obj.assigned_to.first_name} {obj.assigned_to.last_name}".strip()
            return full_name if full_name else obj.assigned_to.username
        return None
    
    def validate(self, data):
        if not data.get("title") or not data.get("description"):
            raise serializers.ValidationError(
                {"message": "Título e descrição são obrigatórios."}
            )
        return data
