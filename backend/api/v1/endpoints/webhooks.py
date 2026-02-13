
from fastapi import APIRouter, Request, Header, HTTPException, Depends
from sqlalchemy.orm import Session
import hmac
import hashlib
import json
import os
from ....database import get_db
from .... import crud

router = APIRouter()

WEBHOOK_SECRET = os.getenv("RAZORPAY_WEBHOOK_SECRET", "mock_secret")

@router.post("/razorpay")
async def razorpay_webhook(
    request: Request, 
    x_razorpay_signature: str = Header(None),
    db: Session = Depends(get_db)
):
    body = await request.body()
    
    # Verify Signature
    if x_razorpay_signature:
        expected_sig = hmac.new(
            WEBHOOK_SECRET.encode(), 
            body, 
            hashlib.sha256
        ).hexdigest()
        
        if not hmac.compare_digest(expected_sig, x_razorpay_signature):
            raise HTTPException(status_code=400, detail="Invalid signature")

    data = json.loads(body)
    event = data.get("event")

    if event == "payment.captured":
        payload = data["payload"]["payment"]["entity"]
        notes = payload.get("notes", {})
        due_id = notes.get("due_id")
        payment_id = payload.get("id")
        
        if due_id:
            try:
                crud.mark_due_as_paid(db, int(due_id), payment_id)
            except Exception as e:
                print(f"Webhook processing failed: {e}")

    return {"status": "ok"}
