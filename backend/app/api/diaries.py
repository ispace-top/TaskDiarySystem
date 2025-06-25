# backend/app/api/diaries.py
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.schemas import DiaryCreate, DiaryUpdate, Diary, DiaryStats
from app.crud import diaries as crud_diaries
from app.models.models import User
from app.core.security import get_current_user
from datetime import datetime
from typing import List, Optional

router = APIRouter(prefix="/diaries", tags=["Diaries"])

@router.post("/", response_model=Diary, status_code=status.HTTP_201_CREATED)
def create_diary(
    diary: DiaryCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """创建新日记。如果 is_encrypted 为 True，内容将在保存前加密。"""
    try:
        return crud_diaries.create_user_diary(db=db, diary=diary, user_id=current_user.id)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

@router.get("/", response_model=List[Diary])
def read_diaries(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    skip: int = 0,
    limit: int = 100,
    start_date: Optional[datetime] = Query(None, description="日记日期开始范围"),
    end_date: Optional[datetime] = Query(None, description="日记日期结束范围"),
    decrypt: bool = Query(False, description="是否解密加密日记内容 (慎用，通常在客户端完成解密)")
):
    """
    获取日记列表。
    支持按日期范围过滤。
    'decrypt' 参数用于在服务器端解密加密日记内容，这在生产环境中应谨慎使用。
    更安全的做法是在客户端完成解密。
    """
    diaries = crud_diaries.get_diaries(
        db=db,
        user_id=current_user.id,
        skip=skip,
        limit=limit,
        start_date=start_date,
        end_date=end_date,
        decrypt=decrypt
    )
    return diaries

@router.get("/{diary_id}", response_model=Diary)
def read_diary(
    diary_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    decrypt: bool = Query(False, description="是否解密加密日记内容 (慎用，通常在客户端完成解密)")
):
    """根据ID获取单篇日记。'decrypt' 参数用于在服务器端解密。"""
    diary = crud_diaries.get_diary(db=db, diary_id=diary_id, user_id=current_user.id, decrypt=decrypt)
    if diary is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="日记未找到")
    return diary

@router.put("/{diary_id}", response_model=Diary)
def update_diary(
    diary_id: int,
    diary_update: DiaryUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    更新日记。
    如果内容或加密状态改变，内容将在保存前/后被重新加密/解密。
    """
    try:
        updated_diary = crud_diaries.update_diary(db=db, diary_id=diary_id, diary_update=diary_update, user_id=current_user.id)
        if updated_diary is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="日记未找到或无权更新")
        return updated_diary
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.delete("/{diary_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_diary(
    diary_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """删除日记"""
    deleted_diary = crud_diaries.delete_diary(db=db, diary_id=diary_id, user_id=current_user.id)
    if deleted_diary is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="日记未找到或无权删除")
    return {"message": "日记删除成功"}

@router.get("/stats/summary", response_model=DiaryStats)
def get_diary_statistics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """获取日记统计信息。包括总条目数、总字数、打卡频率、评级分布等。"""
    stats = crud_diaries.get_diary_stats(db=db, user_id=current_user.id)
    if not stats:
        # 如果没有日记，返回默认空统计
        return DiaryStats(
            total_entries=0,
            total_words=0,
            average_words_per_entry=0.0,
            check_in_frequency_percentage=0.0,
            daily_ratings_distribution={}
        )
    return stats
