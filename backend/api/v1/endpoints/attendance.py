
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from ....database import get_db
from .... import models, schemas
from datetime import datetime

router = APIRouter()

@router.post("/mark")
def mark_attendance(student_id: int, type: str, status: bool, marked_by: int, db: Session = Depends(get_db)):
    """
    Mark student attendance for PICKUP or DROP.
    """
    attendance_record = models.Attendance(
        student_id=student_id,
        date=datetime.utcnow(),
        type=type,
        status=status,
        marked_by=marked_by
    )
    db.add(attendance_record)
    
    # Audit log the attendance marking
    log = models.AuditLog(
        user_id=marked_by,
        action="MARK_ATTENDANCE",
        entity_type="STUDENT",
        entity_id=str(student_id),
        new_values=f"Type: {type}, Status: {status}"
    )
    db.add(log)
    
    db.commit()
    return {"status": "success"}

@router.get("/daily/{route_id}")
def get_daily_attendance(route_id: int, db: Session = Depends(get_db)):
    """
    Retrieve today's attendance for a specific route.
    """
    today = datetime.utcnow().date()
    # This is a simplified query; in production, you'd filter by the start and end of the day
    records = db.query(models.Attendance).join(models.Student).filter(
        models.Student.route_id == route_id,
        models.Attendance.date >= today
    ).all()
    return records
