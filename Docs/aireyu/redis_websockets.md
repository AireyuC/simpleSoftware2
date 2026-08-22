# Redis y WebSockets: Sincronización en Tiempo Real

Para entender cómo logramos que una pantalla se actualice mágicamente en otra computadora (sin que el usuario recargue la página), es fundamental entender dos tecnologías: **WebSockets** y **Redis**. A menudo se confunden o se mencionan juntas, pero cumplen funciones completamente distintas.

## 1. ¿Qué es un WebSocket?
Normalmente, la web funciona bajo el protocolo **HTTP** (Petición-Respuesta):
1. El cliente (Navegador) pregunta: *"¿Me das los proveedores?"*
2. El servidor responde: *"Aquí están"*.
3. **La conexión se cierra.** El servidor no puede hablarle al cliente si el cliente no le pregunta primero.

**WebSocket (WS)** es un protocolo distinto. Cuando un cliente se conecta vía WebSocket, la conexión **se mantiene abierta** (persistente). Esto permite una comunicación **bidireccional**: el servidor puede empujar datos al cliente en cualquier momento (por ejemplo: *"¡Oye, acaba de crearse un nuevo proveedor, actualiza tu tabla!"*).

## 2. ¿Qué es Redis?
Redis **no** es un WebSocket, ni un protocolo de red. Es una **Base de Datos en Memoria** ultrarrápida. 
En nuestra aplicación, originalmente usamos Redis como *Caché* (para guardar consultas pesadas temporalmente). Sin embargo, Redis tiene una característica especial llamada **Pub/Sub** (Publicación y Suscripción). 

En el modelo Pub/Sub, puedes decirle a Redis: *"Voy a crear un canal llamado `compras_channel`. Avísame si alguien publica un mensaje ahí"*.

## 3. ¿Cómo trabajan juntos en este sistema?
Imagina que tienes 5 cajeros conectados usando el software al mismo tiempo. En un entorno moderno (como Docker o la nube), es posible que tu backend (Django) tenga múltiples instancias corriendo para soportar el tráfico.

Cuando el Cajero A guarda un "Nuevo Proveedor", su petición HTTP llega a Django. Django lo guarda en PostgreSQL. Ahora, **¿cómo le avisa Django a los otros 4 cajeros que deben actualizar sus pantallas?**

Aquí es donde ocurre la magia conjunta:
1. **El Disparo (Django):** En cuanto guarda en la base de datos, Django se voltea a Redis y le grita: *"¡Publiqué un mensaje: Nuevo Proveedor Creado!"*
2. **El Reparto (Redis):** Redis, actuando como nuestro **Channel Layer** (Gestor de Canales), toma ese mensaje y lo reparte a la velocidad de la luz a todas las conexiones WebSocket activas que estén escuchando.
3. **La Entrega (WebSockets):** Las conexiones WebSocket abiertas hacia los otros 4 cajeros reciben el evento y lo empujan a los navegadores.
4. **La Reacción (Frontend React/Apollo):** Apollo Client en React intercepta este evento WS, saca la información del nuevo proveedor y actualiza la tabla en milisegundos.

### Resumen
- **WebSocket** es el "cable directo" entre el navegador del cajero y nuestro servidor.
- **Redis** es el "altavoz central" (Channel Layer) en el backend que coordina y reparte los mensajes a todos los cables directos. 
- Juntos logran lo que llamamos la **Sincronización en Tiempo Real**.
