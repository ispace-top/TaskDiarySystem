# backend/app/core/security.py
from passlib.context import CryptContext
from datetime import datetime, timedelta, timezone
from typing import Optional
from jose import JWTError, jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from app.schemas.schemas import TokenData
from app.crud import users as crud_users
from app.core.config import settings
from app.database import get_db # 新增：在这里导入 get_db
import secrets
import os
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.backends import default_backend
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
from base64 import urlsafe_b64encode, urlsafe_b64decode

# --- 密码哈希和验证 ---
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

# --- JWT 认证相关 ---
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/token")

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="无法验证凭据",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
        token_data = TokenData(username=username)
    except JWTError:
        raise credentials_exception

    user = crud_users.get_user_by_username(db, username=token_data.username)
    if user is None:
        raise credentials_exception
    return user

# --- 日记加密相关 ---

def generate_salt(length: int = 16) -> str:
    return urlsafe_b64encode(secrets.token_bytes(length)).decode('utf-8')

def get_key_from_password_hash_and_salt(hashed_password: str, salt: str) -> bytes:
    password_bytes = hashed_password.encode('utf-8')
    salt_bytes = urlsafe_b64decode(salt.encode('utf-8'))

    kdf = PBKDF2HMAC(
        algorithm=hashes.SHA256(),
        length=32,
        salt=salt_bytes,
        iterations=480000,
        backend=default_backend()
    )
    return kdf.derive(password_bytes)

def encrypt_data(plaintext: str, key: bytes) -> str:
    iv = os.urandom(12)
    cipher = Cipher(algorithms.AES(key), modes.GCM(iv), backend=default_backend())
    encryptor = cipher.encryptor()
    ciphertext = encryptor.update(plaintext.encode('utf-8')) + encryptor.finalize()
    tag = encryptor.tag
    combined_data = iv + ciphertext + tag
    return urlsafe_b64encode(combined_data).decode('utf-8')

def decrypt_data(encrypted_text: str, key: bytes) -> str:
    try:
        combined_data = urlsafe_b64decode(encrypted_text.encode('utf-8'))
        iv = combined_data[:12]
        ciphertext = combined_data[12:-16]
        tag = combined_data[-16:]
        cipher = Cipher(algorithms.AES(key), modes.GCM(iv, tag), backend=default_backend())
        decryptor = cipher.decryptor()
        plaintext = decryptor.update(ciphertext) + decryptor.finalize()
        return plaintext.decode('utf-8')
    except Exception as e:
        print(f"解密失败: {e}")
        raise ValueError("解密失败，可能是密钥不匹配或数据损坏。")
