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
from openai import OpenAI

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# JWT Configuration
SECRET_KEY = os.getenv("JWT_SECRET_KEY", "your-secret-key-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 24 hours

# Emergent LLM Key for Smudge AI
EMERGENT_LLM_KEY = os.getenv("EMERGENT_LLM_KEY", "")

# Smudge Kill Switch - set SMUDGE_DISABLED=true in env to disable
SMUDGE_DISABLED = os.getenv("SMUDGE_DISABLED", "false").lower() == "true"

# Smudge AI System Prompt
SMUDGE_SYSTEM_PROMPT = """
You are Smudge, an AI listener used within a veteran support app.

You are not human. You do not claim lived experience, service history, or emotions.
You do not provide therapy, counselling, diagnosis, medical, or legal advice.

Your role is to listen, reflect feelings, and gently encourage connection with real people.

You must:
- Use calm, plain, respectful language suitable for UK Armed Forces veterans
- Reflect emotions without validating harm
- Encourage peer or professional human support regularly
- Escalate immediately if suicide, self-harm, or hopelessness appears

You must never:
- Give advice or coping strategies
- Diagnose conditions
- Replace human support
- Debate escalation during risk

If risk appears, clearly state that this is beyond what you can safely hold and encourage immediate human contact.
"""

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

# Call Intent Logging Models
class CallIntentCreate(BaseModel):
    contact_type: str  # counsellor, peer, organization, crisis_line
    contact_id: Optional[str] = None  # ID of the specific contact if applicable
    contact_name: str
    contact_phone: str
    call_method: str = "phone"  # phone, sms, whatsapp

class CallIntent(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    contact_type: str
    contact_id: Optional[str] = None
    contact_name: str
    contact_phone: str
    call_method: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    # Anonymous - no user tracking for privacy

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

# Resource Library Models
class ResourceCreate(BaseModel):
    title: str
    description: Optional[str] = None
    category: str = "General"
    content: Optional[str] = None  # Rich text content
    link: Optional[str] = None  # External link
    image_url: Optional[str] = None
    image_data: Optional[str] = None  # Base64 encoded image

# Callback Request Models
class CallbackRequestCreate(BaseModel):
    name: str
    phone: str
    email: Optional[str] = None
    message: str
    request_type: str = Field(..., pattern="^(counsellor|peer)$")  # counsellor or peer

class CallbackRequest(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    phone: str
    email: Optional[str] = None
    message: str
    request_type: str  # counsellor or peer
    status: str = "pending"  # pending, in_progress, completed, released
    assigned_to: Optional[str] = None  # ID of counsellor/peer who took control
    assigned_name: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class CallbackStatusUpdate(BaseModel):
    status: str = Field(..., pattern="^(pending|in_progress|completed|released)$")

# Panic Alert Models
class PanicAlertCreate(BaseModel):
    user_name: Optional[str] = None
    user_phone: Optional[str] = None
    location: Optional[str] = None
    message: Optional[str] = None

class PanicAlert(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_name: Optional[str] = None
    user_phone: Optional[str] = None
    location: Optional[str] = None
    message: Optional[str] = None
    status: str = "active"  # active, acknowledged, resolved
    acknowledged_by: Optional[str] = None
    acknowledged_at: Optional[datetime] = None
    resolved_by: Optional[str] = None
    resolved_at: Optional[datetime] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

class Resource(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    description: Optional[str] = None
    category: str = "General"
    content: Optional[str] = None
    link: Optional[str] = None
    image_url: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class ResourceUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    content: Optional[str] = None
    link: Optional[str] = None
    image_url: Optional[str] = None
    image_data: Optional[str] = None  # Base64 encoded image for updates

# Staff Notes Models
class NoteCreate(BaseModel):
    title: str
    content: str
    is_private: bool = True  # True = personal, False = can be shared
    shared_with: Optional[List[str]] = None  # List of user IDs to share with
    callback_id: Optional[str] = None  # Optional link to a callback

class Note(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    content: str
    is_private: bool = True
    shared_with: List[str] = Field(default_factory=list)
    callback_id: Optional[str] = None
    author_id: str
    author_name: str
    author_role: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class NoteUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    is_private: Optional[bool] = None
    shared_with: Optional[List[str]] = None

# Smudge AI Chat Models
class SmudgeChatRequest(BaseModel):
    message: str
    sessionId: str

class SmudgeChatResponse(BaseModel):
    reply: str
    sessionId: str

# In-memory rate limiting and conversation history for Smudge
smudge_sessions: Dict[str, Dict[str, Any]] = {}
SMUDGE_MAX_MESSAGES = 30
SMUDGE_SESSION_TIMEOUT_MINUTES = 60

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

@api_router.post("/organizations/seed")
async def seed_organizations(current_user: User = Depends(require_role("admin"))):
    """Seed default UK veteran support organizations (admin only)"""
    default_organizations = [
        {
            "name": "Combat Stress",
            "description": "Leading charity for veterans mental health. Offers support for trauma, anxiety, depression and more.",
            "phone": "0800 138 1619",
            "sms": None,
            "whatsapp": None,
        },
        {
            "name": "Samaritans",
            "description": "Free 24/7 listening service for anyone who needs to talk. Confidential and non-judgmental support.",
            "phone": "116 123",
            "sms": None,
            "whatsapp": None,
        },
        {
            "name": "Veterans UK",
            "description": "Government support service offering advice on benefits, compensation, and welfare for veterans.",
            "phone": "0808 1914 218",
            "sms": None,
            "whatsapp": None,
        },
        {
            "name": "CALM",
            "description": "Campaign Against Living Miserably. Support for men experiencing difficult times, including veterans.",
            "phone": "0800 58 58 58",
            "sms": None,
            "whatsapp": None,
        },
        {
            "name": "SSAFA",
            "description": "Lifelong support for serving personnel, veterans, and their families. Practical and emotional support.",
            "phone": "0800 731 4880",
            "sms": None,
            "whatsapp": None,
        },
        {
            "name": "Help for Heroes",
            "description": "Recovery and support for wounded, injured and sick veterans. Physical and mental health services.",
            "phone": "0800 058 2121",
            "sms": None,
            "whatsapp": None,
        },
        {
            "name": "Royal British Legion",
            "description": "Welfare support, guidance and advice for serving and ex-serving personnel and their families.",
            "phone": "0808 802 8080",
            "sms": None,
            "whatsapp": None,
        },
        {
            "name": "NHS Urgent Mental Health Helpline",
            "description": "Call 111 and select option 2 for urgent mental health support 24/7.",
            "phone": "111",
            "sms": None,
            "whatsapp": None,
        },
    ]
    
    added_count = 0
    for org_data in default_organizations:
        existing = await db.organizations.find_one({"name": org_data["name"]})
        if not existing:
            org_obj = Organization(**org_data)
            await db.organizations.insert_one(org_obj.dict())
            added_count += 1
    
    return {"message": f"Organizations seeded successfully. Added {added_count} new organizations."}

# ============ RESOURCES LIBRARY ============

@api_router.get("/resources")
async def get_resources():
    """Get all resources (public)"""
    resources = await db.resources.find({}, {"_id": 0}).sort("created_at", -1).to_list(1000)
    return resources

@api_router.post("/resources", response_model=Resource)
async def create_resource(
    resource_input: ResourceCreate,
    current_user: User = Depends(require_role("admin"))
):
    """Create a new resource (admin only)"""
    import base64
    
    image_url = resource_input.image_url
    
    # Handle base64 image upload - store in database as data URL
    if resource_input.image_data:
        # Keep the base64 data as a data URL for simplicity
        # In production, you'd upload to S3/CloudStorage
        if not resource_input.image_data.startswith('data:'):
            image_url = f"data:image/png;base64,{resource_input.image_data}"
        else:
            image_url = resource_input.image_data
    
    resource = Resource(
        title=resource_input.title,
        description=resource_input.description,
        category=resource_input.category,
        content=resource_input.content,
        link=resource_input.link,
        image_url=image_url
    )
    
    await db.resources.insert_one(resource.dict())
    return resource

@api_router.put("/resources/{resource_id}")
async def update_resource(
    resource_id: str,
    resource_input: ResourceUpdate,
    current_user: User = Depends(require_role("admin"))
):
    """Update a resource (admin only)"""
    existing = await db.resources.find_one({"id": resource_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Resource not found")
    
    update_data = {k: v for k, v in resource_input.dict().items() if v is not None and k != 'image_data'}
    
    # Handle base64 image upload
    if resource_input.image_data:
        if not resource_input.image_data.startswith('data:'):
            update_data['image_url'] = f"data:image/png;base64,{resource_input.image_data}"
        else:
            update_data['image_url'] = resource_input.image_data
    
    update_data['updated_at'] = datetime.utcnow()
    
    await db.resources.update_one({"id": resource_id}, {"$set": update_data})
    
    updated = await db.resources.find_one({"id": resource_id}, {"_id": 0})
    return updated

@api_router.delete("/resources/{resource_id}")
async def delete_resource(
    resource_id: str,
    current_user: User = Depends(require_role("admin"))
):
    """Delete a resource (admin only)"""
    result = await db.resources.delete_one({"id": resource_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Resource not found")
    return {"message": "Resource deleted successfully"}

@api_router.post("/resources/seed")
async def seed_resources(current_user: User = Depends(require_role("admin"))):
    """Seed default resources for veterans (admin only)"""
    default_resources = [
        {
            "title": "Understanding PTSD",
            "description": "A comprehensive guide to understanding Post-Traumatic Stress Disorder, its symptoms, and coping strategies.",
            "category": "Mental Health",
            "content": "PTSD is a mental health condition triggered by experiencing or witnessing a terrifying event. Symptoms may include flashbacks, nightmares, severe anxiety, and uncontrollable thoughts about the event.",
            "link": "https://www.nhs.uk/mental-health/conditions/post-traumatic-stress-disorder-ptsd/",
        },
        {
            "title": "Transition to Civilian Life",
            "description": "Tips and resources for veterans transitioning from military to civilian employment.",
            "category": "Career & Employment",
            "content": "Transitioning from military to civilian life can be challenging. This resource provides guidance on translating military skills to civilian job requirements.",
            "link": "https://www.gov.uk/guidance/support-for-veterans",
        },
        {
            "title": "Veterans Benefits Guide",
            "description": "Complete guide to benefits and support available for UK veterans.",
            "category": "Benefits & Support",
            "content": "UK veterans have access to various benefits including healthcare, housing assistance, and financial support. Learn about what you're entitled to.",
            "link": "https://www.gov.uk/government/collections/armed-forces-and-veterans-welfare-services",
        },
        {
            "title": "Family Support Resources",
            "description": "Resources for families of veterans dealing with challenges.",
            "category": "Family Support",
            "content": "Supporting a veteran can be challenging. These resources help families understand and cope with the unique challenges they may face.",
            "link": "https://www.ssafa.org.uk/",
        },
        {
            "title": "Sleep Hygiene for Veterans",
            "description": "Practical tips for improving sleep quality, a common challenge for veterans.",
            "category": "Wellness",
            "content": "Good sleep is essential for mental and physical health. Learn evidence-based techniques to improve your sleep.",
        },
        {
            "title": "Mindfulness & Meditation",
            "description": "Introduction to mindfulness techniques that can help manage stress and anxiety.",
            "category": "Wellness",
            "content": "Mindfulness meditation has been shown to help reduce symptoms of anxiety and depression. Start with just 5 minutes a day.",
        },
        {
            "title": "Emergency Contacts",
            "description": "Important phone numbers and contacts for crisis situations.",
            "category": "Crisis Support",
            "content": "Samaritans: 116 123 (24/7)\\nCombat Stress: 0800 138 1619\\nVeterans UK: 0808 1914 218\\nNHS Mental Health: 111 (option 2)",
        },
        {
            "title": "Physical Health & Fitness",
            "description": "Maintaining physical fitness after military service.",
            "category": "Wellness",
            "content": "Regular physical activity is important for both mental and physical health. Find exercise routines suitable for your fitness level.",
        },
    ]
    
    added_count = 0
    for resource_data in default_resources:
        existing = await db.resources.find_one({"title": resource_data["title"]})
        if not existing:
            resource_obj = Resource(**resource_data)
            await db.resources.insert_one(resource_obj.dict())
            added_count += 1
    
    return {"message": f"Resources seeded successfully. Added {added_count} new resources."}

# ============ SITE SETTINGS ============

class SiteSettings(BaseModel):
    logo_url: Optional[str] = None
    site_name: Optional[str] = "Veterans Support"
    peer_registration_notification_email: Optional[str] = None  # Email to notify when someone registers for peer support

@api_router.get("/settings")
async def get_settings():
    """Get site settings (public)"""
    settings = await db.settings.find_one({"_id": "site_settings"}, {"_id": 0})
    return settings or {
        "logo_url": None, 
        "site_name": "Veterans Support",
        "peer_registration_notification_email": None
    }

@api_router.put("/settings")
async def update_settings(
    settings: SiteSettings,
    current_user: User = Depends(require_role("admin"))
):
    """Update site settings (admin only)"""
    update_data = {k: v for k, v in settings.dict().items() if v is not None}
    
    await db.settings.update_one(
        {"_id": "site_settings"},
        {"$set": update_data},
        upsert=True
    )
    
    return {"message": "Settings updated successfully"}

# ============ CALLBACK REQUEST ENDPOINTS ============

async def send_callback_confirmation_email(email: str, name: str, request_type: str):
    """Send confirmation email to user who requested callback"""
    if not RESEND_API_KEY:
        logging.warning("Resend API key not configured, skipping email")
        return False
    
    try:
        type_label = "Counsellor" if request_type == "counsellor" else "Peer Supporter"
        
        html_content = f"""
        <html>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #1a2332;">Callback Request Received</h2>
            <p>Dear {name},</p>
            <p>Thank you for reaching out. We have received your callback request for a <strong>{type_label}</strong>.</p>
            <p>One of our team members will contact you as soon as possible. If you're in immediate crisis, please call:</p>
            <ul>
                <li><strong>Samaritans:</strong> 116 123 (24/7, free)</li>
                <li><strong>Combat Stress:</strong> 0800 138 1619</li>
                <li><strong>Emergency:</strong> 999</li>
            </ul>
            <p>You matter, and help is on the way.</p>
            <br>
            <p style="color: #1a2332;">Veterans Support Team</p>
        </body>
        </html>
        """
        
        params = {
            "from": SENDER_EMAIL,
            "to": [email],
            "subject": f"Callback Request Received - Veterans Support",
            "html": html_content
        }
        
        result = await asyncio.to_thread(resend.Emails.send, params)
        logging.info(f"Callback confirmation email sent to {email}, ID: {result.get('id')}")
        return True
    except Exception as e:
        logging.error(f"Failed to send callback confirmation email: {str(e)}")
        return False

async def send_callback_notification_to_staff(callback: dict, staff_type: str):
    """Send notification to relevant staff about new callback request"""
    if not RESEND_API_KEY:
        logging.warning("Resend API key not configured, skipping staff notification")
        return False
    
    try:
        # Get all staff of the relevant type
        if staff_type == "counsellor":
            staff_users = await db.users.find({"role": "counsellor"}).to_list(100)
        else:
            staff_users = await db.users.find({"role": "peer"}).to_list(100)
        
        if not staff_users:
            logging.warning(f"No {staff_type} users found to notify")
            return False
        
        staff_emails = [u["email"] for u in staff_users]
        type_label = "Counsellor" if staff_type == "counsellor" else "Peer Supporter"
        
        html_content = f"""
        <html>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #cc0000;">New Callback Request</h2>
            <p>A veteran has requested a callback from a <strong>{type_label}</strong>.</p>
            <div style="background-color: #f5f5f5; padding: 16px; border-radius: 8px; margin: 20px 0;">
                <p><strong>Name:</strong> {callback['name']}</p>
                <p><strong>Phone:</strong> {callback['phone']}</p>
                <p><strong>Email:</strong> {callback.get('email', 'Not provided')}</p>
                <p><strong>Message:</strong> {callback['message']}</p>
                <p><strong>Time:</strong> {callback['created_at'].strftime('%Y-%m-%d %H:%M')}</p>
            </div>
            <p>Please log into the portal to take control of this request.</p>
            <br>
            <p style="color: #1a2332;">Veterans Support System</p>
        </body>
        </html>
        """
        
        params = {
            "from": SENDER_EMAIL,
            "to": staff_emails,
            "subject": f"[ACTION REQUIRED] New Callback Request - Veterans Support",
            "html": html_content
        }
        
        result = await asyncio.to_thread(resend.Emails.send, params)
        logging.info(f"Callback notification sent to {len(staff_emails)} {staff_type}(s), ID: {result.get('id')}")
        return True
    except Exception as e:
        logging.error(f"Failed to send staff notification: {str(e)}")
        return False

@api_router.post("/callbacks")
async def create_callback_request(callback_input: CallbackRequestCreate):
    """Create a new callback request (public)"""
    try:
        callback = CallbackRequest(**callback_input.dict())
        await db.callback_requests.insert_one(callback.dict())
        
        # Send confirmation email if email provided
        if callback_input.email:
            await send_callback_confirmation_email(
                callback_input.email, 
                callback_input.name, 
                callback_input.request_type
            )
        
        # Notify relevant staff
        await send_callback_notification_to_staff(callback.dict(), callback_input.request_type)
        
        logging.info(f"Callback request created: {callback.id} - {callback_input.request_type}")
        return {"message": "Callback request submitted successfully", "id": callback.id}
    except Exception as e:
        logging.error(f"Error creating callback request: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to submit callback request")

@api_router.get("/callbacks")
async def get_callback_requests(
    current_user: User = Depends(get_current_user),
    status: Optional[str] = None,
    request_type: Optional[str] = None
):
    """Get callback requests (staff only, filtered by their role)"""
    try:
        query = {}
        
        # Filter by type based on user role (unless admin)
        if current_user.role == "counsellor":
            query["request_type"] = "counsellor"
        elif current_user.role == "peer":
            query["request_type"] = "peer"
        # Admin sees all
        
        if status:
            query["status"] = status
        if request_type and current_user.role == "admin":
            query["request_type"] = request_type
        
        callbacks = await db.callback_requests.find(query, {"_id": 0}).sort("created_at", -1).to_list(500)
        return callbacks
    except Exception as e:
        logging.error(f"Error fetching callback requests: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch callback requests")

@api_router.patch("/callbacks/{callback_id}/take")
async def take_callback_control(
    callback_id: str,
    current_user: User = Depends(get_current_user)
):
    """Take control of a callback request"""
    try:
        callback = await db.callback_requests.find_one({"id": callback_id})
        if not callback:
            raise HTTPException(status_code=404, detail="Callback request not found")
        
        # Check if already assigned
        if callback.get("status") == "in_progress":
            raise HTTPException(status_code=400, detail="This callback is already being handled")
        
        # Check user has right role for this callback type
        if current_user.role != "admin":
            if callback["request_type"] == "counsellor" and current_user.role != "counsellor":
                raise HTTPException(status_code=403, detail="Only counsellors can handle counsellor callbacks")
            if callback["request_type"] == "peer" and current_user.role != "peer":
                raise HTTPException(status_code=403, detail="Only peers can handle peer callbacks")
        
        await db.callback_requests.update_one(
            {"id": callback_id},
            {"$set": {
                "status": "in_progress",
                "assigned_to": current_user.id,
                "assigned_name": current_user.name,
                "updated_at": datetime.utcnow()
            }}
        )
        
        return {"message": f"Callback assigned to {current_user.name}"}
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error taking callback control: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to take control")

@api_router.patch("/callbacks/{callback_id}/release")
async def release_callback(
    callback_id: str,
    current_user: User = Depends(get_current_user)
):
    """Release a callback request back to pool"""
    try:
        callback = await db.callback_requests.find_one({"id": callback_id})
        if not callback:
            raise HTTPException(status_code=404, detail="Callback request not found")
        
        # Only assigned user or admin can release
        if current_user.role != "admin" and callback.get("assigned_to") != current_user.id:
            raise HTTPException(status_code=403, detail="You can only release callbacks assigned to you")
        
        await db.callback_requests.update_one(
            {"id": callback_id},
            {"$set": {
                "status": "pending",
                "assigned_to": None,
                "assigned_name": None,
                "updated_at": datetime.utcnow()
            }}
        )
        
        return {"message": "Callback released back to pool"}
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error releasing callback: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to release callback")

@api_router.patch("/callbacks/{callback_id}/complete")
async def complete_callback(
    callback_id: str,
    current_user: User = Depends(get_current_user)
):
    """Mark a callback as completed"""
    try:
        callback = await db.callback_requests.find_one({"id": callback_id})
        if not callback:
            raise HTTPException(status_code=404, detail="Callback request not found")
        
        # Only assigned user or admin can complete
        if current_user.role != "admin" and callback.get("assigned_to") != current_user.id:
            raise HTTPException(status_code=403, detail="You can only complete callbacks assigned to you")
        
        await db.callback_requests.update_one(
            {"id": callback_id},
            {"$set": {
                "status": "completed",
                "updated_at": datetime.utcnow()
            }}
        )
        
        return {"message": "Callback marked as completed"}
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error completing callback: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to complete callback")

# ============ PANIC ALERT ENDPOINTS ============

async def send_panic_alert_to_counsellors(alert: dict):
    """Send urgent notification to all counsellors about panic alert"""
    if not RESEND_API_KEY:
        logging.warning("Resend API key not configured, skipping panic alert email")
        return False
    
    try:
        # Get all counsellors AND admins for urgent alerts
        staff_users = await db.users.find({"role": {"$in": ["counsellor", "admin"]}}).to_list(100)
        
        if not staff_users:
            logging.error("No counsellors or admins found to notify about panic alert!")
            return False
        
        staff_emails = [u["email"] for u in staff_users]
        
        html_content = f"""
        <html>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #fff5f5;">
            <h2 style="color: #cc0000;">🚨 URGENT: Panic Alert Triggered</h2>
            <p style="font-size: 18px; color: #cc0000;">A veteran has pressed the panic button and needs immediate assistance.</p>
            <div style="background-color: #ffffff; padding: 20px; border-radius: 8px; margin: 20px 0; border: 2px solid #cc0000;">
                <p><strong>Name:</strong> {alert.get('user_name', 'Anonymous')}</p>
                <p><strong>Phone:</strong> {alert.get('user_phone', 'Not provided')}</p>
                <p><strong>Location:</strong> {alert.get('location', 'Not provided')}</p>
                <p><strong>Message:</strong> {alert.get('message', 'No message')}</p>
                <p><strong>Time:</strong> {alert['created_at'].strftime('%Y-%m-%d %H:%M:%S')}</p>
            </div>
            <p style="font-size: 16px;"><strong>Please take immediate action.</strong></p>
            <p>Log into the portal to acknowledge this alert.</p>
            <br>
            <p style="color: #1a2332;">Veterans Support Emergency System</p>
        </body>
        </html>
        """
        
        params = {
            "from": SENDER_EMAIL,
            "to": staff_emails,
            "subject": f"🚨 URGENT: Panic Alert - Immediate Assistance Required",
            "html": html_content
        }
        
        result = await asyncio.to_thread(resend.Emails.send, params)
        logging.info(f"Panic alert sent to {len(staff_emails)} counsellors/admins, ID: {result.get('id')}")
        return True
    except Exception as e:
        logging.error(f"Failed to send panic alert email: {str(e)}")
        return False

@api_router.post("/panic-alert")
async def create_panic_alert(alert_input: PanicAlertCreate):
    """Create a panic alert (public - for users in crisis)"""
    try:
        alert = PanicAlert(**alert_input.dict())
        await db.panic_alerts.insert_one(alert.dict())
        
        # Send urgent notification to counsellors
        await send_panic_alert_to_counsellors(alert.dict())
        
        logging.warning(f"PANIC ALERT CREATED: {alert.id}")
        
        return {
            "message": "Alert sent. Help is on the way. If you're in immediate danger, call 999.",
            "id": alert.id,
            "crisis_numbers": {
                "emergency": "999",
                "samaritans": "116 123",
                "combat_stress": "0800 138 1619"
            }
        }
    except Exception as e:
        logging.error(f"Error creating panic alert: {str(e)}")
        raise HTTPException(status_code=500, detail="Alert system error. Please call 999 or 116 123.")

@api_router.get("/panic-alerts")
async def get_panic_alerts(
    current_user: User = Depends(get_current_user),
    status: Optional[str] = None
):
    """Get panic alerts (counsellors and admins only)"""
    if current_user.role not in ["admin", "counsellor"]:
        raise HTTPException(status_code=403, detail="Only counsellors and admins can view panic alerts")
    
    try:
        query = {}
        if status:
            query["status"] = status
        
        alerts = await db.panic_alerts.find(query, {"_id": 0}).sort("created_at", -1).to_list(500)
        return alerts
    except Exception as e:
        logging.error(f"Error fetching panic alerts: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch panic alerts")

@api_router.patch("/panic-alerts/{alert_id}/acknowledge")
async def acknowledge_panic_alert(
    alert_id: str,
    current_user: User = Depends(get_current_user)
):
    """Acknowledge a panic alert"""
    if current_user.role not in ["admin", "counsellor"]:
        raise HTTPException(status_code=403, detail="Only counsellors and admins can acknowledge alerts")
    
    try:
        alert = await db.panic_alerts.find_one({"id": alert_id})
        if not alert:
            raise HTTPException(status_code=404, detail="Alert not found")
        
        await db.panic_alerts.update_one(
            {"id": alert_id},
            {"$set": {
                "status": "acknowledged",
                "acknowledged_by": current_user.name,
                "acknowledged_at": datetime.utcnow()
            }}
        )
        
        return {"message": f"Alert acknowledged by {current_user.name}"}
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error acknowledging alert: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to acknowledge alert")

@api_router.patch("/panic-alerts/{alert_id}/resolve")
async def resolve_panic_alert(
    alert_id: str,
    current_user: User = Depends(get_current_user)
):
    """Resolve a panic alert"""
    if current_user.role not in ["admin", "counsellor"]:
        raise HTTPException(status_code=403, detail="Only counsellors and admins can resolve alerts")
    
    try:
        await db.panic_alerts.update_one(
            {"id": alert_id},
            {"$set": {
                "status": "resolved",
                "resolved_by": current_user.name,
                "resolved_at": datetime.utcnow()
            }}
        )
        
        return {"message": f"Alert resolved by {current_user.name}"}
    except Exception as e:
        logging.error(f"Error resolving alert: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to resolve alert")

# ============ STAFF NOTES ENDPOINTS ============

@api_router.post("/notes")
async def create_note(
    note_input: NoteCreate,
    current_user: User = Depends(get_current_user)
):
    """Create a new note (staff only)"""
    if current_user.role not in ["admin", "counsellor", "peer"]:
        raise HTTPException(status_code=403, detail="Only staff can create notes")
    
    try:
        note = Note(
            title=note_input.title,
            content=note_input.content,
            is_private=note_input.is_private,
            shared_with=note_input.shared_with or [],
            callback_id=note_input.callback_id,
            author_id=current_user.id,
            author_name=current_user.name,
            author_role=current_user.role
        )
        
        await db.notes.insert_one(note.dict())
        return note.dict()
    except Exception as e:
        logging.error(f"Error creating note: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to create note")

@api_router.get("/notes")
async def get_notes(
    current_user: User = Depends(get_current_user),
    callback_id: Optional[str] = None,
    include_shared: bool = True
):
    """Get notes - own notes + notes shared with me (admins see all)"""
    if current_user.role not in ["admin", "counsellor", "peer"]:
        raise HTTPException(status_code=403, detail="Only staff can view notes")
    
    try:
        if current_user.role == "admin":
            # Admins can see all notes
            query = {}
        else:
            # Staff see their own notes + notes shared with them
            if include_shared:
                query = {
                    "$or": [
                        {"author_id": current_user.id},
                        {"shared_with": current_user.id},
                        {"is_private": False, "shared_with": []}  # Public notes
                    ]
                }
            else:
                query = {"author_id": current_user.id}
        
        # Filter by callback if specified
        if callback_id:
            query["callback_id"] = callback_id
        
        notes = await db.notes.find(query, {"_id": 0}).sort("created_at", -1).to_list(500)
        return notes
    except Exception as e:
        logging.error(f"Error fetching notes: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch notes")

@api_router.get("/notes/{note_id}")
async def get_note(
    note_id: str,
    current_user: User = Depends(get_current_user)
):
    """Get a specific note"""
    if current_user.role not in ["admin", "counsellor", "peer"]:
        raise HTTPException(status_code=403, detail="Only staff can view notes")
    
    try:
        note = await db.notes.find_one({"id": note_id}, {"_id": 0})
        if not note:
            raise HTTPException(status_code=404, detail="Note not found")
        
        # Check access
        if current_user.role != "admin":
            if note["author_id"] != current_user.id and current_user.id not in note.get("shared_with", []):
                if note.get("is_private", True):
                    raise HTTPException(status_code=403, detail="Access denied")
        
        return note
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error fetching note: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch note")

@api_router.patch("/notes/{note_id}")
async def update_note(
    note_id: str,
    note_update: NoteUpdate,
    current_user: User = Depends(get_current_user)
):
    """Update a note (author or admin only)"""
    try:
        note = await db.notes.find_one({"id": note_id})
        if not note:
            raise HTTPException(status_code=404, detail="Note not found")
        
        # Only author or admin can update
        if note["author_id"] != current_user.id and current_user.role != "admin":
            raise HTTPException(status_code=403, detail="Only the author or admin can update this note")
        
        update_data = note_update.dict(exclude_unset=True)
        update_data["updated_at"] = datetime.utcnow()
        
        await db.notes.update_one({"id": note_id}, {"$set": update_data})
        
        updated_note = await db.notes.find_one({"id": note_id}, {"_id": 0})
        return updated_note
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error updating note: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to update note")

@api_router.delete("/notes/{note_id}")
async def delete_note(
    note_id: str,
    current_user: User = Depends(get_current_user)
):
    """Delete a note (author or admin only)"""
    try:
        note = await db.notes.find_one({"id": note_id})
        if not note:
            raise HTTPException(status_code=404, detail="Note not found")
        
        # Only author or admin can delete
        if note["author_id"] != current_user.id and current_user.role != "admin":
            raise HTTPException(status_code=403, detail="Only the author or admin can delete this note")
        
        await db.notes.delete_one({"id": note_id})
        return {"message": "Note deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error deleting note: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to delete note")

@api_router.get("/staff-users")
async def get_staff_users(
    current_user: User = Depends(get_current_user)
):
    """Get list of staff users for sharing notes"""
    if current_user.role not in ["admin", "counsellor", "peer"]:
        raise HTTPException(status_code=403, detail="Only staff can view staff list")
    
    try:
        # Get all staff users (for note sharing dropdown)
        staff = await db.users.find(
            {"role": {"$in": ["admin", "counsellor", "peer"]}},
            {"_id": 0, "id": 1, "name": 1, "role": 1}
        ).to_list(100)
        return staff
    except Exception as e:
        logging.error(f"Error fetching staff users: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch staff users")

# ============ SMUDGE AI CHAT ENDPOINTS ============

def get_or_create_session(session_id: str) -> Dict[str, Any]:
    """Get or create a Smudge chat session"""
    now = datetime.utcnow()
    
    # Clean up old sessions
    expired = []
    for sid, session in smudge_sessions.items():
        if (now - session["last_active"]).total_seconds() > SMUDGE_SESSION_TIMEOUT_MINUTES * 60:
            expired.append(sid)
    for sid in expired:
        del smudge_sessions[sid]
    
    # Get or create session
    if session_id not in smudge_sessions:
        smudge_sessions[session_id] = {
            "message_count": 0,
            "history": [],  # Store conversation history
            "last_active": now,
            "created_at": now
        }
    
    smudge_sessions[session_id]["last_active"] = now
    return smudge_sessions[session_id]

# Initialize OpenAI client for Smudge (using Emergent LLM Key)
def get_openai_client():
    if EMERGENT_LLM_KEY:
        # Emergent key works directly with OpenAI API
        return OpenAI(api_key=EMERGENT_LLM_KEY)
    return None

smudge_openai_client = get_openai_client()

@api_router.post("/smudge/chat", response_model=SmudgeChatResponse)
async def smudge_chat(request: SmudgeChatRequest):
    """Chat with Smudge AI listener - no authentication required"""
    
    # Kill switch check
    if SMUDGE_DISABLED:
        return SmudgeChatResponse(
            reply="Smudge is offline right now. A real person is available and ready to talk. Please use the buttons below to connect with a peer or counsellor.",
            sessionId=request.sessionId
        )
    
    if not smudge_openai_client:
        raise HTTPException(status_code=503, detail="Smudge is currently unavailable")
    
    if not request.message or not request.sessionId:
        raise HTTPException(status_code=400, detail="Invalid request")
    
    try:
        session = get_or_create_session(request.sessionId)
        session["message_count"] += 1
        
        # Rate limit check
        if session["message_count"] > SMUDGE_MAX_MESSAGES:
            return SmudgeChatResponse(
                reply="Let's pause here for now. If you want to talk more, a real person is available and I can help connect you. You can use the 'Talk to a real person' button below.",
                sessionId=request.sessionId
            )
        
        # Build messages with history
        messages = [{"role": "system", "content": SMUDGE_SYSTEM_PROMPT}]
        
        # Add conversation history (last 20 messages for context)
        for msg in session["history"][-20:]:
            messages.append(msg)
        
        # Add current user message
        messages.append({"role": "user", "content": request.message})
        
        # Call OpenAI via Emergent proxy
        completion = smudge_openai_client.chat.completions.create(
            model="gpt-4o-mini",
            messages=messages,
            max_tokens=200,
            temperature=0.4
        )
        
        reply = completion.choices[0].message.content or ""
        
        # Store in history
        session["history"].append({"role": "user", "content": request.message})
        session["history"].append({"role": "assistant", "content": reply})
        
        return SmudgeChatResponse(
            reply=reply,
            sessionId=request.sessionId
        )
        
    except Exception as e:
        logging.error(f"Smudge chat error: {str(e)}")
        raise HTTPException(
            status_code=500, 
            detail="Smudge is having trouble right now. If you need support, please use the 'Talk to a real person' button."
        )

@api_router.post("/smudge/reset")
async def reset_smudge_session(request: SmudgeChatRequest):
    """Reset a Smudge session"""
    if request.sessionId in smudge_sessions:
        del smudge_sessions[request.sessionId]
    return {"message": "Session reset", "sessionId": request.sessionId}

# ============ ADMIN STATUS MANAGEMENT ============

@api_router.patch("/admin/counsellors/{counsellor_id}/status")
async def admin_update_counsellor_status(
    counsellor_id: str,
    status_update: CounsellorStatusUpdate,
    current_user: User = Depends(require_role("admin"))
):
    """Admin can update any counsellor's status"""
    counsellor = await db.counsellors.find_one({"id": counsellor_id})
    if not counsellor:
        raise HTTPException(status_code=404, detail="Counsellor not found")
    
    await db.counsellors.update_one(
        {"id": counsellor_id},
        {"$set": status_update.dict(exclude_unset=True)}
    )
    
    updated = await db.counsellors.find_one({"id": counsellor_id}, {"_id": 0})
    return updated

@api_router.patch("/admin/peer-supporters/{peer_id}/status")
async def admin_update_peer_status(
    peer_id: str,
    status_update: PeerSupporterStatusUpdate,
    current_user: User = Depends(require_role("admin"))
):
    """Admin can update any peer supporter's status"""
    peer = await db.peer_supporters.find_one({"id": peer_id})
    if not peer:
        raise HTTPException(status_code=404, detail="Peer supporter not found")
    
    await db.peer_supporters.update_one(
        {"id": peer_id},
        {"$set": status_update.dict(exclude_unset=True)}
    )
    
    updated = await db.peer_supporters.find_one({"id": peer_id}, {"_id": 0})
    return updated

# ============ PEER SUPPORT REGISTRATION (from app) ============

async def send_peer_registration_notification(email: str, registration_time: datetime):
    """Send notification to admin when someone registers for peer support"""
    try:
        # Get notification email from settings
        settings = await db.settings.find_one({"_id": "site_settings"})
        notification_email = settings.get("peer_registration_notification_email") if settings else None
        
        # If no notification email configured, try to notify admins
        if not notification_email:
            admin_users = await db.users.find({"role": "admin"}).to_list(10)
            if admin_users:
                notification_email = admin_users[0].get("email")
        
        if not notification_email:
            logging.warning("No notification email configured for peer registration")
            return False
        
        if not RESEND_API_KEY:
            logging.warning("Resend API key not configured, skipping peer registration notification")
            return False
        
        html_content = f"""
        <html>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #1a2332;">New Peer Support Registration</h2>
            <p>Someone has expressed interest in becoming a peer supporter.</p>
            <div style="background-color: #f5f5f5; padding: 16px; border-radius: 8px; margin: 20px 0;">
                <p><strong>Email:</strong> {email}</p>
                <p><strong>Registration Time:</strong> {registration_time.strftime('%Y-%m-%d %H:%M:%S UTC')}</p>
            </div>
            <p>You can view all registrations in the admin portal under "Peer Support Registrations".</p>
            <br>
            <p style="color: #1a2332;">Veterans Support System</p>
        </body>
        </html>
        """
        
        params = {
            "from": SENDER_EMAIL,
            "to": [notification_email],
            "subject": "New Peer Support Registration - Veterans Support",
            "html": html_content
        }
        
        result = await asyncio.to_thread(resend.Emails.send, params)
        logging.info(f"Peer registration notification sent to {notification_email}, ID: {result.get('id')}")
        return True
    except Exception as e:
        logging.error(f"Failed to send peer registration notification: {str(e)}")
        return False

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
        
        # Send notification to admin
        await send_peer_registration_notification(input.email, registration_obj.timestamp)
        
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

# ============ CALL INTENT LOGGING ENDPOINTS ============

@api_router.post("/call-logs", response_model=CallIntent)
async def log_call_intent(call_input: CallIntentCreate):
    """Log a call intent (public - for app users)"""
    try:
        call_obj = CallIntent(**call_input.dict())
        await db.call_logs.insert_one(call_obj.dict())
        logging.info(f"Call intent logged: {call_input.contact_type} - {call_input.contact_name}")
        return call_obj
    except Exception as e:
        logging.error(f"Error logging call intent: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to log call")

@api_router.get("/call-logs")
async def get_call_logs(
    current_user: User = Depends(require_role("admin")),
    days: int = 30,
    contact_type: Optional[str] = None
):
    """Get call logs with metrics (admin only)"""
    try:
        from_date = datetime.utcnow() - timedelta(days=days)
        
        query = {"timestamp": {"$gte": from_date}}
        if contact_type:
            query["contact_type"] = contact_type
        
        logs = await db.call_logs.find(query, {"_id": 0}).sort("timestamp", -1).to_list(1000)
        
        # Calculate metrics
        total_calls = len(logs)
        calls_by_type = {}
        calls_by_method = {}
        calls_by_day = {}
        
        for log in logs:
            # By type
            ct = log.get("contact_type", "unknown")
            calls_by_type[ct] = calls_by_type.get(ct, 0) + 1
            
            # By method
            cm = log.get("call_method", "phone")
            calls_by_method[cm] = calls_by_method.get(cm, 0) + 1
            
            # By day
            day = log.get("timestamp", datetime.utcnow()).strftime("%Y-%m-%d")
            calls_by_day[day] = calls_by_day.get(day, 0) + 1
        
        return {
            "total_calls": total_calls,
            "period_days": days,
            "calls_by_type": calls_by_type,
            "calls_by_method": calls_by_method,
            "calls_by_day": dict(sorted(calls_by_day.items())),
            "recent_logs": logs[:50]  # Last 50 logs
        }
    except Exception as e:
        logging.error(f"Error retrieving call logs: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to retrieve call logs")

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
