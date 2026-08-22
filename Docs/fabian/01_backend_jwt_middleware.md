# Fase 1: Backend - Dependencias y Middleware JWT

## Objetivo
Instalar las dependencias necesarias y configurar la base de la autenticación por token (JWT) en el backend.

## Pasos a realizar

### 1. Actualizar `requirements.txt`
**Archivo:** `backend/requirements.txt`
- Agregar la librería `PyJWT>=2.8.0` al final del archivo.
- Esta librería nos permitirá firmar y decodificar los tokens JWT.

### 2. Crear el Middleware de Autenticación JWT
**Archivo:** `backend/core/middleware.py` (Crear este archivo)
- Implementar una clase `JWTAuthenticationMiddleware`.
- En su método `__call__`, interceptar el header `Authorization`.
- Si el header tiene el formato `Bearer <token>`, decodificarlo usando `PyJWT` y la variable `settings.SECRET_KEY`.
- Si el token es válido, buscar al usuario en la base de datos usando el ID contenido en el token, y asignarlo a `request.user`.

### 3. Registrar el Middleware en Django
**Archivo:** `backend/core/settings.py`
- Agregar la ruta del middleware recién creado (`'core.middleware.JWTAuthenticationMiddleware'`) dentro del array `MIDDLEWARE`.
- Se recomienda colocarlo después de `django.contrib.auth.middleware.AuthenticationMiddleware` o `django.contrib.sessions.middleware.SessionMiddleware`.

## Verificación de esta fase
- Ejecutar el contenedor del backend para asegurar que Django levante correctamente y no existan errores de sintaxis o importación en el middleware.
