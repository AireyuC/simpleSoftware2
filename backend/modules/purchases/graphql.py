from decimal import Decimal, InvalidOperation

import strawberry
import strawberry_django

from django.db import transaction
from django.db.models import Sum
from django.core.cache import cache
import redis

from modules.users.models import Usuario
from modules.users.graphql import UsuarioType

from .models import (
    Proveedor,
    NotaCompra,
    DetalleCompra,
)


# ============================================================
# TYPES
# ============================================================


@strawberry_django.type(Proveedor)
class ProveedorType:
    id: strawberry.auto
    razon_social: strawberry.auto
    nit: strawberry.auto
    ubicacion: strawberry.auto
    telefono: strawberry.auto
    email: strawberry.auto
    descripcion: strawberry.auto
    is_active: strawberry.auto


@strawberry_django.type(NotaCompra)
class NotaCompraType:
    id: strawberry.auto
    descripcion: strawberry.auto
    total: strawberry.auto
    fecha_emision: strawberry.auto
    estado: strawberry.auto

    usuario: UsuarioType = strawberry_django.field()


@strawberry_django.type(DetalleCompra)
class DetalleCompraType:
    id: strawberry.auto
    cantidad: strawberry.auto
    precio_unitario: strawberry.auto
    subtotal: strawberry.auto
    glosa: strawberry.auto

    nota_compra: NotaCompraType = strawberry_django.field()
    proveedor: ProveedorType = strawberry_django.field()


# ============================================================
# INPUTS - CREAR
# ============================================================


@strawberry.input
class CrearProveedorInput:
    razon_social: str
    nit: str
    ubicacion: str
    telefono: str
    email: str
    descripcion: str


@strawberry.input
class CrearNotaCompraInput:
    descripcion: str
    usuario_id: int
    estado: str = "PENDIENTE"


@strawberry.input
class CrearDetalleCompraInput:
    nota_compra_id: int
    proveedor_id: int
    cantidad: int
    precio_unitario: str
    glosa: str


@strawberry.input
class CrearDetalleEnNotaInput:
    proveedor_id: int
    cantidad: int
    precio_unitario: str
    glosa: str


@strawberry.input
class CrearNotaConDetallesInput:
    descripcion: str
    usuario_id: int
    detalles: list[CrearDetalleEnNotaInput]



# ============================================================
# INPUTS - EDITAR
# ============================================================


@strawberry.input
class EditarProveedorInput:
    proveedor_id: int
    razon_social: str | None = None
    nit: str | None = None
    ubicacion: str | None = None
    telefono: str | None = None
    email: str | None = None
    descripcion: str | None = None


@strawberry.input
class EditarDetalleCompraInput:
    detalle_id: int
    proveedor_id: int | None = None
    cantidad: int | None = None
    precio_unitario: str | None = None
    glosa: str | None = None


@strawberry.input
class CambiarEstadoNotaInput:
    nota_compra_id: int
    estado: str


# ============================================================
# FUNCIONES AUXILIARES
# ============================================================

import redis

_redis_publisher = redis.Redis(host='redis', port=6379, db=2)

def notificar_proveedores_actualizados():
    from django.core.cache import cache
    cache.delete("proveedores_activos")
    try:
        _redis_publisher.publish('proveedores_channel', 'RELOAD')
    except Exception as e:
        print(f"Error publishing to redis: {e}")


def recalcular_total_nota(nota: NotaCompra) -> None:
    nuevo_total = (
        DetalleCompra.objects
        .filter(nota_compra=nota)
        .aggregate(total=Sum("subtotal"))
        .get("total")
        or Decimal("0.00")
    )

    nota.total = nuevo_total
    nota.save(update_fields=["total"])


def convertir_precio(precio: str) -> Decimal:
    try:
        valor = Decimal(precio.strip())
    except (
        InvalidOperation,
        AttributeError,
        ValueError,
    ):
        raise ValueError(
            "El precio unitario no es válido."
        )

    if valor < Decimal("0.00"):
        raise ValueError(
            "El precio unitario no puede ser negativo."
        )

    return valor


# ============================================================
# MUTATIONS
# ============================================================


