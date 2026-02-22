"""
Compliance Module for Radio Check
Implements GDPR, BACP, and Data Protection requirements
"""

from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta, timezone
from enum import Enum
import uuid


# ============ AUDIT LOGGING MODELS ============

class AuditAction(str, Enum):
    VIEW = "view"
    CREATE = "create"
    UPDATE = "update"
    DELETE = "delete"
    EXPORT = "export"
    LOGIN = "login"
    LOGOUT = "logout"
    CONSENT_GIVEN = "consent_given"
    CONSENT_WITHDRAWN = "consent_withdrawn"
    DATA_ACCESS = "data_access"
    SAFEGUARDING_ALERT = "safeguarding_alert"
    CHAT_SESSION = "chat_session"
    PASSWORD_CHANGE = "password_change"
    ACCOUNT_DELETION = "account_deletion"


class AuditLog(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: Optional[str] = None
    user_email: Optional[str] = None
    action: AuditAction
    resource_type: str  # "user", "chat", "profile", "safeguarding", etc.
    resource_id: Optional[str] = None
    description: str
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


# ============ CONSENT MANAGEMENT MODELS ============

class ConsentType(str, Enum):
    AI_CHAT = "ai_chat"
    BUDDY_FINDER = "buddy_finder"
    MARKETING_EMAILS = "marketing_emails"
    ANALYTICS = "analytics"
    SAFEGUARDING = "safeguarding"  # Cannot be withdrawn
    CHAT_HISTORY = "chat_history"


class UserConsent(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    consent_type: ConsentType
    granted: bool
    granted_at: Optional[datetime] = None
    withdrawn_at: Optional[datetime] = None
    ip_address: Optional[str] = None
    version: str = "1.0"  # Consent policy version


class ConsentPreferences(BaseModel):
    ai_chat: bool = False
    ai_chat_consent_date: Optional[datetime] = None
    buddy_finder: bool = False
    buddy_finder_consent_date: Optional[datetime] = None
    marketing_emails: bool = False
    marketing_emails_consent_date: Optional[datetime] = None
    analytics: bool = True  # Default opt-in for basic analytics
    analytics_consent_date: Optional[datetime] = None
    chat_history_visible: bool = True
    chat_history_consent_date: Optional[datetime] = None


# ============ STAFF WELLBEING MODELS ============

class StaffMoodRating(str, Enum):
    GREAT = "great"
    GOOD = "good"
    OKAY = "okay"
    STRUGGLING = "struggling"
    NEED_SUPPORT = "need_support"


class StaffWellbeingCheckIn(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    staff_id: str
    mood_rating: StaffMoodRating
    notes: Optional[str] = None
    difficult_cases_today: int = 0
    safeguarding_alerts_handled: int = 0
    break_taken: bool = True
    supervision_requested: bool = False
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class SupervisionRequest(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    staff_id: str
    staff_name: str
    reason: str
    urgency: str = "normal"  # "normal", "urgent", "critical"
    case_reference: Optional[str] = None
    status: str = "pending"  # "pending", "scheduled", "completed"
    scheduled_date: Optional[datetime] = None
    completed_date: Optional[datetime] = None
    notes: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


# ============ COMPLAINTS SYSTEM MODELS ============

class ComplaintCategory(str, Enum):
    AI_RESPONSE = "ai_response"
    STAFF_CONDUCT = "staff_conduct"
    TECHNICAL_ISSUE = "technical_issue"
    PRIVACY_CONCERN = "privacy_concern"
    SAFEGUARDING = "safeguarding"
    ACCESSIBILITY = "accessibility"
    OTHER = "other"


class ComplaintStatus(str, Enum):
    RECEIVED = "received"
    UNDER_REVIEW = "under_review"
    INVESTIGATING = "investigating"
    RESOLVED = "resolved"
    CLOSED = "closed"


class Complaint(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: Optional[str] = None
    user_email: Optional[str] = None
    category: ComplaintCategory
    subject: str
    description: str
    status: ComplaintStatus = ComplaintStatus.RECEIVED
    priority: str = "normal"  # "low", "normal", "high", "critical"
    assigned_to: Optional[str] = None
    resolution: Optional[str] = None
    response_sent: bool = False
    ip_address: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    resolved_at: Optional[datetime] = None


class ComplaintCreate(BaseModel):
    category: ComplaintCategory
    subject: str
    description: str
    user_email: Optional[str] = None


# ============ DATA RETENTION MODELS ============

class DataRetentionPolicy(BaseModel):
    collection_name: str
    retention_days: int
    description: str
    last_cleanup: Optional[datetime] = None
    next_cleanup: Optional[datetime] = None
    items_deleted_last_run: int = 0


class DataRetentionReport(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    run_date: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    policies_applied: List[str]
    total_items_deleted: int
    details: List[Dict[str, Any]]
    errors: List[str] = []


# ============ SECURITY REVIEW MODELS ============

class SecurityReviewItem(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    category: str  # "authentication", "encryption", "access_control", "api_security", etc.
    item: str
    status: str  # "pass", "fail", "warning", "not_tested"
    severity: str  # "low", "medium", "high", "critical"
    description: str
    recommendation: Optional[str] = None
    last_reviewed: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    reviewed_by: Optional[str] = None


class SecurityReview(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    review_date: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    reviewer: str
    review_type: str  # "automated", "manual", "penetration_test"
    overall_status: str  # "pass", "pass_with_warnings", "fail"
    items: List[SecurityReviewItem]
    summary: str
    next_review_date: Optional[datetime] = None


# ============ INCIDENT RESPONSE MODELS ============

class IncidentSeverity(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class IncidentType(str, Enum):
    DATA_BREACH = "data_breach"
    UNAUTHORIZED_ACCESS = "unauthorized_access"
    SERVICE_OUTAGE = "service_outage"
    SAFEGUARDING_FAILURE = "safeguarding_failure"
    PRIVACY_VIOLATION = "privacy_violation"
    SECURITY_VULNERABILITY = "security_vulnerability"
    OTHER = "other"


class IncidentStatus(str, Enum):
    DETECTED = "detected"
    INVESTIGATING = "investigating"
    CONTAINED = "contained"
    RESOLVED = "resolved"
    CLOSED = "closed"


class SecurityIncident(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    incident_type: IncidentType
    severity: IncidentSeverity
    status: IncidentStatus = IncidentStatus.DETECTED
    title: str
    description: str
    detected_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    detected_by: str
    affected_users: int = 0
    affected_systems: List[str] = []
    containment_actions: List[str] = []
    resolution_actions: List[str] = []
    root_cause: Optional[str] = None
    lessons_learned: Optional[str] = None
    ico_notified: bool = False
    ico_notification_date: Optional[datetime] = None
    users_notified: bool = False
    users_notification_date: Optional[datetime] = None
    resolved_at: Optional[datetime] = None
    closed_at: Optional[datetime] = None
    timeline: List[Dict[str, Any]] = []


class IncidentCreate(BaseModel):
    incident_type: IncidentType
    severity: IncidentSeverity
    title: str
    description: str
    detected_by: str
    affected_systems: List[str] = []


# ============ GDPR DATA EXPORT MODELS ============

class GDPRDataExport(BaseModel):
    export_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    requested_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    completed_at: Optional[datetime] = None
    status: str = "pending"  # "pending", "processing", "completed", "failed"
    data_categories: List[str] = []
    download_url: Optional[str] = None
    expires_at: Optional[datetime] = None


# ============ HELPER FUNCTIONS ============

def get_retention_policies() -> List[DataRetentionPolicy]:
    """Get default data retention policies"""
    return [
        DataRetentionPolicy(
            collection_name="callback_requests",
            retention_days=90,
            description="Callback requests after resolution"
        ),
        DataRetentionPolicy(
            collection_name="session_tokens",
            retention_days=1,
            description="Expired session tokens"
        ),
        DataRetentionPolicy(
            collection_name="rate_limit_logs",
            retention_days=1,
            description="Rate limiting data"
        ),
        DataRetentionPolicy(
            collection_name="audit_logs",
            retention_days=2555,  # 7 years
            description="Audit trail for compliance"
        ),
        DataRetentionPolicy(
            collection_name="chat_sessions",
            retention_days=2555,  # 7 years
            description="Chat sessions for safeguarding"
        ),
        DataRetentionPolicy(
            collection_name="safeguarding_alerts",
            retention_days=2555,  # 7 years
            description="Safeguarding records"
        ),
    ]


def calculate_next_cleanup(last_cleanup: datetime, frequency_hours: int = 24) -> datetime:
    """Calculate next scheduled cleanup time"""
    return last_cleanup + timedelta(hours=frequency_hours)
