
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ....database import get_db
from .... import crud, schemas, models
from ....services import payment_service, receipt_service

router = APIRouter()
ps = payment_service.PaymentService()

@router.post("/create-order")
def create_order(due_id: int, db: Session = Depends(get_db)):
    due = db.query(models.MonthlyDue).filter(models.MonthlyDue.id == due_id).first()
    if not due:
        raise HTTPException(status_code=404, detail="Due not found")
    
    notes = {"due_id": str(due_id), "student_id": str(due.student_id)}
    return ps.create_order(amount=due.total_due, notes=notes)

@router.post("/verify")
def verify_payment(payload: dict, db: Session = Depends(get_db)):
    # 1. Verification of Razorpay Signature
    verified = ps.verify_payment(
        payload["razorpay_order_id"], 
        payload["razorpay_payment_id"], 
        payload["razorpay_signature"]
    )
    
    if not verified:
        raise HTTPException(status_code=400, detail="Invalid payment signature")

    # 2. Update Database via CRUD
    due = crud.mark_due_as_paid(db, payload["due_id"], payload["razorpay_payment_id"])
    
    # 3. Generate Receipt PDF
    student = db.query(models.Student).filter(models.Student.id == due.student_id).first()
    payment = db.query(models.Payment).filter(models.Payment.transaction_id == payload["razorpay_payment_id"]).first()
    
    payment_data = {
        "id": payment.transaction_id,
        "date": payment.payment_date.strftime("%Y-%m-%d"),
        "amount": payment.amount
    }
    student_data = {
        "name": student.full_name,
        "admission_no": student.admission_number,
        "class": f"{student.class_name}-{student.section}",
        "route": student.route.name if student.route else "N/A"
    }
    due_data = {
        "month": due.month,
        "year": due.year,
        "base_fee": due.base_fee,
        "late_fee": due.late_fee,
        "discount": due.discount
    }
    
    file_path = receipt_service.generate_receipt_pdf(payment_data, student_data, due_data)
    payment.receipt_url = file_path
    db.commit()

    return {"status": "success", "receipt_path": file_path}
