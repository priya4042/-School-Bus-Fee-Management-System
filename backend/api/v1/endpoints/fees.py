from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.database import get_db
from backend import crud, schemas, models
from backend.services import due_generation_service

router = APIRouter()

@router.get("/dues", response_model=list[schemas.Due])
def get_all_dues(db: Session = Depends(get_db)):
    return db.query(models.MonthlyDue).all()

@router.post("/generate-monthly")
def generate_dues(db: Session = Depends(get_db)):
    count = due_generation_service.generate_monthly_dues_for_all(db)
    return {"message": f"Generated dues for {count} students"}

@router.post("/waive/{due_id}")
def waive_fee(due_id: int, db: Session = Depends(get_db)):
    due = crud.waive_late_fee(db, due_id)
    if not due:
        raise HTTPException(status_code=404, detail="Due not found")
    return due

@router.post("/discount/{due_id}")
def apply_discount(due_id: int, payload: dict, db: Session = Depends(get_db)):
    amount = payload.get("amount", 0)
    due = crud.apply_discount(db, due_id, amount)
    if not due:
        raise HTTPException(status_code=404, detail="Due not found")
    return due

@router.post("/manual-payment/{due_id}")
def record_manual_payment(due_id: int, payload: dict, db: Session = Depends(get_db)):
    """
    Record an offline payment (Cash/Cheque).
    Payload: { "method": "Cash", "reference": "REC-123", "notes": "..." }
    """
    try:
        txn_id = payload.get("reference") or f"OFFLINE-{due_id}"
        due = crud.mark_due_as_paid(db, due_id, txn_id, method=payload.get("method", "Manual"))
        return due
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
