from datetime import datetime, timedelta, timezone
import jwt
from django.conf import settings
from django.contrib.auth import authenticate
import strawberry
import strawberry_django

from .models import Usuario


@strawberry_django.type(Usuario)
class UsuarioType:
    id: strawberry.auto
    username: strawberry.auto
    email: strawberry.auto
    first_name: strawberry.auto
    last_name: strawberry.auto
    is_active: strawberry.auto
    is_staff: strawberry.auto

@strawberry.type
class LoginResponse:
    token: str
    usuario: UsuarioType

@strawberry.type
class AuthMutation:
    @strawberry.mutation
    def login(self, username: str, password: str) -> LoginResponse:
        user = authenticate(username=username, password=password)
        if not user:
            raise Exception("Credenciales inválidas")
        
        payload = {
            'user_id': user.id,
            'exp': datetime.now(timezone.utc) + timedelta(days=1),
            'iat': datetime.now(timezone.utc)
        }
        token = jwt.encode(payload, settings.SECRET_KEY, algorithm='HS256')
        
        return LoginResponse(token=token, usuario=user)