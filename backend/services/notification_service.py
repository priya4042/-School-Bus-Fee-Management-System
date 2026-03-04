
import datetime
from sqlalchemy.orm import Session
from .. import models

class NotificationService:
    @staticmethod
    def _log_notification(db: Session, user_id: int, title: str, message: str, type: str):
        notification = models.Notification(
            user_id=user_id,
            title=title,
            message=message,
            created_at=datetime.datetime.utcnow()
        )
        db.add(notification)
        db.commit()
        print(f"[DISPATCH - {type.upper()}] To User {user_id}: {title} - {message}")

    @staticmethod
    def send_bus_started(db: Session, user_id: int, bus_no: str, eta: int):
        title = "Bus Started"
        message = f"Your bus ({bus_no}) has started the trip. ETA to your stop: {eta} minutes."
        NotificationService._log_notification(db, user_id, title, message, "bus_started")

    @staticmethod
    def send_bus_nearby(db: Session, user_id: int, bus_no: str):
        title = "Bus Nearby"
        message = f"Bus {bus_no} is 5 minutes away from your stop. Please be ready at the pickup point."
        NotificationService._log_notification(db, user_id, title, message, "bus_nearby")

    @staticmethod
    def send_child_boarded(db: Session, user_id: int, student_name: str, time: str):
        title = "Child Boarded"
        message = f"{student_name} has boarded the bus at {time}. You can track the live location in your dashboard."
        NotificationService._log_notification(db, user_id, title, message, "boarded")

    @staticmethod
    def send_child_dropped(db: Session, user_id: int, student_name: str, time: str):
        title = "Child Dropped Off"
        message = f"{student_name} has been safely dropped off at {time}."
        NotificationService._log_notification(db, user_id, title, message, "dropped")

    @staticmethod
    def send_fee_reminder(db: Session, user_id: int, parent_name: str, student_name: str, adm_no: str, amount: float, due_date: str, days_left: int):
        title = "Fee Payment Reminder"
        message = f"Dear {parent_name}, Bus fee of ₹{amount} for {student_name} (Admission: {adm_no}) is due on {due_date}."
        NotificationService._log_notification(db, user_id, title, message, "reminder")

    @staticmethod
    def send_overdue_alert(db: Session, user_id: int, student_name: str, due_date: str, late_fee: float, total: float):
        title = "OVERDUE Alert"
        message = f"Bus fee for {student_name} was due on {due_date}. Late fee of ₹{late_fee} added. Total: ₹{total}."
        NotificationService._log_notification(db, user_id, title, message, "overdue")

    @staticmethod
    def broadcast_emergency(db: Session, user_ids: list[int], message: str):
        for uid in user_ids:
            NotificationService._log_notification(db, uid, "🚨 EMERGENCY", message, "emergency")
