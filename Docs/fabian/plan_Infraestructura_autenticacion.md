# Plan de Implementación: Infraestructura Core y Autenticación

Este plan detalla los pasos para completar la parte asignada al **Desarrollador 1**, basándonos en el progreso actual del proyecto.

## User Review Required
> [!IMPORTANT]
> - **Autenticación con JWT**: El proyecto no tiene configurado un paquete estándar de JWT. Propongo instalar `PyJWT` y crear un Middleware simple en Django que intercepte el token en el Header `Authorization: Bearer <token>`, valide la firma y asigne el `request.user`.
> - **Modelo `Usuario`**: El Desarrollador 2 ya creó la base del modelo en `modules.users.models.Usuario` con `telefono` y `rol`. El modelo ya hereda de `AbstractUser` (que contiene `email` y `is_active`). Asumo que ese modelo está completo y solo nos enfocaremos en la autenticación.

## Proposed Changes

---

### Backend: Dependencias y Middleware JWT
Instalaremos `PyJWT` para manejar los tokens y configuraremos un middleware para la autenticación sin estado en GraphQL.

#### [MODIFY] [requirements.txt](file:///c:/Materias_FINOR/Software_2/simpleSoftware2/backend/requirements.txt)
- Agregar `PyJWT>=2.8.0`.

#### [NEW] [middleware.py](file:///c:/Materias_FINOR/Software_2/simpleSoftware2/backend/core/middleware.py)
- Crear un middleware de Django (`JWTAuthenticationMiddleware`) que lea el header `Authorization`, decodifique el JWT (usando `settings.SECRET_KEY`) y asigne el usuario a `request.user`.

#### [MODIFY] [settings.py](file:///c:/Materias_FINOR/Software_2/simpleSoftware2/backend/core/settings.py)
- Agregar el middleware `core.middleware.JWTAuthenticationMiddleware` a `MIDDLEWARE`.

---

### Backend: Strawberry GraphQL Auth Mutation
Implementar la mutación de login que valida las credenciales y devuelve el token JWT.

#### [MODIFY] [graphql.py](file:///c:/Materias_FINOR/Software_2/simpleSoftware2/backend/modules/users/graphql.py)
- Crear un tipo `LoginResponse` con `token` y los datos del `usuario`.
- Implementar la mutación `login` que utilice `django.contrib.auth.authenticate`, genere un token JWT con una expiración (ej. 24 horas) y devuelva el `LoginResponse`.

#### [MODIFY] [schema.py](file:///c:/Materias_FINOR/Software_2/simpleSoftware2/backend/core/schema.py)
- Incluir la mutación `login` en la clase base `Mutation` del esquema global.

---

### Frontend: Enrutamiento y Apollo Client
Instalar `react-router-dom` y configurar Apollo para enviar el token JWT en cada solicitud.

#### [MODIFY] [package.json](file:///c:/Materias_FINOR/Software_2/simpleSoftware2/frontend/package.json)
- Añadir `react-router-dom` a las dependencias.

#### [MODIFY] [apollo.ts](file:///c:/Materias_FINOR/Software_2/simpleSoftware2/frontend/src/api/apollo.ts)
- Configurar `@apollo/client/link/context` (`setContext`) para inyectar el header `Authorization: Bearer <token>` sacado de `localStorage`.

#### [NEW] [PrivateRoute.tsx](file:///c:/Materias_FINOR/Software_2/simpleSoftware2/frontend/src/components/layout/PrivateRoute.tsx)
- Crear un componente que envuelva las rutas protegidas y redirija a `/login` si no existe un token.

#### [MODIFY] [App.tsx](file:///c:/Materias_FINOR/Software_2/simpleSoftware2/frontend/src/App.tsx)
- Configurar `BrowserRouter`, `Routes` y `Route` para definir el sistema de enrutamiento principal.
- Configurar ruta pública `/login` y enrutar `/` a través de `PrivateRoute` renderizando el `Layout` actual.

---

### Frontend: Pantalla de Login
Desarrollar la interfaz visual y la integración de la mutación de GraphQL.

#### [NEW] [LoginPage.tsx](file:///c:/Materias_FINOR/Software_2/simpleSoftware2/frontend/src/modules/auth/LoginPage.tsx)
- Crear el componente visual de Login con formulario para email/username y contraseña.
- Implementar la mutación `LOGIN_MUTATION` usando Apollo `useMutation`.
- Almacenar el token devuelto en `localStorage` y redirigir a `/` (Proveedores).

## Verification Plan
### Automated Tests
- Al no contar con tests unitarios configurados actualmente, nos saltaremos esta etapa.

### Manual Verification
- Iniciar los contenedores con Docker Compose.
- Crear un superusuario usando `python manage.py createsuperuser` dentro del contenedor backend.
- Entrar al frontend (`localhost:5173`) e intentar acceder a rutas privadas sin token, verificando la redirección al Login.
- Autenticarse exitosamente, verificar que el token se guarde en `localStorage`.
- Revisar que las peticiones a GraphQL desde React contengan el header `Authorization`.
