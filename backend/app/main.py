# backend/app/main.py
from fastapi import FastAPI, APIRouter
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

api_router = APIRouter()

# --- 修正之处 ---
# 移除了 include_router 中的 prefix，因为各个路由模块已经自带了前缀
api_router.include_router(auth.router, tags=["Auth"])
api_router.include_router(tasks.router, tags=["Tasks"])
api_router.include_router(diaries.router, tags=["Diaries"])
api_router.include_router(notifications.router, tags=["Notifications"])
# -----------------

# 将 api_router 挂载到主应用 app 上，并添加统一的前缀
app.include_router(api_router, prefix="/api/v1")

@app.get("/", tags=["Root"])
def read_root():
    return {"message": "欢迎使用 TaskDiarySystem API"}
