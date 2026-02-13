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