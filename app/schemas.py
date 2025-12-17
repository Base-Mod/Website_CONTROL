from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime
from app.models import UserRole, DeviceType, DeviceStatus, AlertType, AlertSeverity, ControlAction


# User Schemas
class UserBase(BaseModel):
    username: str
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None
    role: UserRole = UserRole.USER


class UserCreate(UserBase):
    password: str


class UserLogin(BaseModel):
    username: str
    password: str


class User(UserBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    username: Optional[str] = None


# Device Schemas
class DeviceBase(BaseModel):
    device_name: str
    device_type: DeviceType = DeviceType.OTHER
    location: Optional[str] = None
    power_rating: float = 0.0


class DeviceCreate(DeviceBase):
    pass


class DeviceUpdate(BaseModel):
    device_name: Optional[str] = None
    device_type: Optional[DeviceType] = None
    location: Optional[str] = None
    power_rating: Optional[float] = None
    status: Optional[DeviceStatus] = None
    is_active: Optional[bool] = None


class Device(DeviceBase):
    id: int
    status: DeviceStatus
    is_active: bool
    created_at: datetime
    updated_at: datetime
    current_power: Optional[float] = 0.0
    current_voltage: Optional[float] = 0.0
    current_current: Optional[float] = 0.0
    
    class Config:
        from_attributes = True


# PowerData Schemas
class PowerDataBase(BaseModel):
    voltage: float = 0.0
    current: float = 0.0
    power: float = 0.0
    energy: float = 0.0
    power_factor: float = 1.0
    frequency: float = 50.0


class PowerDataCreate(PowerDataBase):
    device_id: int


class PowerData(PowerDataBase):
    id: int
    device_id: int
    recorded_at: datetime
    
    class Config:
        from_attributes = True


class PowerDataWithDevice(PowerData):
    device_name: str
    device_type: DeviceType
    location: Optional[str]


# Alert Schemas
class AlertBase(BaseModel):
    alert_type: AlertType = AlertType.GENERAL
    message: str
    severity: AlertSeverity = AlertSeverity.MEDIUM


class AlertCreate(AlertBase):
    device_id: int


class Alert(AlertBase):
    id: int
    device_id: int
    is_read: bool
    created_at: datetime
    device_name: Optional[str] = None
    
    class Config:
        from_attributes = True


# Dashboard Stats Schema
class DashboardStats(BaseModel):
    total_devices: int
    devices_on: int
    current_power: float
    today_energy: float
    unread_alerts: int


# Control History Schema
class ControlHistoryCreate(BaseModel):
    device_id: int
    action: ControlAction
    previous_status: str
    new_status: str


class ControlHistory(BaseModel):
    id: int
    device_id: int
    user_id: Optional[int]
    action: ControlAction
    previous_status: str
    new_status: str
    created_at: datetime
    
    class Config:
        from_attributes = True


# Chart Data Schema
class ChartData(BaseModel):
    time: str
    avg_voltage: Optional[float] = 0.0
    avg_current: Optional[float] = 0.0
    avg_power: Optional[float] = 0.0
    total_energy: Optional[float] = 0.0
