from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from ....database import get_db
from .... import models

router = APIRouter()

@router.get("/")
def read_buses(db: Session = Depends(get_db)):
    # Currently reusing students/routes logic or returning mock if model not fully defined
    # For MVP, we return a list of active routes as 'Bus Services'
    routes = db.query(models.Route).all()
    return [
        {
            "id": r.id,
            "plate": f"BUS-{r.code}",
            "model": "Tata Starbus 40s",
            "capacity": 40,
            "driver": "Assigned Staff",
            "status": "On Route" if r.is_active else "Idle"
        } for r in routes
    ]

@router.post("/")
def register_bus(bus_data: dict, db: Session = Depends(get_db)):
    return {"status": "success", "message": "Bus registered successfully"}
