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
    telefono: strawberry.auto
    rol: strawberry.auto

@strawberry.input
class UsuarioInput:
    username: str
    email: str
    first_name: str
    last_name: str
    password: str
    telefono: str | None = None
    rol: str = "EMPLEADO"

@strawberry.input
class UsuarioUpdateInput:
    usuario_id: int
    username: str
    email: str
    first_name: str
    last_name: str
    password: str | None = None
    telefono: str | None = None
    rol: str = "EMPLEADO"

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

@strawberry.type
class UsersMutation:
    @strawberry.mutation
    def crear_usuario(self, data: UsuarioInput) -> UsuarioType:
        if Usuario.objects.filter(username=data.username).exists():
            raise Exception("El nombre de usuario ya existe")
        
        user = Usuario(
            username=data.username,
            email=data.email,
            first_name=data.first_name,
            last_name=data.last_name,
            telefono=data.telefono,
            rol=data.rol,
            is_active=True
        )
        user.set_password(data.password)
        user.save()
        return user

    @strawberry.mutation
    def actualizar_usuario(self, data: UsuarioUpdateInput) -> UsuarioType:
        try:
            user = Usuario.objects.get(pk=data.usuario_id)
        except Usuario.DoesNotExist:
            raise Exception("El usuario no existe")
        
        if data.username != user.username and Usuario.objects.filter(username=data.username).exists():
            raise Exception("El nombre de usuario ya existe")
            
        user.username = data.username
        user.email = data.email
        user.first_name = data.first_name
        user.last_name = data.last_name
        user.telefono = data.telefono
        user.rol = data.rol
        
        if data.password and data.password.strip():
            user.set_password(data.password)
            
        user.save()
        return user

    @strawberry.mutation
    def cambiar_estado_usuario(self, usuario_id: int) -> UsuarioType:
        try:
            user = Usuario.objects.get(pk=usuario_id)
        except Usuario.DoesNotExist:
            raise Exception("El usuario no existe")
            
        user.is_active = not user.is_active
        user.save()
        return user