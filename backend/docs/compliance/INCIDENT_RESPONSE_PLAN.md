# Incident Response Plan
## Radio Check - UK Veterans Support Application
**Version:** 1.0
**Last Updated:** February 2026
**Document Owner:** Data Protection Officer

---

## 1. Purpose

This Incident Response Plan outlines the procedures to be followed when a security incident or data breach occurs at Radio Check. It ensures compliance with GDPR Article 33 (notification of personal data breach to supervisory authority) and Article 34 (communication of personal data breach to data subject).

---

## 2. Scope

This plan covers all types of security incidents including but not limited to:
- Personal data breaches
- Unauthorized access to systems
- Malware infections
- Denial of service attacks
- Lost or stolen devices containing data
- Accidental data disclosure
- Safeguarding failures

---

## 3. Incident Severity Levels

| Level | Description | Response Time | Escalation |
|-------|-------------|---------------|------------|
| **CRITICAL** | Active data breach, safeguarding failure, system compromise | Immediate | CEO, DPO, Legal |
| **HIGH** | Potential data exposure, security vulnerability exploited | Within 1 hour | DPO, Tech Lead |
| **MEDIUM** | Suspicious activity, minor security issue | Within 4 hours | Tech Lead |
| **LOW** | Informational, potential threat | Within 24 hours | Security Team |

---

## 4. Incident Response Team

### 4.1 Core Team

| Role | Responsibilities | Contact |
|------|------------------|---------|
| **Incident Manager** | Overall coordination, decision making | [To be assigned] |
| **Data Protection Officer** | GDPR compliance, ICO notification | privacy@radiocheck.me |
| **Technical Lead** | System investigation, containment | [To be assigned] |
| **Communications Lead** | User notification, PR | [To be assigned] |
| **Legal Advisor** | Legal implications, regulatory liaison | [To be assigned] |

### 4.2 Extended Team (as needed)
- External security consultants
- Law enforcement liaison
- Insurance provider

---

## 5. Incident Response Phases

### Phase 1: Detection & Identification

**Objective:** Identify and confirm the incident

**Actions:**
1. Receive and log incident report via:
   - Automated monitoring alerts
   - Staff reports
   - User complaints
   - External notification

2. Initial assessment:
   - What happened?
   - When did it happen?
   - What systems/data affected?
   - Is it ongoing?

3. Assign severity level

4. Activate response team if MEDIUM or above

**Documentation Required:**
- Incident ID
- Date/time detected
- How detected
- Initial description
- Systems affected
- Data types potentially compromised

### Phase 2: Containment

**Objective:** Limit the damage and prevent further harm

**Immediate Actions (within 1 hour for CRITICAL/HIGH):**

1. **System Isolation**
   - Disconnect affected systems if necessary
   - Block suspicious IP addresses
   - Revoke compromised credentials
   - Enable additional logging

2. **Evidence Preservation**
   - Take system snapshots
   - Preserve logs
   - Document all actions taken
   - Maintain chain of custody

3. **Short-term Containment**
   - Apply emergency patches
   - Change passwords
   - Implement additional access controls

**Do NOT:**
- Destroy evidence
- Communicate externally without authorization
- Make public statements
- Attempt to "hack back"

### Phase 3: Eradication

**Objective:** Remove the threat and vulnerabilities

**Actions:**
1. Identify root cause
2. Remove malware/unauthorized access
3. Patch vulnerabilities
4. Update security controls
5. Reset compromised accounts
6. Verify clean systems

### Phase 4: Recovery

**Objective:** Restore normal operations

**Actions:**
1. Restore from clean backups if needed
2. Verify system integrity
3. Monitor for signs of recurrence
4. Gradual return to normal operations
5. Confirm no data loss

### Phase 5: Post-Incident Review

**Objective:** Learn from the incident

**Within 7 days:**
1. Complete incident timeline
2. Root cause analysis
3. Lessons learned documentation
4. Update security procedures
5. Staff debrief

---

## 6. GDPR Notification Requirements

### 6.1 ICO Notification (Article 33)

**Deadline:** Within 72 hours of becoming aware

**Required if:**
- Personal data breach has occurred
- Risk to individuals' rights and freedoms

**Not required if:**
- Breach unlikely to result in risk to individuals
- Data was encrypted/pseudonymized and key not compromised

