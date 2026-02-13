from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from backend.database import get_db
from backend import models, schemas

router = APIRouter()

@router.get("/", response_model=List[schemas.Route])
def read_routes(db: Session = Depends(get_db)):
    return db.query(models.Route).filter(models.Route.is_active == True).all()

@router.post("/", response_model=schemas.Route)
def create_route(route: schemas.RouteCreate, db: Session = Depends(get_db)):
    # Use model_dump() for Pydantic v2 compatibility
    db_route = models.Route(**route.model_dump())
    db.add(db_route)
    db.commit()
    db.refresh(db_route)
    return db_route

@router.delete("/{route_id}")
def delete_route(route_id: int, db: Session = Depends(get_db)):
    route = db.query(models.Route).filter(models.Route.id == route_id).first()
    if not route:
        raise HTTPException(status_code=404, detail="Route not found")
    route.is_active = False
    db.commit()
    return {"status": "deleted"}