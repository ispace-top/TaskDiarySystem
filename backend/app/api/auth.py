# backend/app/api/auth.py
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.schemas import UserCreate, UserLogin, User, Token
from app.crud import users as crud_users
from app.core.security import verify_password, create_access_token, get_current_user
from datetime import timedelta

router = APIRouter(tags=["Auth"])

@router.post("/register", response_model=User)
def register_user(user: UserCreate, db: Session = Depends(get_db)):
    """
    用户注册。
    检查用户名和邮箱是否已存在。
    """
    db_user_by_username = crud_users.get_user_by_username(db, username=user.username)
    if db_user_by_username:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="用户名已存在")

    if user.email:
        db_user_by_email = crud_users.get_user_by_email(db, email=user.email)
        if db_user_by_email:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="邮箱已注册")

    new_user = crud_users.create_user(db=db, user=user)
    return new_user

@router.post("/token", response_model=Token)
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    """
    用户登录并获取 Access Token。
    使用 OAuth2PasswordRequestForm 获取用户名和密码。
    """
    user = crud_users.get_user_by_username(db, username=form_data.username)
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="不正确的用户名或密码",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=30) # 暂定30分钟过期
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=User)
def read_users_me(current_user: User = Depends(get_current_user)):
    """
    获取当前认证用户的信息。
    需要有效的 Access Token。
    """
    return current_user
