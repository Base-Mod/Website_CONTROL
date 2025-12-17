from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, ForeignKey, Enum, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base
import enum


class UserRole(str, enum.Enum):
    ADMIN = "admin"
    USER = "user"


class DeviceType(str, enum.Enum):
    LIGHT = "light"
    AC = "ac"
    FAN = "fan"
    HEATER = "heater"
    SOCKET = "socket"
    OTHER = "other"


class DeviceStatus(str, enum.Enum):
    ON = "on"
    OFF = "off"


class AlertType(str, enum.Enum):
    OVERVOLTAGE = "overvoltage"
    UNDERVOLTAGE = "undervoltage"
    OVERCURRENT = "overcurrent"
    OVERPOWER = "overpower"
    GENERAL = "general"


class AlertSeverity(str, enum.Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class ControlAction(str, enum.Enum):
    TURN_ON = "turn_on"
    TURN_OFF = "turn_off"
    ADJUST = "adjust"


class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, nullable=False, index=True)
    password = Column(String(255), nullable=False)
    email = Column(String(100))
    full_name = Column(String(100))
    role = Column(Enum(UserRole), default=UserRole.USER)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    control_history = relationship("ControlHistory", back_populates="user")


class Device(Base):
    __tablename__ = "devices"
    
    id = Column(Integer, primary_key=True, index=True)
    device_name = Column(String(100), nullable=False)
    device_type = Column(Enum(DeviceType), default=DeviceType.OTHER)
    location = Column(String(100))
    status = Column(Enum(DeviceStatus), default=DeviceStatus.OFF)
    power_rating = Column(Float, default=0.0)  # Watts
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    power_data = relationship("PowerData", back_populates="device", cascade="all, delete-orphan")
    alerts = relationship("Alert", back_populates="device", cascade="all, delete-orphan")
    control_history = relationship("ControlHistory", back_populates="device", cascade="all, delete-orphan")


class PowerData(Base):
    __tablename__ = "power_data"
    
    id = Column(Integer, primary_key=True, index=True)
    device_id = Column(Integer, ForeignKey("devices.id", ondelete="CASCADE"), nullable=False, index=True)
    voltage = Column(Float, default=0.0)  # Volts
    current = Column(Float, default=0.0)  # Amperes
    power = Column(Float, default=0.0)  # Watts
    energy = Column(Float, default=0.0)  # kWh
    power_factor = Column(Float, default=1.0)
    frequency = Column(Float, default=50.0)  # Hz
    recorded_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    
    # Relationships
    device = relationship("Device", back_populates="power_data")


class Alert(Base):
    __tablename__ = "alerts"
    
    id = Column(Integer, primary_key=True, index=True)
    device_id = Column(Integer, ForeignKey("devices.id", ondelete="CASCADE"), nullable=False)
    alert_type = Column(Enum(AlertType), default=AlertType.GENERAL)
    message = Column(Text)
    severity = Column(Enum(AlertSeverity), default=AlertSeverity.MEDIUM)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    
    # Relationships
    device = relationship("Device", back_populates="alerts")


class SystemConfig(Base):
    __tablename__ = "system_config"
    
    id = Column(Integer, primary_key=True, index=True)
    config_key = Column(String(100), unique=True, nullable=False)
    config_value = Column(Text)
    description = Column(Text)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())


class ControlHistory(Base):
    __tablename__ = "control_history"
    
    id = Column(Integer, primary_key=True, index=True)
    device_id = Column(Integer, ForeignKey("devices.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"))
    action = Column(Enum(ControlAction), default=ControlAction.TURN_ON)
    previous_status = Column(String(50))
    new_status = Column(String(50))
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    
    # Relationships
    device = relationship("Device", back_populates="control_history")
    user = relationship("User", back_populates="control_history")
