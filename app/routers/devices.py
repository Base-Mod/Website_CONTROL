from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func, and_
from typing import List
from datetime import datetime, timedelta
import random
from app.database import get_db
from app.models import Device, PowerData, Alert, ControlHistory, DeviceStatus, ControlAction
from app.schemas import (
    Device as DeviceSchema,
    DeviceCreate,
    DeviceUpdate,
    DashboardStats,
    PowerData as PowerDataSchema,
    PowerDataCreate,
    ChartData
)
from app.auth import get_current_user

router = APIRouter(prefix="/api/devices", tags=["Devices"])


@router.get("/stats", response_model=DashboardStats)
def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Get dashboard statistics"""
    # Total devices
    total_devices = db.query(func.count(Device.id)).filter(Device.is_active == True).scalar()
    
    # Devices ON
    devices_on = db.query(func.count(Device.id)).filter(
        and_(Device.status == DeviceStatus.ON, Device.is_active == True)
    ).scalar()
    
    # Current total power
    current_power = db.query(func.sum(Device.power_rating)).filter(
        and_(Device.status == DeviceStatus.ON, Device.is_active == True)
    ).scalar() or 0.0
    
    # Today's energy
    today = datetime.now().date()
    today_energy = db.query(func.sum(PowerData.energy)).filter(
        func.date(PowerData.recorded_at) == today
    ).scalar() or 0.0
    
    # Unread alerts
    unread_alerts = db.query(func.count(Alert.id)).filter(Alert.is_read == False).scalar()
    
    return {
        "total_devices": total_devices,
        "devices_on": devices_on,
        "current_power": current_power,
        "today_energy": today_energy,
        "unread_alerts": unread_alerts
    }


@router.get("/", response_model=List[DeviceSchema])
def get_devices(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Get all devices with latest power data"""
    devices = db.query(Device).filter(Device.is_active == True).all()
    
    result = []
    for device in devices:
        # Get latest power data
        latest_power = db.query(PowerData).filter(
            PowerData.device_id == device.id
        ).order_by(PowerData.recorded_at.desc()).first()
        
        device_dict = {
            "id": device.id,
            "device_name": device.device_name,
            "device_type": device.device_type,
            "location": device.location,
            "status": device.status,
            "power_rating": device.power_rating,
            "is_active": device.is_active,
            "created_at": device.created_at,
            "updated_at": device.updated_at,
            "current_power": latest_power.power if latest_power else 0.0,
            "current_voltage": latest_power.voltage if latest_power else 0.0,
            "current_current": latest_power.current if latest_power else 0.0
        }
        result.append(device_dict)
    
    return result


@router.post("/", response_model=DeviceSchema)
def create_device(
    device: DeviceCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Create a new device"""
    db_device = Device(**device.dict())
    db.add(db_device)
    db.commit()
    db.refresh(db_device)
    
    # Add default values for response
    db_device.current_power = 0.0
    db_device.current_voltage = 0.0
    db_device.current_current = 0.0
    
    return db_device


@router.get("/{device_id}", response_model=DeviceSchema)
def get_device(
    device_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Get a specific device"""
    device = db.query(Device).filter(Device.id == device_id).first()
    if not device:
        raise HTTPException(status_code=404, detail="Device not found")
    
    # Get latest power data
    latest_power = db.query(PowerData).filter(
        PowerData.device_id == device.id
    ).order_by(PowerData.recorded_at.desc()).first()
    
    device.current_power = latest_power.power if latest_power else 0.0
    device.current_voltage = latest_power.voltage if latest_power else 0.0
    device.current_current = latest_power.current if latest_power else 0.0
    
    return device


@router.put("/{device_id}", response_model=DeviceSchema)
def update_device(
    device_id: int,
    device_update: DeviceUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Update a device"""
    device = db.query(Device).filter(Device.id == device_id).first()
    if not device:
        raise HTTPException(status_code=404, detail="Device not found")
    
    # Update fields
    update_data = device_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(device, field, value)
    
    db.commit()
    db.refresh(device)
    
    # Get latest power data
    latest_power = db.query(PowerData).filter(
        PowerData.device_id == device.id
    ).order_by(PowerData.recorded_at.desc()).first()
    
    device.current_power = latest_power.power if latest_power else 0.0
    device.current_voltage = latest_power.voltage if latest_power else 0.0
    device.current_current = latest_power.current if latest_power else 0.0
    
    return device


@router.post("/{device_id}/toggle")
def toggle_device(
    device_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Toggle device ON/OFF"""
    device = db.query(Device).filter(Device.id == device_id).first()
    if not device:
        raise HTTPException(status_code=404, detail="Device not found")
    
    # Get current status
    previous_status = device.status
    new_status = DeviceStatus.OFF if device.status == DeviceStatus.ON else DeviceStatus.ON
    
    # Update device status
    device.status = new_status
    db.commit()
    
    # Log control history
    history = ControlHistory(
        device_id=device_id,
        user_id=current_user.id,
        action=ControlAction.TURN_ON if new_status == DeviceStatus.ON else ControlAction.TURN_OFF,
        previous_status=previous_status.value,
        new_status=new_status.value
    )
    db.add(history)
    db.commit()
    
    message = f"Đã {'bật' if new_status == DeviceStatus.ON else 'tắt'} thiết bị"
    
    return {
        "success": True,
        "message": message,
        "new_status": new_status.value
    }


@router.delete("/{device_id}")
def delete_device(
    device_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Delete (deactivate) a device"""
    device = db.query(Device).filter(Device.id == device_id).first()
    if not device:
        raise HTTPException(status_code=404, detail="Device not found")
    
    device.is_active = False
    db.commit()
    
    return {"success": True, "message": "Device deactivated"}


@router.post("/{device_id}/simulate")
def simulate_data(
    device_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Add simulated power data for testing"""
    device = db.query(Device).filter(Device.id == device_id).first()
    if not device:
        raise HTTPException(status_code=404, detail="Device not found")
    
    if device.status != DeviceStatus.ON:
        raise HTTPException(
            status_code=400,
            detail="Device must be ON to generate simulated data"
        )
    
    # Generate simulated data
    voltage = 220 + random.uniform(-5, 5)
    power = device.power_rating * (0.8 + random.uniform(0, 0.2))
    current = power / voltage if voltage > 0 else 0
    energy = power / 1000 / 60  # kWh for 1 minute
    power_factor = 0.95
    frequency = 50.0
    
    # Save power data
    power_data = PowerData(
        device_id=device_id,
        voltage=voltage,
        current=current,
        power=power,
        energy=energy,
        power_factor=power_factor,
        frequency=frequency
    )
    db.add(power_data)
    
    # Check for alerts
    if voltage > 250:
        alert = Alert(
            device_id=device_id,
            alert_type="overvoltage",
            message=f"Điện áp vượt quá mức cho phép: {voltage:.2f}V",
            severity="high"
        )
        db.add(alert)
    elif voltage < 200:
        alert = Alert(
            device_id=device_id,
            alert_type="undervoltage",
            message=f"Điện áp thấp hơn mức cho phép: {voltage:.2f}V",
            severity="medium"
        )
        db.add(alert)
    
    db.commit()
    
    return {
        "success": True,
        "message": "Simulated data added",
        "data": {
            "voltage": round(voltage, 2),
            "current": round(current, 3),
            "power": round(power, 2),
            "energy": round(energy, 3)
        }
    }
