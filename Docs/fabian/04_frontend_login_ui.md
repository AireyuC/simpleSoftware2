# Fase 4: Frontend - Pantalla de Login y Flujo de Autenticación

## Objetivo
Crear la interfaz de inicio de sesión visual e integrarla con la mutación de GraphQL definida en el backend.

## Pasos a realizar

### 1. Desarrollar la Vista de Login
**Archivo:** `frontend/src/modules/auth/LoginPage.tsx`
- Crear un componente visual atractivo usando las convenciones CSS o de diseño de tu proyecto.
- Incluir campos de entrada para `username` (o correo electrónico) y `password`.
- Incluir un botón para "Iniciar Sesión".
- Manejar los estados locales de los inputs (`useState`).

### 2. Integrar GraphQL en la Vista
**Archivo:** `frontend/src/modules/auth/LoginPage.tsx`
- Definir la consulta de mutación (`LOGIN_MUTATION`) usando `gql` de Apollo.
- Configurar el hook `useMutation` pasando esta consulta.
- Al hacer clic en enviar (submit del formulario), ejecutar la mutación.
- Manejar los estados de carga y mostrar errores si las credenciales son inválidas.

### 3. Guardar la Sesión y Redirigir
**Archivo:** `frontend/src/modules/auth/LoginPage.tsx`
- Si la mutación es exitosa, capturar el `token` devuelto por el servidor.
- Guardar el `token` en `localStorage.setItem("token", ...)`.
- Redirigir al usuario al dashboard principal (ej. `/proveedores` o `/`) usando el hook `useNavigate` de `react-router-dom`.

## Verificación de esta fase
- Al levantar frontend y backend, navegar a `/login`.
- Ingresar credenciales incorrectas y confirmar que se muestra un mensaje de error.
- Ingresar credenciales correctas. El sistema debería redirigir a la aplicación principal.
- Si recargamos la página (`F5`), el sistema debería mantenernos en la ruta privada (ya que el token quedó en `localStorage`).
- Las peticiones a GraphQL ahora deben mostrar, en la pestaña *Network* del navegador, el header `Authorization: Bearer <tu_token>`.
