from pydantic import BaseModel, EmailStr, ConfigDict
from typing import Optional, List, Any
from datetime import datetime
from .models import UserRole, PaymentStatus, TripStatus

class UserBase(BaseModel):
    email: Optional[EmailStr] = None
    full_name: str
    role: UserRole

class UserCreate(UserBase):
    password: str
    phone_number: Optional[str] = None

class User(UserBase):
    id: int
    is_active: bool
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

class LateFeeRuleBase(BaseModel):
    daily_rate: float
    grace_period_days: int
    max_late_fee: float

class LateFeeRule(LateFeeRuleBase):
    id: Optional[int] = None
    name: Optional[str] = None
    is_active: bool = True
    model_config = ConfigDict(from_attributes=True)

class RouteBase(BaseModel):
    name: str
    code: str
    base_fee: float
    distance_km: float

class RouteCreate(RouteBase):
    pass

class Route(RouteBase):
    id: int
    is_active: bool
    model_config = ConfigDict(from_attributes=True)

class StudentBase(BaseModel):
    admission_number: str
    full_name: str
    class_name: str
    section: str
    route_id: int

class StudentCreate(StudentBase):
    parent_id: Optional[int] = None

class Student(StudentBase):
    id: int
    is_active: bool
    route: Optional[Route] = None
    model_config = ConfigDict(from_attributes=True)

class DueBase(BaseModel):
    student_id: int
    month: int
    year: int
    base_fee: float
    due_date: datetime

class Due(DueBase):
    id: int
    late_fee: float
    discount: float
    total_due: float
    status: PaymentStatus
    barcode: Optional[str] = None
    qr_code: Optional[str] = None
    receipt_number: Optional[str] = None
    model_config = ConfigDict(from_attributes=True)

class AdminContactBase(BaseModel):
    contact_type: str
    contact_value: str
    is_primary: bool = False
    label: Optional[str] = None

class AdminContactCreate(AdminContactBase):
    admin_id: int

class AdminContact(AdminContactBase):
    id: int
    is_verified: bool
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

class BoardingLocationBase(BaseModel):
    location_name: str
    address: str
    latitude: float
    longitude: float
    landmark: Optional[str] = None
    special_instructions: Optional[str] = None
    is_primary: bool = True

class BoardingLocationCreate(BoardingLocationBase):
    student_id: int

class BoardingLocation(BoardingLocationBase):
    id: int
    is_active: bool
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

class BusCameraBase(BaseModel):
    camera_name: str
    camera_type: str
    stream_url: str
    device_id: str
    is_active: bool = True

class BusCameraCreate(BusCameraBase):
    bus_id: int

class BusCamera(BusCameraBase):
    id: int
    last_ping: Optional[datetime] = None
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

class MessageQueueBase(BaseModel):
    recipient_phone: str
    message_type: str
    message_content: str
    template_data: Optional[Any] = None

class MessageQueue(MessageQueueBase):
    id: int
    status: str
    attempts: int
    sent_at: Optional[datetime] = None
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

class AuditLogBase(BaseModel):
    user_id: Optional[int] = None
    action: str
    entity_type: str
    entity_id: str
    old_values: Optional[str] = None
    new_values: Optional[str] = None
    created_at: datetime

class AuditLog(AuditLogBase):
    id: int
    model_config = ConfigDict(from_attributes=True)

class NotificationBase(BaseModel):
    user_id: int
    title: str
    message: str
    is_read: bool = False
    created_at: datetime

class Notification(NotificationBase):
    id: int
    model_config = ConfigDict(from_attributes=True)
