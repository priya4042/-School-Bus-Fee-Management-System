
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ....database import get_db
from .... import models, schemas
from ....services.notification_service import NotificationService

router = APIRouter()

@router.post("/broadcast")
def broadcast_notification(payload: dict, db: Session = Depends(get_db)):
    """
    Broadcast messages to groups of users.
    Payload: { message: str, type: str, target: str }
    """
    message = payload.get("message")
    msg_type = payload.get("type", "announcement")
    target = payload.get("target", "all")

    query = db.query(models.User).filter(models.User.is_active == True)
    if target == "parents":
        query = query.filter(models.User.role == models.UserRole.PARENT)
    
    users = query.all()
    user_ids = [u.id for u in users]
    
    NotificationService.broadcast_emergency(db, user_ids, message)
    
    return {"status": "success", "recipients": len(user_ids)}

@router.get("/my-alerts")
def get_user_notifications(user_id: int, db: Session = Depends(get_db)):
    return db.query(models.Notification).filter(models.User.id == user_id).order_by(models.Notification.created_at.desc()).limit(20).all()
