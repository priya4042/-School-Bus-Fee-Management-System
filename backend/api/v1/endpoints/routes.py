
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from ....database import get_db
from .... import crud, schemas, models

router = APIRouter()

@router.get("/", response_model=List[schemas.Due]) # Reusing schemas or creating Route schemas
def read_routes(db: Session = Depends(get_db)):
    return db.query(models.Route).all()

@router.post("/")
def create_route(route: dict, db: Session = Depends(get_db)):
    db_route = models.Route(**route)
    db.add(db_route)
    db.commit()
    db.refresh(db_route)
    return db_route
