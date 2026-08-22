# Fase 2: Backend - Mutación GraphQL para Login

## Objetivo
Implementar la mutación GraphQL que permita a los usuarios enviar sus credenciales (usuario y contraseña) y recibir a cambio un token JWT.

## Pasos a realizar

### 1. Crear la Mutación y Tipos de Respuesta
**Archivo:** `backend/modules/users/graphql.py`
- Crear un tipo de Strawberry (clase con `@strawberry.type`) llamado `LoginResponse`.
  - Este tipo debe tener un campo `token` (String) y un campo `usuario` (referencia al tipo `UsuarioType` existente).
- Crear una clase para albergar las mutaciones relacionadas con usuarios (ej. `AuthMutation`).
- Implementar el campo `@strawberry.mutation` llamado `login`, que reciba `username` y `password`.
- Dentro de la mutación:
  - Usar `django.contrib.auth.authenticate(username=username, password=password)`.
  - Si las credenciales son incorrectas, retornar un error.
  - Si son correctas, generar un token usando `jwt.encode` con una fecha de expiración (`exp`) en el payload.
  - Retornar el `LoginResponse` con el token generado y los datos del usuario.

### 2. Registrar la Mutación en el Esquema Principal
**Archivo:** `backend/core/schema.py`
- Importar la clase `AuthMutation` que acabas de crear.
- Agregar `AuthMutation` como clase base en la clase `Mutation` global del sistema (ej. `class Mutation(PurchasesMutation, AuthMutation):`).

## Verificación de esta fase
- Ir a la interfaz de GraphiQL (http://localhost:8001/graphql/) y probar la mutación `login`.
- Asegurarse de que retorne el JWT al ingresar credenciales correctas.
