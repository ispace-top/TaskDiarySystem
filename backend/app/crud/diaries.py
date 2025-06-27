# backend/app/crud/diaries.py
from sqlalchemy.orm import Session
from app.models.models import Diary, User
from app.schemas.schemas import DiaryCreate, DiaryUpdate
from app.core.security import encrypt_data, decrypt_data, get_key_from_password_hash_and_salt
from datetime import datetime
from typing import List, Optional

def get_diary(db: Session, diary_id: int, user_id: int, decrypt: bool = False):
    """
    根据日记ID和用户ID获取日记。
    如果 decrypt 为 True 且日记已加密，则解密内容。
    """
    db_diary = db.query(Diary).filter(Diary.id == diary_id, Diary.owner_id == user_id).first()
    if db_diary and decrypt and db_diary.is_encrypted:
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            return None # 用户不存在，无法解密

        # 注意: 这里的密钥派生应使用用户的登录密码，
        # 但为简化示例，这里使用用户的 hashed_password 和 diary_encryption_salt
        # 作为派生密钥的输入，这在实际中需要更安全的处理方式。
        # 最好的做法是客户端发送密码解密，或者用户提供一个单独的加密密码。
        key = get_key_from_password_hash_and_salt(user.hashed_password, user.diary_encryption_salt)
        db_diary.content = decrypt_data(db_diary.content, key)
    return db_diary

def get_diaries(
    db: Session,
    user_id: int,
    skip: int = 0,
    limit: int = 100,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    decrypt: bool = False
) -> List[Diary]:
    """
    获取用户的日记列表，支持日期范围过滤。
    如果 decrypt 为 True 且日记已加密，则解密内容。
    """
    query = db.query(Diary).filter(Diary.owner_id == user_id)
    if start_date:
        query = query.filter(Diary.entry_date >= start_date)
    if end_date:
        query = query.filter(Diary.entry_date <= end_date)

    diaries = query.offset(skip).limit(limit).all()

    if decrypt:
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            return [] # 用户不存在，无法解密

        key = get_key_from_password_hash_and_salt(user.hashed_password, user.diary_encryption_salt)
        for diary in diaries:
            if diary.is_encrypted:
                diary.content = decrypt_data(diary.content, key)
    return diaries

def create_user_diary(db: Session, diary: DiaryCreate, user_id: int):
    """
    为指定用户创建新日记。
    如果日记被标记为加密，则在保存前加密内容。
    """
    content_to_save = diary.content
    if diary.is_encrypted:
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise ValueError("User not found for encryption.")
        key = get_key_from_password_hash_and_salt(user.hashed_password, user.diary_encryption_salt)
        content_to_save = encrypt_data(diary.content, key)

    db_diary = Diary(
        title=diary.title,
        content=content_to_save,
        is_encrypted=diary.is_encrypted,
        entry_date=diary.entry_date,
        daily_rating=diary.daily_rating,
        owner_id=user_id
    )
    db.add(db_diary)
    db.commit()
    db.refresh(db_diary)
    return db_diary

