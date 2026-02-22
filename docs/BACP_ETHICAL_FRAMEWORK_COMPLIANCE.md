# BACP Ethical Framework Compliance Guide
## Radio Check - UK Veterans Support Application
**Last Updated:** February 2026

---

## Overview

The British Association for Counselling and Psychotherapy (BACP) Ethical Framework provides the professional standards that counsellors and psychotherapists in the UK must follow. While Radio Check is primarily a peer support app with AI assistance (not professional therapy), we commit to aligning with BACP principles where applicable.

---

## BACP Core Ethical Principles

### 1. Being Trustworthy (Fidelity)

**BACP Requirement:** Honoring the trust placed in the practitioner

**Radio Check Implementation:**
- ✅ Clear distinction between AI chat and human support
- ✅ AI characters never claim to be human professionals
- ✅ All AI prompts include statements like "I'm not a trained counsellor"
- ✅ Encryption of sensitive data (AES-256)
- ✅ Privacy policy clearly stating data handling
- ⚠️ **Action Required:** Add explicit "AI Disclosure" banner before chat sessions

**Code Implementation:**
```javascript
// Before AI chat begins, show notice:
"You're about to chat with [Character Name], an AI companion. 
While they can offer support and a listening ear, they are not 
a trained counsellor. For professional help, use our 'Talk to 
a Real Person' feature."
```

---

### 2. Autonomy

**BACP Requirement:** Respect for the client's right to be self-governing

**Radio Check Implementation:**
- ✅ Users choose which AI character to talk to
- ✅ Users can end conversations at any time
- ✅ Clear buttons to access human support
- ✅ Self-service account deletion (`DELETE /api/auth/me`)
- ✅ Data export available (`GET /api/auth/my-data/export`)
- ✅ Buddy Finder requires explicit opt-in consent

**Recommendations:**
- Add conversation history download option
- Allow users to clear AI chat history independently
- Provide "pause" option for ongoing safeguarding monitoring

---

### 3. Beneficence (Commitment to Promoting Client's Wellbeing)

**BACP Requirement:** Acting in the client's best interests

**Radio Check Implementation:**
- ✅ 7 diverse AI personas for different needs (Tommy, Doris, Bob, etc.)
- ✅ Knowledge Base providing accurate UK veteran information
- ✅ Crisis resources prominently displayed
- ✅ Substance support character (Margie) with specialized prompts
- ✅ Safeguarding system to detect and escalate crises

**Character-Specific Wellbeing Focus:**
| Character | Wellbeing Focus |
|-----------|-----------------|
| Tommy | Battle buddy, peer understanding |
| Doris | Nurturing, emotional support |
| Hugo | Self-help, wellness, daily habits |
| Finch | Crisis support, PTSD awareness |
| Bob | Honest peer support, relatability |
| Margie | Substance support, recovery |
| Rita | Family support for loved ones |

---

### 4. Non-Maleficence (Avoiding Harm)

**BACP Requirement:** Commitment to avoiding harm to the client

**Radio Check Implementation:**
- ✅ Safeguarding system with RED/AMBER/YELLOW/GREEN risk levels
- ✅ Automatic escalation for suicidal ideation
- ✅ Rate limiting to prevent AI over-reliance (max 50 messages/session)
- ✅ Session limits encourage human connection
- ✅ Crisis helplines prominently displayed
- ✅ AI prompts include harm reduction responses

**Safeguarding Triggers:**
- Suicide/self-harm keywords → RED alert + immediate resources
- Crisis indicators → AMBER alert + staff notification
- Distress signals → YELLOW alert + monitoring
- General support → GREEN (normal operation)

**AI Harm Reduction in Prompts:**
```
All AI characters are instructed to:
- Never minimize feelings of distress
- Always suggest professional help for clinical issues
- Never provide medical/psychiatric advice
- Redirect to crisis lines when appropriate
- Never encourage harmful behaviors
- Maintain appropriate boundaries
```

---

### 5. Justice

**BACP Requirement:** Fair and impartial treatment of all clients

**Radio Check Implementation:**
- ✅ Service available to all UK veterans regardless of:
  - Service branch
  - Length of service
  - Nature of discharge
  - Current circumstances
- ✅ Free to use (no paywalled support)
- ✅ Anonymous usage option available
- ✅ Accessible design (considering disabilities)

**Recommendations:**
- Add accessibility features (screen reader support, high contrast)
- Consider Welsh language support
- Add content for underrepresented veteran groups

---

### 6. Self-Respect (Practitioner Self-Care)

**BACP Requirement:** Practitioners should foster their own self-knowledge and care

**Radio Check Implementation (for Human Staff):**
- ✅ Staff shift management system
- ✅ Clear boundaries on working hours
- ⚠️ **Action Required:** Add staff wellbeing resources
- ⚠️ **Action Required:** Implement debrief system after difficult cases

**Recommendations for Staff Portal:**
- Add "How are you feeling?" check-in for staff
- Provide supervision request feature
- Track exposure to difficult content
- Mandatory breaks after safeguarding alerts

---

## Confidentiality Standards

### BACP Confidentiality Requirements:
1. Clear confidentiality policy
2. Limitations to confidentiality explained
3. Record keeping standards
4. Data protection compliance

### Radio Check Implementation:

