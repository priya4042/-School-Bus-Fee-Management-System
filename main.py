from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.api.v1.endpoints import payments, students, routes, buses, fees, tracking
from backend.database import engine
from backend import models

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="BusWay Pro API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(payments.router, prefix="/api/v1/payments", tags=["payments"])
app.include_router(students.router, prefix="/api/v1/students", tags=["students"])
app.include_router(routes.router, prefix="/api/v1/routes", tags=["routes"])
app.include_router(buses.router, prefix="/api/v1/buses", tags=["buses"])
app.include_router(fees.router, prefix="/api/v1/fees", tags=["fees"])
app.include_router(tracking.router, prefix="/api/v1/tracking", tags=["tracking"])

@app.get("/")
def root():
    return {"message": "Welcome to BusWay Pro API"}
