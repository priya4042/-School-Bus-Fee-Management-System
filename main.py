from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import os
import json
import logging
from backend.api.v1 import endpoints
from backend.database import engine, SessionLocal
from backend import models

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize Database Tables
try:
    logger.info("Initializing database tables...")
    models.Base.metadata.create_all(bind=engine)
    logger.info("Database tables initialized successfully.")
except Exception as e:
    logger.error(f"Critical error initializing database: {e}")

# Optional: Auto-seed on first run
def initial_seed():
    db = SessionLocal()
    try:
        if not db.query(models.User).filter(models.User.role == models.UserRole.ADMIN).first():
            logger.info("No admin user found. Running seed data...")
            from backend.seed import seed_data
            seed_data()
            logger.info("Seed data completed.")
    except Exception as e:
        logger.warning(f"Seed skipped or failed: {e}")
    finally:
        db.close()

initial_seed()

app = FastAPI(title="BusWay Pro API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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
app.include_router(endpoints.auth.router, prefix="/api/v1/auth", tags=["Authentication"])
app.include_router(endpoints.users.router, prefix="/api/v1/users", tags=["User Management"])
app.include_router(endpoints.dashboard.router, prefix="/api/v1/dashboard", tags=["Admin Dashboard"])
app.include_router(endpoints.payments.router, prefix="/api/v1/payments", tags=["Payment Gateway"])
app.include_router(endpoints.students.router, prefix="/api/v1/students", tags=["Student Records"])
app.include_router(endpoints.routes.router, prefix="/api/v1/routes", tags=["Fleet Routes"])
app.include_router(endpoints.buses.router, prefix="/api/v1/buses", tags=["Vehicle Assets"])
app.include_router(endpoints.fees.router, prefix="/api/v1/fees", tags=["Billing Engine"])
app.include_router(endpoints.reports.router, prefix="/api/v1/reports", tags=["Financial Reports"])
app.include_router(endpoints.settings.router, prefix="/api/v1/settings", tags=["System Settings"])
app.include_router(endpoints.webhooks.router, prefix="/api/v1/webhooks", tags=["External Webhooks"])
app.include_router(endpoints.notifications.router, prefix="/api/v1/notifications", tags=["Alerts"])
app.include_router(endpoints.tracking.router, prefix="/api/v1/tracking", tags=["Live Tracking"])
app.include_router(endpoints.receipts.router, prefix="/api/v1/receipts", tags=["Receipts"])
app.include_router(endpoints.attendance.router, prefix="/api/v1/attendance", tags=["Attendance"])

@app.get("/")
def root():
    return {"message": "BusWay Pro API is Online", "docs": "/docs"}

@app.get("/health")
def health_check():
    return {"status": "healthy", "version": "1.2.0"}