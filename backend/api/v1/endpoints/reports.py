
from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session
from sqlalchemy import func
from ....database import get_db
from .... import models, schemas
from ....services import report_service
from datetime import datetime, timedelta

router = APIRouter()

@router.get("/collection-summary")
def get_collection_summary(days: int = 30, db: Session = Depends(get_db)):
    start_date = datetime.utcnow() - timedelta(days=days)
    total = db.query(func.sum(models.Payment.amount)).filter(
        models.Payment.status == "success",
        models.Payment.payment_date >= start_date
    ).scalar() or 0
    return {"total": total, "period_days": days}

@router.get("/export/csv")
def export_collection_csv(start_date: str, end_date: str, db: Session = Depends(get_db)):
    """
    Export collection report between two dates as CSV
    """
    csv_content = report_service.generate_collection_report_csv(db, start_date, end_date)
    return Response(
        content=csv_content,
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=collection_report_{start_date}_to_{end_date}.csv"}
    )

@router.get("/defaulters", response_model=list[dict])
def get_defaulter_list(db: Session = Depends(get_db)):
    """
    Get a list of students with overdue payments grouped by route
    """
    defaulters = db.query(
        models.Student.full_name,
        models.Student.admission_number,
        models.Route.name.label("route_name"),
        models.MonthlyDue.total_due,
        models.MonthlyDue.month,
        models.MonthlyDue.year
    ).join(models.MonthlyDue).join(models.Route).filter(
        models.MonthlyDue.status == models.PaymentStatus.OVERDUE
    ).all()
    
    return [dict(d._mapping) for d in defaulters]
