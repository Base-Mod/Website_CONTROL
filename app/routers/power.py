from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, and_
from typing import List
from datetime import datetime, timedelta
from app.database import get_db
from app.models import PowerData, Device
from app.schemas import ChartData
from app.auth import get_current_user

router = APIRouter(prefix="/api/power", tags=["Power Data"])


@router.get("/history", response_model=List[ChartData])
def get_power_history(
    hours: int = 24,
    device_id: int = None,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Get power data history"""
    # Calculate time range
    end_time = datetime.now()
    start_time = end_time - timedelta(hours=hours)
    
    # Build query
    query = db.query(
        func.date_format(PowerData.recorded_at, '%Y-%m-%d %H:%i').label('time'),
        func.avg(PowerData.voltage).label('avg_voltage'),
        func.avg(PowerData.current).label('avg_current'),
        func.avg(PowerData.power).label('avg_power'),
        func.sum(PowerData.energy).label('total_energy')
    ).filter(
        PowerData.recorded_at >= start_time
    )
    
    # Filter by device if specified
    if device_id:
        query = query.filter(PowerData.device_id == device_id)
    
    # Group and order
    query = query.group_by('time').order_by('time').limit(100)
    
    results = query.all()
    
    return [
        {
            "time": result.time,
            "avg_voltage": round(result.avg_voltage or 0, 2),
            "avg_current": round(result.avg_current or 0, 3),
            "avg_power": round(result.avg_power or 0, 2),
            "total_energy": round(result.total_energy or 0, 3)
        }
        for result in results
    ]


@router.get("/latest")
def get_latest_readings(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Get latest power readings for all devices"""
    # Subquery to get max recorded_at for each device
    subquery = db.query(
        PowerData.device_id,
        func.max(PowerData.recorded_at).label('max_time')
    ).group_by(PowerData.device_id).subquery()
    
    # Join to get full power data
    results = db.query(PowerData, Device).join(
        subquery,
        and_(
            PowerData.device_id == subquery.c.device_id,
            PowerData.recorded_at == subquery.c.max_time
        )
    ).join(Device).all()
    
    return [
        {
            "id": pd.id,
            "device_id": pd.device_id,
            "device_name": device.device_name,
            "device_type": device.device_type.value,
            "location": device.location,
            "voltage": pd.voltage,
            "current": pd.current,
            "power": pd.power,
            "energy": pd.energy,
            "power_factor": pd.power_factor,
            "frequency": pd.frequency,
            "recorded_at": pd.recorded_at.isoformat()
        }
        for pd, device in results
    ]
