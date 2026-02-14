from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import os
import json
import logging
import uvicorn
from backend.api.v1 import endpoints
from backend.database import engine, SessionLocal
from backend import models

# Configure standard uvicorn logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("uvicorn")

# Initialize Database with safety
def init_db():
    try:
        logger.info("⚡ Attempting database connection...")
        models.Base.metadata.create_all(bind=engine)
        logger.info("✅ Database tables synchronized.")
    except Exception as e:
        logger.error(f"❌ DATABASE ERROR: {str(e)}")
        # Don't crash immediately, allow health check to report status

def initial_seed():
    db = SessionLocal()
    try:
        admin_exists = db.query(models.User).filter(models.User.role == models.UserRole.ADMIN).first()
        if not admin_exists:
            logger.info("🌱 Seeding initial data...")
            from backend.seed import seed_data
            seed_data()
    except Exception as e:
        logger.warning(f"⚠️ Seed check skipped: {e}")
    finally:
        db.close()

init_db()
initial_seed()

app = FastAPI(title="BusWay Pro API")

# Updated CORS for Production
frontend_url = os.getenv("FRONTEND_URL", "*")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[frontend_url] if frontend_url != "*" else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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
    return {"message": "BusWay Pro API is Online", "status": "active"}

@app.get("/health")
def health_check():
    return {"status": "healthy", "env": os.getenv("RENDER", "local")}

if __name__ == "__main__":
    # Render uses the PORT env var
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=False)
