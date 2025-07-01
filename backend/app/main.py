# backend/app/main.py
from fastapi import FastAPI, APIRouter # 导入 APIRouter
from fastapi.middleware.cors import CORSMiddleware
from app.api import auth, tasks, diaries, notifications
from app.database import engine, Base
from app.core.config import settings

# 在应用启动时根据模型定义创建数据库表
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="TaskDiarySystem API",
    description="一个功能强大的任务和日记管理系统，支持多种数据库。",
    version="1.0.0",
)

# 设置 CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ----------------- 修正之处 ----------------- #
# 将 api_router 的类型从 FastAPI 改为 APIRouter
api_router = APIRouter()
# --------------------------------------------- #

# 将所有子路由包含到 api_router 中
api_router.include_router(auth.router, prefix="/auth", tags=["Auth"])
api_router.include_router(tasks.router, prefix="/tasks", tags=["Tasks"])
api_router.include_router(diaries.router, prefix="/diaries", tags=["Diaries"])
api_router.include_router(notifications.router, prefix="/notifications", tags=["Notifications"])

# 将 api_router 挂载到主应用 app 上，并添加统一的前缀
app.include_router(api_router, prefix="/api/v1")

@app.get("/", tags=["Root"])
def read_root():
    return {"message": "欢迎使用 TaskDiarySystem API"}
