from django.contrib.auth.models import AbstractUser
from django.db import models

class Usuario(AbstractUser):
    # Hereda username, password, email (correo), first_name, last_name, is_active, date_joined (fecha_creacion)
    
    telefono = models.CharField(max_length=20, blank=True, null=True)
    rol = models.CharField(
        max_length=20, 
        choices=[('ADMIN', 'Admin'), ('EMPLEADO', 'Empleado')],
        default='EMPLEADO'
    )

    class Meta:
        db_table = 'usuario'

    def __str__(self):
        return f"{self.username} - {self.rol}"