def update_diary(db: Session, diary_id: int, diary_update: DiaryUpdate, user_id: int):
    """
    更新指定日记。
    确保只有日记所有者才能更新。
    如果内容或加密状态改变，重新加密。
    """
    db_diary = db.query(Diary).filter(Diary.id == diary_id, Diary.owner_id == user_id).first()
    if db_diary:
        update_data = diary_update.model_dump(exclude_unset=True)

        # 处理内容和加密状态的更新
        if 'content' in update_data or 'is_encrypted' in update_data:
            current_is_encrypted = update_data.get('is_encrypted', db_diary.is_encrypted)
            new_content = update_data.get('content', db_diary.content)

            user = db.query(User).filter(User.id == user_id).first()
            if not user:
                raise ValueError("User not found for encryption/decryption during update.")
            key = get_key_from_password_hash_and_salt(user.hashed_password, user.diary_encryption_salt)

            if current_is_encrypted:
                # 如果要加密或保持加密状态
                # 如果新内容是明文（例如从客户端传来），先解密旧内容（如果旧的是密文）然后加密新内容
                # 简化处理：如果内容有变化且最终是加密的，就直接加密新内容
                if db_diary.is_encrypted and 'content' in update_data:
                    # 如果旧的是加密的，且提供了新内容，需要确保新内容是明文，然后加密
                    # 更好的做法是前端处理明文/密文切换逻辑
                    pass # 不做解密，假定传入的新content是明文

                db_diary.content = encrypt_data(new_content, key)
            else:
                # 如果要解密或保持不加密状态
                if db_diary.is_encrypted and 'content' not in update_data:
                    # 如果旧的是加密的，但现在要不加密，且没提供新内容，则需要解密旧内容
                    db_diary.content = decrypt_data(db_diary.content, key)
                elif 'content' in update_data:
                    # 如果有新内容且不加密，直接使用新内容
                    db_diary.content = new_content
            db_diary.is_encrypted = current_is_encrypted
            update_data.pop('content', None) # 避免重复设置
            update_data.pop('is_encrypted', None)


        for key, value in update_data.items():
            setattr(db_diary, key, value)

        db.add(db_diary)
        db.commit()
        db.refresh(db_diary)
    return db_diary

def delete_diary(db: Session, diary_id: int, user_id: int):
    """
    删除指定日记。
    确保只有日记所有者才能删除。
    """
    db_diary = db.query(Diary).filter(Diary.id == diary_id, Diary.owner_id == user_id).first()
    if db_diary:
        db.delete(db_diary)
        db.commit()
    return db_diary

def get_diary_stats(db: Session, user_id: int) -> dict:
    """
    计算用户的日记统计信息。
    包括总条目数、总字数、平均字数、打卡频率、日评级分布等。
    """
    diaries = db.query(Diary).filter(Diary.owner_id == user_id).all()

    total_entries = len(diaries)
    total_words = 0
    daily_ratings_distribution = {}
    check_in_dates = set()

    # 注意：为了计算字数，需要解密内容。
    # 这在实际应用中可能需要用户在后端提供密码，或者只统计未加密日记。
    # 这里为了示例，假设在统计时可以访问明文。
    # 更安全的做法是，如果日记是加密的，字数统计只能在客户端完成。
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        return {} # 用户不存在

    key = get_key_from_password_hash_and_salt(user.hashed_password, user.diary_encryption_salt)

    for diary in diaries:
        content_to_count = diary.content
        if diary.is_encrypted:
            try:
                content_to_count = decrypt_data(diary.content, key)
            except Exception as e:
                print(f"Error decrypting diary {diary.id} for stats: {e}")
                content_to_count = "" # 无法解密则不计入字数

        total_words += len(content_to_count.strip().split()) if content_to_count else 0
        check_in_dates.add(diary.entry_date.date()) # 只记录日期部分

        if diary.daily_rating:
            daily_ratings_distribution[diary.daily_rating] = daily_ratings_distribution.get(diary.daily_rating, 0) + 1

    average_words_per_entry = total_words / total_entries if total_entries > 0 else 0

    # 简单计算打卡频率：假设从第一篇日记到最后一篇日记的日期范围
    if check_in_dates:
        min_date = min(check_in_dates)
        max_date = max(check_in_dates)
        total_days = (max_date - min_date).days + 1
        check_in_frequency_percentage = (len(check_in_dates) / total_days) * 100 if total_days > 0 else 0
    else:
        check_in_frequency_percentage = 0

    return {
        "total_entries": total_entries,
        "total_words": total_words,
        "average_words_per_entry": average_words_per_entry,
        "check_in_frequency_percentage": check_in_frequency_percentage,
        "daily_ratings_distribution": daily_ratings_distribution
    }
