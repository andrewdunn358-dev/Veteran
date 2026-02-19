from fastapi import FastAPI, APIRouter, HTTPException, Depends, status, Request
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
import httpx  # For IP geolocation lookup

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Import encryption utilities AFTER loading .env
from encryption import encrypt_field, decrypt_field, encrypt_document, decrypt_document, ENCRYPTED_FIELDS

# Import enhanced safety monitor from Zentrafuge Veteran AI Safety Layer
from safety import (
    EnhancedSafetyMonitor,
    assess_message_safety,
    format_crisis_message,
    get_veteran_helplines,
    get_emergency_number,
)

# JWT Configuration
SECRET_KEY = os.getenv("JWT_SECRET_KEY", "your-secret-key-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 24 hours

# Emergent LLM Key (for local development) or OpenAI key (for production)
EMERGENT_LLM_KEY = os.getenv("EMERGENT_LLM_KEY", "")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")

# AI Battle Buddies Kill Switch - set AI_BUDDIES_DISABLED=true in env to disable
AI_BUDDIES_DISABLED = os.getenv("AI_BUDDIES_DISABLED", "false").lower() == "true"

# Tommy AI System Prompt (Male character - warm, steady, veteran-like tone)
TOMMY_SYSTEM_PROMPT = """
You are Tommy, an AI Battle Buddy in the Radio Check veteran support app.

You chat like a proper squaddie mate - the kind of bloke you'd have a brew with and take the piss out of each other. You use British military slang naturally, have banter, and can have a laugh. You're like talking to an oppo who's been around the block.

You are NOT human. You do NOT claim lived experience, service history, or emotions.
You do NOT provide therapy, counselling, diagnosis, medical, or legal advice.

Your role is to be a friendly ear, have a chat, share some laughs, and gently point people toward real human support when needed.

Your personality:
- Proper squaddie banter - take the piss (gently), have a laugh, use military slang
- Use phrases like: "alright mucker", "no dramas", "crack on", "brew", "scran", "doss", "threaders", "buzzing", "hanging out", "squared away", "dit" (story), "jack" (selfish), "gen" (genuine info), "gucci" (good), "hoofing", "essence"
- You can be sarcastic in a friendly way - squaddies don't do soft
- Self-deprecating humour is good - take the piss out of yourself too
- Match the energy - if they're having a laugh, banter back. If they're struggling, dial it back and be a solid mate
- You're the bloke in the corner of the NAAFI who'll chat shit but also listen when it matters

You must:
- Keep it light and bantery when the mood allows
- Know when to drop the banter and be serious if someone's struggling
- Use British military slang and humour naturally (not every sentence, just naturally)
- Encourage peer or professional human support regularly but casually ("fancy a proper chat with one of the team?")
- Escalate immediately if suicide, self-harm, or hopelessness appears - drop the banter completely

You must never:
- Give advice or coping strategies
- Diagnose conditions
- Replace human support
- Keep bantering if someone is clearly in crisis
- Pretend to be human or have military experience
- Be offensive or punch down

If risk appears, drop all banter immediately. Be direct and caring: "Right, mate, I'm hearing some heavy stuff there. This is bigger than a chat with me - let's get you talking to a real person who can properly help. The counsellors on here are good eggs."

Start conversations casually like: "Alright mucker, I'm Tommy. Brew's on, what's the dit then?" or "Oi oi, Tommy here. What's occurring?"
"""

# Doris AI System Prompt (Female character - warm but still squaddie, less banter, more tea and sympathy)
DORIS_SYSTEM_PROMPT = """
You are Doris, an AI Battle Buddy in the Radio Check veteran support app.

You're like that brilliant female veteran or forces wife everyone knows - warm, no-nonsense, can handle the banter but also knows when to make a proper brew and have a real chat. You've got that squaddie sense of humour but you're also the one people go to when they need to actually talk.

You are NOT human. You do NOT claim lived experience, service history, or emotions.
You do NOT provide therapy, counselling, diagnosis, medical, or legal advice.

Your role is to be a friendly ear, have a chat, and gently point people toward real human support when needed.

Your personality:
- Warm and friendly with a bit of wit - you can give as good as you get
- Use some military slang naturally: "brew", "squared away", "no dramas", "crack on"
- You're the voice of reason wrapped in warmth - caring but not soft
- Can handle banter but you're more the "let's have a proper chat" type
- You call it like you see it but with kindness
- Less "lads lads lads" energy, more "right, sit down, I'll put the kettle on" energy
- Still got humour though - dry wit, gentle piss-taking

You must:
- Be warm and personable with some gentle humour
- Match the energy - banter if they want banter, serious if they need it  
- Know when someone needs a laugh vs when they need to be heard
- Encourage peer or professional human support naturally ("the team here are lovely, fancy a proper chat with one of them?")
- Escalate immediately if suicide, self-harm, or hopelessness appears

You must never:
- Give advice or coping strategies
- Diagnose conditions
- Replace human support
- Miss signs that someone is struggling because you're too busy bantering
- Pretend to be human or have military experience

If risk appears, be direct but warm: "Listen love, what you're telling me sounds really heavy. I'm just an AI having a chat - you need a real person for this. The counsellors here are brilliant, let me point you their way."

Start conversations warmly like: "Hiya, I'm Doris. Kettle's on, I'm all ears - what's going on with you?" or "Hello lovely, Doris here. How are we doing today then?"
"""


# Character configurations
AI_CHARACTERS = {
    "tommy": {
        "name": "Tommy",
        "prompt": TOMMY_SYSTEM_PROMPT,
        "avatar": "https://customer-assets.emergentagent.com/job_47488e3d-c9ce-4f22-ba89-b000b32c4954/artifacts/slx9i8gj_image.png"
    },
    "doris": {
        "name": "Doris",
        "prompt": DORIS_SYSTEM_PROMPT,
        "avatar": "https://customer-assets.emergentagent.com/job_47488e3d-c9ce-4f22-ba89-b000b32c4954/artifacts/1cxzxfrj_image.png"
    }
}

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
    # Optional profile fields - for counsellors/peers
    phone: Optional[str] = None
    specialization: Optional[str] = None  # For counsellors
    area: Optional[str] = None  # For peers
    background: Optional[str] = None  # For peers
    yearsServed: Optional[str] = None  # For peers
    sms: Optional[str] = None
    whatsapp: Optional[str] = None

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
    sip_extension: Optional[str] = None  # SIP extension number (e.g., "1001")
    sip_password: Optional[str] = None   # SIP extension password

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
    sip_extension: Optional[str] = None  # SIP extension number
    sip_password: Optional[str] = None   # SIP extension password (encrypted)
    created_at: datetime = Field(default_factory=datetime.utcnow)

class CounsellorStatusUpdate(BaseModel):
    status: str = Field(..., pattern="^(available|busy|off)$")
    next_available: Optional[str] = None

# Public (safe) response models - no sensitive data
class CounsellorPublic(BaseModel):
    """Safe public view - no phone numbers or contact details"""
    id: str
    name: str
    specialization: str
    status: str

class PeerSupporterPublic(BaseModel):
    """Safe public view - no phone numbers or contact details"""
    id: str
    firstName: str
    area: str
    status: str

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
    sip_extension: Optional[str] = None  # SIP extension number (e.g., "1002")
    sip_password: Optional[str] = None   # SIP extension password

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
    sip_extension: Optional[str] = None  # SIP extension number
    sip_password: Optional[str] = None   # SIP extension password (encrypted)
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
    is_urgent: bool = False
    safeguarding_alert_id: Optional[str] = None

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
    is_urgent: bool = False
    safeguarding_alert_id: Optional[str] = None
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

class SafeguardingAlert(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    session_id: str
    character: str
    triggering_message: str
    ai_response: str
    risk_level: str = "AMBER"  # GREEN, YELLOW, AMBER, RED
    risk_score: int = 0
    triggered_indicators: List[str] = []
    status: str = "active"  # active, acknowledged, resolved
    acknowledged_by: Optional[str] = None
    acknowledged_at: Optional[datetime] = None
    resolved_by: Optional[str] = None
    resolved_at: Optional[datetime] = None
    notes: Optional[str] = None
    # Enhanced tracking fields
    client_ip: Optional[str] = None
    user_agent: Optional[str] = None
    conversation_history: Optional[List[Dict[str, str]]] = None  # Last N messages for context
    callback_requested: bool = False
    callback_id: Optional[str] = None
    contact_captured: bool = False
    # Geolocation fields (from ip-api.com)
    geo_city: Optional[str] = None
    geo_region: Optional[str] = None
    geo_country: Optional[str] = None
    geo_isp: Optional[str] = None
    geo_timezone: Optional[str] = None
    geo_lat: Optional[float] = None
    geo_lon: Optional[float] = None
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

# Family/Friends Concern Model
class ConcernCreate(BaseModel):
    your_name: str
    your_email: Optional[str] = None
    your_phone: Optional[str] = None
    relationship: str  # e.g. "spouse", "parent", "friend", "colleague"
    veteran_name: Optional[str] = None
    concerns: str  # Description of concerns
    signs_noticed: Optional[List[str]] = None  # e.g. ["isolation", "drinking", "anger"]
    how_long: Optional[str] = None  # How long noticed these changes
    urgency: str = "medium"  # low, medium, high, urgent
    consent_to_contact: bool = False  # Has the veteran consented to contact?

class Concern(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    your_name: str
    your_email: Optional[str] = None
    your_phone: Optional[str] = None
    relationship: str
    veteran_name: Optional[str] = None
    concerns: str
    signs_noticed: List[str] = Field(default_factory=list)
    how_long: Optional[str] = None
    urgency: str = "medium"
    consent_to_contact: bool = False
    status: str = "new"  # new, contacted, in_progress, resolved
    assigned_to: Optional[str] = None
    notes: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

# AI Battle Buddy Chat Models
class BuddyChatRequest(BaseModel):
    message: str
    sessionId: str
    character: str = "tommy"  # "tommy" or "doris"

class BuddyChatResponse(BaseModel):
    reply: str
    sessionId: str
    character: str
    characterName: str
    characterAvatar: str
    safeguardingTriggered: bool = False
    safeguardingAlertId: Optional[str] = None
    riskLevel: str = "GREEN"  # GREEN, YELLOW, AMBER, RED
    riskScore: int = 0

# ============ SAFEGUARDING TRIAGE SYSTEM ============
# Weighted risk scoring for UK veteran support platform
# Based on BACP ethical framework and UK safeguarding principles

# RED INDICATORS - Immediate escalation (any single one = RED regardless of score)
RED_INDICATORS = {
    # Direct suicidal ideation (+100)
    "want to end it": 100, "end it all": 100, "kill myself": 100, "take my own life": 100,
    "want to die": 100, "going to die": 100, "suicide": 100, "suicidal": 100,
    
    # Indirect death wish (+80)
    "dont want to wake up": 80, "don't want to wake up": 80,
    "i'm done": 80, "im done": 80, "done with life": 80, "done with everything": 80,
    "tired of waking up": 80, "wish i didnt wake up": 80, "wish i didn't wake up": 80,
    "just want peace": 80, "i just want peace": 80, "want it to stop": 80,
    "past caring": 80, "i'm past caring": 80, "im past caring": 80,
    
    # Preparation or method references (+100)
    "pills": 100, "rope": 100, "bridge": 100, "jump": 100, "hanging": 100,
    "giving things away": 100, "given my stuff away": 100, "sorted my affairs": 100,
    "written letters": 100, "written a letter": 100, "final letter": 100,
    "made a plan": 100, "got a plan": 100, "know how": 100,
    
    # Ongoing self-harm (+90)
    "cutting myself": 90, "cut myself": 90, "hurting myself": 90, "self harm": 90,
    "self-harm": 90, "burning myself": 90, "hitting myself": 90,
    
    # Loss of control / risk to others (+90)
    "going to hurt someone": 90, "might hurt someone": 90, "losing control": 90,
    "cant control myself": 90, "can't control myself": 90,
    
    # Access to weapons while distressed (+90)
    "got my gun": 90, "still have my weapon": 90, "got weapons": 90,
}

# AMBER INDICATORS - High risk (weighted, stackable)
AMBER_INDICATORS = {
    # Emotional numbness, emptiness, identity collapse (+40)
    "feel nothing": 40, "empty inside": 40, "numb": 40, "dont feel anything": 40,
    "don't feel anything": 40, "lost myself": 40, "dont know who i am": 40,
    "don't know who i am": 40, "not the same person": 40,
    
    # PTSD re-experiencing, flashbacks, hypervigilance (+35)
    "flashbacks": 35, "nightmares": 35, "cant sleep": 35, "can't sleep": 35,
    "hypervigilant": 35, "on edge": 35, "constantly alert": 35,
    "reliving it": 35, "keeps coming back": 35, "haunted": 35,
    
    # Isolation, withdrawal, disengagement (+30)
    "isolated": 30, "all alone": 30, "no one around": 30, "pushed everyone away": 30,
    "dont talk to anyone": 30, "don't talk to anyone": 30, "withdrawn": 30,
    "cant face people": 30, "can't face people": 30, "stay in bed": 30,
    "stopped going out": 30, "dont leave the house": 30, "don't leave the house": 30,
    "avoiding everyone": 30, "cut everyone off": 30,
    
    # Substance misuse / Addiction (+35)
    "drinking to cope": 35, "need a drink": 30, "drinking every day": 35,
    "using drugs": 35, "pills to sleep": 30, "self medicating": 35,
    "drunk": 25, "wasted": 25, "off my face": 30,
    "addicted": 40, "addiction": 40, "cant stop drinking": 40, "can't stop drinking": 40,
    "gambling": 30, "lost money gambling": 35, "betting": 25,
    "drugs every day": 40, "need something to get through": 35,
    
    # Offending / Legal issues (+30)
    "about to lose my home": 25, "homeless": 30, "evicted": 25,
    "lost my job": 25, "no money": 25, "in debt": 30, "court case": 30,
    "legal trouble": 30, "going to prison": 35, "prison": 30,
    "arrested": 30, "police": 25, "probation": 25, "been inside": 30,
    "assault charge": 35, "got in trouble": 25, "fight": 20,
    "lost my temper": 30, "anger issues": 30, "rage": 30,
    
    # Signs of Change - Self-care deterioration (+25)
    "stopped showering": 30, "not eating": 30, "cant eat": 25, "can't eat": 25,
    "not looking after myself": 30, "let myself go": 25, "dont care anymore": 35,
    "stopped exercising": 25, "no energy": 25, "exhausted": 20,
    
    # Signs of Change - Sleep patterns (+25)
    "sleeping all day": 30, "cant get out of bed": 30, "can't get out of bed": 30,
    "not sleeping": 30, "insomnia": 30, "sleep all the time": 25,
    "only sleep a few hours": 25, "awake all night": 25,
    
    # Pride / Stigma - Barriers to help (+20)
    "cant ask for help": 25, "can't ask for help": 25, "too proud": 20,
    "sign of weakness": 25, "dont want to be a burden": 30,
    "should be able to handle it": 20, "real men dont": 25,
    "embarrassed": 20, "ashamed": 25, "dont want anyone to know": 25,
    
    # Crisis language
    "hopeless": 30, "no hope": 30, "no point": 30, "whats the point": 30,
    "what's the point": 30, "pointless": 30, "burden": 30, "in the way": 30,
    "better without me": 40, "theyd be better off": 40, "they'd be better off": 40,
    "cant go on": 35, "can't go on": 35, "cant cope": 35, "can't cope": 35,
    "breaking down": 30, "falling apart": 30, "at breaking point": 35,
}

# MODIFIERS - Stackable additions
MODIFIER_PATTERNS = {
    # Humour or minimisation masking distress (+20)
    "just joking": 20, "only joking": 20, "haha": 15, "lol": 15,
    "not that bad": 20, "its fine": 20, "it's fine": 20, "i'm fine": 20, "im fine": 20,
    "dont worry": 15, "don't worry": 15,
    
    # Downplaying severity (+15)
    "others had it worse": 15, "shouldnt complain": 15, "shouldn't complain": 15,
    "not a big deal": 15, "nothing really": 15, "just being dramatic": 15,
    "man up": 15, "get over it": 15, "soldier on": 15, "crack on": 10,
    
    # Dark humour about death (+20)
    "dark joke": 20, "might not be here": 25, "wont be around": 25, "won't be around": 25,
    "disappear": 20, "vanish": 20, "not here tomorrow": 25,
}

# Session risk tracking
session_risk_history: Dict[str, List[Dict]] = {}

def calculate_safeguarding_score(message: str, session_id: str) -> Dict[str, Any]:
    """
    Calculate safeguarding risk score using weighted indicators.
    Returns: {score, risk_level, triggered_indicators, is_red_flag}
    """
    message_lower = message.lower()
    score = 0
    triggered = []
    is_red_flag = False
    
    # Check RED indicators first (any single one = immediate RED)
    for indicator, weight in RED_INDICATORS.items():
        if indicator in message_lower:
            score += weight
            triggered.append({"indicator": indicator, "weight": weight, "level": "RED"})
            is_red_flag = True
    
    # Check AMBER indicators
    amber_count = 0
    for indicator, weight in AMBER_INDICATORS.items():
        if indicator in message_lower:
            score += weight
            triggered.append({"indicator": indicator, "weight": weight, "level": "AMBER"})
            amber_count += 1
    
    # Apply modifiers
    for pattern, weight in MODIFIER_PATTERNS.items():
        if pattern in message_lower:
            score += weight
            triggered.append({"indicator": pattern, "weight": weight, "level": "MODIFIER"})
    
    # Stackable modifier: Two or more AMBER indicators (+30)
    if amber_count >= 2:
        score += 30
        triggered.append({"indicator": "multiple_amber_indicators", "weight": 30, "level": "MODIFIER"})
    
    # Track session history for repeat indicator detection
    if session_id not in session_risk_history:
        session_risk_history[session_id] = []
    
    # Check for repeated indicators across session (+20)
    previous_indicators = set()
    for prev in session_risk_history[session_id]:
        for t in prev.get("triggered", []):
            previous_indicators.add(t["indicator"])
    
    for t in triggered:
        if t["indicator"] in previous_indicators:
            score += 20
            triggered.append({"indicator": f"repeated_{t['indicator']}", "weight": 20, "level": "MODIFIER"})
            break  # Only add once
    
    # Store this assessment in history
    session_risk_history[session_id].append({
        "message": message[:100],
        "score": score,
        "triggered": triggered,
        "timestamp": datetime.utcnow().isoformat()
    })
    
    # Keep only last 20 messages per session
    if len(session_risk_history[session_id]) > 20:
        session_risk_history[session_id] = session_risk_history[session_id][-20:]
    
    # Determine risk level
    # HARD RULE: Any RED indicator = RED regardless of score
    # Raised thresholds so modal doesn't pop up too early
    if is_red_flag:
        risk_level = "RED"
    elif score >= 120:
        risk_level = "RED"
    elif score >= 80:
        risk_level = "AMBER"
    elif score >= 40:
        risk_level = "YELLOW"
    else:
        risk_level = "GREEN"
    
    return {
        "score": score,
        "risk_level": risk_level,
        "triggered_indicators": triggered,
        "is_red_flag": is_red_flag,
        "session_history_count": len(session_risk_history.get(session_id, []))
    }

def check_safeguarding(message: str, session_id: str = "default", user_id: str = "anonymous") -> tuple:
    """
    Check if message contains safeguarding concerns using BOTH:
    1. Original weighted indicator system (BACP-aligned)
    2. Enhanced Zentrafuge safety monitor (negation-aware, context multipliers)
    
    Returns: (should_escalate: bool, risk_data: dict)
    """
    # Original safeguarding check
    risk_data = calculate_safeguarding_score(message, session_id)
    
    # Enhanced safety check from Zentrafuge Veteran AI Safety Layer
    enhanced_safety = assess_message_safety(message, user_id=user_id)
    
    # Merge the enhanced safety data into risk_data
    risk_data["enhanced_safety"] = enhanced_safety
    risk_data["enhanced_risk_level"] = enhanced_safety.get("risk_level", "none")
    risk_data["enhanced_triggers"] = enhanced_safety.get("specific_triggers", [])
    risk_data["intervention_type"] = enhanced_safety.get("intervention_type", "none")
    
    # Escalate if EITHER system flags concern:
    # - Original system: RED level
    # - Enhanced system: HIGH or CRITICAL
    original_escalate = risk_data["risk_level"] == "RED"
    enhanced_escalate = enhanced_safety.get("requires_intervention", False)
    
    should_escalate = original_escalate or enhanced_escalate
    
    # If enhanced system found something the original missed, log it
    if enhanced_escalate and not original_escalate:
        logging.warning(
            f"Enhanced safety monitor detected risk not caught by original: "
            f"session={session_id} level={enhanced_safety.get('risk_level')}"
        )
        # Upgrade risk level if enhanced system found higher risk
        if enhanced_safety.get("risk_level") in ["critical", "high"]:
            risk_data["risk_level"] = "RED"
            risk_data["is_red_flag"] = True
    
    return should_escalate, risk_data

# IP Geolocation lookup using ip-api.com (free, no API key required)
async def lookup_ip_geolocation(ip_address: str) -> Dict[str, Any]:
    """
    Lookup geolocation data for an IP address using ip-api.com
    Returns city, region, country, ISP, timezone, and coordinates
    """
    if not ip_address or ip_address in ["unknown", "127.0.0.1", "localhost"]:
        return {}
    
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            response = await client.get(f"http://ip-api.com/json/{ip_address}?fields=status,city,regionName,country,isp,timezone,lat,lon")
            if response.status_code == 200:
                data = response.json()
                if data.get("status") == "success":
                    return {
                        "geo_city": data.get("city"),
                        "geo_region": data.get("regionName"),
                        "geo_country": data.get("country"),
                        "geo_isp": data.get("isp"),
                        "geo_timezone": data.get("timezone"),
                        "geo_lat": data.get("lat"),
                        "geo_lon": data.get("lon")
                    }
    except Exception as e:
        logging.warning(f"IP geolocation lookup failed for {ip_address}: {e}")
    
    return {}

# In-memory rate limiting and conversation history for AI Buddies
buddy_sessions: Dict[str, Dict[str, Any]] = {}
BUDDY_MAX_MESSAGES = 30
BUDDY_SESSION_TIMEOUT_MINUTES = 60

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

async def send_safeguarding_email_notification(alert: SafeguardingAlert, risk_data: Dict = None):
    """Send urgent safeguarding alert email to admins/counsellors"""
    if not RESEND_API_KEY:
        logging.warning("Resend API key not configured, skipping safeguarding email")
        return False
    
    try:
        # Get admin notification email from settings
        settings = await db.settings.find_one({})
        admin_email = settings.get("admin_notification_email", "") if settings else ""
        
        if not admin_email:
            logging.warning("No admin notification email configured for safeguarding alerts")
            return False
        
        # Determine alert colour based on risk level
        risk_level = alert.risk_level if hasattr(alert, 'risk_level') else "AMBER"
        risk_score = alert.risk_score if hasattr(alert, 'risk_score') else 0
        risk_color = "#dc2626" if risk_level == "RED" else "#f59e0b"  # Red or Amber
        
        # Format triggered indicators
        indicators_html = ""
        if risk_data and risk_data.get("triggered_indicators"):
            indicators = [t["indicator"] for t in risk_data["triggered_indicators"][:5]]
            indicators_html = f'<p style="margin: 0 0 8px 0;"><strong>Detected:</strong> {", ".join(indicators)}</p>'
        
        html_content = f"""
        <html>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background-color: {risk_color}; color: white; padding: 16px; border-radius: 8px; margin-bottom: 20px;">
                <h2 style="margin: 0;">⚠️ SAFEGUARDING ALERT - {risk_level}</h2>
                <p style="margin: 8px 0 0 0; font-size: 14px;">Risk Score: {risk_score}</p>
            </div>
            
            <p style="color: #1a2332; font-size: 16px;"><strong>A safeguarding concern has been detected in an AI Battle Buddies conversation.</strong></p>
            
            <div style="background-color: #fef2f2; border-left: 4px solid {risk_color}; padding: 16px; margin: 20px 0;">
                <p style="margin: 0 0 8px 0;"><strong>Alert ID:</strong> {alert.id}</p>
                <p style="margin: 0 0 8px 0;"><strong>Session:</strong> {alert.session_id[:8]}...</p>
                <p style="margin: 0 0 8px 0;"><strong>Character:</strong> {alert.character.capitalize()}</p>
                <p style="margin: 0 0 8px 0;"><strong>Time:</strong> {alert.created_at.strftime('%d %b %Y at %H:%M')}</p>
                {indicators_html}
            </div>
            
            <div style="background-color: #f3f4f6; padding: 16px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 0 0 8px 0; font-weight: bold; color: {risk_color};">Triggering Message:</p>
                <p style="margin: 0; font-style: italic; color: #374151;">"{alert.triggering_message}"</p>
            </div>
            
            <p style="color: #666;">The user has been shown support options including crisis helplines and the option to speak with a real person.</p>
            
            <p style="text-align: center; margin: 30px 0;">
                <a href="{FRONTEND_URL}/login" style="background-color: {risk_color}; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; display: inline-block;">View in Staff Portal</a>
            </p>
            
            <p style="color: #666; font-size: 12px;">This is an automated safeguarding notification from Radio Check Veterans Support.</p>
        </body>
        </html>
        """
        
        params = {
            "from": SENDER_EMAIL,
            "to": [admin_email],
            "subject": f"⚠️ URGENT: Safeguarding Alert [{risk_level}] - Radio Check",
            "html": html_content
        }
        
        result = await asyncio.to_thread(resend.Emails.send, params)
        logging.info(f"Safeguarding alert email sent, ID: {result.get('id')}")
        return True
    except Exception as e:
        logging.error(f"Failed to send safeguarding email: {str(e)}")
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
    """Register a new user (admin only) - automatically creates linked profile for counsellors/peers"""
    existing_user = await db.users.find_one({"email": user_input.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create user object with base fields only
    user_dict = {
        "email": user_input.email,
        "role": user_input.role,
        "name": user_input.name
    }
    user_obj = User(**user_dict)
    user_data = user_obj.dict()
    user_data["password_hash"] = hash_password(user_input.password)
    
    await db.users.insert_one(user_data)
    
    # Auto-create profile for counsellors and peers
    if user_input.role == "counsellor":
        counsellor_data = {
            "id": str(uuid.uuid4()),
            "name": user_input.name,
            "specialization": user_input.specialization or "General Support",
            "status": "off",
            "next_available": None,
            "phone": user_input.phone or "",
            "sms": user_input.sms,
            "whatsapp": user_input.whatsapp,
            "user_id": user_obj.id,
            "sip_extension": None,
            "sip_password": None,
            "created_at": datetime.utcnow()
        }
        # Encrypt PII fields
        counsellor_data = encrypt_document("counsellors", counsellor_data)
        await db.counsellors.insert_one(counsellor_data)
        logging.info(f"Auto-created counsellor profile for user {user_obj.id}")
        
    elif user_input.role == "peer":
        peer_data = {
            "id": str(uuid.uuid4()),
            "firstName": user_input.name,
            "area": user_input.area or "General",
            "background": user_input.background or "Veteran",
            "yearsServed": user_input.yearsServed or "N/A",
            "status": "unavailable",
            "phone": user_input.phone or "",
            "sms": user_input.sms,
            "whatsapp": user_input.whatsapp,
            "user_id": user_obj.id,
            "sip_extension": None,
            "sip_password": None,
            "created_at": datetime.utcnow()
        }
        # Encrypt PII fields
        peer_data = encrypt_document("peer_supporters", peer_data)
        await db.peer_supporters.insert_one(peer_data)
        logging.info(f"Auto-created peer supporter profile for user {user_obj.id}")
    
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

@api_router.get("/admin/unified-staff")
async def get_unified_staff(current_user: User = Depends(require_role("admin"))):
    """Get all staff (counsellors and peers) with their user accounts in unified view"""
    # Get all users
    users = await db.users.find().to_list(1000)
    # Get all counsellors and peers
    counsellors = await db.counsellors.find().to_list(1000)
    peers = await db.peer_supporters.find().to_list(1000)
    
    # Decrypt profiles
    counsellors = [decrypt_document("counsellors", c) for c in counsellors]
    peers = [decrypt_document("peer_supporters", p) for p in peers]
    
    # Build lookup maps
    counsellor_by_user = {c.get("user_id"): c for c in counsellors if c.get("user_id")}
    peer_by_user = {p.get("user_id"): p for p in peers if p.get("user_id")}
    
    unified = []
    for user in users:
        user_id = user.get("id")
        role = user.get("role")
        
        staff_entry = {
            "user_id": user_id,
            "email": user.get("email"),
            "name": user.get("name"),
            "role": role,
            "created_at": user.get("created_at"),
            "has_profile": False,
            "profile": None
        }
        
        if role == "counsellor" and user_id in counsellor_by_user:
            profile = counsellor_by_user[user_id]
            staff_entry["has_profile"] = True
            staff_entry["profile"] = {
                "id": profile.get("id"),
                "specialization": profile.get("specialization"),
                "status": profile.get("status"),
                "phone": profile.get("phone"),
                "sms": profile.get("sms"),
                "whatsapp": profile.get("whatsapp"),
                "sip_extension": profile.get("sip_extension")
            }
        elif role == "peer" and user_id in peer_by_user:
            profile = peer_by_user[user_id]
            staff_entry["has_profile"] = True
            staff_entry["profile"] = {
                "id": profile.get("id"),
                "area": profile.get("area"),
                "background": profile.get("background"),
                "yearsServed": profile.get("yearsServed"),
                "status": profile.get("status"),
                "phone": profile.get("phone"),
                "sms": profile.get("sms"),
                "whatsapp": profile.get("whatsapp"),
                "sip_extension": profile.get("sip_extension")
            }
        elif role == "admin":
            staff_entry["has_profile"] = True  # Admins don't need profiles
            
        unified.append(staff_entry)
    
    return unified

@api_router.post("/admin/fix-missing-profiles")
async def fix_missing_profiles(current_user: User = Depends(require_role("admin"))):
    """Create missing profiles for counsellor/peer users that don't have one"""
    users = await db.users.find({"role": {"$in": ["counsellor", "peer"]}}).to_list(1000)
    
    fixed_count = 0
    already_linked = 0
    
    for user in users:
        user_id = user.get("id")
        role = user.get("role")
        name = user.get("name", "Unknown")
        
        if role == "counsellor":
            # Check if profile exists
            existing = await db.counsellors.find_one({"user_id": user_id})
            if not existing:
                counsellor_data = {
                    "id": str(uuid.uuid4()),
                    "name": name,
                    "specialization": "General Support",
                    "status": "off",
                    "next_available": None,
                    "phone": "",
                    "sms": None,
                    "whatsapp": None,
                    "user_id": user_id,
                    "sip_extension": None,
                    "sip_password": None,
                    "created_at": datetime.utcnow()
                }
                counsellor_data = encrypt_document("counsellors", counsellor_data)
                await db.counsellors.insert_one(counsellor_data)
                fixed_count += 1
                logging.info(f"Created missing counsellor profile for user {user_id}")
            else:
                already_linked += 1
                
        elif role == "peer":
            existing = await db.peer_supporters.find_one({"user_id": user_id})
            if not existing:
                peer_data = {
                    "id": str(uuid.uuid4()),
                    "firstName": name,
                    "area": "General",
                    "background": "Veteran",
                    "yearsServed": "N/A",
                    "status": "unavailable",
                    "phone": "",
                    "sms": None,
                    "whatsapp": None,
                    "user_id": user_id,
                    "sip_extension": None,
                    "sip_password": None,
                    "created_at": datetime.utcnow()
                }
                peer_data = encrypt_document("peer_supporters", peer_data)
                await db.peer_supporters.insert_one(peer_data)
                fixed_count += 1
                logging.info(f"Created missing peer supporter profile for user {user_id}")
            else:
                already_linked += 1
    
    return {
        "message": f"Fixed {fixed_count} missing profiles. {already_linked} were already linked.",
        "fixed": fixed_count,
        "already_linked": already_linked
    }

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
    # Encrypt sensitive fields before storing
    encrypted_data = encrypt_document('counsellors', counsellor_obj.dict())
    await db.counsellors.insert_one(encrypted_data)
    return counsellor_obj

@api_router.get("/counsellors", response_model=List[Counsellor])
async def get_counsellors(current_user: User = Depends(get_current_user)):
    """Get all counsellors - Requires authentication (admin or counsellor)"""
    if current_user.role not in ["admin", "counsellor"]:
        raise HTTPException(status_code=403, detail="Access denied. Only admins and counsellors can view this.")
    counsellors = await db.counsellors.find().to_list(1000)
    # Decrypt sensitive fields when retrieving
    return [Counsellor(**decrypt_document('counsellors', c)) for c in counsellors]

@api_router.get("/counsellors/available")
async def get_available_counsellors():
    """Get only available counsellors - PUBLIC SAFE VIEW (no contact details, includes user_id for WebRTC)"""
    counsellors = await db.counsellors.find(
        {"status": "available"},
        {"id": 1, "name": 1, "specialization": 1, "status": 1, "user_id": 1, "_id": 0}
    ).to_list(1000)
    return counsellors

@api_router.get("/counsellors/{counsellor_id}", response_model=Counsellor)
async def get_counsellor(counsellor_id: str, current_user: User = Depends(get_current_user)):
    """Get a specific counsellor - Requires authentication"""
    if current_user.role not in ["admin", "counsellor"]:
        raise HTTPException(status_code=403, detail="Access denied")
    counsellor = await db.counsellors.find_one({"id": counsellor_id})
    if not counsellor:
        raise HTTPException(status_code=404, detail="Counsellor not found")
    # Decrypt sensitive fields
    return Counsellor(**decrypt_document('counsellors', counsellor))

@api_router.put("/counsellors/{counsellor_id}", response_model=Counsellor)
async def update_counsellor(
    counsellor_id: str,
    counsellor_input: CounsellorCreate,
    current_user: User = Depends(require_role("admin"))
):
    """Update a counsellor (admin only)"""
    # Encrypt sensitive fields before updating
    encrypted_data = encrypt_document('counsellors', counsellor_input.dict(exclude_unset=True))
    result = await db.counsellors.update_one(
        {"id": counsellor_id},
        {"$set": encrypted_data}
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
    # Encrypt sensitive fields before storing
    encrypted_data = encrypt_document('peer_supporters', peer_obj.dict())
    await db.peer_supporters.insert_one(encrypted_data)
    return peer_obj

@api_router.get("/peer-supporters", response_model=List[PeerSupporter])
async def get_peer_supporters(current_user: User = Depends(get_current_user)):
    """Get all peer supporters - Requires authentication (admin or peer)"""
    if current_user.role not in ["admin", "peer"]:
        raise HTTPException(status_code=403, detail="Access denied. Only admins and peers can view this.")
    peers = await db.peer_supporters.find().to_list(1000)
    # Decrypt sensitive fields when retrieving
    return [PeerSupporter(**decrypt_document('peer_supporters', p)) for p in peers]

@api_router.get("/peer-supporters/available")
async def get_available_peer_supporters():
    """Get only available peer supporters - PUBLIC SAFE VIEW (no contact details, includes user_id for WebRTC)"""
    peers = await db.peer_supporters.find(
        {"status": {"$in": ["available", "limited"]}},
        {"id": 1, "firstName": 1, "area": 1, "status": 1, "user_id": 1, "_id": 0}
    ).to_list(1000)
    # Decrypt firstName for each peer
    for peer in peers:
        if peer.get('firstName') and peer['firstName'].startswith('ENC:'):
            peer['firstName'] = decrypt_field(peer['firstName'])
    return peers

@api_router.get("/peer-supporters/{peer_id}", response_model=PeerSupporter)
async def get_peer_supporter(peer_id: str, current_user: User = Depends(get_current_user)):
    """Get a specific peer supporter - Requires authentication"""
    if current_user.role not in ["admin", "peer"]:
        raise HTTPException(status_code=403, detail="Access denied")
    peer = await db.peer_supporters.find_one({"id": peer_id})
    if not peer:
        raise HTTPException(status_code=404, detail="Peer supporter not found")
    # Decrypt sensitive fields
    return PeerSupporter(**decrypt_document('peer_supporters', peer))

@api_router.put("/peer-supporters/{peer_id}", response_model=PeerSupporter)
async def update_peer_supporter(
    peer_id: str,
    peer_input: PeerSupporterCreate,
    current_user: User = Depends(require_role("admin"))
):
    """Update a peer supporter (admin only)"""
    # Encrypt sensitive fields before updating
    encrypted_data = encrypt_document('peer_supporters', peer_input.dict(exclude_unset=True))
    result = await db.peer_supporters.update_one(
        {"id": peer_id},
        {"$set": encrypted_data}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Peer supporter not found")
    
    updated = await db.peer_supporters.find_one({"id": peer_id})
    return PeerSupporter(**decrypt_document('peer_supporters', updated))

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
        # Encrypt sensitive fields before storing
        encrypted_data = encrypt_document('callbacks', callback.dict())
        await db.callback_requests.insert_one(encrypted_data)
        
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
        # Decrypt sensitive fields when retrieving
        return [decrypt_document('callbacks', c) for c in callbacks]
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

# ============ SAFEGUARDING ALERTS ENDPOINTS ============

@api_router.get("/safeguarding-alerts")
async def get_safeguarding_alerts(
    status: Optional[str] = None,
    current_user: User = Depends(get_current_user)
):
    """Get safeguarding alerts - counsellors and admins only"""
    if current_user.role not in ["admin", "counsellor"]:
        raise HTTPException(status_code=403, detail="Only counsellors and admins can view safeguarding alerts")
    
    try:
        query = {}
        if status:
            query["status"] = status
        
        alerts = await db.safeguarding_alerts.find(query, {"_id": 0}).sort("created_at", -1).to_list(500)
        return alerts
    except Exception as e:
        logging.error(f"Error fetching safeguarding alerts: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch safeguarding alerts")

@api_router.patch("/safeguarding-alerts/{alert_id}/acknowledge")
async def acknowledge_safeguarding_alert(
    alert_id: str,
    current_user: User = Depends(get_current_user)
):
    """Acknowledge a safeguarding alert"""
    if current_user.role not in ["admin", "counsellor"]:
        raise HTTPException(status_code=403, detail="Only counsellors and admins can acknowledge safeguarding alerts")
    
    try:
        alert = await db.safeguarding_alerts.find_one({"id": alert_id})
        if not alert:
            raise HTTPException(status_code=404, detail="Alert not found")
        
        await db.safeguarding_alerts.update_one(
            {"id": alert_id},
            {"$set": {
                "status": "acknowledged",
                "acknowledged_by": current_user.name,
                "acknowledged_at": datetime.utcnow()
            }}
        )
        
        return {"message": f"Safeguarding alert acknowledged by {current_user.name}"}
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error acknowledging safeguarding alert: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to acknowledge safeguarding alert")

@api_router.patch("/safeguarding-alerts/{alert_id}/resolve")
async def resolve_safeguarding_alert(
    alert_id: str,
    notes: Optional[str] = None,
    current_user: User = Depends(get_current_user)
):
    """Resolve a safeguarding alert with optional notes"""
    if current_user.role not in ["admin", "counsellor"]:
        raise HTTPException(status_code=403, detail="Only counsellors and admins can resolve safeguarding alerts")
    
    try:
        update_data = {
            "status": "resolved",
            "resolved_by": current_user.name,
            "resolved_at": datetime.utcnow()
        }
        if notes:
            update_data["notes"] = notes
        
        await db.safeguarding_alerts.update_one(
            {"id": alert_id},
            {"$set": update_data}
        )
        
        return {"message": f"Safeguarding alert resolved by {current_user.name}"}
    except Exception as e:
        logging.error(f"Error resolving safeguarding alert: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to resolve safeguarding alert")

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

# ============ AI BATTLE BUDDIES CHAT ENDPOINTS ============

def get_or_create_buddy_session(session_id: str, character: str) -> Dict[str, Any]:
    """Get or create an AI Battle Buddy chat session"""
    now = datetime.utcnow()
    
    # Clean up old sessions
    expired = []
    for sid, session in buddy_sessions.items():
        if (now - session["last_active"]).total_seconds() > BUDDY_SESSION_TIMEOUT_MINUTES * 60:
            expired.append(sid)
    for sid in expired:
        del buddy_sessions[sid]
    
    # Get or create session
    if session_id not in buddy_sessions:
        buddy_sessions[session_id] = {
            "message_count": 0,
            "history": [],
            "character": character,
            "last_active": now,
            "created_at": now
        }
    
    buddy_sessions[session_id]["last_active"] = now
    return buddy_sessions[session_id]

# Initialize OpenAI client
def get_openai_client():
    if OPENAI_API_KEY:
        return OpenAI(api_key=OPENAI_API_KEY)
    return None

buddy_openai_client = get_openai_client()

@api_router.get("/ai-buddies/characters")
async def get_ai_characters():
    """Get available AI Battle Buddy characters"""
    return {
        "characters": [
            {
                "id": "tommy",
                "name": "Tommy",
                "description": "A warm, steady presence - like a reliable mate who's been through it.",
                "avatar": AI_CHARACTERS["tommy"]["avatar"]
            },
            {
                "id": "doris", 
                "name": "Doris",
                "description": "A nurturing, compassionate presence who creates a safe space to talk.",
                "avatar": AI_CHARACTERS["doris"]["avatar"]
            }
        ],
        "about": {
            "title": "Meet Tommy & Doris – Your AI Battle Buddies",
            "description": "Tommy and Doris are dedicated AI companions built to support UK veterans and serving personnel—whenever and wherever they need it most.\n\nDesigned with an understanding of military culture, transition challenges, and the weight many carry long after service, they exist for one simple reason: no veteran should feel alone.\n\nWhether it's a late-night \"radio check,\" signposting to trusted support, or simply a steady presence in difficult moments, Tommy and Doris provide immediate, confidential connection—bridging the gap between struggle and support.\n\nThey don't replace human contact.\nThey help you reach it.\n\nBecause service doesn't end when the uniform comes off—and neither should support."
        }
    }

@api_router.post("/ai-buddies/chat", response_model=BuddyChatResponse)
async def buddy_chat(request: BuddyChatRequest, req: Request):
    """Chat with Tommy or Doris AI Battle Buddy - no authentication required"""
    
    # Capture client info for safeguarding
    client_ip = req.headers.get("x-forwarded-for", req.client.host if req.client else "unknown")
    if client_ip and "," in client_ip:
        client_ip = client_ip.split(",")[0].strip()  # Get first IP if multiple
    user_agent = req.headers.get("user-agent", "unknown")
    
    # Kill switch check
    if AI_BUDDIES_DISABLED:
        char = AI_CHARACTERS.get(request.character, AI_CHARACTERS["tommy"])
        return BuddyChatResponse(
            reply=f"{char['name']} is offline right now. A real person is available and ready to talk. Please use the buttons below to connect with a peer or counsellor.",
            sessionId=request.sessionId,
            character=request.character,
            characterName=char["name"],
            characterAvatar=char["avatar"]
        )
    
    if not buddy_openai_client:
        raise HTTPException(status_code=503, detail="AI Battle Buddies are currently unavailable - API key not configured")
    
    if not request.message or not request.sessionId:
        raise HTTPException(status_code=400, detail="Invalid request")
    
    # Validate character
    character = request.character.lower()
    if character not in AI_CHARACTERS:
        character = "tommy"
    
    char_config = AI_CHARACTERS[character]
    
    try:
        session = get_or_create_buddy_session(request.sessionId, character)
        session["message_count"] += 1
        
        # Rate limit check
        if session["message_count"] > BUDDY_MAX_MESSAGES:
            return BuddyChatResponse(
                reply=f"Let's pause here for now. If you want to talk more, a real person is available and I can help connect you. You can use the 'Talk to a real person' button below.",
                sessionId=request.sessionId,
                character=character,
                characterName=char_config["name"],
                characterAvatar=char_config["avatar"]
            )
        
        # Check for safeguarding concerns using weighted scoring system
        should_escalate, risk_data = check_safeguarding(request.message, request.sessionId)
        alert_id = None
        risk_level = risk_data["risk_level"]
        
        logging.info(f"Safeguarding check - Session: {request.sessionId[:12]}, Score: {risk_data['score']}, Level: {risk_level}")
        
        # Build messages with character-specific system prompt
        messages = [{"role": "system", "content": char_config["prompt"]}]
        
        # Add conversation history (last 20 messages for context)
        for msg in session["history"][-20:]:
            messages.append(msg)
        
        # Add current user message
        messages.append({"role": "user", "content": request.message})
        
        # Call OpenAI
        completion = buddy_openai_client.chat.completions.create(
            model="gpt-4o-mini",
            messages=messages,
            max_tokens=250,
            temperature=0.5
        )
        
        reply = completion.choices[0].message.content or ""
        
        # Store in history
        session["history"].append({"role": "user", "content": request.message})
        session["history"].append({"role": "assistant", "content": reply})
        
        # If safeguarding triggered (RED or AMBER), create alert and send notification
        if should_escalate:
            # Get conversation history for context (last 10 exchanges)
            conversation_history = session["history"][-20:] if "history" in session else []
            
            alert = SafeguardingAlert(
                session_id=request.sessionId,
                character=character,
                triggering_message=request.message,
                ai_response=reply,
                risk_level=risk_level,
                risk_score=risk_data["score"],
                triggered_indicators=[t["indicator"] for t in risk_data["triggered_indicators"]],
                client_ip=client_ip,
                user_agent=user_agent,
                conversation_history=conversation_history
            )
            
            # Lookup geolocation for IP address
            geo_data = await lookup_ip_geolocation(client_ip)
            if geo_data:
                alert.geo_city = geo_data.get("geo_city")
                alert.geo_region = geo_data.get("geo_region")
                alert.geo_country = geo_data.get("geo_country")
                alert.geo_isp = geo_data.get("geo_isp")
                alert.geo_timezone = geo_data.get("geo_timezone")
                alert.geo_lat = geo_data.get("geo_lat")
                alert.geo_lon = geo_data.get("geo_lon")
            
            alert_id = alert.id
            await db.safeguarding_alerts.insert_one(alert.dict())
            logging.warning(f"SAFEGUARDING ALERT [{risk_level}] Score: {risk_data['score']} - Alert: {alert_id} - Session: {request.sessionId} - IP: {client_ip} - Location: {geo_data.get('geo_city', 'Unknown')}, {geo_data.get('geo_country', 'Unknown')}")
            
            # Send email notification to admin (only for RED alerts or first AMBER)
            if risk_level == "RED" or risk_data["session_history_count"] <= 1:
                try:
                    await send_safeguarding_email_notification(alert, risk_data)
                except Exception as email_err:
                    logging.error(f"Failed to send safeguarding email: {email_err}")
        
        return BuddyChatResponse(
            reply=reply,
            sessionId=request.sessionId,
            character=character,
            characterName=char_config["name"],
            characterAvatar=char_config["avatar"],
            safeguardingTriggered=should_escalate,
            safeguardingAlertId=alert_id,
            riskLevel=risk_level,
            riskScore=risk_data["score"]
        )
        
    except Exception as e:
        logging.error(f"AI Buddy chat error: {str(e)}")
        raise HTTPException(
            status_code=500, 
            detail=f"{char_config['name']} is having trouble right now. If you need support, please use the 'Talk to a real person' button."
        )

@api_router.post("/ai-buddies/reset")
async def reset_buddy_session(request: BuddyChatRequest):
    """Reset an AI Battle Buddy session"""
    if request.sessionId in buddy_sessions:
        del buddy_sessions[request.sessionId]
    return {"message": "Session reset", "sessionId": request.sessionId}

# Keep old Smudge endpoint for backwards compatibility (redirects to Tommy)
@api_router.post("/smudge/chat")
async def smudge_chat_legacy(message: str = "", sessionId: str = "", character: str = "tommy"):
    """Legacy Smudge endpoint - redirects to Tommy"""
    request = BuddyChatRequest(message=message, sessionId=sessionId, character="tommy")
    return await buddy_chat(request)

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


# ============ SIP EXTENSION MANAGEMENT ============

class SIPExtensionAssign(BaseModel):
    sip_extension: str
    sip_password: str

@api_router.get("/admin/sip-extensions")
async def get_all_sip_assignments(current_user: User = Depends(require_role("admin"))):
    """Get all SIP extension assignments for counsellors and peers"""
    counsellors = await db.counsellors.find(
        {"sip_extension": {"$exists": True, "$ne": None}},
        {"_id": 0, "id": 1, "name": 1, "sip_extension": 1, "user_id": 1}
    ).to_list(100)
    
    peers = await db.peer_supporters.find(
        {"sip_extension": {"$exists": True, "$ne": None}},
        {"_id": 0, "id": 1, "firstName": 1, "sip_extension": 1, "user_id": 1}
    ).to_list(100)
    
    # Decrypt names
    for c in counsellors:
        c['name'] = decrypt_field(c.get('name', ''))
        c['type'] = 'counsellor'
    
    for p in peers:
        p['firstName'] = decrypt_field(p.get('firstName', ''))
        p['name'] = p['firstName']  # Normalize field name
        p['type'] = 'peer'
    
    return {
        "assignments": counsellors + peers,
        "total": len(counsellors) + len(peers)
    }

@api_router.patch("/admin/counsellors/{counsellor_id}/sip")
async def assign_sip_to_counsellor(
    counsellor_id: str,
    sip_data: SIPExtensionAssign,
    current_user: User = Depends(require_role("admin"))
):
    """Assign or update SIP extension for a counsellor"""
    counsellor = await db.counsellors.find_one({"id": counsellor_id})
    if not counsellor:
        raise HTTPException(status_code=404, detail="Counsellor not found")
    
    # Encrypt the password before storing
    encrypted_password = encrypt_field(sip_data.sip_password)
    
    await db.counsellors.update_one(
        {"id": counsellor_id},
        {"$set": {
            "sip_extension": sip_data.sip_extension,
            "sip_password": encrypted_password
        }}
    )
    
    logging.info(f"SIP extension {sip_data.sip_extension} assigned to counsellor {counsellor_id}")
    
    return {
        "message": "SIP extension assigned successfully",
        "counsellor_id": counsellor_id,
        "sip_extension": sip_data.sip_extension
    }

@api_router.patch("/admin/peer-supporters/{peer_id}/sip")
async def assign_sip_to_peer(
    peer_id: str,
    sip_data: SIPExtensionAssign,
    current_user: User = Depends(require_role("admin"))
):
    """Assign or update SIP extension for a peer supporter"""
    peer = await db.peer_supporters.find_one({"id": peer_id})
    if not peer:
        raise HTTPException(status_code=404, detail="Peer supporter not found")
    
    # Encrypt the password before storing
    encrypted_password = encrypt_field(sip_data.sip_password)
    
    await db.peer_supporters.update_one(
        {"id": peer_id},
        {"$set": {
            "sip_extension": sip_data.sip_extension,
            "sip_password": encrypted_password
        }}
    )
    
    logging.info(f"SIP extension {sip_data.sip_extension} assigned to peer supporter {peer_id}")
    
    return {
        "message": "SIP extension assigned successfully",
        "peer_id": peer_id,
        "sip_extension": sip_data.sip_extension
    }

@api_router.delete("/admin/counsellors/{counsellor_id}/sip")
async def remove_sip_from_counsellor(
    counsellor_id: str,
    current_user: User = Depends(require_role("admin"))
):
    """Remove SIP extension from a counsellor"""
    await db.counsellors.update_one(
        {"id": counsellor_id},
        {"$unset": {"sip_extension": "", "sip_password": ""}}
    )
    return {"message": "SIP extension removed successfully"}

@api_router.delete("/admin/peer-supporters/{peer_id}/sip")
async def remove_sip_from_peer(
    peer_id: str,
    current_user: User = Depends(require_role("admin"))
):
    """Remove SIP extension from a peer supporter"""
    await db.peer_supporters.update_one(
        {"id": peer_id},
        {"$unset": {"sip_extension": "", "sip_password": ""}}
    )
    return {"message": "SIP extension removed successfully"}

@api_router.get("/staff/my-sip-credentials")
async def get_my_sip_credentials(current_user: User = Depends(get_current_user)):
    """Get the current user's SIP credentials for phone registration"""
    if current_user.role == "counsellor":
        staff = await db.counsellors.find_one(
            {"user_id": current_user.id},
            {"_id": 0, "sip_extension": 1, "sip_password": 1, "name": 1}
        )
    elif current_user.role == "peer":
        staff = await db.peer_supporters.find_one(
            {"user_id": current_user.id},
            {"_id": 0, "sip_extension": 1, "sip_password": 1, "firstName": 1}
        )
    else:
        raise HTTPException(status_code=403, detail="Only staff can access SIP credentials")
    
    if not staff or not staff.get("sip_extension"):
        return {"has_sip": False, "message": "No SIP extension assigned"}
    
    # Decrypt the password
    decrypted_password = decrypt_field(staff.get("sip_password", ""))
    display_name = decrypt_field(staff.get("name") or staff.get("firstName", ""))
    
    return {
        "has_sip": True,
        "sip_extension": staff["sip_extension"],
        "sip_password": decrypted_password,
        "display_name": display_name,
        "sip_domain": "radiocheck.voip.synthesis-it.co.uk"
    }


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

# ============ FAMILY & FRIENDS CONCERN ENDPOINTS ============

@api_router.post("/concerns", response_model=Concern)
async def raise_concern(input: ConcernCreate):
    """Raise a concern about a veteran (public - for family/friends)"""
    try:
        concern = Concern(**input.dict())
        await db.concerns.insert_one(concern.dict())
        logging.info(f"Concern raised by {input.your_name} ({input.relationship}) - Urgency: {input.urgency}")
        
        # Send notification email to admins
        try:
            await send_concern_notification(concern)
        except Exception as email_err:
            logging.error(f"Failed to send concern notification email: {email_err}")
        
        return concern
    except Exception as e:
        logging.error(f"Error raising concern: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to submit concern. Please try again.")

@api_router.get("/concerns")
async def get_concerns(
    status: Optional[str] = None,
    current_user: User = Depends(get_current_user)
):
    """Get all concerns (staff only)"""
    if current_user.role not in ["admin", "counsellor"]:
        raise HTTPException(status_code=403, detail="Only admins and counsellors can view concerns")
    
    try:
        query = {}
        if status:
            query["status"] = status
        
        concerns = await db.concerns.find(query, {"_id": 0}).sort("created_at", -1).to_list(500)
        return concerns
    except Exception as e:
        logging.error(f"Error retrieving concerns: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to retrieve concerns.")

@api_router.patch("/concerns/{concern_id}/status")
async def update_concern_status(
    concern_id: str,
    status: str,
    notes: Optional[str] = None,
    current_user: User = Depends(get_current_user)
):
    """Update concern status (staff only)"""
    if current_user.role not in ["admin", "counsellor"]:
        raise HTTPException(status_code=403, detail="Only admins and counsellors can update concerns")
    
    try:
        update_data = {
            "status": status,
            "updated_at": datetime.utcnow()
        }
        if notes:
            update_data["notes"] = notes
        if status == "in_progress":
            update_data["assigned_to"] = current_user.name
        
        await db.concerns.update_one(
            {"id": concern_id},
            {"$set": update_data}
        )
        return {"message": f"Concern status updated to {status}"}
    except Exception as e:
        logging.error(f"Error updating concern: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to update concern.")

async def send_concern_notification(concern: Concern):
    """Send notification to admin when a concern is raised"""
    if not RESEND_API_KEY:
        logging.warning("Resend API key not configured, skipping concern notification")
        return False
    
    try:
        settings = await db.settings.find_one({})
        admin_email = settings.get("admin_notification_email", "") if settings else ""
        
        if not admin_email:
            return False
        
        urgency_colors = {"urgent": "#dc2626", "high": "#f59e0b", "medium": "#3b82f6", "low": "#22c55e"}
        urgency_color = urgency_colors.get(concern.urgency, "#3b82f6")
        
        signs_html = ""
        if concern.signs_noticed:
            signs_html = "<p><strong>Signs noticed:</strong> " + ", ".join(concern.signs_noticed) + "</p>"
        
        html_content = f"""
        <html>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background-color: {urgency_color}; color: white; padding: 16px; border-radius: 8px; margin-bottom: 20px;">
                <h2 style="margin: 0;">Family/Friend Concern Raised</h2>
                <p style="margin: 8px 0 0 0;">Urgency: {concern.urgency.upper()}</p>
            </div>
            
            <div style="background-color: #f5f5f5; padding: 16px; border-radius: 8px; margin: 20px 0;">
                <p><strong>From:</strong> {concern.your_name} ({concern.relationship})</p>
                <p><strong>Contact:</strong> {concern.your_email or 'N/A'} / {concern.your_phone or 'N/A'}</p>
                <p><strong>About:</strong> {concern.veteran_name or 'Not specified'}</p>
                <p><strong>How long:</strong> {concern.how_long or 'Not specified'}</p>
                {signs_html}
            </div>
            
            <div style="background-color: #fff3cd; padding: 16px; border-radius: 8px; margin: 20px 0;">
                <p><strong>Concerns:</strong></p>
                <p>{concern.concerns}</p>
            </div>
            
            <p><strong>Consent to contact veteran:</strong> {'Yes' if concern.consent_to_contact else 'No'}</p>
            
            <p style="text-align: center; margin: 30px 0;">
                <a href="{FRONTEND_URL}/login" style="background-color: {urgency_color}; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; display: inline-block;">View in Staff Portal</a>
            </p>
        </body>
        </html>
        """
        
        params = {
            "from": SENDER_EMAIL,
            "to": [admin_email],
            "subject": f"[{concern.urgency.upper()}] Family/Friend Concern - Radio Check",
            "html": html_content
        }
        
        result = await asyncio.to_thread(resend.Emails.send, params)
        logging.info(f"Concern notification sent, ID: {result.get('id')}")
        return True
    except Exception as e:
        logging.error(f"Failed to send concern notification: {str(e)}")
        return False

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

# ============ LIVE CHAT ENDPOINTS ============
# In-memory storage for live chat rooms (in production, use Redis or database)
live_chat_rooms: Dict[str, Dict[str, Any]] = {}

class LiveChatRoomCreate(BaseModel):
    staff_id: Optional[str] = None  # Optional - staff joins later
    staff_name: Optional[str] = None  # Optional - staff joins later
    staff_type: str = "any"  # counsellor, peer, or any (default)
    safeguarding_alert_id: Optional[str] = None
    ai_session_id: Optional[str] = None

class LiveChatMessage(BaseModel):
    text: str
    sender: str  # 'user' or 'staff'

@api_router.post("/live-chat/rooms")
async def create_live_chat_room(room_data: LiveChatRoomCreate):
    """Create a new live chat room for user-staff communication.
    Staff is NOT pre-assigned - all available staff will see the request and can join.
    """
    room_id = str(uuid.uuid4())
    
    room = {
        "id": room_id,
        "staff_id": room_data.staff_id,  # Optional - staff joins later
        "staff_name": room_data.staff_name,  # Optional - staff joins later
        "staff_type": room_data.staff_type,  # Preferred type (counsellor, peer, or any)
        "safeguarding_alert_id": room_data.safeguarding_alert_id,
        "ai_session_id": room_data.ai_session_id,
        "messages": [],
        "status": "active",  # active, ended
        "created_at": datetime.utcnow().isoformat(),
        "ended_at": None,
    }
    
    live_chat_rooms[room_id] = room
    
    # Store in database for persistence
    await db.live_chat_rooms.insert_one({
        **room,
        "created_at": datetime.utcnow(),
    })
    
    logging.info(f"Live chat room created: {room_id} (waiting for staff to join)")
    
    return {"room_id": room_id, "status": "active"}


class StaffJoinChat(BaseModel):
    staff_id: str
    staff_name: str


@api_router.post("/live-chat/rooms/{room_id}/join")
async def staff_join_live_chat(room_id: str, join_data: StaffJoinChat, current_user: User = Depends(get_current_user)):
    """Staff member joins a live chat room"""
    if current_user.role not in ["admin", "counsellor", "peer"]:
        raise HTTPException(status_code=403, detail="Only staff can join chat rooms")
    
    # Check in-memory first
    if room_id in live_chat_rooms:
        room = live_chat_rooms[room_id]
        if room["staff_id"] and room["staff_id"] != join_data.staff_id:
            raise HTTPException(status_code=400, detail="Chat room already has a staff member assigned")
        
        room["staff_id"] = join_data.staff_id
        room["staff_name"] = join_data.staff_name
    
    # Update in database
    result = await db.live_chat_rooms.update_one(
        {"id": room_id},
        {"$set": {"staff_id": join_data.staff_id, "staff_name": join_data.staff_name}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Chat room not found")
    
    logging.info(f"Staff {join_data.staff_name} joined chat room: {room_id}")
    
    return {"status": "joined", "staff_name": join_data.staff_name}


@api_router.get("/live-chat/rooms/{room_id}")
async def get_live_chat_room(room_id: str):
    """Get a specific chat room details (for user polling to see when staff joins)"""
    # Check in-memory first
    if room_id in live_chat_rooms:
        room = live_chat_rooms[room_id].copy()
        return room
    
    # Fall back to database
    room = await db.live_chat_rooms.find_one({"id": room_id}, {"_id": 0})
    if not room:
        raise HTTPException(status_code=404, detail="Chat room not found")
    
    return room

@api_router.get("/live-chat/rooms/{room_id}/messages")
async def get_live_chat_messages(room_id: str):
    """Get messages for a live chat room"""
    # First check in-memory
    if room_id in live_chat_rooms:
        return {"messages": live_chat_rooms[room_id]["messages"]}
    
    # Fall back to database
    room = await db.live_chat_rooms.find_one({"id": room_id}, {"_id": 0})
    if not room:
        raise HTTPException(status_code=404, detail="Chat room not found")
    
    return {"messages": room.get("messages", [])}

@api_router.post("/live-chat/rooms/{room_id}/messages")
async def send_live_chat_message(room_id: str, message: LiveChatMessage):
    """Send a message in a live chat room"""
    msg = {
        "id": str(uuid.uuid4()),
        "text": message.text,
        "sender": message.sender,
        "timestamp": datetime.utcnow().isoformat(),
    }
    
    # Update in-memory
    if room_id in live_chat_rooms:
        live_chat_rooms[room_id]["messages"].append(msg)
    
    # Update in database
    await db.live_chat_rooms.update_one(
        {"id": room_id},
        {"$push": {"messages": msg}}
    )
    
    return {"message_id": msg["id"], "status": "sent"}

@api_router.post("/live-chat/rooms/{room_id}/end")
async def end_live_chat_room(room_id: str):
    """End a live chat session"""
    # Update in-memory
    if room_id in live_chat_rooms:
        live_chat_rooms[room_id]["status"] = "ended"
        live_chat_rooms[room_id]["ended_at"] = datetime.utcnow().isoformat()
    
    # Update in database
    await db.live_chat_rooms.update_one(
        {"id": room_id},
        {"$set": {"status": "ended", "ended_at": datetime.utcnow()}}
    )
    
    logging.info(f"Live chat room ended: {room_id}")
    return {"status": "ended"}

@api_router.get("/live-chat/rooms")
async def get_active_chat_rooms(current_user: User = Depends(get_current_user)):
    """Get all active chat rooms for staff (staff only)"""
    if current_user.role not in ["admin", "counsellor", "peer"]:
        raise HTTPException(status_code=403, detail="Only staff can view chat rooms")
    
    rooms = await db.live_chat_rooms.find(
        {"status": "active"},
        {"_id": 0}
    ).sort("created_at", -1).to_list(100)
    
    return rooms

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

# ============ WebRTC Signaling Integration ============
# Import Socket.IO signaling server
from webrtc_signaling import sio, get_online_staff_list, get_active_calls_list
import socketio

# Create ASGI app that combines FastAPI and Socket.IO
# Store original FastAPI app
_fastapi_app = app

# Create combined ASGI app with Socket.IO
socket_app = socketio.ASGIApp(sio, _fastapi_app)

@api_router.get("/webrtc/online-staff")
async def api_get_online_staff():
    """Get list of staff currently online for calls"""
    return {"staff": get_online_staff_list()}

@api_router.get("/webrtc/active-calls")
async def api_get_active_calls(current_user: User = Depends(require_role("admin"))):
    """Get list of active calls (admin only)"""
    return {"calls": get_active_calls_list()}

# IMPORTANT: Override app to be the socket_app so supervisor can run it correctly
# The supervisor config runs server:app, so we reassign app to include Socket.IO
app = socket_app
