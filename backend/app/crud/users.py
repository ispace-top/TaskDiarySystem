# backend/app/crud/users.py
from sqlalchemy.orm import Session
from app.models.models import User
from app.schemas.schemas import UserCreate
from app.core.security import get_password_hash, generate_salt

def get_user(db: Session, user_id: int):
    """根据用户ID获取用户"""
    return db.query(User).filter(User.id == user_id).first()

def get_user_by_username(db: Session, username: str):
    """根据用户名获取用户"""
    return db.query(User).filter(User.username == username).first()

def get_user_by_email(db: Session, email: str):
    """根据邮箱获取用户"""
    return db.query(User).filter(User.email == email).first()

def create_user(db: Session, user: UserCreate):
    """
    创建新用户。
    为用户密码生成哈希，并为日记加密生成唯一的盐。
    """
    hashed_password = get_password_hash(user.password)
    diary_encryption_salt = generate_salt() # 为日记加密生成一个独立的盐
    db_user = User(
        username=user.username,
        hashed_password=hashed_password,
        diary_encryption_salt=diary_encryption_salt,
        email=user.email
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

# 可以在这里添加更新用户、删除用户等功能
