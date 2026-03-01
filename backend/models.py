
from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Boolean, Enum as SQLEnum, Table, UniqueConstraint, Text, JSON
from sqlalchemy.orm import relationship
from .database import Base
import datetime
import enum

class UserRole(str, enum.Enum):
    SUPER_ADMIN = 'SUPER_ADMIN'
    ADMIN = 'ADMIN'
    PARENT = 'PARENT'

class PaymentStatus(str, enum.Enum):
    PAID = 'PAID'
    UNPAID = 'UNPAID'
    OVERDUE = 'OVERDUE'
    PARTIAL = 'PARTIAL'

class TripStatus(str, enum.Enum):
    ACTIVE = 'ACTIVE'
    COMPLETED = 'COMPLETED'
    CANCELLED = 'CANCELLED'

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=True)
    phone_number = Column(String, unique=True, index=True, nullable=True)
    password_hash = Column(String)
    full_name = Column(String)
    role = Column(SQLEnum(UserRole), default=UserRole.PARENT)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class LateFeeRule(Base):
    __tablename__ = "late_fee_rules"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    daily_rate = Column(Float, default=50.0)
    grace_period_days = Column(Integer, default=2)
    max_late_fee = Column(Float, default=500.0)
    is_active = Column(Boolean, default=True)

class Route(Base):
    __tablename__ = "routes"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    code = Column(String, unique=True, index=True)
    base_fee = Column(Float)
    distance_km = Column(Float)
    is_active = Column(Boolean, default=True)

class Student(Base):
    __tablename__ = "students"
    id = Column(Integer, primary_key=True, index=True)
    admission_number = Column(String, unique=True, index=True)
    full_name = Column(String, index=True)
    class_name = Column(String)
    section = Column(String)
    route_id = Column(Integer, ForeignKey("routes.id"))
    parent_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    is_active = Column(Boolean, default=True)
    route = relationship("Route")

class Bus(Base):
    __tablename__ = "buses"
    id = Column(Integer, primary_key=True, index=True)
    plate = Column(String, unique=True, index=True)
    model = Column(String)
    capacity = Column(Integer, default=40)
    driver_id = Column(Integer, ForeignKey("users.id"))
    route_id = Column(Integer, ForeignKey("routes.id"))
    status = Column(String, default='IDLE') # 'ON_ROUTE', 'IDLE', 'MAINTENANCE'
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class MonthlyDue(Base):
    __tablename__ = "monthly_dues"
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"))
    month = Column(Integer)
    year = Column(Integer)
    base_fee = Column(Float)
    late_fee = Column(Float, default=0.0)
    discount = Column(Float, default=0.0)
    total_due = Column(Float)
    due_date = Column(DateTime)
    status = Column(SQLEnum(PaymentStatus), default=PaymentStatus.UNPAID)
    barcode = Column(String, unique=True, nullable=True)
    qr_code = Column(Text, nullable=True)
    receipt_number = Column(String, unique=True, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    __table_args__ = (UniqueConstraint('student_id', 'month', 'year', name='_student_month_year_uc'),)

class AdminContact(Base):
    __tablename__ = "admin_contacts"
    id = Column(Integer, primary_key=True, index=True)
    admin_id = Column(Integer, ForeignKey("users.id"))
    contact_type = Column(String) # 'phone', 'email', 'whatsapp'
    contact_value = Column(String)
    is_primary = Column(Boolean, default=False)
    is_verified = Column(Boolean, default=False)
    label = Column(String) # 'Office', 'Personal', etc.
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class BoardingLocation(Base):
    __tablename__ = "boarding_locations"
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"))
    location_name = Column(String)
    address = Column(String)
    latitude = Column(Float)
    longitude = Column(Float)
    landmark = Column(String)
    special_instructions = Column(Text)
    is_primary = Column(Boolean, default=True)
    is_active = Column(Boolean, default=True)
    created_by = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class BusCamera(Base):
    __tablename__ = "bus_cameras"
    id = Column(Integer, primary_key=True, index=True)
    bus_id = Column(Integer, ForeignKey("buses.id"))
    camera_name = Column(String) # 'Front', 'Interior', etc.
    camera_type = Column(String) # 'interior', 'front', 'rear', 'gps'
    stream_url = Column(String)
    device_id = Column(String)
    is_active = Column(Boolean, default=True)
    last_ping = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class CameraAccessLog(Base):
    __tablename__ = "camera_access_logs"
    id = Column(Integer, primary_key=True, index=True)
    camera_id = Column(Integer, ForeignKey("bus_cameras.id"))
    user_id = Column(Integer, ForeignKey("users.id"))
    accessed_at = Column(DateTime, default=datetime.datetime.utcnow)
    duration_seconds = Column(Integer, nullable=True)
    ip_address = Column(String, nullable=True)

class MessageQueue(Base):
    __tablename__ = "message_queue"
    id = Column(Integer, primary_key=True, index=True)
    recipient_phone = Column(String)
    message_type = Column(String)
    message_content = Column(Text)
    template_data = Column(JSON, nullable=True)
    status = Column(String, default='pending') # 'pending', 'sent', 'failed', 'delivered'
    attempts = Column(Integer, default=0)
    max_attempts = Column(Integer, default=3)
    scheduled_for = Column(DateTime, default=datetime.datetime.utcnow)
    sent_at = Column(DateTime, nullable=True)
    error_message = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class Payment(Base):
    __tablename__ = "payments"
    id = Column(Integer, primary_key=True, index=True)
    due_id = Column(Integer, ForeignKey("monthly_dues.id"))
    amount = Column(Float)
    transaction_id = Column(String, unique=True)
    payment_method = Column(String) 
    status = Column(String) 
    payment_date = Column(DateTime, default=datetime.datetime.utcnow)
    receipt_url = Column(String, nullable=True)

class AuditLog(Base):
    __tablename__ = "audit_logs"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    action = Column(String)
    entity_type = Column(String)
    entity_id = Column(String)
    old_values = Column(Text, nullable=True)
    new_values = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class Attendance(Base):
    __tablename__ = "attendance"
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"))
    date = Column(DateTime, default=datetime.datetime.utcnow)
    type = Column(String) # 'PICKUP' or 'DROP'
    status = Column(Boolean, default=True)
    marked_by = Column(Integer, ForeignKey("users.id"))

class Trip(Base):
    __tablename__ = "trips"
    id = Column(Integer, primary_key=True, index=True)
    bus_id = Column(Integer)
    route_id = Column(Integer)
    driver_id = Column(Integer)
    start_time = Column(DateTime, default=datetime.datetime.utcnow)
    end_time = Column(DateTime, nullable=True)
    status = Column(SQLEnum(TripStatus), default=TripStatus.ACTIVE)

class BusLocation(Base):
    __tablename__ = "bus_locations"
    id = Column(Integer, primary_key=True, index=True)
    trip_id = Column(Integer)
    bus_id = Column(Integer)
    latitude = Column(Float)
    longitude = Column(Float)
    speed = Column(Float, default=0)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)

class PickupLog(Base):
    __tablename__ = "pickup_logs"
    id = Column(Integer, primary_key=True, index=True)
    trip_id = Column(Integer)
    student_id = Column(Integer)
    action_type = Column(String) # 'PICKED_UP', 'DROPPED_OFF'
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)

class Notification(Base):
    __tablename__ = "notifications"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    title = Column(String)
    message = Column(Text)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    is_read = Column(Boolean, default=False)
