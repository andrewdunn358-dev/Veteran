# GDPR Compliance Audit Report
## Radio Check - UK Veterans Support Application
**Audit Date:** February 2026

---

## Executive Summary

Radio Check demonstrates **good foundational GDPR compliance** with encryption, privacy policies, and safeguarding protocols. However, several areas need improvement to achieve full compliance, particularly around **data subject rights automation**, **consent management**, and **data retention enforcement**.

**Overall Rating: 🟡 PARTIALLY COMPLIANT (7/10)**

---

## ✅ COMPLIANT AREAS

### 1. Privacy Policy (Article 13 & 14)
- **Status:** ✅ GOOD
- Comprehensive privacy policy at `/website/privacy.html`
- Covers: data collection, usage, storage, rights, retention, third parties
- Contact: privacy@radiocheck.me
- ICO complaint reference included

### 2. Data Encryption (Article 32)
- **Status:** ✅ GOOD
- AES-256 field-level encryption implemented (`encryption.py`)
- Sensitive fields encrypted: SIP passwords, contact details
- Passwords hashed with bcrypt
- JWT tokens with expiration

### 3. Lawful Basis & Consent (Article 6)
- **Status:** ✅ GOOD for Buddy Finder
- `gdpr_consent: bool` required field
- `gdpr_consent_date` timestamp recorded
- Buddy Finder requires explicit opt-in

### 4. Safeguarding & Legitimate Interest (Article 6(1)(d))
- **Status:** ✅ EXCELLENT
- Robust safeguarding system with risk scoring
- RED/AMBER/YELLOW/GREEN risk levels
- Crisis resources provided automatically
- Escalation procedures documented

### 5. Security Measures (Article 32)
- **Status:** ✅ GOOD
- JWT authentication
- Role-based access control (admin, staff, user)
- Password hashing (bcrypt)
- HTTPS enforced

---

## ⚠️ AREAS NEEDING IMPROVEMENT

### 1. Right to Access (Article 15) - Data Export
- **Status:** ⚠️ PARTIAL
- **Issue:** Only organizations can be exported to CSV
- **Missing:** User personal data export endpoint

**RECOMMENDATION:**
```python
@api_router.get("/auth/my-data/export")
async def export_my_data(current_user: User = Depends(get_current_user)):
    """Export all user's personal data (GDPR Article 15)"""
    # Collect all data associated with user
```

### 2. Right to Erasure (Article 17) - Account Deletion
- **Status:** ⚠️ PARTIAL
- **Issue:** Admin can delete users, but users cannot self-delete
- **Missing:** User-initiated account deletion with cascade

**RECOMMENDATION:**
```python
@api_router.delete("/auth/me")
async def delete_my_account(current_user: User = Depends(get_current_user)):
    """Delete own account and all associated data (GDPR Article 17)"""
    # Delete from: users, buddy_profiles, buddy_messages, shifts, etc.
```

### 3. Data Retention Enforcement (Article 5(1)(e))
- **Status:** ⚠️ MISSING
- **Issue:** Policy states retention periods but no automated cleanup
- **Privacy Policy States:**
  - Chat logs: 7 years
  - Callback requests: 90 days after resolution

**RECOMMENDATION:**
- Implement scheduled cleanup jobs
- Add `expires_at` fields to relevant collections
- Create admin dashboard for data retention monitoring

### 4. Consent Management (Article 7)
- **Status:** ⚠️ PARTIAL
- **Issue:** No consent withdrawal mechanism
- **Missing:** Granular consent preferences

**RECOMMENDATION:**
```python
class UserConsent(BaseModel):
    marketing_emails: bool = False
    buddy_finder_visible: bool = True
    ai_chat_analytics: bool = False
    consent_updated_at: datetime
```

### 5. Cookie/Local Storage Consent
- **Status:** ⚠️ MISSING
- **Issue:** No cookie banner or consent mechanism
- **Required:** Explicit consent for non-essential storage

