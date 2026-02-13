from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import os
import json
from backend.api.v1.endpoints import (
    payments, students, routes, buses, fees, tracking, 
    receipts, auth, dashboard, attendance, notifications, users, reports, settings, webhooks
)
from backend.database import engine
from backend import models

# Initialize Database Tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="BusWay Pro API")

# Security: CORS Configuration
frontend_url = os.getenv("FRONTEND_URL", "http://localhost:3000")
allowed_origins = [
    frontend_url,
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Real-time Tracking Manager
class ConnectionManager:
    def __init__(self):
        self.active_connections: dict[int, list[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, bus_id: int):
        await websocket.accept()
        if bus_id not in self.active_connections:
            self.active_connections[bus_id] = []
        self.active_connections[bus_id].append(websocket)

    def disconnect(self, websocket: WebSocket, bus_id: int):
        if bus_id in self.active_connections:
            self.active_connections[bus_id].remove(websocket)

    async def broadcast(self, bus_id: int, message: dict):
        if bus_id in self.active_connections:
            for connection in self.active_connections[bus_id]:
                await connection.send_json(message)

manager = ConnectionManager()

@app.websocket("/ws/tracking/{bus_id}")
async def tracking_websocket(websocket: WebSocket, bus_id: int):
    await manager.connect(websocket, bus_id)
    try:
        while True:
            data = await websocket.receive_text()
            message = json.loads(data)
            await manager.broadcast(bus_id, message)
    except WebSocketDisconnect:
        manager.disconnect(websocket, bus_id)

# API Route Registration
app.include_router(auth.router, prefix="/api/v1/auth", tags=["Authentication"])
app.include_router(users.router, prefix="/api/v1/users", tags=["User Management"])
app.include_router(dashboard.router, prefix="/api/v1/dashboard", tags=["Admin Dashboard"])
app.include_router(payments.router, prefix="/api/v1/payments", tags=["Payment Gateway"])
app.include_router(students.router, prefix="/api/v1/students", tags=["Student Records"])
app.include_router(routes.router, prefix="/api/v1/routes", tags=["Fleet Routes"])
app.include_router(buses.router, prefix="/api/v1/buses", tags=["Vehicle Assets"])
app.include_router(fees.router, prefix="/api/v1/fees", tags=["Billing Engine"])
app.include_router(reports.router, prefix="/api/v1/reports", tags=["Financial Reports"])
app.include_router(settings.router, prefix="/api/v1/settings", tags=["System Settings"])
app.include_router(webhooks.router, prefix="/api/v1/webhooks", tags=["External Webhooks"])
app.include_router(notifications.router, prefix="/api/v1/notifications", tags=["Alerts"])
app.include_router(tracking.router, prefix="/api/v1/tracking", tags=["Live Tracking"])
app.include_router(receipts.router, prefix="/api/v1/receipts", tags=["Receipts"])
app.include_router(attendance.router, prefix="/api/v1/attendance", tags=["Attendance"])

@app.get("/health")
def health_check():
    return {"status": "healthy", "version": "1.1.0"}
