import asyncio
import websockets
import json

async def test_ws():
    uri = "ws://localhost:8001/graphql/"
    async with websockets.connect(uri, subprotocols=["graphql-transport-ws"]) as websocket:
        print("Connected!")
        # Init payload
        await websocket.send(json.dumps({"type": "connection_init", "payload": {}}))
        response = await websocket.recv()
        print("Response:", response)

        # Start subscription
        query = """
        subscription {
            proveedoresActualizados
        }
        """
        await websocket.send(json.dumps({
            "id": "1",
            "type": "subscribe",
            "payload": {
                "query": query
            }
        }))
        
        print("Waiting for event...")
        response = await websocket.recv()
        print("Event:", response)

asyncio.run(test_ws())
