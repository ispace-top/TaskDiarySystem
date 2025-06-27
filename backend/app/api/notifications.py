# backend/app/api/notifications.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.schemas import NotificationSettings, NotificationSettingsUpdate
from app.crud import notifications as crud_notifications
from app.models.models import User
from app.core.security import get_current_user

router = APIRouter()

@router.get("/settings", response_model=NotificationSettings)
def read_notification_settings(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """获取当前用户的通知设置。"""
    return crud_notifications.get_notification_settings(db=db, user_id=current_user.id)

@router.put("/settings", response_model=NotificationSettings)
def update_notification_settings(
    settings_update: NotificationSettingsUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """更新当前用户的通知设置。"""
    return crud_notifications.update_notification_settings(
        db=db, user_id=current_user.id, settings_update=settings_update
    )