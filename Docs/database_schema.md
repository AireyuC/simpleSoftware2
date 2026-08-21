# Esquema de Base de Datos

De acuerdo a la imagen que enviaste y tu descripción, he mapeado las 4 tablas, **agregando los atributos recomendados para robustecer el sistema** y corrigiendo la consistencia de los tipos de datos (por ejemplo, el NIT debe ser texto, y los campos monetarios deben ser decimales).

Tenemos una relación de "Uno a Muchos" entre `Usuario` y `Nota_compra`. Luego, tenemos una relación de "Muchos a Muchos" entre `Nota_compra` y `Proveedor`, la cual se rompe utilizando la tabla intermedia (asociativa) llamada `Detalle_compra`.

Aquí tienes el diagrama actualizado:

```mermaid
erDiagram
    Usuario ||--o{ Nota_compra : "registra"
    Nota_compra ||--o{ Detalle_compra : "contiene"
    Proveedor ||--o{ Detalle_compra : "es provisto por"

    Usuario {
        int id_usuario PK
        string nombre
        string username
        string password
        string correo
        string telefono
        string rol "ADMIN o EMPLEADO"
        boolean is_active "Para borrado lógico"
        datetime fecha_creacion
    }

    Nota_compra {
        int id_notaCompra PK
        string descripcion
        decimal total "Cambiado de int a decimal (moneda)"
        datetime fecha_emision "Fecha en que se hace la compra"
        string estado "PENDIENTE, COMPLETADA, ANULADA"
        int usuario_id FK "Llave foránea a Usuario"
    }

    Proveedor {
        int id_proveedor PK
        string razon_social
        string nit "Cambiado a texto (los NIT no se suman)"
        string ubicacion
        string telefono "Contacto adicional"
        string email "Contacto adicional"
        string descripcion
        boolean is_active "Para borrado lógico"
    }

    Detalle_compra {
        int id_detalle PK
        int cantidad
        decimal precio_unitario "Precio al momento de la compra"
        decimal subtotal "cantidad * precio_unitario"
        string glosa "Usado para describir el ítem/producto"
        int nota_compra_id FK "Llave foránea a Nota_compra"
        int proveedor_id FK "Llave foránea a Proveedor"
    }
```

## Detalles de Consistencia
1. **NIT:** En tu diagrama original estaba como `int`. En bases de datos de producción, documentos de identidad o NITs siempre son de tipo `String/Varchar` porque pueden llevar ceros a la izquierda y no se realizan operaciones matemáticas con ellos.
2. **Moneda (`total`, `precio_unitario`, `subtotal`):** Se ajustaron a tipo `Decimal` en lugar de `int` o `float`. El tipo decimal previene errores de redondeo en operaciones financieras.
3. **Borrado Lógico (`is_active`):** En lugar de borrar usuarios o proveedores, se cambia este estado a `falso` para mantener el historial de compras intacto en la base de datos.
