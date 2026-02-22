# Security Review Schedule & Procedures
## Radio Check - UK Veterans Support Application
**Version:** 1.0
**Last Updated:** February 2026

---

## 1. Overview

This document outlines the regular security review schedule for Radio Check, ensuring ongoing protection of user data and compliance with GDPR Article 32 (security of processing).

---

## 2. Review Types

### 2.1 Automated Security Reviews

**Frequency:** Weekly (triggered via API)
**Endpoint:** `GET /api/compliance/security/automated-review`

**Checks Performed:**
| Check | Category | Severity |
|-------|----------|----------|
| Password hashing | Authentication | High |
| JWT token expiration | Authentication | Medium |
| Rate limiting | API Security | Medium |
| Field-level encryption | Encryption | High |
| CORS configuration | API Security | Low |
| Audit logging | Compliance | Medium |
| Crisis detection | Safeguarding | Critical |

**Process:**
1. Admin triggers review via Admin Portal or API
2. System performs automated checks
3. Results stored in `security_reviews` collection
4. Dashboard updated with status
5. Alerts generated for failures

### 2.2 Manual Security Reviews

**Frequency:** Monthly

**Checklist:**
- [ ] Review access control configurations
- [ ] Audit admin account activity
- [ ] Check for unused staff accounts
- [ ] Review API rate limiting effectiveness
- [ ] Verify encryption key rotation schedule
- [ ] Review third-party integrations
- [ ] Check SSL/TLS certificate expiry
- [ ] Review firewall rules
- [ ] Audit database access patterns

### 2.3 Penetration Testing

**Frequency:** Annually (minimum)

**Scope:**
- External penetration test
- Web application security assessment
- API security testing
- Mobile application testing

**Recommended Providers:**
- NCSC-certified penetration testing companies
- CHECK-approved testers

### 2.4 Code Security Reviews

**Frequency:** Per release

**Checks:**
- Dependency vulnerability scanning (npm audit, pip-audit)
- Static code analysis
- Secrets detection
- OWASP Top 10 compliance

---

## 3. Annual Security Calendar

| Month | Activity | Responsible |
|-------|----------|-------------|
| January | Annual penetration test | External |
| February | Q1 policy review | DPO |
| March | Staff security training | All staff |
| April | Dependency audit | Tech Lead |
| May | Q2 policy review | DPO |
| June | Incident response drill | Security Team |
| July | Third-party vendor review | DPO |
| August | Q3 policy review | DPO |
| September | Staff security refresher | All staff |
| October | Encryption review | Tech Lead |
| November | Q4 policy review | DPO |
| December | Annual security report | DPO + Tech Lead |

---

## 4. Vulnerability Management

### 4.1 Severity Classification

| Severity | Response Time | Examples |
|----------|---------------|----------|
| Critical | 24 hours | RCE, SQL injection, active exploit |
| High | 72 hours | Authentication bypass, XSS with data exposure |
| Medium | 7 days | Session issues, minor XSS |
| Low | 30 days | Information disclosure, missing headers |

### 4.2 Response Process

1. **Detection:** Automated scanning, reports, or discovery
2. **Triage:** Assign severity and owner
3. **Fix:** Develop and test patch
4. **Deploy:** Release with monitoring
5. **Verify:** Confirm fix effective
6. **Document:** Update security register

---

## 5. Security Metrics

### Key Performance Indicators (KPIs)

| Metric | Target | Measured By |
|--------|--------|-------------|
| Time to patch critical vulnerabilities | < 24 hours | Incident logs |
| Automated review pass rate | > 90% | Review reports |
| Staff security training completion | 100% | HR records |
| Mean time to detect incidents | < 1 hour | Monitoring logs |
| Failed login attempt rate | < 5% | Auth logs |
| API rate limit triggers | Baseline + 10% | Rate limit logs |

---

## 6. Compliance Mapping

| Requirement | Standard | Evidence |
|-------------|----------|----------|
| Security of processing | GDPR Art. 32 | Security reviews |
| Data breach notification | GDPR Art. 33 | Incident response plan |
| Encryption | GDPR Art. 32 | Encryption audit |
| Access control | GDPR Art. 25 | RBAC review |
| Regular testing | GDPR Art. 32 | Pen test reports |

---

## 7. Tools & Resources

### Automated Scanning
- npm audit (frontend dependencies)
- pip-audit (Python dependencies)
- OWASP ZAP (web application scanning)
- Trivy (container scanning)

### Monitoring
- Application logs
- Audit trail
- Rate limit monitoring
- Error tracking

### Documentation
- `/app/docs/compliance/` - Compliance documents
- `/app/docs/compliance/INCIDENT_RESPONSE_PLAN.md` - Incident procedures
- `/app/docs/compliance/ROPA.md` - Processing records

---

## 8. Review Checklist Template

```markdown
## Security Review: [Date]
**Reviewer:** [Name]
**Type:** [Automated/Manual/Annual]

### Authentication
- [ ] Password policy enforced
- [ ] JWT tokens expiring correctly
- [ ] Failed login monitoring active
- [ ] MFA status (if applicable)

### Encryption
- [ ] AES-256 encryption active
- [ ] Keys rotated (if due)
- [ ] HTTPS enforced
- [ ] Database encryption verified

### Access Control
- [ ] RBAC functioning correctly
- [ ] Admin accounts audited
- [ ] Unused accounts disabled
- [ ] API authentication verified

### Safeguarding
- [ ] Crisis detection active
- [ ] Alert system functioning
- [ ] Staff notification working
- [ ] Emergency contacts up to date

### Compliance
- [ ] Audit logging active
- [ ] Data retention policies applied
- [ ] Privacy policy current
- [ ] ROPA updated

### Findings
| Finding | Severity | Action Required | Owner | Due Date |
|---------|----------|-----------------|-------|----------|
| | | | | |

### Sign-off
- Reviewer: _______________
- Date: _______________
```

---

## 9. Document Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | Feb 2026 | E1 Agent | Initial creation |

---

*This document should be reviewed quarterly and updated as security requirements evolve.*
