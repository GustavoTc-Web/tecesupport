from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers

from .models import UserPreference


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)


class UserProfileSerializer(serializers.ModelSerializer):
    role = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "email",
            "role",
        ]
        read_only_fields = [
            "id",
            "role",
        ]

    def get_role(self, user):
        return user.profile.role if hasattr(user, "profile") else "client"

    def validate_email(self, value):
        user = self.instance

        email_already_exists = (
            User.objects
            .filter(email__iexact=value)
            .exclude(pk=user.pk if user else None)
            .exists()
        )

        if email_already_exists:
            raise serializers.ValidationError(
                "Já existe uma conta cadastrada com este e-mail."
            )

        return value


class UserPreferenceSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserPreference
        fields = [
            "theme",
            "reduce_motion",
            "sidebar_collapsed",
            "tickets_per_page",
        ]


class ChangePasswordSerializer(serializers.Serializer):
    current_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True)
    confirm_password = serializers.CharField(write_only=True)

    def validate_current_password(self, value):
        user = self.context["request"].user

        if not user.check_password(value):
            raise serializers.ValidationError(
                "A senha atual está incorreta."
            )

        return value

    def validate(self, attrs):
        new_password = attrs["new_password"]
        confirm_password = attrs["confirm_password"]

        if new_password != confirm_password:
            raise serializers.ValidationError(
                {
                    "confirm_password": (
                        "A confirmação não corresponde à nova senha."
                    )
                }
            )

        validate_password(
            password=new_password,
            user=self.context["request"].user,
        )

        return attrs

    def save(self, **kwargs):
        user = self.context["request"].user
        user.set_password(self.validated_data["new_password"])
        user.save(update_fields=["password"])

        return user