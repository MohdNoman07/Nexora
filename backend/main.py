from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from typing import List
import json
import asyncio

app = FastAPI(title="Nexora Security Monitoring API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            try:
                await connection.send_text(message)
            except WebSocketDisconnect:
                self.disconnect(connection)

manager = ConnectionManager()

@app.get("/")
def read_root():
    return {"message": "Nexora Backend API running"}

@app.websocket("/ws/events")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            # We don't expect messages from client for now, just keep connection open
            data = await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)

@app.get("/api/incidents")
def get_incidents():
    # Return placeholder incidents to demonstrate API structure
    return [{"id": "INC-1024", "severity": "Critical", "attack_type": "Brute force"}]

# In a real scenario, the simulator/data generator would run as a background task
# pushing to manager.broadcast(event)
