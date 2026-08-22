# Resumen de Implementación: Infraestructura Core y Autenticación

Este documento resume todas las implementaciones realizadas correspondientes a la asignación del **Desarrollador 1**, basadas en el plan original de trabajo.

## 1. Backend: Middleware JWT
- **Dependencia instalada:** `PyJWT>=2.8.0` añadida a `requirements.txt`.
- **Middleware creado:** Se implementó `JWTAuthenticationMiddleware` en `backend/core/middleware.py` para interceptar el header `Authorization: Bearer <token>`, validar la firma y asignar el usuario autenticado a `request.user`.
- **Configuración:** Se registró el middleware en `backend/core/settings.py` (`MIDDLEWARE`).

## 2. Backend: Strawberry GraphQL Auth Mutation
- **Mutación de Login:** Se creó el archivo `backend/modules/users/graphql.py` donde se definió la mutación `login`.
- **Lógica:** La mutación recibe credenciales, utiliza `authenticate` de Django, genera un token JWT y retorna un `LoginResponse` que incluye el token y los datos del usuario.
- **Esquema:** La mutación fue expuesta a través del esquema principal en `backend/core/schema.py`.

## 3. Frontend: Enrutamiento y Apollo Client
- **Apollo Client:** En `frontend/src/api/apollo.ts` se configuró `setContext` (authLink) para inyectar automáticamente el token almacenado en `localStorage` a las peticiones GraphQL. Adicionalmente, se aseguró que la URL de GraphQL termine en `/` para evitar errores de redirección 301.
- **Protección de Rutas:** Se implementó el componente `PrivateRoute` (`frontend/src/components/layout/PrivateRoute.tsx`) que redirecciona a `/login` si no existe un token almacenado.
- **Router:** Se configuró el `BrowserRouter` en `App.tsx` delimitando la ruta pública `/login` y envolviendo el acceso al dashboard (`/`) con `PrivateRoute`.
- **Navegación:** Se agregó un botón de "Cerrar Sesión" en `Navbar.tsx` para permitir al usuario salir del sistema de forma segura.

## 4. Frontend: UI de Login
- **Componente Visual:** Se creó `frontend/src/modules/auth/LoginPage.tsx` utilizando el hook `useMutation` para ejecutar el login.
- **Estilos:** Se definió `LoginPage.css` en total concordancia con la paleta de colores del diseño global del proyecto (`index.css`) para mantener la consistencia visual.
- **Flujo de sesión:** Al autenticarse correctamente, el token se almacena localmente y la aplicación redirige al usuario hacia la vista de Proveedores.
