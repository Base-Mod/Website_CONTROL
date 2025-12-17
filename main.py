from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse
from fastapi.middleware.cors import CORSMiddleware
from typing import List
import json
from datetime import datetime

from app.config import settings
from app.database import engine, Base
from app.routers import auth, devices, power, alerts

# Create database tables
Base.metadata.create_all(bind=engine)

# Create FastAPI app
app = FastAPI(
    title="Energy Monitoring System",
    description="Real-time energy monitoring and control system",
    version="2.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(devices.router)
app.include_router(power.router)
app.include_router(alerts.router)

# Mount static files
app.mount("/static", StaticFiles(directory="static"), name="static")


# WebSocket connection manager
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []
    
    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
    
    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)
    
    async def broadcast(self, message: dict):
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except:
                pass


manager = ConnectionManager()


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """WebSocket endpoint for real-time updates"""
    await manager.connect(websocket)
    try:
        while True:
            # Receive message from client
            data = await websocket.receive_text()
            
            # Echo back for now (can be extended for real-time data)
            await websocket.send_json({
                "type": "pong",
                "timestamp": datetime.now().isoformat()
            })
    except WebSocketDisconnect:
        manager.disconnect(websocket)


@app.get("/")
async def root():
    """Root endpoint - redirect to docs or static page"""
    return {
        "message": "Energy Monitoring System API",
        "version": "2.0.0",
        "docs": "/docs",
        "websocket": "/ws"
    }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat()
    }


# Broadcast device status updates (can be called from routers)
async def broadcast_device_update(device_id: int, status: str):
    """Broadcast device status update to all connected clients"""
    await manager.broadcast({
        "type": "device_update",
        "device_id": device_id,
        "status": status,
        "timestamp": datetime.now().isoformat()
    })


# Broadcast new power data (can be called when new data arrives)
async def broadcast_power_data(device_id: int, data: dict):
    """Broadcast new power data to all connected clients"""
    await manager.broadcast({
        "type": "power_data",
        "device_id": device_id,
        "data": data,
        "timestamp": datetime.now().isoformat()
    })


# Broadcast new alert
async def broadcast_alert(alert: dict):
    """Broadcast new alert to all connected clients"""
    await manager.broadcast({
        "type": "alert",
        "alert": alert,
        "timestamp": datetime.now().isoformat()
    })


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG
    )
