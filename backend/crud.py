from sqlalchemy.orm import Session
from . import models, schemas
import datetime
import json

def log_action(db: Session, user_id: int, action: str, entity_type: str, entity_id: str, old=None, new=None):
    log = models.AuditLog(
        user_id=user_id,
        action=action,
        entity_type=entity_type,
        entity_id=str(entity_id),
        old_values=json.dumps(old) if old else None,
        new_values=json.dumps(new) if new else None
    )
    db.add(log)
    db.commit()

def create_user(db: Session, user: schemas.UserCreate):
    db_user = models.User(
        email=user.email,
        full_name=user.full_name,
        role=user.role,
        password_hash=user.password, # In prod, use pwd_context.hash
        phone_number=user.phone_number
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def create_student(db: Session, student: schemas.StudentCreate):
    db_student = models.Student(
        admission_number=student.admission_number,
        full_name=student.full_name,
        class_name=student.class_name,
        section=student.section,
        route_id=student.route_id,
        parent_id=student.parent_id
    )
    db.add(db_student)
    db.commit()
    db.refresh(db_student)
    return db_student

def register_parent_with_admission(db: Session, payload: dict):
    # Check if student exists
    student = db.query(models.Student).filter(models.Student.admission_number == payload["admissionNo"]).first()
    if not student:
        raise ValueError("Admission ID not found in records")
    
    # Create the user
    db_user = models.User(
        email=payload["email"],
        full_name=payload["fullName"],
        phone_number=payload["phone"],
        password_hash=payload["password"], # hashed in endpoint
        role=models.UserRole.PARENT
    )
    db.add(db_user)
    db.flush() # Get ID
    
    # Link student to parent
    student.parent_id = db_user.id
    
    db.commit()
    db.refresh(db_user)
    return db_user

def mark_due_as_paid(db: Session, due_id: int, txn_id: str, method: str = "online"):
    db_due = db.query(models.MonthlyDue).filter(models.MonthlyDue.id == due_id).first()
    if not db_due:
        return None
    
    # REINFORCE RULE 1: No Month Skipping
    previous_unpaid = db.query(models.MonthlyDue).filter(
        models.MonthlyDue.student_id == db_due.student_id,
        (models.MonthlyDue.year < db_due.year) | 
        ((models.MonthlyDue.year == db_due.year) & (models.MonthlyDue.month < db_due.month)),
        models.MonthlyDue.status != models.PaymentStatus.PAID
    ).first()

    if previous_unpaid:
        raise ValueError(f"Constraint Violation: Unpaid dues exist for {previous_unpaid.month}/{previous_unpaid.year}")

    # Mark as Paid
    db_due.status = models.PaymentStatus.PAID
    
    # Check if payment record already exists (idempotency)
    existing_pay = db.query(models.Payment).filter(models.Payment.transaction_id == txn_id).first()
    if not existing_pay:
        db_payment = models.Payment(
            due_id=due_id,
            amount=db_due.total_due,
            transaction_id=txn_id,
            payment_method=method,
            status="success"
        )
        db.add(db_payment)
    
    db.commit()
    return db_due

def waive_late_fee(db: Session, due_id: int, admin_id: int = 1):
    due = db.query(models.MonthlyDue).filter(models.MonthlyDue.id == due_id).first()
    if not due: return None
    
    old_late_fee = due.late_fee
    due.late_fee = 0
    due.total_due = due.base_fee - due.discount
    
    log_action(db, admin_id, "WAIVE_LATE_FEE", "DUE", due_id, old={"late_fee": old_late_fee}, new={"late_fee": 0})
    db.commit()
    return due

def apply_discount(db: Session, due_id: int, amount: float, admin_id: int = 1):
    due = db.query(models.MonthlyDue).filter(models.MonthlyDue.id == due_id).first()
    if not due: return None
    
    old_discount = due.discount
    due.discount = amount
    due.total_due = due.base_fee + due.late_fee - due.discount
    
    log_action(db, admin_id, "APPLY_DISCOUNT", "DUE", due_id, old={"discount": old_discount}, new={"discount": amount})
    db.commit()
    return due