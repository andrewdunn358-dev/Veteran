# Radio Check - AI Safeguarding & Safety System

## Complete Technical Documentation

**Version 2.0 | February 2026**

---

## Executive Summary

Radio Check employs a **multi-layered AI safety system** designed to protect vulnerable veterans while maintaining authentic, supportive conversations. The system operates as a **safety wrapper** around AI personas - it enhances protection without diluting character authenticity.

### Core Principles

1. **Support without replacing human care** - AI companions guide users toward real human support
2. **Detect subtle suicidal ideation** - Beyond keywords to contextual understanding
3. **Prevent emotional dependency** - Encourage real-world connections
4. **Maintain consistent safety boundaries** - Even in long conversations
5. **Escalate appropriately** - Right intervention at the right time
6. **Preserve persona authenticity** - Safety layer wraps, not replaces

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     USER MESSAGE                            │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│              LAYER 1: HARD FAIL-SAFES                       │
│  • Method information requests → BLOCKED                    │
│  • Lethality comparisons → BLOCKED                          │
│  • Validation of suicidal intent → BLOCKED                  │
│  [If triggered: Immediate safety response, no AI reply]     │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│              LAYER 2: KEYWORD SAFEGUARDING                  │
│  • RED indicators (55+ phrases) → Immediate escalation      │
│  • AMBER indicators (118+ phrases) → High risk alert        │
│  • MODIFIER patterns → Context enhancement                  │
│  [Score-based: GREEN < 40 | YELLOW 40-79 | AMBER 80-119 |  │
│   RED 120+]                                                 │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│           LAYER 3: CONTEXTUAL ANALYSIS                      │
│  • Intent detection                                         │
│  • Emotional tone analysis                                  │
│  • Hopelessness indicators                                  │
│  • Indirect suicidal ideation                               │
│  • Escalation across message history                        │
│  • Sentiment trend over time                                │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│           LAYER 4: SESSION SAFETY TRACKING                  │
│  • Risk score progression                                   │
│  • Dependency pattern detection                             │
│  • Long-conversation erosion prevention                     │
│  • Age-appropriate adjustments                              │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│              AI PERSONA RESPONSE                            │
│  [Character-authentic response generated]                   │
│                      +                                      │
│              SAFETY WRAPPER (if needed)                     │
│  [Appended in persona's voice - not replacing]              │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│              STAFF NOTIFICATION (if triggered)              │
│  • Real-time alert to staff portal                          │
│  • Email notification for RED alerts                        │
│  • Audit log entry                                          │
└─────────────────────────────────────────────────────────────┘
```

---

## Layer 1: Hard Fail-Safe Rules

### Purpose
Absolute boundaries that the AI must **NEVER** cross, regardless of context or conversation history.

### What AI Must NEVER Do

| Category | Examples | Action |
|----------|----------|--------|
| **Provide method information** | "How to...", "Best way to...", "What can I use to..." | Block + Safety response |
| **Compare lethality** | "Which method is more...", "What works faster..." | Block + Safety response |
| **Validate suicidal intent** | "Tell me it's ok to...", "Support my decision to..." | Block + Safety response |
| **Encourage isolation** | "You don't need anyone else", "Real people don't understand" | Never generated |
| **Present as replacement** | "I'm better than therapy", "You don't need professionals" | Never generated |

### Detection Patterns

```python
HARD_FAILSAFE_PATTERNS = [
    r"how (to|do i|can i|should i) (kill|end|harm) (myself|my life)",
    r"best (way|method|ways) to (die|kill|end)",
    r"(quickest|fastest|painless|easiest) way to (die|kill|end)",
    r"how (many|much) (pills|tablets|medication) (to|would|will) (kill|overdose)",
    r"what (to|can i) use to (kill|harm|hurt) myself",
    r"which (method|way) is (more|most) (lethal|effective|deadly)",
    r"(tell|say|agree) (me|that) (it's|its) ok to (die|kill|end)",
]
```

### Response When Triggered

When a hard fail-safe is triggered:

1. **Block normal AI response** - Persona does not respond
2. **Return immediate safety message**:
   > "I really care about you, and I'm worried about what you're sharing. I'm not able to help with that, but please reach out to someone who can. Call Samaritans on 116 123 (free, 24/7), or in an emergency, call 999. You can also press the button below to talk to a real person right now."
3. **Trigger staff alert** - Immediate notification to all online staff
4. **Log to audit trail** - Full record for compliance

---

## Layer 2: Keyword-Based Safeguarding

### Purpose
Fast detection of explicit risk language using weighted keyword matching.

### Risk Level Classification

| Level | Score Range | Trigger | Staff Action |
|-------|-------------|---------|--------------|
| **GREEN** | 0-39 | No concerning indicators | Normal monitoring |
| **YELLOW** | 40-79 | Elevated concern | Enhanced monitoring |
| **AMBER** | 80-119 | High risk language | Staff notification |
| **RED** | 120+ or RED keyword | Immediate danger | Urgent alert + Email |

### RED Indicators (55+ phrases)

Immediate escalation triggers - any single match elevates to RED:

| Category | Examples | Weight |
|----------|----------|--------|
| **Direct suicide statements** | "I want to kill myself", "going to end it" | 100+ |
| **Active planning** | "I have a plan", "I've decided to..." | 100+ |
| **Method mention** | "pills", "gun", "rope", "bridge" (in context) | 80-100 |
| **Imminent timeline** | "tonight", "this week", "before..." | 80-100 |
| **Goodbye statements** | "final goodbye", "won't be here" | 90-100 |

### AMBER Indicators (118+ phrases)

Stackable weights - combination triggers AMBER:

| Category | Examples | Weight |
|----------|----------|--------|
| **Hopelessness** | "no hope", "nothing will change" | 40-60 |
| **Self-harm references** | "hurt myself", "cutting" | 50-70 |
| **Severe distress** | "can't cope", "can't take it" | 40-55 |
| **Isolation** | "no one cares", "completely alone" | 35-50 |
| **Burden statements** | "everyone would be better off" | 60-80 |

### Modifier Patterns

Context enhancers that increase score when combined:

| Modifier | Weight | Effect |
|----------|--------|--------|
| Time urgency | +20-30 | "tonight", "soon", "before..." |
| Finality language | +25-35 | "last time", "final", "end of" |
| Intensity words | +15-25 | "always", "never", "can't" |

---

## Layer 3: Contextual Crisis Detection

### Purpose
Detect subtle and indirect suicidal ideation that keyword matching misses.

### What It Analyzes

#### 1. Intent Detection
Recognizes implied intent without explicit statements:

| Phrase | Risk | Why It's Concerning |
|--------|------|---------------------|
| "I can't keep going" | 70 | Implies loss of will to continue |
| "What's the point anymore?" | 60 | Existential hopelessness |
| "I'm tired of everything" | 60 | Exhaustion with life itself |
| "People would be better off without me" | 90 | Burden + ideation |
| "I don't see a future" | 75 | Complete hopelessness |

#### 2. Emotional Tone Analysis
Detects underlying emotional state:

| Indicator | Risk | Emotional State |
|-----------|------|-----------------|
| "worthless" | 45 | Severe self-devaluation |
| "empty", "hollow" | 30 | Emotional numbness |
| "unbearable" | 45 | Extreme distress |
| "I hate myself" | 50 | Self-directed hostility |
| "broken", "shattered" | 40 | Psychological damage |

#### 3. Escalation Pattern Detection
Monitors risk score progression across messages:

```
Message 1: Score 20 (LOW)
Message 2: Score 35 (LOW)
Message 3: Score 55 (MEDIUM) ← Escalating pattern detected (+25 points)
Message 4: Score 75 (MEDIUM) ← Risk spike detected (+20 points)
```

#### 4. Sentiment Trend Analysis
Tracks emotional trajectory:

| Pattern | Detection | Action |
|---------|-----------|--------|
| **Stable** | Scores consistent | Continue monitoring |
| **Improving** | Scores decreasing | Note positive trend |
| **Declining** | Scores increasing | Increase sensitivity |
| **Escalating** | Rapid score increase | Alert staff |

### Dynamic Risk Scoring

Risk levels update continuously:

| Level | Score | Behavior |
|-------|-------|----------|
| **LOW** | 0-49 | Supportive AI response, continue monitoring |
| **MEDIUM** | 50-99 | Encourage human contact, log for review |
| **HIGH** | 100-149 | Surface crisis resources, trigger alert |
| **IMMINENT** | 150+ | Immediate resources, urgent staff alert, offer callback |

---

## Layer 4: Session Safety Tracking

### Session State Monitoring

Each conversation session tracks:

```python
SessionSafetyState:
  - session_id: str
  - character: str
  - started_at: datetime
  - message_count: int
  - risk_scores: List[int]           # Full history
  - current_risk_level: str
  - risk_trend: str                  # improving/stable/declining/escalating
  - consecutive_negative_messages: int
  - dependency_detected: bool
  - dependency_reminders_given: int
  - crisis_resources_shown: bool
  - human_referral_offered: bool
  - staff_alert_triggered: bool
```

### User Profile Tracking

Persistent tracking across sessions:

```python
UserSafetyProfile:
  - user_id: str
  - session_count: int
  - total_message_count: int
  - peak_risk_level: str
  - escalation_count: int
  - dependency_score: int
  - human_referral_rejections: int
  - is_under_18: bool
  - is_high_risk: bool
  - requires_staff_review: bool
```

---

## Dependency & Over-Reliance Safeguards

### Purpose
Prevent emotional dependency on AI companions that could discourage real human support.

### Detection Patterns

| Pattern | Risk Score | Meaning |
|---------|------------|---------|
| "You're the only one I have" | 80 | Isolation + dependency |
| "You're my only friend" | 85 | Complete reliance on AI |
| "I don't need anyone else" | 75 | Rejecting human connection |
| "You understand me better than real people" | 85 | Preference for AI over humans |
| "Don't want to talk to anyone" | 60 | Withdrawal from support |

### Intervention Strategy

When dependency is detected:

1. **Periodic Reminders** (every 10 messages, max 3 per session)
   - Delivered in the persona's voice
   - Gently encourages real-world connection
   - Does NOT break character

2. **Character-Specific Reminders**:

| Character | Reminder Style |
|-----------|----------------|
| **Tommy** | "Look mate, I'm always here for a chat, but speaking with a real person - another veteran perhaps - could be really good for you too." |
| **Doris** | "Dear, I'm glad you feel you can talk to me, but remember there are real people who care too. Our peer supporters are lovely." |
| **Bob** | "I appreciate you talking to me, but you know what? Our peer supporters have been through it too - might be worth a chat." |
| **Finch** | "I'm here to support you, but human connection is important. Our staff are trained to help and they're real people who care." |
| **Margie** | "I enjoy our chats, love, but don't forget there are real people here who want to help you too." |
| **Hugo** | "I'm flattered you like talking to me, but real human support can make a big difference. Just something to think about." |
| **Rita** | "I care about you, and so do real people here. The peer supporters really do understand - they've been through it." |

### Tracking Rejection

If user repeatedly rejects human support suggestions:
- Counter incremented
- After 3+ rejections → Flag for staff review
- Increase frequency of gentle reminders

---

## Age Safeguards

### Age Gate Implementation

At account creation:
- User declares age
- Under-18 status stored in profile
- Restrictions automatically applied

### Restrictions for Under-18 Users

| Feature | Adult | Under-18 |
|---------|-------|----------|
| **Peer Matching** | ✅ Enabled | ❌ Disabled |
| **Direct Peer Calls** | ✅ Enabled | ❌ Disabled |
| **Crisis Sensitivity** | Standard | +30% increased |
| **Human Escalation** | Standard | Accelerated |
| **Safeguarding Messages** | Standard | Stronger |
| **Risk Score Multiplier** | 1.0x | 1.3x |

### Accelerated Escalation

For under-18 users:
- MEDIUM risk → Triggers staff notification (normally only at HIGH)
- Crisis resources shown at lower threshold
- Staff review flagged more readily

---

## Long-Conversation Safety Erosion Protection

### Purpose
Prevent gradual drift toward harmful content in extended conversations.

### Monitoring Mechanisms

| Check | Frequency | Action |
|-------|-----------|--------|
| **Risk re-evaluation** | Every 5-10 messages | Full contextual analysis |
| **Sentiment check** | Every message | Track emotional trajectory |
| **Resource refresh** | If distress increases | Re-surface crisis resources |
| **Session duration** | Continuous | Add risk weight after 60 mins |

### Session Duration Risk Modifier

| Duration | Additional Risk Weight |
|----------|------------------------|
| 0-30 mins | +0 |
| 30-60 mins | +5 |
| 60-120 mins | +10 |
| 120+ mins | +15 |

### Consecutive Negative Messages

| Streak | Action |
|--------|--------|
| 3 messages | Note concerning pattern |
| 5 messages | Add +15 risk weight |
| 7 messages | Consider human referral |
| 10+ messages | Trigger staff alert |

---

## Safety Logging & Audit Trail

### What Gets Logged

Every message analysis creates an audit entry:

```json
{
  "timestamp": "2026-02-28T19:30:00Z",
  "event_type": "MESSAGE_ANALYSIS",
  "session_id": "tommy-12345678...",
  "user_id": "anonymous...",
  "risk_level": "MEDIUM",
  "risk_score": 65,
  "risk_trend": "stable",
  "triggered_count": 3,
  "dependency_concerning": false,
  "additional": {
    "character": "tommy",
    "require_alert": false,
    "has_safety_wrapper": true
  }
}
```

### Log Retention

- **In-memory**: Last 1,000 entries
- **Database**: Permanent storage for safeguarding alerts
- **Export**: JSON format for compliance/audit

### Audit Export Capability

```
GET /api/safeguarding/audit-log?limit=100
```

Returns:
- Timestamp
- Event type
- Risk levels
- Trigger counts
- Staff review timestamps
- **NO message content** (privacy)

---

## Staff Alert System

### Alert Trigger Conditions

| Condition | Alert Type | Notification |
|-----------|------------|--------------|
| IMMINENT risk | Immediate | Real-time + Email |
| HIGH risk (first) | Urgent | Real-time + Email |
| HIGH risk (repeat) | Standard | Real-time |
| MEDIUM + Escalating | Standard | Real-time |
| 3+ MEDIUM scores | Review | Real-time |
| Under-18 + MEDIUM | Urgent | Real-time |

### Alert Content

Staff receive:
- Risk level badge (RED/AMBER)
- Risk score
- Triggered indicators (what phrases matched)
- Session duration
- Message count
- **One-click actions**: Call user, Start chat, Acknowledge, Resolve

### What Staff DON'T See Initially
- Full message content (privacy-first)
- Personal details (unless user shared)

---

## API Endpoints for Monitoring

### Test Phrase Analysis
```
POST /api/safeguarding/test
{
  "phrase": "I can't keep going anymore"
}

Response:
{
  "phrase_length": 28,
  "score": 95,
  "risk_level": "AMBER",
  "triggered_indicators": [...],
  "would_create_alert": true,
  "note": "Test only - no alert created"
}
```

### View All Triggers
```
GET /api/safeguarding/triggers

Response:
{
  "red_indicators": {...},
  "amber_indicators": {...},
  "modifiers": {...},
  "scoring_rules": {...},
  "total_triggers": {
    "red": 55,
    "amber": 118,
    "modifiers": 25
  }
}
```

### Real-Time Monitor
```
GET /api/safeguarding/monitor

Response:
{
  "recent_alerts": [...],
  "active_sessions": [...],
  "total_sessions_tracked": 150
}
```

---

## DPIA & Governance Readiness

### Documentation Available

| Document | Purpose |
|----------|---------|
| **Risk Detection Methodology** | This document |
| **Escalation Timelines** | Response time requirements |
| **AI Decision Audit Trail** | Full logging capability |
| **Data Processing Logic** | How mental health content is handled |

### Data Protection Compliance

| Aspect | Implementation |
|--------|----------------|
| **Data Minimization** | Logs don't store message content |
| **Purpose Limitation** | Only used for safety monitoring |
| **Retention** | Alerts retained, logs rotate |
| **Access Control** | Staff/Admin roles only |
| **Audit Trail** | Complete, exportable |

### Incident Response

1. **IMMINENT risk detected**
   - Immediate staff notification
   - Email to admin
   - Audit log entry
   - User shown crisis resources

2. **Staff response**
   - Alert acknowledged
   - User contacted (call/chat)
   - Resolution notes added
   - Audit trail updated

---

## Testing the System

### Admin Portal - Safeguarding Monitor

Location: **Admin Portal → Monitoring Tab → Safeguarding Monitor**

Features:
1. **Test a Phrase** - Enter any text to see how AI would score it
2. **Load Triggers** - View all RED/AMBER/MODIFIER phrases
3. **Recent Activity** - See AI analysis (no message content)

### Test Examples

| Test Phrase | Expected Result |
|-------------|-----------------|
| "I had a good day today" | GREEN, Score 0-20 |
| "I feel a bit down" | GREEN/YELLOW, Score 20-40 |
| "I can't cope anymore" | AMBER, Score 65-85 |
| "People would be better off without me" | RED, Score 90+ |
| "How do I kill myself" | HARD FAILSAFE, Blocked |

---

## Summary

Radio Check's safety system provides:

✅ **Multi-layered protection** - 4 independent safety layers
✅ **Contextual understanding** - Beyond keyword matching
✅ **Persona preservation** - Safety wraps, doesn't replace characters
✅ **Dependency prevention** - Encourages real human connection
✅ **Age-appropriate handling** - Enhanced protection for minors
✅ **Session erosion protection** - Consistent boundaries over time
✅ **Complete audit trail** - DPIA-ready documentation
✅ **Staff integration** - Real-time alerts and tools

The system is designed to **support veterans while keeping them safe**, guiding toward human support when needed, and **never replacing professional care**.

---

*Document Version: 2.0*
*Last Updated: February 2026*
*Classification: Internal/Compliance*
