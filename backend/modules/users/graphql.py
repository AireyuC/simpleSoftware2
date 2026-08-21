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