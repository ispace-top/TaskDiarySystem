# backend/app/main.py

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware # 导入 CORSMiddleware

from app.api import auth, tasks, diaries, notifications
from app.database import engine, Base

# 创建所有数据库表
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="任务日记系统 API",
    description="一个用于管理任务和日记的 API。",
    version="1.0.0",
)

# 配置 CORS 中间件
# 允许来自前端的特定源
# 允许所有方法 (GET, POST, PUT, DELETE 等)
# 允许所有头部
origins = [
    "http://localhost",
    "http://localhost:3000", # 你的前端应用的地址
    "http://127.0.0.1:3000", # 如果前端也可能通过 127.0.0.1 访问
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"], # 允许所有 HTTP 方法
    allow_headers=["*"], # 允许所有 HTTP 头部
)

# 包含 API 路由
app.include_router(auth.router, prefix="/api/v1/auth", tags=["auth"])
app.include_router(tasks.router, prefix="/api/v1/tasks", tags=["tasks"])
app.include_router(diaries.router, prefix="/api/v1/diaries", tags=["diaries"])
app.include_router(notifications.router, prefix="/api/v1/notifications", tags=["notifications"])

@app.get("/")
def read_root():
    """
    根路径，返回一个简单的问候语。
    """
    return {"message": "欢迎来到任务日记系统 API！"}

