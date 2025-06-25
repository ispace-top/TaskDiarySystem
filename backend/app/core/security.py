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
import os
import secrets
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.backends import default_backend
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
from base64 import urlsafe_b64encode, urlsafe_b64decode

# --- 密码哈希和验证 ---
# 使用 bcrypt 算法进行密码哈希
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """验证明文密码是否与哈希密码匹配"""
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    """生成密码的哈希值"""
    return pwd_context.hash(password)

# --- JWT 认证相关 ---

# 从环境变量中获取 JWT 密钥和过期时间
SECRET_KEY = os.getenv("SECRET_KEY", "your-super-secret-jwt-key")
ALGORITHM = "HS256"
# Access Token 30分钟过期
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 30))

# OAuth2 密码流程，用于获取 JWT token
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """创建 JWT Access Token"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    """
    获取当前认证用户。
    从 JWT token 中解析用户信息，并从数据库中检索用户。
    """
    from app.database import get_db # 避免循环引用

    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="无法验证凭据",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
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
    """生成一个用于日记加密的随机盐值，存储为 URL 安全的 base64 字符串。"""
    return urlsafe_b64encode(secrets.token_bytes(length)).decode('utf-8')

def get_key_from_password_hash_and_salt(hashed_password: str, salt: str) -> bytes:
    """
    从用户的密码哈希和日记加密盐值派生加密密钥。
    注意：在实际应用中，如果加密在客户端进行，则密钥应由客户端从原始密码派生。
    这里为了服务器端加密示例，使用hashed_password和存储的盐作为输入。
    """
    # 将密码哈希（字符串）和盐（base64字符串）转换为字节
    password_bytes = hashed_password.encode('utf-8')
    salt_bytes = urlsafe_b64decode(salt.encode('utf-8'))

    kdf = PBKDF2HMAC(
        algorithm=hashes.SHA256(),
        length=32,  # AES-256 需要 32 字节的密钥
        salt=salt_bytes,
        iterations=480000, # 推荐迭代次数，高一些更安全
        backend=default_backend()
    )
    return kdf.derive(password_bytes)

def encrypt_data(plaintext: str, key: bytes) -> str:
    """使用 AES-GCM 加密数据，返回 URL 安全的 base64 编码字符串。"""
    # 为每次加密生成一个新的随机 IV (Initialization Vector)
    iv = os.urandom(12) # GCM 模式推荐 12 字节的 IV

    cipher = Cipher(algorithms.AES(key), modes.GCM(iv), backend=default_backend())
    encryptor = cipher.encryptor()
    # AAD (Additional Authenticated Data) 可选，这里为空
    # encryptor.authenticate_additional_data(b"")

    ciphertext = encryptor.update(plaintext.encode('utf-8')) + encryptor.finalize()
    tag = encryptor.tag # GCM 模式的认证标签

    # 将 IV、密文和标签组合并进行 base64 编码
    # 格式: IV || ciphertext || tag
    combined_data = iv + ciphertext + tag
    return urlsafe_b64encode(combined_data).decode('utf-8')

def decrypt_data(encrypted_text: str, key: bytes) -> str:
    """解密 URL 安全的 base64 编码字符串，返回明文。"""
    try:
        combined_data = urlsafe_b64decode(encrypted_text.encode('utf-8'))
        iv = combined_data[:12] # IV 是前 12 字节
        ciphertext = combined_data[12:-16] # 密文在 IV 和标签之间
        tag = combined_data[-16:] # 标签是最后 16 字节

        cipher = Cipher(algorithms.AES(key), modes.GCM(iv, tag), backend=default_backend())
        decryptor = cipher.decryptor()
        # decryptor.authenticate_additional_data(b"") # 如果加密时使用了 AAD，这里也要使用

        plaintext = decryptor.update(ciphertext) + decryptor.finalize()
        return plaintext.decode('utf-8')
    except Exception as e:
        # 解密失败通常意味着密钥不正确或数据被篡改
        print(f"解密失败: {e}")
        raise ValueError("解密失败，可能是密钥不匹配或数据损坏。")

