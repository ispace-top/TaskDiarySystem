from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv
import os

# 从 .env 文件加载环境变量
# 这使得本地运行和Docker运行都能正确读取配置
load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise ValueError("未找到数据库连接地址(DATABASE_URL)，请检查您的 .env 文件。")

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# 依赖注入：为每个请求提供一个数据库会话
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
