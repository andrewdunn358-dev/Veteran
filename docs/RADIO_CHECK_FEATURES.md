# Radio Check - Complete Feature Documentation

## Version 2.1 | December 2025

---

## Overview

Radio Check is a comprehensive mental health and peer support platform for UK military veterans. This document outlines all features across the three main components:

1. **User Application** - Veteran-facing mobile and web app
2. **Staff Portal** - Support staff interface
3. **Admin Portal** - Administrative management system
4. **Governance System** - Clinical safety & compliance infrastructure

---

## User Application Features

### Core Navigation

| Feature | Description | Status |
|---------|-------------|--------|
| **Home Dashboard** | Central hub with quick access to all features | ✅ Live |
| **Settings** | User preferences and account management | ✅ Live |
| **Emergency Banner** | 999 reminder always visible | ✅ Live |

### Support Features

#### Need to Talk? (Crisis Support)
- **One-tap access** to immediate support
- **Clear choice**: Call a Supporter or Chat
- **Staff availability indicator** - shows if human support is online
- **Fallback to AI** when staff unavailable
- **Anonymous access** - no registration required

#### Talk to a Veteran
- **Peer supporter directory** with profiles
- **Direct call** to available supporters
- **Live chat** option
- **Status indicators** - See who's available

#### AI Companions (Buddies)
- **Multiple personas** with distinct personalities
- **24/7 availability** - always someone to talk to
- **Conversation continuity** - remembers context
- **Safety monitoring** - AI conversations are monitored
- **Warm handoff** - escalation to humans when needed

Current AI Personas:
| Name | Personality | Use Case |
|------|-------------|----------|
| **Reggie** | Pragmatic RAF veteran | General support |
| **Tommy** | Compassionate Army vet | Emotional support |
| **Chalky** | Straight-talking Royal Marine | Direct advice |
| **Jenny** | Empathetic Navy veteran | Gentle support |
| **Dave** | Humorous Para | Light-hearted chat |

#### Warfare on Lawfare
- **Support for historical investigations** (NI veterans)
- **Legal resources** directory
- **Specialist support** connections

### Self-Care Tools

| Tool | Description | Status |
|------|-------------|--------|
| **Journal** | Private daily journaling | ✅ Live |
| **Breathing Exercises** | Guided 4-7-8 and box breathing | ✅ Live |
| **Grounding Techniques** | 5-4-3-2-1 sensory exercises | ✅ Live |
| **Mood Tracking** | Daily check-in scale 1-10 | ✅ Live |
| **Progress View** | Track mood trends over time | ✅ Live |

### Support Directory
- **Comprehensive listing** of veteran organizations
- **Category filtering** - Mental health, housing, employment
- **Contact details** - Phone, website, address
- **Quick actions** - One-tap call or visit website

### Friends & Family
- **Resources** for those worried about a veteran
- **Warning signs** education
- **How to help** guidance
- **Crisis contacts** quick access

### User Account Features
| Feature | Description | Status |
|---------|-------------|--------|
| **Anonymous Mode** | Use without registration | ✅ Live |
| **Account Creation** | Optional profile for history | ✅ Live |
| **Beta Survey** | Feedback collection | ✅ Live |
| **Settings** | Preferences management | ✅ Live |

### Age Gate System
| Feature | Description | Status |
|---------|-------------|--------|
| **DOB Collection** | First-time users enter date of birth | ✅ Live |
| **Local Storage** | DOB stored on device only (privacy) | ✅ Live |
| **Under-18 Detection** | Automatic age verification | ✅ Live |
| **Feature Restrictions** | Peer matching disabled for minors | ✅ Live |
| **Enhanced Safety** | 1.3x risk multiplier for under-18s | ✅ Live |
| **Info Screen** | Friendly explanation of restrictions | ✅ Live |

---

## Staff Portal Features

### Authentication
- **Secure login** with JWT tokens
- **Role-based access** - Counsellor, Peer, Admin
- **Auto-logout** for security
- **Session management**

### Dashboard

#### WebRTC Phone System
| Feature | Description | Status |
|---------|-------------|--------|
| **Status Toggle** | Available/Busy/Offline | ✅ Live |
| **Incoming Calls** | Visual + audio notification | ✅ Live |
| **Outgoing Calls** | Direct dial to users | ✅ Live |
| **Call Controls** | Mute, End call | ✅ Live |
| **Call Timer** | Duration tracking | ✅ Live |

#### Safeguarding Alerts
| Feature | Description | Status |
|---------|-------------|--------|
| **Real-time Alerts** | Instant notification when AI detects risk | ✅ Live |
| **Risk Levels** | RED/AMBER/YELLOW/GREEN classification | ✅ Live |
| **Trigger Display** | Shows which phrases triggered alert | ✅ Live |
| **Acknowledge** | Mark alert as seen | ✅ Live |
| **Direct Call** | One-click call to at-risk user | ✅ Live |
| **Resolve** | Close alert with notes | ✅ Live |
| **History** | View past alerts | ✅ Live |

