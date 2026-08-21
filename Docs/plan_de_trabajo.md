# Alcance y División del Trabajo (Equipo de 3 Personas)

Dado el contexto del proyecto (Django, React, GraphQL con Strawberry, PostgreSQL) y el esquema de la base de datos, aquí está la definición del alcance y la mejor estrategia para dividir el trabajo equitativamente entre 3 desarrolladores.

## 1. Alcance del Proyecto (Scope)

El objetivo es construir un **Módulo de Compras** funcional. El flujo debe ser claro, simple pero contener lógica de negocio real.

**Flujo Principal (Lógica de Negocio):**
1. **Autenticación:** Un usuario (empleado/administrador) inicia sesión en el sistema.
2. **Gestión de Proveedores:** El usuario puede registrar nuevos proveedores, ver la lista de proveedores existentes y editar su información.
3. **Registro de Compras:** 
   - El usuario crea una nueva "Nota de Compra".
   - A esta nota, le añade múltiples "Detalles de Compra" (especificando qué proveedor provee, la cantidad, el subtotal y una glosa).
   - **Lógica clave:** El sistema debe calcular automáticamente el `total` de la `Nota_compra` sumando los `subtotales` de cada `Detalle_compra`.
4. **Historial:** El usuario puede ver el historial de las notas de compra registradas.

---

## 2. División del Trabajo (Estrategia Recomendada)

Al usar GraphQL, el frontend y el backend están desacoplados. La mejor forma de dividir a 3 personas en este ecosistema es mediante **módulos verticales (Full-Stack)** o por **capas de especialidad**. 

La estrategia recomendada para que nadie se bloquee es la de **Módulos Verticales + Especialidad**:

### Desarrollador 1: Infraestructura Core y Autenticación
**Rol principal:** Backend / Seguridad.
- **Backend (Django):** 
  - Extender el modelo de `User` de Django para incluir `telefono`, `correo`, `rol` y `is_active`.
  - Configurar Strawberry GraphQL.
  - Implementar la mutación de **Login** (recomendado usar JWT para que React lo consuma fácilmente).
- **Frontend (React):**
  - Configurar el enrutador (`react-router-dom`) para proteger rutas privadas.
  - Crear la pantalla de Login y guardar el token (en localStorage o cookies).
  - Configurar el proveedor de `@apollo/client` para enviar el token en cada petición.

### Desarrollador 2: Módulo de Proveedores y UI Base
**Rol principal:** Frontend / CRUD UI.
- **Backend (Django):** 
  - Crear el modelo `Proveedor` en una app llamada `purchases`.
  - Crear Query (`getProveedores`) y Mutations (`createProveedor`, `updateProveedor`) en Strawberry.
- **Frontend (React):**
  - Definir la estructura base de componentes (Layout, Menú de Navegación, Tablas genéricas, Formularios).
  - Construir la vista de "Lista de Proveedores" y el formulario para "Crear/Editar Proveedor".
  - *Nota: Esta persona definirá el "estilo visual" que los demás seguirán.*

### Desarrollador 3: Módulo de Compras (Lógica Compleja)
**Rol principal:** Lógica de Negocio (Backend/Frontend).
- **Backend (Django):** 
  - Crear los modelos `Nota_compra` y `Detalle_compra`.
  - Crear la mutación transaccional `createNotaCompra` que reciba los datos principales y una lista de detalles. 
  - Implementar la **lógica de negocio:** Calcular el `total` sumando los subtotales de los detalles antes de guardar. Validar que la nota pertenezca al usuario que hace la petición (`request.user`).
- **Frontend (React):**
  - Construir el formulario "Maestro-Detalle" (Un formulario donde se llenan los datos de la nota y abajo se pueden agregar N filas de detalles dinámicamente).
  - Consumir la mutación de GraphQL enviando la estructura anidada.

---

## 3. ¿Cómo trabajar en paralelo sin bloquearse?

La magia de **GraphQL** es que permite a los desarrolladores de Frontend trabajar sin que el Backend esté terminado.

1. **Paso Cero (Juntos - 1 hora):** Se sientan los 3 y definen el "Esquema" de GraphQL en un papel o documento. Definen exactamente qué datos devolverá `Query.proveedores` o qué pedirá `Mutation.createNotaCompra`.
2. **Frontend:** Usa datos falsos (Mocks) en React o simula la API basándose en el esquema acordado para ir armando las pantallas.
3. **Backend:** Programa los modelos y expone exactamente el esquema acordado.
4. **Integración:** Simplemente cambian los Mocks por el llamado real a Apollo Client.
