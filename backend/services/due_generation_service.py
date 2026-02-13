
from sqlalchemy.orm import Session
from .. import models, crud
from .notification_service import NotificationService
import datetime

def process_daily_cron(db: Session):
    """
    Automated Daily Tasks (Run at 9:00 AM)
    1. 3-day & 1-day reminders
    2. Mark overdue & apply late fees based on LateFeeRule
    """
    now = datetime.datetime.now()
    today_date = now.date()

    # Fetch Active Late Fee Rule
    fee_rule = db.query(models.LateFeeRule).filter(models.LateFeeRule.is_active == True).first()
    if not fee_rule:
        # Fallback to defaults if no rule found
        fee_rule = models.LateFeeRule(daily_rate=50.0, grace_period_days=2, max_late_fee=500.0)

    students = db.query(models.Student).filter(models.Student.is_active == True).all()

    for student in students:
        pending_dues = db.query(models.MonthlyDue).filter(
            models.MonthlyDue.student_id == student.id,
            models.MonthlyDue.status != models.PaymentStatus.PAID
        ).all()

        for due in pending_dues:
            due_date = due.due_date.date()
            
            # 1. Overdue logic (Rule 3)
            if today_date > due_date:
                if due.status != models.PaymentStatus.OVERDUE:
                    due.status = models.PaymentStatus.OVERDUE
                
                # Apply Late Fee Calculation
                overdue_days = (today_date - due_date).days
                if overdue_days > fee_rule.grace_period_days:
                    penalty_days = overdue_days - fee_rule.grace_period_days
                    calculated_late_fee = min(penalty_days * fee_rule.daily_rate, fee_rule.max_late_fee)
                    
                    if calculated_late_fee > due.late_fee:
                        due.late_fee = float(calculated_late_fee)
                        due.total_due = due.base_fee + due.late_fee - due.discount
    
    db.commit()
    return True

def generate_monthly_dues_for_all(db: Session):
    now = datetime.datetime.now()
    month = now.month
    year = now.year
    due_date = datetime.datetime(year, month, 10) # 10th of every month
    
    active_students = db.query(models.Student).filter(models.Student.is_active == True).all()
    created_count = 0
    
    for student in active_students:
        existing = db.query(models.MonthlyDue).filter(
            models.MonthlyDue.student_id == student.id,
            models.MonthlyDue.month == month,
            models.MonthlyDue.year == year
        ).first()
        
        if not existing:
            # Get fee from route
            base_fee = student.route.base_fee if student.route else 1500.0
            new_due = models.MonthlyDue(
                student_id=student.id,
                month=month,
                year=year,
                base_fee=base_fee,
                total_due=base_fee,
                due_date=due_date,
                status=models.PaymentStatus.UNPAID
            )
            db.add(new_due)
            created_count += 1
            
    db.commit()
    return created_count
