
import os
import uuid
import datetime

class PaymentService:
    def __init__(self):
        self.key_id = os.getenv("RAZORPAY_KEY_ID", "rzp_test_xxxx")
        self.secret = os.getenv("RAZORPAY_KEY_SECRET", "secret_xxxx")

    def create_order(self, amount: float, currency: str = "INR", notes: dict = None):
        """
        Mock creating a Razorpay order.
        In production, use: client.order.create(data=data)
        """
        order_id = f"order_{uuid.uuid4().hex[:12]}"
        return {
            "id": order_id,
            "amount": amount * 100, # Razorpay expects paise
            "currency": currency,
            "receipt": f"rcpt_{uuid.uuid4().hex[:6]}",
            "notes": notes or {},
            "status": "created"
        }

    def verify_payment(self, razorpay_order_id: str, razorpay_payment_id: str, signature: str):
        """
        Mock signature verification.
        In production, use razorpay utility to verify HMAC signature.
        """
        # Verification logic here
        return True

    @staticmethod
    def generate_receipt_number():
        now = datetime.datetime.now()
        return f"REC-{now.year}-{uuid.uuid4().hex[:6].upper()}"