@strawberry.type
class PurchasesMutation:

    # ========================================================
    # CREAR PROVEEDOR
    # ========================================================

    @strawberry.mutation
    def create_proveedor(
        self,
        data: CrearProveedorInput,
    ) -> ProveedorType:

        razon_social = data.razon_social.strip()
        nit = data.nit.strip()

        if not razon_social:
            raise ValueError(
                "La razón social es obligatoria."
            )

        if not nit:
            raise ValueError(
                "El NIT es obligatorio."
            )

        if Proveedor.objects.filter(nit=nit).exists():
            raise ValueError(
                "Ya existe un proveedor con ese NIT."
            )

        proveedor = Proveedor.objects.create(
            razon_social=razon_social,
            nit=nit,
            ubicacion=data.ubicacion.strip(),
            telefono=data.telefono.strip(),
            email=data.email.strip(),
            descripcion=data.descripcion.strip(),
            is_active=True,
        )

        notificar_proveedores_actualizados()
        return proveedor

    # ========================================================
    # EDITAR PROVEEDOR
    # ========================================================

    @strawberry.mutation
    def update_proveedor(
        self,
        data: EditarProveedorInput,
    ) -> ProveedorType:

        proveedor = Proveedor.objects.filter(
            pk=data.proveedor_id
        ).first()

        if proveedor is None:
            raise ValueError(
                "El proveedor no existe."
            )

        if data.razon_social is not None:
            razon_social = data.razon_social.strip()

            if not razon_social:
                raise ValueError(
                    "La razón social no puede estar vacía."
                )

            proveedor.razon_social = razon_social

        if data.nit is not None:
            nit = data.nit.strip()

            if not nit:
                raise ValueError(
                    "El NIT no puede estar vacío."
                )

            nit_existente = (
                Proveedor.objects
                .filter(nit=nit)
                .exclude(pk=proveedor.pk)
                .exists()
            )

            if nit_existente:
                raise ValueError(
                    "Ya existe otro proveedor con ese NIT."
                )

            proveedor.nit = nit

        if data.ubicacion is not None:
            proveedor.ubicacion = data.ubicacion.strip()

        if data.telefono is not None:
            proveedor.telefono = data.telefono.strip()

        if data.email is not None:
            proveedor.email = data.email.strip()

        if data.descripcion is not None:
            proveedor.descripcion = data.descripcion.strip()

        proveedor.save()

        notificar_proveedores_actualizados()
        return proveedor

    # ========================================================
    # DESACTIVAR PROVEEDOR
    # ========================================================

    @strawberry.mutation
    def desactivar_proveedor(
        self,
        proveedor_id: int,
    ) -> ProveedorType:

        proveedor = Proveedor.objects.filter(
            pk=proveedor_id
        ).first()

        if proveedor is None:
            raise ValueError(
                "El proveedor no existe."
            )

        proveedor.is_active = False
        proveedor.save(
            update_fields=["is_active"]
        )

        notificar_proveedores_actualizados()
        return proveedor

    # ========================================================
    # REACTIVAR PROVEEDOR
    # ========================================================

    @strawberry.mutation
    def reactivar_proveedor(
        self,
        proveedor_id: int,
    ) -> ProveedorType:

        proveedor = Proveedor.objects.filter(
            pk=proveedor_id
        ).first()

        if proveedor is None:
            raise ValueError(
                "El proveedor no existe."
            )

        proveedor.is_active = True
        proveedor.save(
            update_fields=["is_active"]
        )

        notificar_proveedores_actualizados()
        return proveedor

    # ========================================================
    # CREAR NOTA DE COMPRA
    # ========================================================

    @strawberry.mutation
    def crear_nota_compra(
        self,
        data: CrearNotaCompraInput,
    ) -> NotaCompraType:

        descripcion = data.descripcion.strip()

        if not descripcion:
            raise ValueError(
                "La descripción es obligatoria."
            )

        estado = data.estado.upper().strip()

        estados_validos = {
            "PENDIENTE",
            "COMPLETADA",
            "ANULADA",
        }

        if estado not in estados_validos:
            raise ValueError(
                "Estado inválido."
            )

        usuario = Usuario.objects.filter(
            pk=data.usuario_id,
            is_active=True,
        ).first()

        if usuario is None:
            raise ValueError(
                "El usuario no existe o está inactivo."
            )

        nota = NotaCompra.objects.create(
            descripcion=descripcion,
            total=Decimal("0.00"),
            estado=estado,
            usuario=usuario,
        )

        return nota

    # ========================================================
    # CREAR NOTA CON DETALLES (ATÓMICO)
    # ========================================================

    @strawberry.mutation
    def crear_nota_con_detalles(
        self,
        data: CrearNotaConDetallesInput,
    ) -> NotaCompraType:

        with transaction.atomic():
            descripcion = data.descripcion.strip()
            if not descripcion:
                raise ValueError("La descripción es obligatoria.")

            usuario = Usuario.objects.filter(
                pk=data.usuario_id,
                is_active=True,
            ).first()

            if usuario is None:
                raise ValueError("El usuario no existe o está inactivo.")

            if not data.detalles:
                raise ValueError("Debe incluir al menos un detalle de compra.")

            nota = NotaCompra.objects.create(
                descripcion=descripcion,
                total=Decimal("0.00"),
                estado="COMPLETADA",
                usuario=usuario,
            )

            total = Decimal("0.00")
            for det in data.detalles:
                if det.cantidad <= 0:
                    raise ValueError("La cantidad debe ser mayor a cero.")

                precio = convertir_precio(det.precio_unitario)

                proveedor = Proveedor.objects.filter(
                    pk=det.proveedor_id,
                    is_active=True,
                ).first()

                if proveedor is None:
                    raise ValueError(f"El proveedor ID {det.proveedor_id} no existe o está inactivo.")

                glosa = det.glosa.strip()
                if not glosa:
                    raise ValueError("La glosa es obligatoria en todos los detalles.")

                subtotal = Decimal(det.cantidad) * precio
                total += subtotal

                DetalleCompra.objects.create(
                    cantidad=det.cantidad,
                    precio_unitario=precio,
                    subtotal=subtotal,
                    glosa=glosa,
                    nota_compra=nota,
                    proveedor=proveedor,
                )

            nota.total = total
            nota.save(update_fields=["total"])

            return nota

    # ========================================================
    # CAMBIAR ESTADO NOTA
    # ========================================================

    @strawberry.mutation
    @transaction.atomic
    def cambiar_estado_nota(
        self,
        data: CambiarEstadoNotaInput,
    ) -> NotaCompraType:

        nota = (
            NotaCompra.objects
            .select_for_update()
            .filter(pk=data.nota_compra_id)
            .first()
        )

        if nota is None:
            raise ValueError(
                "La nota de compra no existe."
            )

        nuevo_estado = data.estado.upper().strip()

        estados_validos = {
            "PENDIENTE",
            "COMPLETADA",
            "ANULADA",
        }

        if nuevo_estado not in estados_validos:
            raise ValueError(
                "Estado inválido. "
                "Use PENDIENTE, COMPLETADA o ANULADA."
            )

        if nota.estado != "PENDIENTE":
            raise ValueError(
                "Una nota finalizada o anulada "
                "ya no puede cambiar de estado."
            )

        if nuevo_estado == "PENDIENTE":
            return nota

        if nuevo_estado == "COMPLETADA":
            tiene_detalles = DetalleCompra.objects.filter(
                nota_compra=nota
            ).exists()

            if not tiene_detalles:
                raise ValueError(
                    "No se puede completar una nota "
                    "sin detalles de compra."
                )

        nota.estado = nuevo_estado
        nota.save(
            update_fields=["estado"]
        )

        return nota

    # ========================================================
    # CREAR DETALLE
    # ========================================================

    @strawberry.mutation
    def crear_detalle_compra(
        self,
        data: CrearDetalleCompraInput,
    ) -> DetalleCompraType:

        with transaction.atomic():

            if data.cantidad <= 0:
                raise ValueError(
                    "La cantidad debe ser mayor a cero."
                )

            precio = convertir_precio(
                data.precio_unitario
            )

            nota = (
                NotaCompra.objects
                .select_for_update()
                .filter(pk=data.nota_compra_id)
                .first()
            )

            if nota is None:
                raise ValueError(
                    "La nota de compra no existe."
                )

            if nota.estado != "PENDIENTE":
                raise ValueError(
                    "Solo se pueden agregar detalles "
                    "a una nota PENDIENTE."
                )

            proveedor = Proveedor.objects.filter(
                pk=data.proveedor_id,
                is_active=True,
            ).first()

            if proveedor is None:
                raise ValueError(
                    "El proveedor no existe "
                    "o está inactivo."
                )

            glosa = data.glosa.strip()

            if not glosa:
                raise ValueError(
                    "La glosa es obligatoria."
                )

            subtotal = (
                Decimal(data.cantidad)
                * precio
            )

            detalle = DetalleCompra.objects.create(
                cantidad=data.cantidad,
                precio_unitario=precio,
                subtotal=subtotal,
                glosa=glosa,
                nota_compra=nota,
                proveedor=proveedor,
            )

            recalcular_total_nota(nota)

            return detalle

    # ========================================================
    # EDITAR DETALLE
    # ========================================================

    @strawberry.mutation
    def editar_detalle_compra(
        self,
        data: EditarDetalleCompraInput,
    ) -> DetalleCompraType:

        with transaction.atomic():

            detalle = (
                DetalleCompra.objects
                .select_related("nota_compra")
                .filter(pk=data.detalle_id)
                .first()
            )

            if detalle is None:
                raise ValueError(
                    "El detalle de compra no existe."
                )

            nota = (
                NotaCompra.objects
                .select_for_update()
                .get(pk=detalle.nota_compra_id)
            )

            if nota.estado != "PENDIENTE":
                raise ValueError(
                    "Solo se pueden editar detalles "
                    "de una nota PENDIENTE."
                )

            if data.proveedor_id is not None:
                proveedor = Proveedor.objects.filter(
                    pk=data.proveedor_id,
                    is_active=True,
                ).first()

                if proveedor is None:
                    raise ValueError(
                        "El proveedor no existe "
                        "o está inactivo."
                    )

                detalle.proveedor = proveedor

            if data.cantidad is not None:
                if data.cantidad <= 0:
                    raise ValueError(
                        "La cantidad debe ser mayor a cero."
                    )

                detalle.cantidad = data.cantidad

            if data.precio_unitario is not None:
                detalle.precio_unitario = convertir_precio(
                    data.precio_unitario
                )

            if data.glosa is not None:
                glosa = data.glosa.strip()

                if not glosa:
                    raise ValueError(
                        "La glosa no puede estar vacía."
                    )

                detalle.glosa = glosa

            detalle.subtotal = (
                Decimal(detalle.cantidad)
                * detalle.precio_unitario
            )

            detalle.save()

            recalcular_total_nota(nota)

            return detalle

    # ========================================================
    # ELIMINAR DETALLE
    # ========================================================

    @strawberry.mutation
    def eliminar_detalle_compra(
        self,
        detalle_id: int,
    ) -> bool:

        with transaction.atomic():

            detalle = (
                DetalleCompra.objects
                .select_related("nota_compra")
                .filter(pk=detalle_id)
                .first()
            )

            if detalle is None:
                raise ValueError(
                    "El detalle de compra no existe."
                )

            nota = (
                NotaCompra.objects
                .select_for_update()
                .get(pk=detalle.nota_compra_id)
            )

            if nota.estado != "PENDIENTE":
                raise ValueError(
                    "Solo se pueden eliminar detalles "
                    "de una nota PENDIENTE."
                )

            detalle.delete()

            return True

# ============================================================
# SUBSCRIPTIONS (WebSockets + Redis Pub/Sub)
# ============================================================
import typing
import asyncio
import redis.asyncio as aioredis

@strawberry.type
class PurchasesSubscription:
    @strawberry.subscription
    async def proveedores_actualizados(self) -> typing.AsyncGenerator[str, None]:
        client = None
        try:
            client = aioredis.Redis(host='redis', port=6379, db=2, health_check_interval=30)
            pubsub = client.pubsub()
            await pubsub.subscribe('proveedores_channel')
            
            async for message in pubsub.listen():
                if message['type'] == 'message':
                    yield message['data'].decode('utf-8')
        except asyncio.CancelledError:
            # Client disconnected naturally
            pass
        except Exception as e:
            print(f"Redis Subscription Error: {e}")
        finally:
            if client:
                try:
                    await client.close()
                except Exception:
                    pass