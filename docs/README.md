# Radio Check Documentation

## Directory Structure

```
docs/
├── README.md                           # This file
├── deployment/                         # Server and hosting guides
│   ├── DEPLOYMENT_20I.md              # 20i hosting setup
│   ├── DEPLOYMENT_INSTRUCTIONS.md     # General deployment
│   ├── DEPLOYMENT_READINESS_REPORT.md # Pre-deployment checklist
│   ├── FREESWITCH_SETUP.md           # VoIP setup (future)
│   ├── PRODUCTION_CLEANUP.md         # Database cleanup scripts
│   ├── PRODUCTION_CONFIG.md          # Environment variables
│   └── SHARED_HOSTING_DEPLOYMENT.md  # Shared hosting options
├── compliance/                         # Regulatory compliance
│   ├── GDPR_AUDIT_REPORT.md          # GDPR assessment
│   ├── ROPA.md                        # Record of Processing Activities
│   ├── BACP_ETHICAL_FRAMEWORK_COMPLIANCE.md # Counselling ethics
│   └── SAFEGUARDING_DISCLAIMER.md    # Crisis response protocols
├── guides/                             # How-to guides
│   ├── AI_COMPANIONS_GUIDE.md        # AI character documentation
│   ├── AI_TESTING_STRATEGY.md        # Automated testing for AI
│   ├── DEVELOPER_GUIDE.md            # Development setup
│   ├── FEATURE_LIST.md               # Feature inventory
│   └── PROMPT_IMPROVEMENT_WORKFLOW.md # Improving AI prompts
├── ATTRIBUTION.md                      # Credits and licenses
├── CLIENT_SUMMARY.md                   # Non-technical overview
├── MVP_READINESS.md                    # MVP status checklist
└── PROJECT_SUMMARY_REPORT.md          # Comprehensive project report
```

## Quick Reference

### For Developers
- Start with [DEVELOPER_GUIDE.md](guides/DEVELOPER_GUIDE.md)
- Review [Backend Architecture](/backend/ARCHITECTURE.md)
- Check [Feature List](guides/FEATURE_LIST.md)

### For Deployment
- Production: [PRODUCTION_CONFIG.md](deployment/PRODUCTION_CONFIG.md)
- Database cleanup: [PRODUCTION_CLEANUP.md](deployment/PRODUCTION_CLEANUP.md)
- Hosting options in `deployment/` folder

### For Compliance
- GDPR: [GDPR_AUDIT_REPORT.md](compliance/GDPR_AUDIT_REPORT.md) + [ROPA.md](compliance/ROPA.md)
- Ethics: [BACP_ETHICAL_FRAMEWORK_COMPLIANCE.md](compliance/BACP_ETHICAL_FRAMEWORK_COMPLIANCE.md)
- Crisis: [SAFEGUARDING_DISCLAIMER.md](compliance/SAFEGUARDING_DISCLAIMER.md)

### For AI Management
- Character guide: [AI_COMPANIONS_GUIDE.md](guides/AI_COMPANIONS_GUIDE.md)
- Testing: [AI_TESTING_STRATEGY.md](guides/AI_TESTING_STRATEGY.md)
- Improvement: [PROMPT_IMPROVEMENT_WORKFLOW.md](guides/PROMPT_IMPROVEMENT_WORKFLOW.md)

## Related Documentation

- `/memory/PRD.md` - Product Requirements Document (main planning doc)
- `/backend/ARCHITECTURE.md` - API router structure
- `/admin-site/DEPLOYMENT_GUIDE.md` - Admin portal deployment
- `/admin-site/DEVELOPER_BRIEFING.md` - Admin portal tech brief
