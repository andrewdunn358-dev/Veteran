from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timedelta
import bcrypt
import jwt
import secrets
import resend
import asyncio

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# JWT Configuration
SECRET_KEY = os.getenv("JWT_SECRET_KEY", "your-secret-key-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 24 hours

# MongoDB connection with SSL fix for Atlas
import ssl
import certifi

mongo_url = os.environ['MONGO_URL']

# Only apply SSL settings for MongoDB Atlas (remote) connections
if 'mongodb+srv' in mongo_url or 'mongodb.net' in mongo_url:
    client = AsyncIOMotorClient(
        mongo_url,
        serverSelectionTimeoutMS=10000,
        tlsCAFile=certifi.where()
    )
else:
    # Local MongoDB without SSL
    client = AsyncIOMotorClient(
        mongo_url,
        serverSelectionTimeoutMS=10000
    )
db = client[os.environ.get('DB_NAME', 'veterans_support')]

# Create the main app
app = FastAPI()
api_router = APIRouter(prefix="/api")
security = HTTPBearer()

# ============ MODELS ============

# Auth Models
class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    role: str = Field(..., pattern="^(admin|counsellor|peer)$")
    name: str

class User(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: EmailStr
    role: str
    name: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: User

# Counsellor Models
class CounsellorCreate(BaseModel):
    name: str
    specialization: str
    phone: str
    sms: Optional[str] = None
    whatsapp: Optional[str] = None
    user_id: Optional[str] = None

class Counsellor(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    specialization: str
    status: str = "off"  # available, busy, off
    next_available: Optional[str] = None
    phone: str
    sms: Optional[str] = None
    whatsapp: Optional[str] = None
    user_id: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

class CounsellorStatusUpdate(BaseModel):
    status: str = Field(..., pattern="^(available|busy|off)$")
    next_available: Optional[str] = None

# Peer Supporter Models
class PeerSupporterCreate(BaseModel):
    firstName: str
    area: str
    background: str
    yearsServed: str
    phone: str
    sms: Optional[str] = None
    whatsapp: Optional[str] = None
    user_id: Optional[str] = None

class PeerSupporter(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    firstName: str
    area: str
    background: str
    yearsServed: str
    status: str = "unavailable"  # available, limited, unavailable
    phone: str
    sms: Optional[str] = None
    whatsapp: Optional[str] = None
    user_id: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

class PeerSupporterStatusUpdate(BaseModel):
    status: str = Field(..., pattern="^(available|limited|unavailable)$")

# Organization Models
class OrganizationCreate(BaseModel):
    name: str
    description: str
    phone: str
    sms: Optional[str] = None
    whatsapp: Optional[str] = None

class Organization(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: str
    phone: str
    sms: Optional[str] = None
    whatsapp: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

# Peer Support Registration (from app)
class PeerSupportRegistration(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: EmailStr
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class PeerSupportRegistrationCreate(BaseModel):
    email: EmailStr

# Password Management Models
class ChangePassword(BaseModel):
    current_password: str
    new_password: str

class ResetPasswordRequest(BaseModel):
    email: EmailStr

class ResetPassword(BaseModel):
    token: str
    new_password: str

class AdminResetPassword(BaseModel):
    user_id: str
    new_password: str

# CMS Content Models
class PageContent(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    page_name: str  # home, crisis-support, organizations, peer-support, historical-investigations
    section: str    # title, subtitle, emergency_text, etc.
    content: str
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    updated_by: Optional[str] = None

class PageContentUpdate(BaseModel):
    content: str

# Resend Configuration
RESEND_API_KEY = os.getenv("RESEND_API_KEY", "")
SENDER_EMAIL = os.getenv("SENDER_EMAIL", "noreply@veteran.dbty.co.uk")
FRONTEND_URL = os.getenv("FRONTEND_URL", "https://veteran-support.vercel.app")

# Initialize Resend
if RESEND_API_KEY:
    resend.api_key = RESEND_API_KEY

async def send_reset_email(email: str, reset_token: str):
    """Send password reset email via Resend"""
    if not RESEND_API_KEY:
        logging.warning("Resend API key not configured, skipping email")
        return False
    
    try:
        reset_link = f"{FRONTEND_URL}/reset-password?token={reset_token}"
        
        html_content = f"""
        <html>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #1a2332;">Password Reset Request</h2>
            <p>You have requested to reset your password for the Veterans Support portal.</p>
            <p>Click the button below to reset your password:</p>
            <p style="text-align: center; margin: 30px 0;">
                <a href="{reset_link}" style="background-color: #4a90d9; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; display: inline-block;">Reset Password</a>
            </p>
            <p style="color: #666; font-size: 14px;">Or copy this link: {reset_link}</p>
            <p style="color: #666; font-size: 14px;">This link will expire in 1 hour.</p>
            <p style="color: #666; font-size: 14px;">If you did not request this, please ignore this email.</p>
            <br>
            <p style="color: #1a2332;">Veterans Support Team</p>
        </body>
        </html>
        """
        
        params = {
            "from": SENDER_EMAIL,
            "to": [email],
            "subject": "Password Reset - Veterans Support",
            "html": html_content
        }
        
        # Run sync SDK in thread to keep FastAPI non-blocking
        result = await asyncio.to_thread(resend.Emails.send, params)
        logging.info(f"Password reset email sent to {email}, ID: {result.get('id')}")
        return True
    except Exception as e:
        logging.error(f"Failed to send email via Resend: {str(e)}")
        return False

# ============ AUTH FUNCTIONS ============

def hash_password(password: str) -> str:
    """Hash a password using bcrypt"""
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against a hash"""
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))

def create_access_token(data: dict) -> str:
    """Create JWT access token"""
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> User:
    """Get current authenticated user from JWT token"""
    try:
        token = credentials.credentials
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=401, detail="Invalid authentication credentials")
        
        user_data = await db.users.find_one({"email": email})
        if user_data is None:
            raise HTTPException(status_code=401, detail="User not found")
        
        return User(**user_data)
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except jwt.JWTError:
        raise HTTPException(status_code=401, detail="Could not validate credentials")

def require_role(required_role: str):
    """Dependency to check if user has required role"""
    async def role_checker(current_user: User = Depends(get_current_user)):
        if current_user.role != required_role and current_user.role != "admin":
            raise HTTPException(
                status_code=403,
                detail=f"Access denied. Required role: {required_role}"
            )
        return current_user
    return role_checker

# ============ AUTH ENDPOINTS ============

@api_router.post("/auth/register", response_model=User)
async def register_user(user_input: UserCreate, current_user: User = Depends(require_role("admin"))):
    """Register a new user (admin only)"""
    existing_user = await db.users.find_one({"email": user_input.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user_dict = user_input.dict(exclude={"password"})
    user_obj = User(**user_dict)
    user_data = user_obj.dict()
    user_data["password_hash"] = hash_password(user_input.password)
    
    await db.users.insert_one(user_data)
    return user_obj

@api_router.post("/auth/login", response_model=TokenResponse)
async def login(credentials: UserLogin):
    """Login and get JWT token"""
    user_data = await db.users.find_one({"email": credentials.email})
    if not user_data or not verify_password(credentials.password, user_data["password_hash"]):
        raise HTTPException(status_code=401, detail="Incorrect email or password")
    
    user = User(**user_data)
    access_token = create_access_token(data={"sub": user.email, "role": user.role})
    
    return TokenResponse(access_token=access_token, user=user)

@api_router.get("/auth/me", response_model=User)
async def get_me(current_user: User = Depends(get_current_user)):
    """Get current user info"""
    return current_user

# ============ PASSWORD MANAGEMENT ENDPOINTS ============

@api_router.post("/auth/change-password")
async def change_password(
    password_data: ChangePassword,
    current_user: User = Depends(get_current_user)
):
    """Change own password (logged-in users)"""
    user_data = await db.users.find_one({"email": current_user.email})
    if not verify_password(password_data.current_password, user_data["password_hash"]):
        raise HTTPException(status_code=400, detail="Current password is incorrect")
    
    new_hash = hash_password(password_data.new_password)
    await db.users.update_one(
        {"email": current_user.email},
        {"$set": {"password_hash": new_hash}}
    )
    return {"message": "Password changed successfully"}

@api_router.post("/auth/forgot-password")
async def forgot_password(request: ResetPasswordRequest):
    """Request password reset email"""
    user_data = await db.users.find_one({"email": request.email})
    if not user_data:
        # Don't reveal if email exists
        return {"message": "If this email exists, a reset link has been sent"}
    
    # Generate reset token
    reset_token = secrets.token_urlsafe(32)
    expires = datetime.utcnow() + timedelta(hours=1)
    
    # Store reset token
    await db.password_resets.delete_many({"email": request.email})  # Remove old tokens
    await db.password_resets.insert_one({
        "email": request.email,
        "token": reset_token,
        "expires": expires
    })
    
    # Send email
    email_sent = await send_reset_email(request.email, reset_token)
    
    if not email_sent:
        # For non-production, return token directly
        return {
            "message": "Email service not configured",
            "reset_token": reset_token,
            "note": "In production, this would be sent via email"
        }
    
    return {"message": "If this email exists, a reset link has been sent"}

@api_router.post("/auth/reset-password")
async def reset_password(reset_data: ResetPassword):
    """Reset password using token"""
    reset_record = await db.password_resets.find_one({"token": reset_data.token})
    
    if not reset_record:
        raise HTTPException(status_code=400, detail="Invalid or expired reset token")
    
    if reset_record["expires"] < datetime.utcnow():
        await db.password_resets.delete_one({"token": reset_data.token})
        raise HTTPException(status_code=400, detail="Reset token has expired")
    
    # Update password
    new_hash = hash_password(reset_data.new_password)
    await db.users.update_one(
        {"email": reset_record["email"]},
        {"$set": {"password_hash": new_hash}}
    )
    
    # Delete used token
    await db.password_resets.delete_one({"token": reset_data.token})
    
    return {"message": "Password reset successfully"}

@api_router.post("/auth/admin-reset-password")
async def admin_reset_password(
    reset_data: AdminResetPassword,
    current_user: User = Depends(require_role("admin"))
):
    """Admin resets another user's password"""
    user = await db.users.find_one({"id": reset_data.user_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    new_hash = hash_password(reset_data.new_password)
    await db.users.update_one(
        {"id": reset_data.user_id},
        {"$set": {"password_hash": new_hash}}
    )
    
    return {"message": f"Password reset for user {user['email']}"}

@api_router.get("/auth/users", response_model=List[User])
async def get_all_users(current_user: User = Depends(require_role("admin"))):
    """Get all users (admin only)"""
    users = await db.users.find().to_list(1000)
    return [User(**u) for u in users]

@api_router.delete("/auth/users/{user_id}")
async def delete_user(user_id: str, current_user: User = Depends(require_role("admin"))):
    """Delete a user (admin only)"""
    if user_id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot delete yourself")
    
    result = await db.users.delete_one({"id": user_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    
    return {"message": "User deleted successfully"}

# ============ CMS CONTENT ENDPOINTS ============

@api_router.get("/content/{page_name}")
async def get_page_content(page_name: str):
    """Get all content for a page (public)"""
    content = await db.page_content.find({"page_name": page_name}).to_list(100)
    return {item["section"]: item["content"] for item in content}

@api_router.get("/content")
async def get_all_content():
    """Get all CMS content (public)"""
    content = await db.page_content.find().to_list(500)
    result = {}
    for item in content:
        if item["page_name"] not in result:
            result[item["page_name"]] = {}
        result[item["page_name"]][item["section"]] = item["content"]
    return result

@api_router.put("/content/{page_name}/{section}")
async def update_page_content(
    page_name: str,
    section: str,
    content_data: PageContentUpdate,
    current_user: User = Depends(require_role("admin"))
):
    """Update page content (admin only)"""
    existing = await db.page_content.find_one({
        "page_name": page_name,
        "section": section
    })
    
    if existing:
        await db.page_content.update_one(
            {"page_name": page_name, "section": section},
            {"$set": {
                "content": content_data.content,
                "updated_at": datetime.utcnow(),
                "updated_by": current_user.email
            }}
        )
    else:
        content_obj = PageContent(
            page_name=page_name,
            section=section,
            content=content_data.content,
            updated_by=current_user.email
        )
        await db.page_content.insert_one(content_obj.dict())
    
    return {"message": "Content updated successfully"}

@api_router.post("/content/seed")
async def seed_default_content(current_user: User = Depends(require_role("admin"))):
    """Seed default CMS content (admin only)"""
    default_content = [
        # Home page
        {"page_name": "home", "section": "title", "content": "Veterans Support"},
        {"page_name": "home", "section": "tagline_english", "content": "Once in service, forever united"},
        {"page_name": "home", "section": "tagline_latin", "content": "Semel Servientes, Semper Uniti"},
        {"page_name": "home", "section": "emergency_title", "content": "Immediate Danger?"},
        {"page_name": "home", "section": "emergency_text", "content": "Call 999 for emergency services"},
        {"page_name": "home", "section": "help_button", "content": "I NEED HELP NOW"},
        {"page_name": "home", "section": "help_subtext", "content": "24/7 Crisis Support"},
        {"page_name": "home", "section": "peer_button", "content": "Talk to Another Veteran"},
        {"page_name": "home", "section": "hiat_button", "content": "Issues Related to Historical Investigations"},
        {"page_name": "home", "section": "orgs_button", "content": "Support Organisations"},
        {"page_name": "home", "section": "disclaimer", "content": "This app is not an emergency service. For immediate danger, always call 999."},
        
        # Crisis support page
        {"page_name": "crisis-support", "section": "title", "content": "Crisis Support"},
        {"page_name": "crisis-support", "section": "subtitle", "content": "Help is available 24/7"},
        {"page_name": "crisis-support", "section": "samaritans_name", "content": "Samaritans"},
        {"page_name": "crisis-support", "section": "samaritans_desc", "content": "Free 24/7 support for anyone in distress"},
        {"page_name": "crisis-support", "section": "samaritans_phone", "content": "116 123"},
        {"page_name": "crisis-support", "section": "combat_stress_name", "content": "Combat Stress"},
        {"page_name": "crisis-support", "section": "combat_stress_desc", "content": "UK veteran mental health charity"},
        {"page_name": "crisis-support", "section": "combat_stress_phone", "content": "0800 138 1619"},
        
        # Peer support page
        {"page_name": "peer-support", "section": "title", "content": "Peer Support"},
        {"page_name": "peer-support", "section": "subtitle", "content": "Connect with fellow veterans who understand"},
        {"page_name": "peer-support", "section": "intro", "content": "Sometimes the best support comes from those who have walked the same path."},
        
        # Historical investigations page
        {"page_name": "historical-investigations", "section": "title", "content": "Historical Investigations Support"},
        {"page_name": "historical-investigations", "section": "subtitle", "content": "Support for veterans facing historical investigations"},
        {"page_name": "historical-investigations", "section": "intro", "content": "We understand the stress and anxiety that can come with historical investigations. You are not alone."},
        
        # Organizations page
        {"page_name": "organizations", "section": "title", "content": "Support Organisations"},
        {"page_name": "organizations", "section": "subtitle", "content": "UK veteran support services"},
    ]
    
    for item in default_content:
        existing = await db.page_content.find_one({
            "page_name": item["page_name"],
            "section": item["section"]
        })
        if not existing:
            content_obj = PageContent(**item, updated_by=current_user.email)
            await db.page_content.insert_one(content_obj.dict())
    
    return {"message": "Default content seeded successfully"}

# ============ COUNSELLOR ENDPOINTS ============

@api_router.post("/counsellors", response_model=Counsellor)
async def create_counsellor(
    counsellor_input: CounsellorCreate,
    current_user: User = Depends(require_role("admin"))
):
    """Create a new counsellor (admin only)"""
    counsellor_obj = Counsellor(**counsellor_input.dict())
    await db.counsellors.insert_one(counsellor_obj.dict())
    return counsellor_obj

@api_router.get("/counsellors", response_model=List[Counsellor])
async def get_counsellors():
    """Get all counsellors (public - for mobile app)"""
    counsellors = await db.counsellors.find().to_list(1000)
    return [Counsellor(**c) for c in counsellors]

@api_router.get("/counsellors/available", response_model=List[Counsellor])
async def get_available_counsellors():
    """Get only available counsellors"""
    counsellors = await db.counsellors.find({"status": "available"}).to_list(1000)
    return [Counsellor(**c) for c in counsellors]

@api_router.get("/counsellors/{counsellor_id}", response_model=Counsellor)
async def get_counsellor(counsellor_id: str):
    """Get a specific counsellor"""
    counsellor = await db.counsellors.find_one({"id": counsellor_id})
    if not counsellor:
        raise HTTPException(status_code=404, detail="Counsellor not found")
    return Counsellor(**counsellor)

@api_router.put("/counsellors/{counsellor_id}", response_model=Counsellor)
async def update_counsellor(
    counsellor_id: str,
    counsellor_input: CounsellorCreate,
    current_user: User = Depends(require_role("admin"))
):
    """Update a counsellor (admin only)"""
    result = await db.counsellors.update_one(
        {"id": counsellor_id},
        {"$set": counsellor_input.dict(exclude_unset=True)}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Counsellor not found")
    
    updated = await db.counsellors.find_one({"id": counsellor_id})
    return Counsellor(**updated)

@api_router.patch("/counsellors/{counsellor_id}/status", response_model=Counsellor)
async def update_counsellor_status(
    counsellor_id: str,
    status_update: CounsellorStatusUpdate,
    current_user: User = Depends(get_current_user)
):
    """Update counsellor status (counsellor or admin)"""
    # Check if user is counsellor or admin
    counsellor = await db.counsellors.find_one({"id": counsellor_id})
    if not counsellor:
        raise HTTPException(status_code=404, detail="Counsellor not found")
    
    if current_user.role == "counsellor" and counsellor.get("user_id") != current_user.id:
        raise HTTPException(status_code=403, detail="Can only update your own status")
    
    result = await db.counsellors.update_one(
        {"id": counsellor_id},
        {"$set": status_update.dict(exclude_unset=True)}
    )
    
    updated = await db.counsellors.find_one({"id": counsellor_id})
    return Counsellor(**updated)

@api_router.delete("/counsellors/{counsellor_id}")
async def delete_counsellor(
    counsellor_id: str,
    current_user: User = Depends(require_role("admin"))
):
    """Delete a counsellor (admin only)"""
    result = await db.counsellors.delete_one({"id": counsellor_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Counsellor not found")
    return {"message": "Counsellor deleted successfully"}

# ============ PEER SUPPORTER ENDPOINTS ============

@api_router.post("/peer-supporters", response_model=PeerSupporter)
async def create_peer_supporter(
    peer_input: PeerSupporterCreate,
    current_user: User = Depends(require_role("admin"))
):
    """Create a new peer supporter (admin only)"""
    peer_obj = PeerSupporter(**peer_input.dict())
    await db.peer_supporters.insert_one(peer_obj.dict())
    return peer_obj

@api_router.get("/peer-supporters", response_model=List[PeerSupporter])
async def get_peer_supporters():
    """Get all peer supporters (public - for mobile app)"""
    peers = await db.peer_supporters.find().to_list(1000)
    return [PeerSupporter(**p) for p in peers]

@api_router.get("/peer-supporters/available", response_model=List[PeerSupporter])
async def get_available_peer_supporters():
    """Get only available peer supporters"""
    peers = await db.peer_supporters.find({"status": {"$in": ["available", "limited"]}}).to_list(1000)
    return [PeerSupporter(**p) for p in peers]

@api_router.get("/peer-supporters/{peer_id}", response_model=PeerSupporter)
async def get_peer_supporter(peer_id: str):
    """Get a specific peer supporter"""
    peer = await db.peer_supporters.find_one({"id": peer_id})
    if not peer:
        raise HTTPException(status_code=404, detail="Peer supporter not found")
    return PeerSupporter(**peer)

@api_router.put("/peer-supporters/{peer_id}", response_model=PeerSupporter)
async def update_peer_supporter(
    peer_id: str,
    peer_input: PeerSupporterCreate,
    current_user: User = Depends(require_role("admin"))
):
    """Update a peer supporter (admin only)"""
    result = await db.peer_supporters.update_one(
        {"id": peer_id},
        {"$set": peer_input.dict(exclude_unset=True)}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Peer supporter not found")
    
    updated = await db.peer_supporters.find_one({"id": peer_id})
    return PeerSupporter(**updated)

@api_router.patch("/peer-supporters/{peer_id}/status", response_model=PeerSupporter)
async def update_peer_supporter_status(
    peer_id: str,
    status_update: PeerSupporterStatusUpdate,
    current_user: User = Depends(get_current_user)
):
    """Update peer supporter status (peer or admin)"""
    peer = await db.peer_supporters.find_one({"id": peer_id})
    if not peer:
        raise HTTPException(status_code=404, detail="Peer supporter not found")
    
    if current_user.role == "peer" and peer.get("user_id") != current_user.id:
        raise HTTPException(status_code=403, detail="Can only update your own status")
    
    result = await db.peer_supporters.update_one(
        {"id": peer_id},
        {"$set": status_update.dict(exclude_unset=True)}
    )
    
    updated = await db.peer_supporters.find_one({"id": peer_id})
    return PeerSupporter(**updated)

@api_router.delete("/peer-supporters/{peer_id}")
async def delete_peer_supporter(
    peer_id: str,
    current_user: User = Depends(require_role("admin"))
):
    """Delete a peer supporter (admin only)"""
    result = await db.peer_supporters.delete_one({"id": peer_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Peer supporter not found")
    return {"message": "Peer supporter deleted successfully"}

# ============ ORGANIZATION ENDPOINTS ============

@api_router.post("/organizations", response_model=Organization)
async def create_organization(
    org_input: OrganizationCreate,
    current_user: User = Depends(require_role("admin"))
):
    """Create a new organization (admin only)"""
    org_obj = Organization(**org_input.dict())
    await db.organizations.insert_one(org_obj.dict())
    return org_obj

@api_router.get("/organizations", response_model=List[Organization])
async def get_organizations():
    """Get all organizations (public)"""
    orgs = await db.organizations.find().to_list(1000)
    return [Organization(**o) for o in orgs]

@api_router.get("/organizations/{org_id}", response_model=Organization)
async def get_organization(org_id: str):
    """Get a specific organization"""
    org = await db.organizations.find_one({"id": org_id})
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")
    return Organization(**org)

@api_router.put("/organizations/{org_id}", response_model=Organization)
async def update_organization(
    org_id: str,
    org_input: OrganizationCreate,
    current_user: User = Depends(require_role("admin"))
):
    """Update an organization (admin only)"""
    result = await db.organizations.update_one(
        {"id": org_id},
        {"$set": org_input.dict(exclude_unset=True)}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Organization not found")
    
    updated = await db.organizations.find_one({"id": org_id})
    return Organization(**updated)

@api_router.delete("/organizations/{org_id}")
async def delete_organization(
    org_id: str,
    current_user: User = Depends(require_role("admin"))
):
    """Delete an organization (admin only)"""
    result = await db.organizations.delete_one({"id": org_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Organization not found")
    return {"message": "Organization deleted successfully"}

# ============ PEER SUPPORT REGISTRATION (from app) ============

@api_router.post("/peer-support/register", response_model=PeerSupportRegistration)
async def register_peer_support(input: PeerSupportRegistrationCreate):
    """Register interest for peer support programme (public)"""
    try:
        existing = await db.peer_support_registrations.find_one({"email": input.email})
        if existing:
            raise HTTPException(status_code=400, detail="This email is already registered.")
        
        registration_dict = input.dict()
        registration_obj = PeerSupportRegistration(**registration_dict)
        await db.peer_support_registrations.insert_one(registration_obj.dict())
        
        logging.info(f"Peer support registration: {input.email}")
        return registration_obj
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error registering peer support: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to register. Please try again.")

@api_router.get("/peer-support/registrations", response_model=List[PeerSupportRegistration])
async def get_peer_support_registrations(current_user: User = Depends(require_role("admin"))):
    """Get all peer support registrations (admin only)"""
    try:
        registrations = await db.peer_support_registrations.find().sort("timestamp", -1).to_list(1000)
        return [PeerSupportRegistration(**reg) for reg in registrations]
    except Exception as e:
        logging.error(f"Error retrieving registrations: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to retrieve registrations.")

# ============ SETUP/SEED ENDPOINTS ============

@api_router.api_route("/setup/init", methods=["GET", "POST"])
async def initialize_system():
    """Initialize system with default admin user (GET or POST)"""
    # Check if admin already exists
    existing_admin = await db.users.find_one({"role": "admin"})
    if existing_admin:
        raise HTTPException(status_code=400, detail="System already initialized")
    
    # Create default admin
    admin_user = User(
        email="admin@veteran.dbty.co.uk",
        role="admin",
        name="System Administrator"
    )
    admin_data = admin_user.dict()
    admin_data["password_hash"] = hash_password("ChangeThisPassword123!")
    await db.users.insert_one(admin_data)
    
    return {
        "message": "System initialized successfully",
        "admin_email": "admin@veteran.dbty.co.uk",
        "default_password": "ChangeThisPassword123!",
        "warning": "Please change the default password immediately!"
    }

# ============ ROOT ENDPOINT ============

@api_router.get("/")
async def root():
    return {"message": "UK Veterans Support API - Admin System Active"}

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()

# ============ IMAGE UPLOAD ENDPOINTS ============
import base64
import os

UPLOAD_DIR = "/tmp/uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

class ImageUpload(BaseModel):
    filename: str
    data: str  # Base64 encoded image

@api_router.post("/upload/image")
async def upload_image(
    image: ImageUpload,
    current_user: User = Depends(require_role("admin"))
):
    """Upload an image (admin only)"""
    try:
        # Decode base64 data
        image_data = base64.b64decode(image.data.split(",")[-1] if "," in image.data else image.data)
        
        # Generate unique filename
        import uuid
        ext = os.path.splitext(image.filename)[1] or ".png"
        unique_filename = f"{uuid.uuid4().hex}{ext}"
        filepath = os.path.join(UPLOAD_DIR, unique_filename)
        
        # Save file
        with open(filepath, "wb") as f:
            f.write(image_data)
        
        # Return URL (in production, this would be a CDN URL)
        return {"url": f"/api/uploads/{unique_filename}", "filename": unique_filename}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to upload image: {str(e)}")

@api_router.get("/uploads/{filename}")
async def get_uploaded_image(filename: str):
    """Serve uploaded image"""
    from fastapi.responses import FileResponse
    filepath = os.path.join(UPLOAD_DIR, filename)
    if not os.path.exists(filepath):
        raise HTTPException(status_code=404, detail="Image not found")
    return FileResponse(filepath)
