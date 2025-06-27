# backend/app/models/models.py
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, ForeignKey, Enum
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import enum

# 声明式基础，所有模型都将继承它
Base = declarative_base()

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
    # 存储密码的哈希值，而不是明文
    hashed_password = Column(String, nullable=False)
    # 用于加密日记的盐值，每个用户不同
    diary_encryption_salt = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=True)
    # 创建时间
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    # 更新时间
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # 关系：一个用户可以有多个任务和多篇日记
    tasks = relationship("Task", back_populates="owner")
    diaries = relationship("Diary", back_populates="owner")

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
    # 任务重要性，使用枚举类型
    importance = Column(Enum(ImportanceEnum), default=ImportanceEnum.MEDIUM, nullable=False)
    # 是否完成
    completed = Column(Boolean, default=False)
    # 截止日期
    due_date = Column(DateTime(timezone=True), nullable=True)
    # 提醒时间
    reminder_time = Column(DateTime(timezone=True), nullable=True)
    # 所属用户ID
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    # 关系：多对一，多个任务属于一个用户
    owner = relationship("User", back_populates="tasks")
    # 创建时间
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    # 更新时间
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
    # 日记内容，如果是加密日记，这里存储密文
    content = Column(Text, nullable=False)
    # 是否是加密日记
    is_encrypted = Column(Boolean, default=False)
    # 日记日期 (用于打卡和统计)
    entry_date = Column(DateTime(timezone=True), index=True, nullable=False, unique=True)
    # 当日评级 (例如 1-5 星，或自定义字符串)
    daily_rating = Column(String, nullable=True)
    # 所属用户ID
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    # 关系：多对一，多篇日记属于一个用户
    owner = relationship("User", back_populates="diaries")
    # 创建时间
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    # 更新时间
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    def __repr__(self):
        return f"<Diary(id={self.id}, title='{self.title}', is_encrypted={self.is_encrypted})>"

# 可以添加更多模型，例如：
# - NotificationSettings: 存储用户的通知偏好设置 (邮件地址、企业微信Webhook等)
# - Tag: 标签模型，用于任务和日记的分类
# - TaskTag: 任务和标签的关联表 (多对多关系)
# - DiaryTag: 日记和标签的关联表 (多对多关系)

# ... (User, Task, Diary 模型定义之后) ...

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

    # 关系：一对一
    owner = relationship("User", back_populates="notification_settings")

User.notification_settings = relationship("NotificationSettings", uselist=False, back_populates="owner")
