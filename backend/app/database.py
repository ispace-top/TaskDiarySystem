# backend/app/database.py
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.core.config import settings # 导入我们新的配置模块

# 根据 DATABASE_URL 判断数据库类型并创建引擎
if settings.DATABASE_URL.startswith("sqlite"):
    # SQLite 特殊配置，允许在多线程环境 (FastAPI) 中使用
    # 这是因为 SQLite 默认不允许在创建它的线程之外的线程中使用连接
    engine = create_engine(
        settings.DATABASE_URL, connect_args={"check_same_thread": False}
    )
else:
    # MySQL, PostgreSQL 等其他数据库的通用配置
    # 使用连接池来更高效地管理数据库连接
    engine = create_engine(
        settings.DATABASE_URL, pool_pre_ping=True
    )

# 创建一个可用于生成数据库会话的工厂
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# 创建一个所有数据模型都将继承的基础类
Base = declarative_base()

# 依赖注入：为每个 API 请求提供一个独立的数据库会话
def get_db():
    """
    一个 FastAPI 依赖，用于获取数据库会话。
    它确保数据库会话在请求处理完毕后（无论成功或失败）都会被关闭。
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
