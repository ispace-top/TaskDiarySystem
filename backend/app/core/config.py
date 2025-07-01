# backend/app/core/config.py
from pydantic_settings import BaseSettings
from typing import List, ClassVar

class Settings(BaseSettings):
    """
    集中管理应用的所有配置。
    配置项会从环境变量或 .env 文件中自动读取。
    """
    # --- JWT 安全配置 ---
    SECRET_KEY: str = "a_very_long_and_super_secret_random_string_for_jwt"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    ALGORITHM: str = "HS256"

    # --- 数据库配置 ---
    DATABASE_URL: str = "sqlite:///./taskdiary.db"

    # --- CORS 跨域配置 ---
    # 定义允许访问后端 API 的前端源地址
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173", # 保留旧的端口以备用
        "http://127.0.0.1:5173",
        "http://localhost:3000", # 新增：允许来自 3000 端口的前端访问
    ]

    class Config:
        # 指定 Pydantic 从 .env 文件中读取环境变量
        env_file: ClassVar[str] = ".env"

# 创建一个全局可用的配置实例
settings = Settings()
