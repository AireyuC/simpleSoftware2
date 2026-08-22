import strawberry
import strawberry_django

from modules.users.graphql import UsuarioType, AuthMutation

from modules.purchases.graphql import (
    ProveedorType,
    NotaCompraType,
    DetalleCompraType,
    PurchasesMutation,
)


@strawberry.type
class Query:

    @strawberry.field
    def hello(self) -> str:
        return "Minisoftware API funcionando"

    usuarios: list[UsuarioType] = strawberry_django.field()

    # Se expone como getProveedores en GraphQL
    get_proveedores: list[ProveedorType] = strawberry_django.field()

    notas_compra: list[NotaCompraType] = strawberry_django.field()

    detalles_compra: list[DetalleCompraType] = strawberry_django.field()


@strawberry.type
class Mutation(PurchasesMutation, AuthMutation):
    pass


schema = strawberry.Schema(
    query=Query,
    mutation=Mutation,
)