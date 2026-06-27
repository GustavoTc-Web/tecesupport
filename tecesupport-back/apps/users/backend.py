from django.contrib.auth.backends import ModelBackend
from django.contrib.auth.models import User

class EmailBackend(ModelBackend):
     def authenticate(self, request, username=None, password=None, **kwargs):
        email = kwargs.get("email") or username

        if email is None or password is None:
            return None
        
        if "@" not in email:
            return None
        
        user = User.objects.filter(email__iexact=email).first()

        if not user:
            return None

        if user.check_password(password) and self.user_can_authenticate(user):
            return user

        return None