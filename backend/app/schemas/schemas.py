# backend/app/schemas/schemas.py
from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum

# 定义与数据库模型中 ImportanceEnum 对应的 Pydantic 枚举
class ImportanceEnumSchema(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"

# --- 用户相关模式 ---

class UserBase(BaseModel):
    username: str
    email: Optional[EmailStr] = None

class UserCreate(UserBase):
    password: str

# ----------------- 新增的模型 ----------------- #
# 这个模型定义了通过 API 返回给客户端的用户数据结构。
# 它继承自 UserBase，并添加了 id 等安全字段。
# 这就是之前报错时找不到的 'User'。
class User(UserBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        # 允许 Pydantic 模型从 ORM 对象（数据库模型）中读取数据。
        from_attributes = True
# --------------------------------------------- #

class UserLogin(BaseModel):
    username: str
    password: str

class UserInDB(UserBase):
    id: int
    hashed_password: str
    diary_encryption_salt: str
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None


# --- 任务相关模式 ---

class TaskBase(BaseModel):
    title: str
    description: Optional[str] = None
    importance: ImportanceEnumSchema = ImportanceEnumSchema.MEDIUM
    completed: bool = False
    due_date: Optional[datetime] = None
    reminder_time: Optional[datetime] = None

class TaskCreate(TaskBase):
    pass

class TaskUpdate(TaskBase):
    title: Optional[str] = None
    description: Optional[str] = None
    importance: Optional[ImportanceEnumSchema] = None
    completed: Optional[bool] = None
    due_date: Optional[datetime] = None
    reminder_time: Optional[datetime] = None

class Task(TaskBase):
    id: int
    owner_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# --- 日记相关模式 ---

class DiaryBase(BaseModel):
    title: Optional[str] = None
    content: str
    is_encrypted: bool = False
    entry_date: datetime = Field(default_factory=datetime.now)
    daily_rating: Optional[str] = None

class DiaryCreate(DiaryBase):
    pass

class DiaryUpdate(DiaryBase):
    title: Optional[str] = None
    content: Optional[str] = None
    is_encrypted: Optional[bool] = None
    entry_date: Optional[datetime] = None
    daily_rating: Optional[str] = None

class Diary(DiaryBase):
    id: int
    owner_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# 用于日记统计的模式
class DiaryStats(BaseModel):
    total_entries: int
    total_words: int
    average_words_per_entry: float
    check_in_frequency_percentage: float
    daily_ratings_distribution: dict

# --- 通知相关模式 ---

class NotificationSettingsBase(BaseModel):
    email_enabled: bool = False
    email_address: Optional[EmailStr] = None
    wecom_enabled: bool = False
    wecom_webhook_url: Optional[str] = None
    dingtalk_enabled: bool = False
    dingtalk_webhook_url: Optional[str] = None
    telegram_enabled: bool = False
    telegram_bot_token: Optional[str] = None
    telegram_chat_id: Optional[str] = None

class NotificationSettingsCreate(NotificationSettingsBase):
    pass

class NotificationSettingsUpdate(NotificationSettingsBase):
    pass

class NotificationSettings(NotificationSettingsBase):
    id: int
    owner_id: int

    class Config:
        from_attributes = True
