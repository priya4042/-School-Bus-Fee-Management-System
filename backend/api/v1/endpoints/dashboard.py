from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from backend.database import get_db
from backend import models
from datetime import datetime, timedelta

router = APIRouter()

@router.get("/stats")
def get_admin_stats(db: Session = Depends(get_db)):
    # Total Collection (Successful payments)
    total_collection = db.query(func.sum(models.Payment.amount)).filter(models.Payment.status == "success").scalar() or 0
    
    # Active Students
    active_students = db.query(func.count(models.Student.id)).filter(models.Student.is_active == True).scalar() or 0
    
    # Defaulters (Overdue dues)
    defaulters = db.query(func.count(models.MonthlyDue.id)).filter(models.MonthlyDue.status == models.PaymentStatus.OVERDUE).scalar() or 0
    
    # Late Fees Collected
    total_late_fees = db.query(func.sum(models.MonthlyDue.late_fee)).filter(models.MonthlyDue.status == models.PaymentStatus.PAID).scalar() or 0

    # Revenue Trend (Last 6 Months)
    revenue_trend = []
    for i in range(5, -1, -1):
        target_date = datetime.now() - timedelta(days=i*30)
        month = target_date.month
        year = target_date.year
        
        monthly_rev = db.query(func.sum(models.Payment.amount)).join(models.MonthlyDue).filter(
            models.MonthlyDue.month == month,
            models.MonthlyDue.year == year,
            models.Payment.status == "success"
        ).scalar() or 0
        
        revenue_trend.append({
            "month": target_date.strftime("%b"),
            "revenue": float(monthly_rev)
        })

    return {
        "totalCollection": f"₹{(total_collection/100000):.1f}L" if total_collection >= 100000 else f"₹{total_collection}",
        "activeStudents": active_students,
        "defaulters": defaulters,
        "lateFeeCollected": f"₹{total_late_fees:,.0f}",
        "revenueTrend": revenue_trend,
        "paymentHealth": [
            {"name": "Paid", "value": db.query(func.count(models.MonthlyDue.id)).filter(models.MonthlyDue.status == models.PaymentStatus.PAID).scalar() or 0, "color": "#22c55e"},
            {"name": "Overdue", "value": defaulters, "color": "#f59e0b"},
            {"name": "Unpaid", "value": db.query(func.count(models.MonthlyDue.id)).filter(models.MonthlyDue.status == models.PaymentStatus.UNPAID).scalar() or 0, "color": "#ef4444"},
        ]
    }