# backend/app/models/models.py
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, ForeignKey, Enum
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import enum

# --- 修正之处 ---
# 不再创建新的 Base，而是从 database.py 中导入
from app.database import Base
# -----------------

class ImportanceEnum(enum.Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"

class User(Base):
    """
    用户模型：存储用户信息，包括用户名、密码哈希。
    """
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    diary_encryption_salt = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    tasks = relationship("Task", back_populates="owner")
    diaries = relationship("Diary", back_populates="owner")
    # 添加与 NotificationSettings 的反向关系
    notification_settings = relationship("NotificationSettings", uselist=False, back_populates="owner")

    def __repr__(self):
        return f"<User(id={self.id}, username='{self.username}')>"

class Task(Base):
    """
    任务模型：存储待办事项。
    """
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True, nullable=False)
    description = Column(Text, nullable=True)
    importance = Column(Enum(ImportanceEnum), default=ImportanceEnum.MEDIUM, nullable=False)
    completed = Column(Boolean, default=False)
    due_date = Column(DateTime(timezone=True), nullable=True)
    reminder_time = Column(DateTime(timezone=True), nullable=True)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    owner = relationship("User", back_populates="tasks")
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    def __repr__(self):
        return f"<Task(id={self.id}, title='{self.title}', completed={self.completed})>"

class Diary(Base):
    """
    日记模型：存储日记内容。
    """
    __tablename__ = "diaries"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=True)
    content = Column(Text, nullable=False)
    is_encrypted = Column(Boolean, default=False)
    entry_date = Column(DateTime(timezone=True), index=True, nullable=False, unique=True)
    daily_rating = Column(String, nullable=True)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    owner = relationship("User", back_populates="diaries")
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    def __repr__(self):
        return f"<Diary(id={self.id}, title='{self.title}', is_encrypted={self.is_encrypted})>"


class NotificationSettings(Base):
    """
    通知设置模型：存储用户的通知配置。
    """
    __tablename__ = "notification_settings"

    id = Column(Integer, primary_key=True, index=True)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False, unique=True)
    
    email_enabled = Column(Boolean, default=False)
    email_address = Column(String, nullable=True)

    wecom_enabled = Column(Boolean, default=False)
    wecom_webhook_url = Column(String, nullable=True)

    dingtalk_enabled = Column(Boolean, default=False)
    dingtalk_webhook_url = Column(String, nullable=True)

    telegram_enabled = Column(Boolean, default=False)
    telegram_bot_token = Column(String, nullable=True)
    telegram_chat_id = Column(String, nullable=True)

    owner = relationship("User", back_populates="notification_settings")

