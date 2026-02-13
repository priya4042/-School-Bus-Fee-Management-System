
import csv
import io
from sqlalchemy.orm import Session
from .. import models

def generate_collection_report_csv(db: Session, start_date: str, end_date: str):
    payments = db.query(models.Payment).filter(
        models.Payment.payment_date >= start_date,
        models.Payment.payment_date <= end_date
    ).all()

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(['TXN ID', 'Student ID', 'Amount', 'Date', 'Status', 'Method'])

    for p in payments:
        writer.writerow([
            p.transaction_id,
            p.due_id,
            p.amount,
            p.payment_date.strftime('%Y-%m-%d %H:%M'),
            p.status,
            p.payment_method
        ])

    return output.getvalue()

def get_revenue_summary(db: Session):
    total = db.query(models.Payment).filter(models.Payment.status == 'success').sum(models.Payment.amount)
    return {"total_revenue": total or 0.0}
