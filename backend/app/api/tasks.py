# backend/app/api/tasks.py
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.schemas import TaskCreate, TaskUpdate, Task, ImportanceEnumSchema
from app.crud import tasks as crud_tasks
from app.models.models import User, ImportanceEnum
from app.core.security import get_current_user
from datetime import datetime
from typing import List, Optional

router = APIRouter(prefix="/tasks", tags=["Tasks"])

@router.post("/", response_model=Task, status_code=status.HTTP_201_CREATED)
def create_task(
    task: TaskCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """创建新任务"""
    return crud_tasks.create_user_task(db=db, task=task, user_id=current_user.id)

@router.get("/", response_model=List[Task])
def read_tasks(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    skip: int = 0,
    limit: int = 100,
    completed: Optional[bool] = Query(None, description="按完成状态过滤"),
    importance: Optional[ImportanceEnumSchema] = Query(None, description="按重要性过滤"),
    due_date_after: Optional[datetime] = Query(None, description="截止日期晚于此时间"),
    due_date_before: Optional[datetime] = Query(None, description="截止日期早于此时间")
):
    """
    获取任务列表。
    支持按完成状态、重要性、截止日期范围过滤。
    """
    # 将 ImportanceEnumSchema 转换为数据库模型中的 ImportanceEnum
    db_importance = ImportanceEnum[importance.upper()] if importance else None
    tasks = crud_tasks.get_tasks(
        db=db,
        user_id=current_user.id,
        skip=skip,
        limit=limit,
        completed=completed,
        importance=db_importance,
        due_date_after=due_date_after,
        due_date_before=due_date_before
    )
    return tasks

@router.get("/{task_id}", response_model=Task)
def read_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """根据ID获取单个任务"""
    task = crud_tasks.get_task(db=db, task_id=task_id, user_id=current_user.id)
    if task is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="任务未找到")
    return task

@router.put("/{task_id}", response_model=Task)
def update_task(
    task_id: int,
    task_update: TaskUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """更新任务"""
    updated_task = crud_tasks.update_task(db=db, task_id=task_id, task_update=task_update, user_id=current_user.id)
    if updated_task is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="任务未找到或无权更新")
    return updated_task

@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """删除任务"""
    deleted_task = crud_tasks.delete_task(db=db, task_id=task_id, user_id=current_user.id)
    if deleted_task is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="任务未找到或无权删除")
    return {"message": "任务删除成功"}