#### Live Chat
| Feature | Description | Status |
|---------|-------------|--------|
| **Chat Requests** | See incoming chat requests | ✅ Live |
| **Accept/Decline** | Manage chat queue | ✅ Live |
| **Real-time Messaging** | Instant message delivery | ✅ Live |
| **Typing Indicators** | See when user is typing | ✅ Live |
| **Chat History** | Scrollable conversation | ✅ Live |
| **User Status** | Know when user disconnects | ✅ Live |
| **Escalate to Call** | Call user from chat | ✅ Live |

#### Callback Requests
| Feature | Description | Status |
|---------|-------------|--------|
| **Request Queue** | List of callback requests | ✅ Live |
| **User Details** | Name, contact info | ✅ Live |
| **One-click Call** | Initiate callback | ✅ Live |
| **Mark Complete** | Track completed callbacks | ✅ Live |

### Team Features
| Feature | Description | Status |
|---------|-------------|--------|
| **Online Staff** | See who's available | ✅ Live |
| **Staff Status** | Available/Busy indicators | ✅ Live |
| **Shift Info** | Current shift details | ✅ Live |

### Notes & Documentation
| Feature | Description | Status |
|---------|-------------|--------|
| **Session Notes** | Document conversations | ✅ Live |
| **User Notes** | Persistent user context | ✅ Live |
| **Safeguarding Notes** | Alert resolution notes | ✅ Live |

### Incident Reporting
| Feature | Description | Status |
|---------|-------------|--------|
| **Report Incident** | Staff can log safety incidents | ✅ Live |
| **Severity Levels** | Level 1/2/3 classification | ✅ Live |
| **Automatic Notification** | Email sent to CSO/Admin | ✅ Live |
| **Audit Trail** | All reports logged for compliance | ✅ Live |

---

## Admin Portal Features

### Dashboard Overview
| Metric | Description |
|--------|-------------|
| **Active Sessions** | Current live conversations |
| **Staff Online** | Available support staff |
| **Alerts Today** | Safeguarding events |
| **Total Users** | Registered veteran count |
| **7-Day Alerts** | Weekly safeguarding trend |

### User Management

#### Staff Management
| Feature | Description | Status |
|---------|-------------|--------|
| **Create Staff** | Add new counsellors/peers | ✅ Live |
| **Edit Staff** | Update profiles and roles | ✅ Live |
| **Deactivate** | Disable accounts | ✅ Live |
| **Role Assignment** | Admin/Counsellor/Peer | ✅ Live |
| **Profile Photos** | Staff images | ✅ Live |
| **Bio/Specialties** | Staff information | ✅ Live |

#### App User Management
| Feature | Description | Status |
|---------|-------------|--------|
| **View Users** | List all registered users | ✅ Live |
| **User Details** | Profile information | ✅ Live |
| **Usage History** | Conversation activity | ✅ Live |
| **Notes** | Admin notes on users | ✅ Live |

### Content Management System (CMS)

#### AI Persona Management
| Feature | Description | Status |
|---------|-------------|--------|
| **View Personas** | List all AI buddies | ✅ Live |
| **Edit Persona** | Modify personality/prompts | ✅ Live |
| **Create Persona** | Add new AI companions | ✅ Live |
| **Activate/Deactivate** | Control availability | ✅ Live |
| **System Prompts** | Define AI behavior | ✅ Live |

#### Crisis Numbers
| Feature | Description | Status |
|---------|-------------|--------|
| **Emergency Contacts** | Manage crisis line list | ✅ Live |
| **Add/Edit/Remove** | Full CRUD operations | ✅ Live |
| **Order Management** | Control display order | ✅ Live |

#### Support Organizations
| Feature | Description | Status |
|---------|-------------|--------|
| **Organization List** | All support services | ✅ Live |
| **Add Organization** | Create new entries | ✅ Live |
| **Edit Details** | Update information | ✅ Live |
| **Categories** | Organize by type | ✅ Live |

#### Page Content
| Feature | Description | Status |
|---------|-------------|--------|
| **Home Page** | Edit welcome text | ✅ Live |
| **About Page** | Edit about content | ✅ Live |
| **Custom Pages** | Create new pages | 🔄 Planned |

### Rota Management

#### Shift Scheduling
| Feature | Description | Status |
|---------|-------------|--------|
| **Calendar View** | Visual schedule | ✅ Live |
| **Create Shifts** | Define shift times | ✅ Live |
| **Assign Staff** | Allocate to shifts | ✅ Live |
| **Recurring Shifts** | Weekly patterns | ✅ Live |
| **Shift Templates** | Reusable schedules | ✅ Live |

