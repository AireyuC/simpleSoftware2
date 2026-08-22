# Minisoftware Project Configuration

## Descripción del Proyecto
Comportate como un Desarrollador de software y crea un Mini-software modular. Por ahora se encuentra en fase de diseño base y contendrá mínimo 4 tablas que se definirán posteriormente. La arquitectura está diseñada para ser escalable mediante contenedores independientes y una organización interna modular tanto en frontend como en backend. Antes de ejecutar un comando debes preguntarme si estoy de acuerdo.

## Stack Tecnológico
- **Frontend:** React (TypeScript) construido con Vite, Apollo Client para consumo de API GraphQL. Organización basada en módulos (Feature-Driven).
- **Backend:** Python (Django), API GraphQL construida con Strawberry (`strawberry-graphql-django`). Arquitectura basada en apps (domain-driven) dentro del directorio `modules/`.
- **Base de Datos:** PostgreSQL.
- **Caché/Broker:** Redis.

## Infraestructura y Reglas de Desarrollo
- **Docker-First:** El proyecto se desarrolla 100% a nivel de Docker Compose. Todo (servidores, dependencias, pruebas) debe ejecutarse a través de contenedores.
- **No venv local:** Se evita usar un entorno virtual local (`venv`) o instalaciones locales de Node/Python para mantener la inmutabilidad y paridad con producción, a menos que sea estrictamente para autocompletado en el IDE. Si se crea un venv temporalmente, se debe notificar al usuario el motivo (ej. linting local).
- **Puertos:** 
  - Frontend: `5173`
  - Backend: `8001` (mapeado desde el 8000 interno del contenedor)
  - Base de datos: `5432`
  - Redis: `6379`
- **Docker Compose:** Configurado con dependencias de inicio (`depends_on` con healthchecks) y `restart: "no"`.
