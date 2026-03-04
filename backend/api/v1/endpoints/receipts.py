
from fastapi import APIRouter, Depends, HTTPException, Response
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from ....database import get_db
from .... import models
from ....services import receipt_service
import os

router = APIRouter()

@router.get("/{payment_id}/download")
def download_receipt(payment_id: int, db: Session = Depends(get_db)):
    payment = db.query(models.Payment).filter(models.Payment.id == payment_id).first()
    if not payment:
        raise HTTPException(status_code=404, detail="Payment record not found")
    
    # Check if PDF already exists
    if payment.receipt_url and os.path.exists(payment.receipt_url):
        return FileResponse(payment.receipt_url, filename=f"Receipt_{payment.transaction_id}.pdf")
    
    # If not, generate it on the fly (Safety fallback)
    due = db.query(models.MonthlyDue).filter(models.MonthlyDue.id == payment.due_id).first()
    student = db.query(models.Student).filter(models.Student.id == due.student_id).first()
    
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
    
    return FileResponse(file_path, filename=f"Receipt_{payment.transaction_id}.pdf")
