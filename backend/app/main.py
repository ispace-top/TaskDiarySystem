# backend/app/main.py
# 作用：这是FastAPI应用的入口，它将您编写的所有API路由(auth, tasks, diaries)组合在一起，并配置CORS中间件以允许前端访问。

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import auth, tasks, diaries
from app.database import engine, Base

# 在应用启动时创建数据库表（如果尚不存在）
# 这会根据您在 app/models/models.py 中定义的模型来创建表
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="TaskDiarySystem API",
    description="一个功能强大的任务和日记管理系统",
    version="1.0.0",
)

# 配置 CORS 中间件
# 允许来自您前端开发服务器(如 http://localhost:5173)的请求
origins = [
    "http://localhost",
    "http://localhost:3000",
    "http://localhost:5173", # Vite 默认端口
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 包含您已经编写好的API路由
app.include_router(auth.router, prefix="/api/v1", tags=["Auth"])
app.include_router(tasks.router, prefix="/api/v1", tags=["Tasks"])
app.include_router(diaries.router, prefix="/api/v1", tags=["Diaries"])

@app.get("/", tags=["Root"])
def read_root():
    """
    根路径，用于检查API服务是否正常运行。
    """
    return {"message": "欢迎使用 TaskDiarySystem API"}