**RECOMMENDATION:**
- Add cookie consent banner to website
- Add local storage consent to mobile app onboarding

---

## 🔴 CRITICAL GAPS TO ADDRESS

### 1. AI Chat Data Processing (Article 22)
- **Status:** 🔴 NEEDS ATTENTION
- **Issue:** Chat data sent to OpenAI without explicit per-session consent
- **Risk:** Automated decision-making based on chat content (safeguarding)

**RECOMMENDATION:**
- Add clear notice before AI chat: "Your messages are processed by AI to provide support and detect crisis situations"
- Allow users to opt-out of chat history being used for safeguarding analytics
- Document the legitimate interest basis for safeguarding

### 2. Data Processing Records (Article 30)
- **Status:** 🔴 MISSING
- **Issue:** No documented Record of Processing Activities (ROPA)

**RECOMMENDATION:**
Create `/docs/ROPA.md` documenting:
- Categories of data subjects
- Categories of personal data
- Processing purposes
- Data recipients
- Retention periods
- Security measures

### 3. Data Protection Impact Assessment (Article 35)
- **Status:** 🔴 MISSING
- **Issue:** High-risk processing (mental health data) requires DPIA

**RECOMMENDATION:**
- Conduct formal DPIA for AI chat processing
- Document risk mitigation measures
- Review annually

### 4. Audit Trail / Logging (Article 5(2))
- **Status:** ⚠️ PARTIAL
- **Issue:** No comprehensive audit log for data access

**RECOMMENDATION:**
```python
class AuditLog(BaseModel):
    user_id: str
    action: str  # "view", "create", "update", "delete", "export"
    resource_type: str  # "user", "chat", "profile", etc.
    resource_id: str
    ip_address: str
    timestamp: datetime
```

---

## 📋 IMPLEMENTATION PRIORITY

### P0 - Critical (Do Immediately)
1. [ ] Add user self-deletion endpoint (`/auth/me` DELETE)
2. [ ] Add user data export endpoint (`/auth/my-data/export`)
3. [ ] Create ROPA document
4. [ ] Add AI chat consent notice

### P1 - High (Within 30 days)
5. [ ] Implement data retention cleanup jobs
6. [ ] Add audit logging for data access
7. [ ] Cookie consent banner on website
8. [ ] Conduct basic DPIA for AI processing

### P2 - Medium (Within 90 days)
9. [ ] Granular consent preferences
10. [ ] Data retention dashboard for admins
11. [ ] Automated data subject request handling
12. [ ] Annual GDPR review process

---

## Third-Party Data Processors

| Processor | Purpose | Data Shared | DPA Status |
|-----------|---------|-------------|------------|
| OpenAI | AI chat | Chat messages (anonymised) | ⚠️ Need to verify DPA |
| MongoDB Atlas | Database | All data | ✅ Standard DPA |
| Render | Hosting | All data | ✅ Standard DPA |
| Resend | Email | Email addresses | ⚠️ Need to verify DPA |

**RECOMMENDATION:** Ensure Data Processing Agreements (DPAs) are in place with all processors.

---

## Special Category Data (Article 9)

Radio Check processes **special category data**:
- Health data (mental health conversations)
- Military service history

**Lawful Basis:**
- Article 9(2)(c): Vital interests (safeguarding)
- Article 9(2)(g): Substantial public interest

**RECOMMENDATION:** Document this basis explicitly in privacy policy.

---

## Contact Information

- **Data Protection Contact:** privacy@radiocheck.me
- **ICO Registration:** Verify if registration required (likely yes for health data)
- **Website:** https://radiocheck.me/privacy.html

---

## Next Steps

1. **Implement P0 items** - User deletion and export endpoints
2. **Create ROPA** - Document all processing activities
3. **Review DPAs** - Ensure all third parties have agreements
4. **Consider ICO registration** - Mental health processing may require registration

---

*This audit was conducted based on code review. A full compliance audit should include process review, staff training assessment, and penetration testing.*
