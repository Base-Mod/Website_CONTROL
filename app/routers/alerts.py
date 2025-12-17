from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models import Alert, Device
from app.schemas import Alert as AlertSchema
from app.auth import get_current_user

router = APIRouter(prefix="/api/alerts", tags=["Alerts"])


@router.get("/", response_model=List[AlertSchema])
def get_alerts(
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Get all alerts"""
    alerts = db.query(Alert, Device).join(Device).order_by(
        Alert.created_at.desc()
    ).limit(limit).all()
    
    return [
        {
            "id": alert.id,
            "device_id": alert.device_id,
            "alert_type": alert.alert_type,
            "message": alert.message,
            "severity": alert.severity,
            "is_read": alert.is_read,
            "created_at": alert.created_at,
            "device_name": device.device_name
        }
        for alert, device in alerts
    ]


@router.post("/{alert_id}/mark-read")
def mark_alert_read(
    alert_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Mark an alert as read"""
    if alert_id == 0:
        # Mark all as read
        db.query(Alert).update({"is_read": True})
        db.commit()
        return {"success": True, "message": "All alerts marked as read"}
    else:
        # Mark specific alert
        alert = db.query(Alert).filter(Alert.id == alert_id).first()
        if alert:
            alert.is_read = True
            db.commit()
            return {"success": True, "message": "Alert marked as read"}
        return {"success": False, "message": "Alert not found"}
