# Record of Processing Activities (ROPA)
## Radio Check - UK Veterans Support Application
**Last Updated:** February 2026

---

## 1. Controller Information

| Field | Information |
|-------|-------------|
| **Organization Name** | Radio Check |
| **Contact Email** | privacy@radiocheck.me |
| **Data Protection Contact** | privacy@radiocheck.me |
| **Address** | [To be added] |
| **ICO Registration** | [To be verified - likely required for health data] |

---

## 2. Categories of Data Subjects

| Category | Description | Approximate Numbers |
|----------|-------------|---------------------|
| **Veterans** | UK Armed Forces veterans seeking support | Primary users |
| **Serving Personnel** | Currently serving military members | Secondary users |
| **Family Members** | Partners, spouses, family of veterans | Via Family & Friends section |
| **Staff/Counsellors** | Trained peer supporters and professional counsellors | Limited number |
| **Administrators** | System administrators | Minimal |

---

## 3. Categories of Personal Data Processed

### 3.1 Standard Personal Data

| Data Type | Purpose | Retention | Legal Basis |
|-----------|---------|-----------|-------------|
| Email address | Account identification, communication | Account lifetime + 7 years | Contract |
| Name | Identification, personalization | Account lifetime + 7 years | Contract |
| Password (hashed) | Authentication | Account lifetime | Contract |
| Date of birth (encrypted) | Age verification | Account lifetime + 7 years | Legitimate Interest |
| Service branch | Personalization, matching | Account lifetime | Consent |
| Regiment/Unit | Peer matching | Account lifetime | Consent |
| Geographic region | Service localization | Account lifetime | Consent |

### 3.2 Special Category Data (Article 9)

| Data Type | Purpose | Retention | Legal Basis |
|-----------|---------|-----------|-------------|
| Mental health conversations | Support provision, crisis detection | 7 years | Vital interests (Article 9(2)(c)), Substantial public interest (Article 9(2)(g)) |
| Crisis indicators | Safeguarding, emergency response | 7 years | Vital interests |
| Substance use discussions | Support provision | 7 years | Explicit consent + Vital interests |

### 3.3 Technical Data

| Data Type | Purpose | Retention | Legal Basis |
|-----------|---------|-----------|-------------|
| IP address | Security, rate limiting, geolocation for safeguarding | 90 days | Legitimate Interest |
| Device information | App compatibility | Session only | Legitimate Interest |
| Session tokens | Authentication | Session duration | Contract |

---

## 4. Processing Activities

### 4.1 User Registration & Authentication
- **Purpose:** Create and manage user accounts
- **Data:** Email, password, name, optional profile fields
- **Processing:** Account creation, login, password reset
- **Retention:** Account lifetime + 7 years after deletion
- **Recipients:** Internal only

### 4.2 AI Chat Support
- **Purpose:** Provide AI-powered mental health support
- **Data:** Chat messages, session metadata
- **Processing:** Sent to OpenAI for response generation, analyzed for crisis detection
- **Retention:** 7 years
- **Recipients:** OpenAI (Data Processor), internal staff (for safeguarding)
- **Automated Decision Making:** Yes - crisis detection triggers staff alerts
- **User Rights:** Informed via consent screen, can request deletion

### 4.3 Peer Support (Buddy Finder)
- **Purpose:** Connect veterans with peer supporters
- **Data:** Bio, interests, region, service history
- **Processing:** Profile matching, messaging
- **Retention:** Account lifetime
- **Recipients:** Other opted-in users (limited view)
- **Consent:** Explicit opt-in required (gdpr_consent field)

### 4.4 Staff Scheduling
- **Purpose:** Manage counsellor/peer supporter availability
- **Data:** Staff schedules, contact information
- **Processing:** Calendar management, notifications
- **Retention:** 2 years after staff departure
- **Recipients:** Internal admin, other staff (schedules only)

### 4.5 Safeguarding Alerts
- **Purpose:** Protect users in crisis
- **Data:** Triggering messages, risk scores, conversation history, IP, geolocation
- **Processing:** Automated risk scoring, staff notification
- **Retention:** 7 years
- **Recipients:** Internal safeguarding team
- **Legal Basis:** Vital interests, legitimate interest in user safety

### 4.6 Analytics & Improvement
- **Purpose:** Improve AI responses and service quality
- **Data:** Aggregated chat statistics, user feedback
- **Processing:** Pattern analysis, prompt improvement
- **Retention:** Aggregated data indefinitely, raw data 7 years
- **Recipients:** Internal only

