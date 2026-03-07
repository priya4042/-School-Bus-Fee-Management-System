from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.database import get_db
from backend import crud, schemas, models
from backend.services import due_generation_service
from backend.services.whatsapp_service import WhatsAppService
import datetime

router = APIRouter()

@router.get("/dues", response_model=list[schemas.Due])
def get_all_dues(db: Session = Depends(get_db)):
    return db.query(models.MonthlyDue).all()

@router.get("/defaulters", response_model=list[schemas.Due])
def get_defaulters(db: Session = Depends(get_db)):
    return crud.get_defaulters(db)

@router.get("/barcode/{barcode}", response_model=schemas.Due)
def get_fee_by_barcode(barcode: str, db: Session = Depends(get_db)):
    due = crud.get_fee_by_barcode(db, barcode)
    if not due:
        raise HTTPException(status_code=404, detail="Barcode not found")
    return due

@router.post("/barcode-payment")
def process_barcode_payment(payload: dict, db: Session = Depends(get_db)):
    barcode = payload.get("barcode")
    method = payload.get("method", "Barcode")
    txn_id = payload.get("transactionId") or f"BARCODE-{datetime.datetime.now().timestamp()}"
    
    due = crud.get_fee_by_barcode(db, barcode)
    if not due:
        raise HTTPException(status_code=404, detail="Barcode not found")
    
    if due.status == models.PaymentStatus.PAID:
        raise HTTPException(status_code=400, detail="Fee already paid")
        
    try:
        updated_due = crud.mark_due_as_paid(db, due.id, txn_id, method=method)
        
        # Trigger WhatsApp Notification
        student = db.query(models.Student).filter(models.Student.id == due.student_id).first()
        parent = db.query(models.User).filter(models.User.id == student.parent_id).first()
        
        if parent and parent.phone_number:
            WhatsAppService.queue_payment_confirmation(db, parent.phone_number, {
                "child_name": student.full_name,
                "month": f"{due.month}/{due.year}",
                "amount": due.total_due,
                "receipt_number": due.receipt_number or f"RCP-{due.id}",
                "paid_at": datetime.datetime.now().strftime("%Y-%m-%d %H:%M")
            })
            
        return updated_due
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

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
