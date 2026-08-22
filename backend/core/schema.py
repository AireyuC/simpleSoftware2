import strawberry
import strawberry_django

from modules.users.graphql import UsuarioType, AuthMutation, UsersMutation

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

    @strawberry.field
    def get_proveedores(self) -> list[ProveedorType]:
        from django.core.cache import cache
        from modules.purchases.models import Proveedor
        
        proveedores = cache.get("proveedores_activos")
        if proveedores is not None:
            print("🟢 [REDIS] Proveedores obtenidos desde Caché!")
            return proveedores
            
        print("🟡 [POSTGRES] Consultando Proveedores a Base de Datos...")
        proveedores = list(Proveedor.objects.all())
        cache.set("proveedores_activos", proveedores, timeout=3600)
        return proveedores

    notas_compra: list[NotaCompraType] = strawberry_django.field()

    detalles_compra: list[DetalleCompraType] = strawberry_django.field()


@strawberry.type
class Mutation(PurchasesMutation, AuthMutation, UsersMutation):
    pass


from modules.purchases.graphql import PurchasesSubscription

@strawberry.type
class Subscription(PurchasesSubscription):
    pass

schema = strawberry.Schema(
    query=Query,
    mutation=Mutation,
    subscription=Subscription,
)