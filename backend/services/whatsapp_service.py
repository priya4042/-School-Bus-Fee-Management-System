from sqlalchemy.orm import Session
from .. import models
import datetime
import json

class WhatsAppService:
    @staticmethod
    def queue_payment_confirmation(db: Session, parent_phone: str, data: dict):
        """
        Queue a payment confirmation message
        """
        message_content = f"🎓 *BusWay Pro - Payment Confirmation*\n\nDear Parent,\n\nPayment received successfully!\n\n👤 Child: {data['child_name']}\n📅 Month: {data['month']}\n💰 Amount Paid: ₹{data['amount']}\n🧾 Receipt #: {data['receipt_number']}\n📆 Paid On: {data['paid_at']}\n\nThank you for your payment!"
        
        new_msg = models.MessageQueue(
            recipient_phone=parent_phone,
            message_type='PAYMENT_CONFIRMATION',
            message_content=message_content,
            template_data=data,
            status='pending'
        )
        db.add(new_msg)
        db.commit()
        return new_msg

    @staticmethod
    def queue_fee_reminder(db: Session, parent_phone: str, data: dict):
        """
        Queue a fee reminder message
        """
        message_content = f"🎓 *BusWay Pro - Fee Reminder*\n\nDear Parent,\n\nThis is a reminder for pending fee payment.\n\n👤 Child: {data['child_name']}\n📅 Month: {data['month']}\n💰 Amount Due: ₹{data['amount']}\n📆 Due Date: {data['due_date']}\n\nPlease clear the dues at your earliest convenience."
        
        new_msg = models.MessageQueue(
            recipient_phone=parent_phone,
            message_type='FEE_REMINDER',
            message_content=message_content,
            template_data=data,
            status='pending'
        )
        db.add(new_msg)
        db.commit()
        return new_msg

    @staticmethod
    def process_queue(db: Session):
        """
        Process pending messages in the queue
        In a real app, this would call Twilio/WhatsApp API
        """
        pending_messages = db.query(models.MessageQueue).filter(
            models.MessageQueue.status == 'pending',
            models.MessageQueue.attempts < models.MessageQueue.max_attempts
        ).all()
        
        for msg in pending_messages:
            try:
                # Simulate API call
                print(f"Sending WhatsApp to {msg.recipient_phone}: {msg.message_content}")
                
                msg.status = 'sent'
                msg.sent_at = datetime.datetime.utcnow()
                msg.attempts += 1
            except Exception as e:
                msg.attempts += 1
                msg.error_message = str(e)
                if msg.attempts >= msg.max_attempts:
                    msg.status = 'failed'
        
        db.commit()
        return len(pending_messages)
