# backend/app/crud/tasks.py
from sqlalchemy.orm import Session
from app.models.models import Task, User, ImportanceEnum
from app.schemas.schemas import TaskCreate, TaskUpdate
from datetime import datetime
from typing import List, Optional

def get_task(db: Session, task_id: int, user_id: int):
    """根据任务ID和用户ID获取任务"""
    return db.query(Task).filter(Task.id == task_id, Task.owner_id == user_id).first()

def get_tasks(
    db: Session,
    user_id: int,
    skip: int = 0,
    limit: int = 100,
    completed: Optional[bool] = None,
    importance: Optional[ImportanceEnum] = None,
    due_date_after: Optional[datetime] = None,
    due_date_before: Optional[datetime] = None
) -> List[Task]:
    """
    获取用户的任务列表，支持过滤。
    """
    query = db.query(Task).filter(Task.owner_id == user_id)
    if completed is not None:
        query = query.filter(Task.completed == completed)
    if importance is not None:
        query = query.filter(Task.importance == importance)
    if due_date_after is not None:
        query = query.filter(Task.due_date >= due_date_after)
    if due_date_before is not None:
        query = query.filter(Task.due_date <= due_date_before)
    return query.offset(skip).limit(limit).all()

def create_user_task(db: Session, task: TaskCreate, user_id: int):
    """为指定用户创建新任务"""
    db_task = Task(**task.model_dump(), owner_id=user_id)
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    return db_task

def update_task(db: Session, task_id: int, task_update: TaskUpdate, user_id: int):
    """
    更新指定任务。
    确保只有任务所有者才能更新。
    """
    db_task = db.query(Task).filter(Task.id == task_id, Task.owner_id == user_id).first()
    if db_task:
        update_data = task_update.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_task, key, value)
        db.add(db_task)
        db.commit()
        db.refresh(db_task)
    return db_task

def delete_task(db: Session, task_id: int, user_id: int):
    """
    删除指定任务。
    确保只有任务所有者才能删除。
    """
    db_task = db.query(Task).filter(Task.id == task_id, Task.owner_id == user_id).first()
    if db_task:
        db.delete(db_task)
        db.commit()
    return db_task
