from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import auth, tasks, diaries, notifications # 导入新路由
from app.database import engine, Base

# 在应用启动时创建数据库表
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="TaskDiarySystem API",
    description="一个功能强大的任务和日记管理系统",
    version="1.0.0",
)

# 配置 CORS
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API 路由
api_router = FastAPI(prefix="/api/v1")
api_router.include_router(auth.router, tags=["Auth"])
api_router.include_router(tasks.router, prefix="/tasks", tags=["Tasks"])
api_router.include_router(diaries.router, prefix="/diaries", tags=["Diaries"])
api_router.include_router(notifications.router, prefix="/notifications", tags=["Notifications"])

app.include_router(api_router)

@app.get("/", tags=["Root"])
def read_root():
    return {"message": "欢迎使用 TaskDiarySystem API"}