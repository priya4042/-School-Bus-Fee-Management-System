from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from .... import crud, schemas, models
from ....database import get_db
from ...v1.endpoints.auth import get_current_user
from ....services.whatsapp_service import WhatsAppService

router = APIRouter()

# --- ADMIN CONTACTS ---

@router.post("/admin/contacts", response_model=schemas.AdminContact)
def add_contact(contact: schemas.AdminContactBase, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    if current_user.role not in [models.UserRole.ADMIN, models.UserRole.SUPER_ADMIN]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    db_contact = crud.add_admin_contact(db, schemas.AdminContactCreate(**contact.model_dump(), admin_id=current_user.id))
    return db_contact

@router.get("/admin/contacts", response_model=List[schemas.AdminContact])
def get_contacts(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    return crud.get_admin_contacts(db, current_user.id)

# --- BOARDING LOCATIONS ---

@router.post("/students/{student_id}/boarding", response_model=schemas.BoardingLocation)
def add_boarding(student_id: int, location: schemas.BoardingLocationBase, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    # Verify student belongs to parent
    student = db.query(models.Student).filter(models.Student.id == student_id).first()
    if not student or (current_user.role == models.UserRole.PARENT and student.parent_id != current_user.id):
        raise HTTPException(status_code=403, detail="Not authorized")
    
    db_location = crud.add_boarding_location(db, schemas.BoardingLocationCreate(**location.model_dump(), student_id=student_id), current_user.id)
    return db_location

@router.get("/students/{student_id}/boarding", response_model=List[schemas.BoardingLocation])
def get_boarding(student_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    return crud.get_student_boarding_locations(db, student_id)

# --- BUS CAMERAS ---

@router.post("/buses/{bus_id}/cameras", response_model=schemas.BusCamera)
def add_camera(bus_id: int, camera: schemas.BusCameraBase, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    if current_user.role not in [models.UserRole.ADMIN, models.UserRole.SUPER_ADMIN]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    db_camera = crud.add_bus_camera(db, schemas.BusCameraCreate(**camera.model_dump(), bus_id=bus_id))
    return db_camera

@router.get("/buses/{bus_id}/cameras", response_model=List[schemas.BusCamera])
def get_cameras(bus_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    return crud.get_bus_cameras(db, bus_id)

@router.get("/tracking/parent/bus-cameras")
def get_parent_bus_cameras(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    if current_user.role != models.UserRole.PARENT:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    # Find active bus for parent's children
    student = db.query(models.Student).filter(models.Student.parent_id == current_user.id).first()
    if not student or not student.route_id:
        return {"bus": None, "cameras": []}
    
    bus = db.query(models.Bus).filter(models.Bus.route_id == student.route_id).first()
    if not bus:
        return {"bus": None, "cameras": []}
    
    cameras = crud.get_bus_cameras(db, bus.id)
    return {"bus": {"plate": bus.plate, "id": bus.id}, "cameras": cameras}

# --- WHATSAPP SETTINGS ---

@router.post("/whatsapp/process-queue")
def process_queue(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    if current_user.role not in [models.UserRole.ADMIN, models.UserRole.SUPER_ADMIN]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    processed = WhatsAppService.process_queue(db)
    return {"processed": processed}
