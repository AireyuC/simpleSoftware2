# Fase 3: Frontend - Enrutamiento y Configuración de Apollo

## Objetivo
Configurar el manejo de rutas en React y asegurar que todas las llamadas a la API de GraphQL desde el Frontend adjunten automáticamente el token de seguridad.

## Pasos a realizar

### 1. Instalar React Router
**Archivo:** `frontend/package.json` y consola
- Ejecutar el comando para instalar `react-router-dom` (ej. `npm install react-router-dom`).

### 2. Modificar la Configuración de Apollo Client
**Archivo:** `frontend/src/api/apollo.ts`
- Importar `setContext` desde `@apollo/client/link/context`.
- Configurar el enlace (`authLink`) para leer el token de sesión (desde `localStorage` o cookies).
- Integrar este enlace a la inicialización del cliente: `concat(authLink, httpLink)`.

### 3. Crear Componente de Rutas Privadas
**Archivo:** `frontend/src/components/layout/PrivateRoute.tsx`
- Crear un componente funcional `PrivateRoute` que reciba componentes hijos (`children`).
- Este componente validará si existe un token en el `localStorage`.
- Si el token existe, renderizar los componentes hijos (`children` o un `<Outlet />`).
- Si no existe, redirigir al usuario automáticamente hacia `/login` usando `<Navigate to="/login" />`.

### 4. Configurar el Enrutador en la Aplicación
**Archivo:** `frontend/src/App.tsx` (o `main.tsx`)
- Importar `BrowserRouter`, `Routes`, y `Route` de `react-router-dom`.
- Establecer las rutas principales:
  - Una ruta pública para `/login`.
  - Rutas privadas para el resto de la aplicación (ej. Proveedores) protegidas por el componente `PrivateRoute`.

## Verificación de esta fase
- El proyecto React debe compilar correctamente.
- Intentar acceder manualmente a la ruta raíz `/` sin haber iniciado sesión. Debe redirigir instantáneamente hacia la vista `/login` (aunque todavía esté vacía o arroje un error por no existir la página).
