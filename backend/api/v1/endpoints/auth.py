from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.database import get_db
from backend import models, schemas, crud
from backend.core import security

router = APIRouter()

@router.post("/register-with-admission")
def register_with_admission(payload: dict, db: Session = Depends(get_db)):
    try:
        # Hash password before storage
        payload["password"] = security.get_password_hash(payload["password"])
        user = crud.register_parent_with_admission(db, payload)
        
        token = security.create_access_token(subject=user.id)
        return {
            "user": user,
            "access_token": token,
            "token_type": "bearer"
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/login-staff")
def login_staff(payload: dict, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == payload['email']).first()
    
    if not user or user.role not in [models.UserRole.DRIVER, models.UserRole.TEACHER, models.UserRole.ADMIN, models.UserRole.SUPER_ADMIN]:
         raise HTTPException(status_code=401, detail="Unauthorized staff member")
    
    if not security.verify_password(payload['password'], user.password_hash):
         raise HTTPException(status_code=401, detail="Invalid password")
         
    token = security.create_access_token(subject=user.id)
    return {
        "user": {
            "id": user.id,
            "email": user.email,
            "fullName": user.full_name,
            "role": user.role
        },
        "access_token": token,
        "token_type": "bearer"
    }

@router.post("/login-parent")
def login_parent(payload: dict, db: Session = Depends(get_db)):
    # Admission ID + Password flow
    user = db.query(models.User).join(models.Student, models.Student.parent_id == models.User.id).filter(
        models.Student.admission_number == payload.get('admissionNo')
    ).first()
    
    if not user or not security.verify_password(payload['password'], user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")
        
    token = security.create_access_token(subject=user.id)
    return {
        "user": {
            "id": user.id,
            "email": user.email,
            "fullName": user.full_name,
            "role": user.role,
            "admissionNumber": payload.get('admissionNo')
        },
        "access_token": token,
        "token_type": "bearer"
    }