from django.contrib import admin
from .models import Proveedor, NotaCompra, DetalleCompra

admin.site.register(Proveedor)
admin.site.register(NotaCompra)
admin.site.register(DetalleCompra)
