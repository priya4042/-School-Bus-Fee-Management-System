
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from ....database import get_db
from .... import models, schemas, crud

router = APIRouter()

@router.get("/", response_model=List[schemas.User])
def get_users(role_types: str = None, db: Session = Depends(get_db)):
    query = db.query(models.User)
    if role_types:
        roles = role_types.split(',')
        query = query.filter(models.User.role.in_(roles))
    return query.all()

@router.post("/admin", response_model=schemas.User)
def create_admin_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    # In prod: Verify requester is SUPER_ADMIN
    return crud.create_user(db, user)

@router.put("/{user_id}/status")
def update_user_status(user_id: int, payload: dict, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.is_active = payload.get("is_active", True)
    db.commit()
    return {"status": "success"}

@router.put("/{user_id}/preferences")
def update_preferences(user_id: int, prefs: dict, db: Session = Depends(get_db)):
    # Simplified preference storage
    return {"status": "success"}
