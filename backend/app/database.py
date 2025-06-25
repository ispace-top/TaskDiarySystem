# backend/app/database.py
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base
import os

# 从环境变量中获取数据库URL
# 格式通常为: postgresql://user:password@host:port/database_name
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://user:password@db:5432/mydatabase")

# 创建 SQLAlchemy 引擎
# connect_args={"check_same_thread": False} 仅用于 SQLite，对于 PostgreSQL 不需要
engine = create_engine(SQLALCHEMY_DATABASE_URL)

# 创建一个 SessionLocal 类，每个请求使用一个独立的数据库会话
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# 创建一个声明式基础类，后续的模型都将继承它
Base = declarative_base()

def get_db():
    """
    依赖注入函数，获取数据库会话。
    在 FastAPI 路由中作为依赖项使用，确保每个请求都有独立的会话，并在请求结束后关闭。
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_db():
    """
    初始化数据库：创建所有在 Base 上定义的表。
    """
    print("正在初始化数据库并创建表...")
    # 导入所有模型，确保 Base 知道它们
    from app.models import models
    Base.metadata.create_all(bind=engine)
    print("数据库初始化完成。")

if __name__ == "__main__":
    # 可以在此处运行 init_db() 来手动创建表，或者通过 Docker Entrypoint 脚本运行
    # 例如：python -m app.database
    init_db()