**Notification must include:**
1. Nature of breach (categories of data, number of subjects)
2. DPO contact details
3. Likely consequences
4. Measures taken/proposed

**ICO Contact:**
- Website: https://ico.org.uk/make-a-complaint/data-protection-complaints/data-protection-complaints/
- Phone: 0303 123 1113
- Online form: https://ico.org.uk/for-organisations/report-a-breach/

### 6.2 User Notification (Article 34)

**Required if:**
- High risk to individuals' rights and freedoms
- Cannot be mitigated

**Not required if:**
- Encryption made data unintelligible
- Subsequent measures eliminated risk
- Would require disproportionate effort (public communication instead)

**Communication must be:**
- In clear, plain language
- Direct (email, app notification)
- Timely

**Template:**
```
Subject: Important Security Notice from Radio Check

Dear [User],

We are writing to inform you of a data security incident that may affect your personal information.

What Happened:
[Brief description]

What Information Was Involved:
[List data types]

What We Are Doing:
[Actions taken]

What You Can Do:
[Recommended actions]

Contact Us:
privacy@radiocheck.me

We apologize for any concern this may cause.

Radio Check Team
```

---

## 7. Special Considerations for Safeguarding Incidents

Given Radio Check handles mental health data, safeguarding incidents require special handling:

### Safeguarding System Failure
If the crisis detection system fails:
1. **Immediate:** Manual review of recent high-risk conversations
2. **Within 4 hours:** Contact any users who sent crisis messages
3. **Documentation:** Full audit trail of system downtime

### Unauthorized Access to Mental Health Data
1. **Assess:** Which conversations were accessed
2. **Identify:** Any crisis/suicidal content exposed
3. **Action:** Consider notifying emergency services if vulnerable users identified
4. **Support:** Offer affected users immediate counselling support

---

## 8. Communication Templates

### 8.1 Internal Alert (Staff)
```
SECURITY INCIDENT ALERT

Severity: [LEVEL]
Incident ID: [ID]
Time: [TIMESTAMP]

Summary:
[Brief description]

Action Required:
- [Specific instructions]

DO NOT:
- Discuss externally
- Post on social media
- Speculate

Updates: [Channel/Frequency]
```

### 8.2 Initial Press Statement (if needed)
```
Radio Check is aware of a security incident affecting [brief description]. 
We have initiated our incident response procedures and are working to 
resolve the situation. We are committed to protecting our users' privacy 
and will provide updates as appropriate.

For urgent queries: press@radiocheck.me
```

---

## 9. Documentation & Evidence

### Required Documentation:
- Incident log (timeline of all events)
- System logs and screenshots
- Communications (internal and external)
- Decisions made and rationale
- Containment and recovery actions
- ICO notifications and responses
- User communications

### Evidence Retention:
- All incident documentation: 7 years minimum
- System logs: As available at time of incident
- Communications: Indefinitely for legal purposes

---

## 10. Testing & Training

### Annual Testing:
- Tabletop exercises (quarterly)
- Technical drills (bi-annually)
- Full simulation (annually)

### Training Requirements:
- All staff: Annual incident awareness training
- Response team: Quarterly technical training
- New starters: Induction includes incident procedures

---

## 11. Post-Incident Checklist

- [ ] Incident fully resolved
- [ ] Root cause identified
- [ ] ICO notified (if required)
- [ ] Users notified (if required)
- [ ] Evidence preserved
- [ ] Incident report completed
- [ ] Lessons learned documented
- [ ] Procedures updated
- [ ] Staff debriefed
- [ ] Monitoring enhanced
- [ ] Follow-up date scheduled

---

## 12. Contact Information

| Contact | Details |
|---------|---------|
| Internal Security | security@radiocheck.me |
| Data Protection | privacy@radiocheck.me |
| ICO Helpline | 0303 123 1113 |
| Police (non-emergency) | 101 |
| Emergency | 999 |
| NCSC (cyber) | https://www.ncsc.gov.uk/information/report-a-cyber-incident |

---

## 13. Document Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | Feb 2026 | E1 Agent | Initial creation |

---

## 14. Approval

| Role | Name | Signature | Date |
|------|------|-----------|------|
| CEO | | | |
| DPO | | | |
| Tech Lead | | | |

---

*This document should be reviewed and updated annually, or following any significant incident.*
