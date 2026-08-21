from django.db import models
from django.conf import settings

class Proveedor(models.Model):
    razon_social = models.CharField(max_length=200)
    nit = models.CharField(max_length=50)
    ubicacion = models.CharField(max_length=255)
    telefono = models.CharField(max_length=50, blank=True, null=True)
    email = models.EmailField(blank=True, null=True)
    descripcion = models.TextField(blank=True, null=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = 'proveedor'

    def __str__(self):
        return f"{self.razon_social} - {self.nit}"


class NotaCompra(models.Model):
    ESTADOS = [
        ('PENDIENTE', 'Pendiente'),
        ('COMPLETADA', 'Completada'),
        ('ANULADA', 'Anulada'),
    ]

    descripcion = models.CharField(max_length=255)
    total = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    fecha_emision = models.DateTimeField(auto_now_add=True)
    estado = models.CharField(max_length=20, choices=ESTADOS, default='PENDIENTE')
    usuario = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name='notas_compra')

    class Meta:
        db_table = 'nota_compra'

    def __str__(self):
        return f"Nota {self.id} - {self.estado}"


class DetalleCompra(models.Model):
    nota_compra = models.ForeignKey(NotaCompra, on_delete=models.CASCADE, related_name='detalles')
    proveedor = models.ForeignKey(Proveedor, on_delete=models.PROTECT, related_name='ventas')
    cantidad = models.IntegerField(default=1)
    precio_unitario = models.DecimalField(max_digits=10, decimal_places=2)
    subtotal = models.DecimalField(max_digits=12, decimal_places=2)
    glosa = models.CharField(max_length=255, blank=True, null=True)

    class Meta:
        db_table = 'detalle_compra'

    def save(self, *args, **kwargs):
        self.subtotal = self.cantidad * self.precio_unitario
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.cantidad} x {self.precio_unitario} ({self.proveedor.razon_social})"
