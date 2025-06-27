# backend/app/crud/notifications.py
from sqlalchemy.orm import Session
from app.models.models import NotificationSettings
from app.schemas.schemas import NotificationSettingsUpdate

def get_notification_settings(db: Session, user_id: int):
    """获取用户的通知设置"""
    settings = db.query(NotificationSettings).filter(NotificationSettings.owner_id == user_id).first()
    if not settings:
        # 如果用户还没有设置，为他们创建一个空的
        settings = NotificationSettings(owner_id=user_id)
        db.add(settings)
        db.commit()
        db.refresh(settings)
    return settings

def update_notification_settings(db: Session, user_id: int, settings_update: NotificationSettingsUpdate):
    """更新用户的通知设置"""
    db_settings = get_notification_settings(db, user_id)
    update_data = settings_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_settings, key, value)
    db.add(db_settings)
    db.commit()
    db.refresh(db_settings)
    return db_settings