**1. Confidentiality Policy ✅**
- Privacy policy at `/website/privacy.html`
- Covers data collection, usage, retention
- Contact: privacy@radiocheck.me

**2. Limitations Explained ✅**
- Safeguarding override clearly stated
- Crisis situations may require disclosure
- Staff supervision may involve case discussion

**Recommended Disclosure Text:**
```
"Confidentiality: Your conversations are private and secure. 
However, if we believe you or someone else is at immediate 
risk of harm, we may need to share information with 
emergency services or our safeguarding team."
```

**3. Record Keeping ✅**
- Chat sessions stored with encryption
- 7-year retention for safeguarding compliance
- Audit trail for data access
- User can export own data

**4. Data Protection ✅**
- GDPR compliant (see GDPR_AUDIT_REPORT.md)
- ICO registration to be verified
- Data Processing Agreements with processors

---

## Boundaries and Dual Relationships

### BACP Requirement:
Maintain appropriate boundaries to protect both client and practitioner

### Radio Check Implementation:

**AI Characters:**
- ✅ AI never forms personal relationships
- ✅ AI cannot be contacted outside the app
- ✅ AI clearly states limitations
- ✅ Session limits prevent over-dependency

**Human Staff:**
- ⚠️ Staff should not connect with users on personal social media
- ⚠️ Staff training needed on boundary maintenance
- ⚠️ Protocol needed for when users request personal contact

**Recommendations:**
- Add staff code of conduct to Staff Portal
- Implement "professional boundaries" training module
- Create escalation path for boundary violations

---

## Competence

### BACP Requirement:
Only practice within areas of competence

### Radio Check Implementation:

**AI Characters:**
- ✅ AI explicitly states it's not a counsellor
- ✅ AI redirects clinical questions to professionals
- ✅ AI does not diagnose conditions
- ✅ AI does not prescribe treatments
- ✅ Knowledge Base provides factual info only

**Human Staff:**
- ⚠️ Verify staff qualifications before onboarding
- ⚠️ Define scope of practice for peer supporters vs counsellors
- ⚠️ Supervision requirements for counselling staff

**Competence Boundaries Table:**
| Topic | AI Can | AI Cannot |
|-------|--------|-----------|
| Emotional support | ✅ | |
| Signposting to services | ✅ | |
| Grounding techniques | ✅ | |
| Diagnosis | | ❌ |
| Medication advice | | ❌ |
| Therapy/treatment | | ❌ |
| Legal advice | | ❌ |

---

## Informed Consent

### BACP Requirement:
Clients must give informed consent to the therapeutic process

### Radio Check Implementation:

**Before AI Chat:**
- ⚠️ **Action Required:** Add consent screen explaining:
  - AI nature of the conversation
  - Data processing (including OpenAI)
  - Safeguarding monitoring
  - Limitations of AI support
  - How to access human support

**Buddy Finder:**
- ✅ Explicit GDPR consent required
- ✅ Profile visibility opt-in
- ✅ Can withdraw anytime

**Recommended Consent Flow:**
```
1. User opens AI chat
2. First-time consent screen appears
3. User must acknowledge:
   [ ] I understand this is an AI, not a trained counsellor
   [ ] I understand my messages are processed to provide support
   [ ] I understand crisis situations may be escalated
   [ ] I can access human support anytime via the app
4. Consent stored: ai_chat_consent: true, consent_date: timestamp
```

---

## Complaints and Feedback

### BACP Requirement:
Clear complaints procedure for clients

### Radio Check Implementation:

**Current:**
- ✅ Contact email: privacy@radiocheck.me
- ✅ ICO complaint reference in privacy policy
- ✅ AI feedback system (`/api/ai-feedback`)

**Recommendations:**
- Add in-app "Report an Issue" button
- Create formal complaints procedure document
- Log complaints with response times
- Regular review of complaints for service improvement

---

## Supervision

### BACP Requirement:
Practitioners should receive appropriate supervision

### Radio Check Implementation for Human Staff:

**Current:**
- ⚠️ No formal supervision system in app

**Recommendations:**
- Add "Request Supervision" feature in Staff Portal
- Track difficult cases for supervision discussion
- Implement peer support sessions for staff
- Monthly case review meetings (tracked in system)

---

## Implementation Checklist

### P0 - Critical (Implement Now)
- [ ] Add AI disclosure banner before chat sessions
- [ ] Implement first-time AI chat consent flow
- [ ] Add "Limitations" text to all AI characters
- [ ] Document staff competence requirements

### P1 - High Priority (30 days)
- [ ] Staff wellbeing check-in feature
- [ ] Boundary training module for staff
- [ ] In-app complaints/feedback button
- [ ] Accessibility review (screen readers, contrast)

### P2 - Medium Priority (90 days)
- [ ] Staff supervision request system
- [ ] Case tracking for supervision
- [ ] Staff exposure monitoring
- [ ] Formal complaints procedure

### P3 - Ongoing
- [ ] Regular ethical framework reviews
- [ ] Staff training updates
- [ ] Service user feedback integration
- [ ] BACP guidance monitoring for updates

---

## References

- BACP Ethical Framework for the Counselling Professions (2018)
- BACP Good Practice in Action resources
- ICO GDPR Guidance
- NHS England Digital First guidance

---

## Document Control

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | Feb 2026 | Initial creation |

*This document should be reviewed quarterly and updated when BACP guidance changes.*