---

## 5. Data Recipients & Transfers

### 5.1 Third-Party Processors

| Processor | Purpose | Location | DPA Status | Transfer Mechanism |
|-----------|---------|----------|------------|-------------------|
| **OpenAI** | AI chat processing | USA | ✅ Standard Terms | SCCs |
| **MongoDB Atlas** | Database hosting | UK/EU preferred | ✅ Standard DPA | Adequacy / SCCs |
| **Render** | Application hosting | EU | ✅ Standard DPA | Adequacy |
| **Resend** | Email delivery | USA | ⚠️ To verify | SCCs |
| **Expo** | Mobile push notifications | USA | ✅ Standard Terms | SCCs |

### 5.2 Internal Recipients

| Recipient | Data Access | Purpose |
|-----------|-------------|---------|
| Admin users | Full system access | System management |
| Staff/Counsellors | Callbacks, live chat, safeguarding alerts | User support |
| Peer supporters | Limited user profiles | Peer matching |

---

## 6. Data Retention Schedule

| Data Category | Retention Period | Trigger for Deletion | Notes |
|---------------|------------------|---------------------|-------|
| User accounts | Account lifetime + 7 years | User deletion request | Required for safeguarding audit trail |
| Chat sessions | 7 years | Automatic cleanup | May contain safeguarding evidence |
| Safeguarding alerts | 7 years | Automatic cleanup | Regulatory requirement |
| Callback requests | 90 days after resolution | Automatic cleanup | |
| Session tokens | Session end + 24 hours | Automatic | |
| Rate limit data | 24 hours | Automatic | |
| Audit logs | 7 years | Automatic cleanup | |

---

## 7. Security Measures (Article 32)

### Technical Measures
- ✅ AES-256 encryption for sensitive fields
- ✅ bcrypt password hashing (cost factor 12)
- ✅ JWT authentication with expiration
- ✅ HTTPS enforced
- ✅ Rate limiting on AI endpoints
- ✅ IP-based bot protection

### Organizational Measures
- ✅ Role-based access control (admin, staff, user)
- ✅ Staff training on safeguarding protocols
- ✅ Regular security reviews (See: [SECURITY_REVIEW_SCHEDULE.md](./SECURITY_REVIEW_SCHEDULE.md))
- ✅ Incident response plan (See: [INCIDENT_RESPONSE_PLAN.md](./INCIDENT_RESPONSE_PLAN.md))

---

## 8. Data Subject Rights Implementation

| Right | Article | Implementation | Status |
|-------|---------|----------------|--------|
| **Access** | 15 | `GET /api/auth/my-data/export` | ✅ Implemented |
| **Rectification** | 16 | Profile edit endpoints | ✅ Implemented |
| **Erasure** | 17 | `DELETE /api/auth/me` | ✅ Implemented |
| **Restriction** | 18 | Contact privacy@radiocheck.me | Manual process |
| **Portability** | 20 | `GET /api/auth/my-data/export` (JSON) | ✅ Implemented |
| **Object** | 21 | Contact privacy@radiocheck.me | Manual process |
| **Automated decisions** | 22 | Safeguarding has human review | ✅ Implemented |

---

## 9. Special Considerations

### 9.1 Safeguarding Override
Users cannot opt-out of crisis detection processing as it operates under:
- Article 6(1)(d): Vital interests of the data subject
- Article 9(2)(c): Necessary to protect vital interests where subject is incapable of giving consent

### 9.2 Children's Data
- App is intended for adults (veterans/family)
- No intentional collection of data from under-18s
- Age verification recommended at registration

### 9.3 Health Data Protection
- Mental health conversations are Special Category Data
- Additional safeguards implemented:
  - Encryption at rest
  - Access logging
  - Limited staff access
  - Clear retention policies

---

## 10. Review Schedule

| Activity | Frequency | Last Review | Next Review |
|----------|-----------|-------------|-------------|
| ROPA update | Quarterly | Feb 2026 | May 2026 |
| Security review | Annual | - | - |
| DPA verification | Annual | - | - |
| Retention cleanup | Automated | Continuous | Continuous |
| Staff training | Annual | - | - |

---

## 11. Document Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | Feb 2026 | E1 Agent | Initial creation |

---

*This ROPA should be reviewed and updated whenever processing activities change.*