#### Shift Management
| Feature | Description | Status |
|---------|-------------|--------|
| **View Schedule** | All staff schedules | ✅ Live |
| **Edit Shifts** | Modify assignments | ✅ Live |
| **Delete Shifts** | Remove from schedule | ✅ Live |
| **Swap Requests** | Staff shift swaps | ✅ Live |
| **Approve Swaps** | Authorize changes | ✅ Live |

### Monitoring & Analytics

#### System Monitoring
| Feature | Description | Status |
|---------|-------------|--------|
| **Real-time Stats** | Live metrics dashboard | ✅ Live |
| **Staff Status** | Current availability | ✅ Live |
| **Alert Volume** | Safeguarding trends | ✅ Live |
| **Response Times** | Staff performance | ✅ Live |

#### Safeguarding Monitor
| Feature | Description | Status |
|---------|-------------|--------|
| **Test Phrases** | Test AI detection | ✅ Live |
| **View Triggers** | All trigger phrases | ✅ Live |
| **Scoring Rules** | Understand risk levels | ✅ Live |
| **Recent Activity** | AI analysis history | ✅ Live |
| **Privacy Protected** | No message content shown | ✅ Live |

### Compliance & Reporting

#### Document Generation
| Feature | Description | Status |
|---------|-------------|--------|
| **Compliance Reports** | Generate PDF reports | ✅ Live |
| **Safeguarding Summary** | Weekly/monthly reports | ✅ Live |
| **Staff Activity** | Work hour reports | ✅ Live |
| **User Statistics** | Usage reports | ✅ Live |

#### Audit & Logs
| Feature | Description | Status |
|---------|-------------|--------|
| **Action Logs** | Track admin changes | ✅ Live |
| **Login History** | Security audit | ✅ Live |
| **Change History** | Content modifications | ✅ Live |

### Settings

| Feature | Description | Status |
|---------|-------------|--------|
| **Beta Survey** | Enable/disable survey | ✅ Live |
| **Maintenance Mode** | Take app offline | ✅ Live |
| **Email Notifications** | Configure alerts | ✅ Live |
| **System Config** | Platform settings | ✅ Live |

---

## Safeguarding System Details

### Risk Detection Methodology

#### Scoring System
```
Score Range    Risk Level    Action
-----------------------------------------
0-39           GREEN         Normal conversation
40-79          YELLOW        Elevated monitoring
80-119         AMBER         Staff notification
120+           RED           Immediate escalation
```

#### Trigger Categories

**RED Indicators (Immediate Escalation)**
- Suicide ideation phrases
- Self-harm statements
- Immediate danger expressions
- Method/plan discussions

**AMBER Indicators (High Risk)**
- Persistent hopelessness
- Self-harm history
- Substance abuse mentions
- Severe isolation expressions

**Modifiers (Context Enhancement)**
- Time urgency phrases
- Finality language
- Goodbye expressions

### Alert Lifecycle
1. **Detection** - AI identifies risk pattern
2. **Alert Creation** - System generates alert
3. **Notification** - Staff receive real-time alert
4. **Acknowledge** - Staff marks as seen
5. **Response** - Staff contacts user (call/chat)
6. **Resolution** - Alert closed with notes

---

## Technical Integrations

### Current Integrations
| Service | Purpose | Status |
|---------|---------|--------|
| **OpenAI GPT-4** | AI conversations | ✅ Active |
| **ExpressTURN** | WebRTC TURN servers | ✅ Active |
| **Socket.IO** | Real-time messaging | ✅ Active |
| **MongoDB** | Data storage | ✅ Active |
| **Resend** | Email notifications | ✅ Active |

### Planned Integrations
| Service | Purpose | Status |
|---------|---------|--------|
| **Twilio** | SMS/External calls | 🔄 In Progress |
| **Expo Push** | Mobile notifications | 🔄 Planned |
| **Sipgate** | SIP telephony | 📋 Evaluated |

---

## Security Features

| Feature | Implementation |
|---------|----------------|
| **Authentication** | JWT tokens, secure password hashing |
| **Authorization** | Role-based access control |
| **Data Protection** | HTTPS, encrypted storage |
| **Privacy** | Conversation monitoring without content logging |
| **Session Security** | Auto-logout, token expiry |

---

## Accessibility Features

| Feature | Description |
|---------|-------------|
| **Screen Reader** | Compatible with assistive tech |
| **Color Contrast** | WCAG 2.1 AA compliance |
| **Keyboard Navigation** | Full keyboard access |
| **Font Scaling** | Responsive text sizing |

---

## Future Roadmap

### Q2 2026
- [ ] Push notifications (mobile)
- [ ] External phone calling (Twilio)
- [ ] Appointment booking system

