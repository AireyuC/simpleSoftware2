# Esquema de Base de Datos

De acuerdo a la imagen que enviaste y tu descripción, he mapeado las 4 tablas. Tenemos una relación de "Uno a Muchos" entre `Usuario` y `Nota_compra`. Luego, tenemos una relación de "Muchos a Muchos" entre `Nota_compra` y `Proveedor`, la cual se rompe utilizando la tabla intermedia (asociativa) llamada `Detalle_compra`.

Aquí tienes el diagrama mapeado para que lo puedas visualizar correctamente:

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
    }

    Nota_compra {
        int id_notaCompra PK
        string descripcion
        int total
        int usuario_id FK "Llave foránea a Usuario"
    }

    Proveedor {
        int id_proveedor PK
        string razon_social
        string ubicacion
        string descripcion
        int nit
    }

    Detalle_compra {
        int id_detalle PK
        int nota_compra_id FK "Llave foránea a Nota_compra"
        int proveedor_id FK "Llave foránea a Proveedor"
        int cantidad
        float subtotal
        string glosa
    }
```
