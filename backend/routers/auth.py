"""
Authentication Router - Handles user authentication and management
"""

from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import List
import uuid
from datetime import datetime, timedelta
import bcrypt
import jwt
import secrets
import os

from services.database import get_database
from models.schemas import (
    UserLogin, UserCreate, User, TokenResponse,
    ChangePassword, ResetPasswordRequest, ResetPassword, AdminResetPassword
)

router = APIRouter(prefix="/auth", tags=["authentication"])
security = HTTPBearer()

# JWT Configuration
SECRET_KEY = os.getenv("JWT_SECRET_KEY", "your-secret-key-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 24 hours


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))


def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> User:
    """Validate JWT token and return current user"""
    db = get_database()
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        
        user = await db.users.find_one({"id": user_id})
        if user is None:
            raise HTTPException(status_code=401, detail="User not found")
        
        return User(id=user["id"], email=user["email"], role=user.get("role", "user"), name=user.get("name", ""))
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Could not validate credentials")


def require_role(*required_roles: str):
    """Dependency to require specific roles"""
    async def role_checker(current_user: User = Depends(get_current_user)):
        if current_user.role not in required_roles:
            raise HTTPException(status_code=403, detail="Insufficient permissions")
        return current_user
    return role_checker


@router.post("/register", response_model=User)
async def register_user(user_input: UserCreate, current_user: User = Depends(require_role("admin"))):
    """Register a new user (admin only)"""
    db = get_database()
    
    # Check if email exists
    existing = await db.users.find_one({"email": user_input.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user_id = str(uuid.uuid4())
    user_data = {
        "id": user_id,
        "email": user_input.email,
        "hashed_password": hash_password(user_input.password),
        "role": user_input.role,
        "name": user_input.name or f"{user_input.first_name} {user_input.last_name}".strip(),
        "created_at": datetime.utcnow()
    }
    
    await db.users.insert_one(user_data)
    return User(id=user_id, email=user_input.email, role=user_input.role, name=user_data["name"])


@router.post("/login", response_model=TokenResponse)
async def login(credentials: UserLogin):
    """Login and get JWT token"""
    db = get_database()
    user = await db.users.find_one({"email": credentials.email})
    
    if not user or not verify_password(credentials.password, user["hashed_password"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    token = create_access_token({"sub": user["id"]})
    redirect = "/staff" if user.get("role") in ["counsellor", "peer_supporter", "staff"] else None
    
    return TokenResponse(
        token=token,
        user=User(id=user["id"], email=user["email"], role=user.get("role", "user"), name=user.get("name", "")),
        redirect=redirect
    )


@router.get("/me", response_model=User)
async def get_me(current_user: User = Depends(get_current_user)):
    """Get current user profile"""
    return current_user


@router.post("/change-password")
async def change_password(data: ChangePassword, current_user: User = Depends(get_current_user)):
    """Change current user's password"""
    db = get_database()
    user = await db.users.find_one({"id": current_user.id})
    
    if not verify_password(data.old_password, user["hashed_password"]):
        raise HTTPException(status_code=400, detail="Current password is incorrect")
    
    await db.users.update_one(
        {"id": current_user.id},
        {"$set": {"hashed_password": hash_password(data.new_password)}}
    )
    return {"message": "Password changed successfully"}


@router.post("/forgot-password")
async def forgot_password(request: ResetPasswordRequest):
    """Request a password reset email"""
    db = get_database()
    user = await db.users.find_one({"email": request.email})
    
    if not user:
        # Don't reveal if email exists
        return {"message": "If an account exists, a reset email has been sent"}
    
    reset_token = secrets.token_urlsafe(32)
    expires = datetime.utcnow() + timedelta(hours=24)
    
    await db.password_resets.insert_one({
        "user_id": user["id"],
        "token": reset_token,
        "expires": expires,
        "used": False
    })
    
    # TODO: Send email with reset link
    # await send_reset_email(request.email, reset_token)
    
    return {"message": "If an account exists, a reset email has been sent"}


@router.post("/reset-password")
async def reset_password(reset_data: ResetPassword):
    """Reset password using token"""
    db = get_database()
    reset_record = await db.password_resets.find_one({
        "token": reset_data.token,
        "used": False,
        "expires": {"$gt": datetime.utcnow()}
    })
    
    if not reset_record:
        raise HTTPException(status_code=400, detail="Invalid or expired reset token")
    
    await db.users.update_one(
        {"id": reset_record["user_id"]},
        {"$set": {"hashed_password": hash_password(reset_data.new_password)}}
    )
    
    await db.password_resets.update_one(
        {"token": reset_data.token},
        {"$set": {"used": True}}
    )
    
    return {"message": "Password reset successfully"}


@router.post("/admin-reset-password")
async def admin_reset_password(data: AdminResetPassword, current_user: User = Depends(require_role("admin"))):
    """Admin can reset any user's password"""
    db = get_database()
    result = await db.users.update_one(
        {"id": data.user_id},
        {"$set": {"hashed_password": hash_password(data.new_password)}}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    
    return {"message": "Password reset successfully"}


@router.get("/users", response_model=List[User])
async def get_all_users(current_user: User = Depends(require_role("admin"))):
    """Get all users (admin only)"""
    db = get_database()
    users = await db.users.find({}).to_list(1000)
    return [User(id=u["id"], email=u["email"], role=u.get("role", "user"), name=u.get("name", "")) for u in users]


@router.delete("/users/{user_id}")
async def delete_user(user_id: str, current_user: User = Depends(require_role("admin"))):
    """Delete a user (admin only)"""
    db = get_database()
    if user_id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot delete your own account")
    
    result = await db.users.delete_one({"id": user_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    
    return {"message": "User deleted"}
