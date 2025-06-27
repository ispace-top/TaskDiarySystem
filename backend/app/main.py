from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import auth, tasks, diaries
from app.database import engine, Base

# 在应用启动时创建数据库表 (如果尚不存在)
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="TaskDiarySystem API",
    description="一个功能强大的任务和日记管理系统",
    version="1.0.0",
)

# 配置 CORS 中间件以允许前端访问
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

# 包含您已经编写好的API路由
app.include_router(auth.router, prefix="/api/v1", tags=["Auth"])
app.include_router(tasks.router, prefix="/api/v1/tasks", tags=["Tasks"])
app.include_router(diaries.router, prefix="/api/v1/diaries", tags=["Diaries"])

@app.get("/", tags=["Root"])
def read_root():
    return {"message": "欢迎使用 TaskDiarySystem API"}