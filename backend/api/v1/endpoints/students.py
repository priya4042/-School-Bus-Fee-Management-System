
from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File
from sqlalchemy.orm import Session
from typing import List
import csv
import io
from ....database import get_db
from .... import crud, schemas, models

router = APIRouter()

@router.get("/", response_model=List[schemas.Student])
def read_students(
    skip: int = 0, 
    limit: int = 100, 
    search: str = Query(None),
    db: Session = Depends(get_db)
):
    query = db.query(models.Student)
    if search:
        query = query.filter(models.Student.full_name.ilike(f"%{search}%") | models.Student.admission_number.ilike(f"%{search}%"))
    return query.offset(skip).limit(limit).all()

@router.post("/", response_model=schemas.Student)
def create_student(student: schemas.StudentCreate, db: Session = Depends(get_db)):
    return crud.create_student(db, student)

@router.post("/bulk-upload")
async def bulk_upload_students(file: UploadFile = File(...), db: Session = Depends(get_db)):
    """
    Processes a CSV file to bulk create students.
    """
    content = await file.read()
    decoded = content.decode('utf-8')
    reader = csv.DictReader(io.StringIO(decoded))
    
    count = 0
    for row in reader:
        # Simplified creation logic
        student = models.Student(
            admission_number=row['admission_number'],
            full_name=row['full_name'],
            class_name=row['class_name'],
            section=row['section'],
            route_id=int(row['route_id']),
            is_active=True
        )
        db.add(student)
        count += 1
    
    db.commit()
    return {"message": f"Successfully imported {count} students"}

@router.get("/{student_id}", response_model=schemas.Student)
def read_student(student_id: int, db: Session = Depends(get_db)):
    student = db.query(models.Student).filter(models.Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    return student
