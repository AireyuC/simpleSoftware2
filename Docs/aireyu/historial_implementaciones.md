# Historial de Implementaciones y Correcciones

Este documento resume las correcciones, integraciones y nuevas características implementadas en el sistema a partir de la revisión del código integrado por los compañeros del equipo.

## 1. Restauración del Django Admin (Corrección de 404 y Estilos)
**Problema:** Al intentar acceder al panel de administración de Django (`localhost:8001/admin`), la página cargaba sin estilos CSS (Error 404 en archivos estáticos) y mostraba un diseño personalizado a medio terminar.
**Solución y Funcionamiento:**
- **Variables de Entorno:** El problema de los CSS 404 se debía a que `settings.py` estaba leyendo incorrectamente la variable `DJANGO_DEBUG` en lugar de la variable universal `DEBUG`. Al corregir esto, Django volvió a servir correctamente los archivos estáticos a través de WhiteNoise en el contenedor Docker.
- **Limpieza de Custom Admin:** Se eliminaron las personalizaciones y overrides de plantillas en `backend/modules/users/admin.py` y `backend/modules/purchases/admin.py`, devolviendo el registro de modelos al estándar puro de Django (`admin.site.register()`), garantizando estabilidad y un diseño profesional por defecto.

## 2. Desarrollo del Módulo de Usuarios (Full-Stack)
**Problema:** El botón de "Usuarios" en el Frontend estaba deshabilitado y faltaba conectar la lógica del backend.
**Solución y Funcionamiento:**
- **Backend (GraphQL):** Se crearon las mutaciones necesarias en `backend/modules/users/graphql.py` (`crear_usuario`, `actualizar_usuario` y `cambiar_estado_usuario`). Se adoptó el patrón de **Soft-Delete** (cambiar estado activo/inactivo en lugar de borrar físicamente la fila) para evitar violaciones de llaves foráneas con el historial de compras.
- **Frontend (React/Vite):** Se construyó el módulo en `frontend/src/modules/usuarios/` con la misma arquitectura modular de `compras`. Se implementó un DataGrid para listar usuarios y modales reutilizables para la creación y edición.

## 3. Implementación de Redis (Fase 1: Caché de Consultas)
**Problema:** Las peticiones a base de datos para obtener catálogos como los "Proveedores" podían ser lentas si había mucha concurrencia de cajeros.
**Solución y Funcionamiento:**
- Se configuró Redis en `settings.py`.
- Se creó un *resolver* personalizado en GraphQL para la consulta `get_proveedores`.
- **Caché First:** Cuando un usuario entra a "Nueva Compra", el backend primero busca los proveedores en la memoria RAM de Redis (`cache.get`). Si no existen, los consulta de PostgreSQL y los guarda en Redis por una hora (`cache.set`).
- **Invalidación:** Cada vez que un administrador crea, edita o desactiva un proveedor, se ejecuta un `cache.delete` para garantizar que el sistema nunca muestre datos antiguos.

## 4. Evolución a Tiempo Real (Fase 2: WebSockets y Pub/Sub)
**Problema:** El requerimiento final exigía que los cambios realizados por un usuario (ej. crear un proveedor) se reflejaran *mágicamente* y de forma *instantánea* en los navegadores de los demás usuarios, sin necesidad de recargar la página.
**Solución y Funcionamiento (Arquitectura Reactiva):**
- **Servidor ASGI:** Se reemplazó el servidor estándar WSGI por **ASGI (Daphne)** y se instaló **Django Channels**, habilitando la capacidad de mantener múltiples conexiones bidireccionales permanentes (WebSockets).
- **Redis Pub/Sub:** Redis dejó de ser solo una caché y se convirtió en un *Channel Layer*. Cuando alguien crea un proveedor, Django publica un evento a un canal de Redis (`r.publish('proveedores_channel', 'RELOAD')`).
- **Backend Subscriptions:** Se integró la capacidad de transmitir flujos de datos asíncronos (`AsyncGenerator`) directamente hacia los clientes usando Strawberry Subscriptions.
- **Frontend Apollo WebSockets:** Se instaló `graphql-ws` y se configuró un enrutador inteligente (split) en `apollo.ts`. Ahora Apollo Client sabe que todas las peticiones normales (Mutation/Query) deben ir por HTTP tradicional, pero si es un evento reactivo (Subscription), abre un conducto especial `ws://`. Usando el hook `useSubscription`, la tabla de React "escucha" los eventos de Redis y recarga sus datos en milisegundos cuando es notificada.