### Q3 2026
- [ ] Video call support
- [ ] Group chat features
- [ ] Welsh language support

### Q4 2026
- [ ] CBT course integration
- [ ] Achievement/badge system
- [ ] Native mobile apps (App Store/Play Store)

---

*Document Version: 2.1*
*Last Updated: December 2025*

---

## Clinical Safety Governance System

### Overview

NHS DCB0129-aligned governance infrastructure for clinical safety monitoring and compliance.

### Hazard Register

| Feature | Description | Status |
|---------|-------------|--------|
| **Pre-populated Hazards** | 7 core hazards (H1-H7) | ✅ Live |
| **Risk Scoring** | Severity × Likelihood calculation | ✅ Live |
| **Status Tracking** | Active/Mitigated/Under Review/Closed | ✅ Live |
| **CSO Review** | Clinical Safety Officer sign-off | ✅ Live |
| **Audit Trail** | All changes logged | ✅ Live |

**Core Hazards:**
| ID | Hazard | Severity |
|----|--------|----------|
| H1 | AI fails to detect suicidal ideation | Catastrophic |
| H2 | AI over-escalates benign content | Minor |
| H3 | Staff miss urgent alert | Major |
| H4 | Under-18 falsely declares 18+ | Moderate |
| H5 | Peer messaging abuse | Moderate |
| H6 | System outage during crisis | Major |
| H7 | AI safety drift after update | Major |

### Safeguarding KPIs

| Metric | Target | Description |
|--------|--------|-------------|
| High-risk response | < 15 mins | Time to staff acknowledgement |
| Imminent risk response | < 5 mins | Time to user contact |
| SLA compliance | > 90% | Cases within target times |
| False positive rate | < 15% | Incorrectly escalated cases |

### Incident Management

| Feature | Description | Status |
|---------|-------------|--------|
| **Incident Logging** | Record safety events | ✅ Live |
| **Severity Levels** | Level 1/2/3 classification | ✅ Live |
| **Email Notifications** | Auto-notify CSO + Admin | ✅ Live |
| **Investigation Workflow** | Open → Investigating → Resolved | ✅ Live |
| **Resolution Tracking** | Document outcomes | ✅ Live |

### Peer Moderation

| Feature | Description | Status |
|---------|-------------|--------|
| **Report Queue** | User-submitted reports | ✅ Live |
| **Action Options** | Warning/Suspend/Ban | ✅ Live |
| **User Status** | Track warnings/suspensions | ✅ Live |
| **Block Feature** | User-to-user blocking | ✅ Live |

### CSO Approvals

| Feature | Description | Status |
|---------|-------------|--------|
| **Approval Requests** | Changes requiring CSO sign-off | ✅ Live |
| **Email Alerts** | Notify CSO of pending approvals | ✅ Live |
| **Audit Trail** | All decisions logged | ✅ Live |

**Changes Requiring CSO Approval:**
- Risk threshold modifications
- Trigger word updates
- Escalation rule changes
- Hazard closures
- Annual safeguarding sign-off

### Audit & Export

| Feature | Description | Status |
|---------|-------------|--------|
| **Governance Audit Log** | All governance events recorded | ✅ Live |
| **Data Export** | JSON export for compliance | ✅ Live |
| **KPI Reports** | Period-based analytics | ✅ Live |
| **Privacy Protection** | No chat content in exports | ✅ Live |

### Email Notification System

| Trigger | Recipients | Priority |
|---------|------------|----------|
| Level 3 Incident | CSO + Admin | Immediate |
| Level 2 Incident | CSO + Admin | Within shift |
| Level 1 Incident | Admin | Next review |
| CSO Approval Request | CSO | Within 48 hours |

**Configuration:**
- CSO Email: Configurable via Admin Settings
- Admin Email: Configurable via Admin Settings
- Currently set to: `admin@radiocheck.me`

---

## Samaritans AI Policy Compliance

Radio Check's AI safety system has been designed to align with the Samaritans' policy briefing on AI and suicide prevention.

| Compliance Area | Status | Implementation |
|-----------------|--------|----------------|
| Refuse to provide harmful instructions | ✅ Complete | Hard-coded in AI prompts |
| Avoid glorifying or romanticizing suicide | ✅ Complete | Prompt guardrails |
| Redirect to crisis support | ✅ Complete | Auto-resources in responses |
| Human escalation pathway | ✅ Complete | Safeguarding popup + staff |
| Age-appropriate safeguards | ✅ Complete | Age gate + enhanced monitoring |
| Session-aware monitoring | ✅ Complete | Multi-message trend analysis |
| Dependency detection | ✅ Complete | Over-reliance warnings |
| Audit logging | ✅ Complete | Governance audit system |
| Qualified human oversight | ✅ Complete | CSO role + approval workflow |
