from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.database import get_db
from backend import models, schemas, crud

router = APIRouter()

@router.get("/late-fee-rules", response_model=schemas.LateFeeRule)
def get_active_rule(db: Session = Depends(get_db)):
    rule = db.query(models.LateFeeRule).filter(models.LateFeeRule.is_active == True).first()
    if not rule:
        # Return default if none exists
        return {"daily_rate": 50.0, "grace_period_days": 2, "max_late_fee": 500.0}
    return rule

@router.post("/late-fee-rules")
def update_rule(rule_data: dict, db: Session = Depends(get_db)):
    # Deactivate current
    db.query(models.LateFeeRule).update({models.LateFeeRule.is_active: False})
    
    new_rule = models.LateFeeRule(
        name="Revised Rule",
        daily_rate=rule_data.get("daily_rate", 50.0),
        grace_period_days=rule_data.get("grace_period_days", 2),
        max_late_fee=rule_data.get("max_late_fee", 500.0),
        is_active=True
    )
    db.add(new_rule)
    db.commit()
    return new_rule
