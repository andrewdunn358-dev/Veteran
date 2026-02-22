# Safeguarding Disclaimer

**Veterans Support Application**

*Last updated: February 2026*

---

## Purpose of This Document

This disclaimer sets out the responsibilities, limitations, and liabilities associated with the AI chatbot and safeguarding features in this application.

**This document must be read and understood by all personnel involved in operating, maintaining, or overseeing this service before it goes live with real users.**

---

## What This Application Is

This application provides:

- An AI-powered chat companion designed to offer a supportive, non-judgmental space for UK military veterans
- Automated risk detection that flags potentially concerning messages for human review
- A pathway to connect users with trained peer supporters and counsellors
- Links to established crisis services and helplines

---

## What This Application Is NOT

This application is **not**:

- A regulated mental health service
- A clinically validated diagnostic tool
- A replacement for professional mental health treatment
- A crisis service
- A substitute for emergency services (999)

**Do not describe this service as clinically validated, medically approved, or as a substitute for professional care.**

---

## Safeguarding Responsibilities

### Organisation Responsibilities

The organisation operating this service **must**:

1. **Designate a Safeguarding Lead** — a named individual responsible for safeguarding policy and escalation decisions

2. **Maintain human oversight** — all AI-flagged alerts must be reviewed by trained staff; automated systems do not replace human judgment

3. **Establish escalation procedures** — clear, documented procedures for what happens when risk is detected, including out-of-hours protocols

4. **Train all staff** — peer supporters and counsellors must complete safeguarding training appropriate to their role before using this system

5. **Document everything** — maintain records of safeguarding incidents, decisions made, and follow-up actions taken

6. **Review regularly** — safeguarding policy and AI detection thresholds should be reviewed at least annually

7. **Verify crisis resources** — check that all helpline numbers are current at least every 6 months

### Staff Responsibilities

Staff using the safeguarding features **must**:

1. **Respond promptly** to safeguarding alerts — do not ignore or dismiss alerts
2. **Follow escalation procedures** — if in doubt, escalate
3. **Document actions taken** — record decisions and rationale in the notes system
4. **Never promise confidentiality** in situations of serious risk
5. **Know the limits of their role** — refer to appropriate services when needed

---

## Limitations of AI Risk Detection

The AI safety monitoring system has known limitations:

### What It Can Do
- Detect many common phrases associated with suicidal ideation and self-harm
- Flag messages for human review based on keyword patterns
- Distinguish between affirmed and negated statements (e.g., "I want to die" vs "I don't want to die")
- Escalate risk levels based on context (substances, isolation, means)

### What It Cannot Do
- Understand context with human-level accuracy
- Detect novel or unusual phrasing
- Understand slang, code-switching, or non-English input reliably
- Replace professional clinical assessment
- Guarantee that all risk will be detected

### Fail-Safe Behaviour
The system is designed to **fail safe** — if the detection system encounters an error, it will assume HIGH risk rather than dismissing the message. This means:

- Some messages may be flagged unnecessarily (false positives)
- Human review is essential to assess flagged messages appropriately

---

## Data Protection and Privacy

This application processes sensitive personal data, including:

- Mental health-related conversation content
- Contact information
- Location data (via IP geolocation for safeguarding purposes)

All such data is subject to UK GDPR requirements. See `DATA_AND_PRIVACY.md` and `DEVELOPER_GUIDE.md` for technical implementation details.

Key points:
- Conversation content is **encrypted at rest**
- Users have the right to request deletion of their data
- Data retention policies must be documented and followed
- A Data Processing Agreement (DPA) should be in place with any third-party processors (e.g., OpenAI, hosting providers)

---

## Liability

### No Clinical Warranty
This software is provided "as is" without warranty of any kind, express or implied. The AI features are not clinically validated and should not be relied upon as the sole means of identifying risk.

### Organisational Liability
The organisation deploying this software is responsible for:
- Ensuring appropriate safeguarding policies are in place
- Training and supervising staff
- Responding appropriately to safeguarding alerts
- Compliance with applicable laws and regulations

### Software Provider Liability
The developers of this software are not liable for:
- Failures of the AI detection system to identify risk
- Decisions made by staff using this system
- Harm arising from use or misuse of this software
- Clinical outcomes for users of this service

---

## Crisis Services

This application directs users in crisis to established support services. For the UK, these include:

| Service | Contact | Hours |
|---------|---------|-------|
| **Emergency Services** | 999 | 24/7 |
| **Samaritans** | 116 123 | 24/7 |
| **Combat Stress** | 0800 138 1619 | 24/7 |
| **Veterans Gateway** | 0808 802 1212 | 24/7 |
| **Crisis Text Line** | Text SHOUT to 85258 | 24/7 |

**Staff should be familiar with these services and know how to direct users to them.**

---

## Before Going Live

Ensure the following checklist is complete:

- [ ] Safeguarding Lead designated and documented
- [ ] Escalation procedures written and approved
- [ ] All staff completed safeguarding training
- [ ] Crisis resource numbers verified as current
- [ ] Data protection documentation complete
- [ ] Privacy notice accessible to users
- [ ] Incident reporting process in place
- [ ] Out-of-hours coverage arranged
- [ ] AI detection thresholds reviewed and appropriate
- [ ] Legal review completed

---

## Review Schedule

This disclaimer and associated safeguarding policies should be reviewed:

- **Annually** as a minimum
- **After any safeguarding incident**
- **When legislation or guidance changes**
- **When significant changes are made to the AI system**

---

## Attribution

The AI safety layer in this application is adapted from the **Veteran AI Safety Layer** by Zentrafuge, available at:

https://github.com/TheAIOldtimer/veteran-ai-safety-layer

Used under MIT License with attribution.

---

*This document is guidance and does not constitute legal advice. The organisation is responsible for ensuring compliance with all applicable laws, regulations, and professional standards.*
