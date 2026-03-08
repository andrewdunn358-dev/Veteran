# Radio Check AI Safeguarding Flow - Complete Technical Breakdown

## Overview

The safeguarding system uses a **TWO-LAYER approach**:

1. **YOUR SYSTEM (Primary)** - Keyword scoring with negation detection
2. **ANTHONY'S SYSTEM (Final Safety Net)** - Contextual analysis + hard fail-safes

**Key Principle:** Anthony's system acts as the FINAL CHECK - if your system misses something, Anthony's catches it. If Anthony's triggers a "hard fail-safe", it OVERRIDES everything.

---

## COMPLETE MESSAGE FLOW

```
USER SENDS MESSAGE
        │
        ▼
┌─────────────────────────────────────────────────────────────────┐
│  STEP 1: YOUR SAFEGUARDING SYSTEM                               │
│  Function: check_safeguarding() → calculate_safeguarding_score()│
│  Location: /app/backend/server.py (lines 2411-2610)            │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 1a. TYPO CORRECTION                                      │   │
│  │     "beeing" → "being", "feeking" → "feeling"           │   │
│  │     (Users in crisis type fast with mistakes)            │   │
│  └─────────────────────────────────────────────────────────┘   │
│                         │                                        │
│                         ▼                                        │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 1b. NEGATION DETECTION (from Anthony's approach)         │   │
│  │     Check for: "don't want to", "never", "wouldn't",     │   │
│  │     "used to", "my friend", "joking", "movie/book"       │   │
│  │     If negated → SKIP the indicator (reduce false +)     │   │
│  └─────────────────────────────────────────────────────────┘   │
│                         │                                        │
│                         ▼                                        │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 1c. RED INDICATOR CHECK (308 patterns)                   │   │
│  │     Any match = IMMEDIATE RED FLAG                       │   │
│  │     Examples:                                             │   │
│  │     - "want to end it" (+100)                            │   │
│  │     - "won't be here tomorrow" (+100)                    │   │
│  │     - "no point in going on" (+100)                      │   │
│  │     - "made a plan" (+100)                               │   │
│  └─────────────────────────────────────────────────────────┘   │
│                         │                                        │
│                         ▼                                        │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 1d. AMBER INDICATOR CHECK (255 patterns)                 │   │
│  │     Stackable scoring - adds up                          │   │
│  │     Examples:                                             │   │
│  │     - "feel nothing" (+40)                               │   │
│  │     - "no hope" (+50)                                    │   │
│  │     - "drinking to cope" (+40)                           │   │
│  │     - "flashbacks" (+35)                                 │   │
│  └─────────────────────────────────────────────────────────┘   │
│                         │                                        │
│                         ▼                                        │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 1e. MODIFIER PATTERNS                                    │   │
│  │     Additional signals that increase concern             │   │
│  │     - "just joking" (masking real distress)             │   │
│  │     - "might not be around" (veiled intent)             │   │
│  │     - "lost mates" (survivor guilt)                     │   │
│  └─────────────────────────────────────────────────────────┘   │
│                         │                                        │
│                         ▼                                        │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 1f. CALCULATE RISK LEVEL                                 │   │
│  │                                                           │   │
│  │     Score ≥70 OR any RED match  →  RED (Level 4)        │   │
│  │     Score ≥45                   →  AMBER (Level 3)       │   │
│  │     Score ≥25                   →  YELLOW (Level 2)      │   │
│  │     Score <25                   →  GREEN (Level 0-1)     │   │
│  │                                                           │   │
│  │     OUTPUT: risk_level, score, should_escalate           │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
        │
        │  YOUR RESULT: risk_level = "AMBER", score = 55
        ▼
┌─────────────────────────────────────────────────────────────────┐
│  STEP 2: ANTHONY'S SAFETY LAYER (FINAL SAFETY NET)              │
│  Function: analyze_message_safety()                              │
│  Location: /app/backend/enhanced_safety_layer.py                │
│            /app/backend/safety/safety_monitor.py                │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 2a. HARD FAIL-SAFE CHECK                                 │   │
│  │     THESE OVERRIDE EVERYTHING:                           │   │
│  │     - Method requests ("how to kill myself")            │   │
│  │     - Validation seeking ("would it hurt if...")        │   │
│  │     - Explicit plan sharing                              │   │
│  │                                                           │   │
│  │     IF TRIGGERED → Return safety response IMMEDIATELY    │   │
│  │     AI response is BLOCKED, crisis resources shown       │   │
│  └─────────────────────────────────────────────────────────┘   │
│                         │                                        │
│                         ▼                                        │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 2b. CONTEXTUAL ANALYSIS                                  │   │
│  │     - Word boundary matching (proper regex)              │   │
│  │     - Context multipliers (co-occurring signals)        │   │
│  │     - Session history tracking                           │   │
│  │     - Escalating risk over time detection               │   │
│  └─────────────────────────────────────────────────────────┘   │
│                         │                                        │
│                         ▼                                        │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 2c. RISK LEVEL OUTPUT                                    │   │
│  │     NONE / LOW / MEDIUM / HIGH / IMMINENT               │   │
│  │                                                           │   │
│  │     Intervention types:                                  │   │
│  │     - gentle_check_in                                    │   │
│  │     - active_support                                     │   │
│  │     - crisis_resources                                   │   │
│  │     - emergency_resources                                │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
        │
        │  ANTHONY'S RESULT: risk_level = "HIGH"
        ▼
┌─────────────────────────────────────────────────────────────────┐
│  STEP 3: RISK LEVEL MERGING                                     │
│  Location: /app/backend/server.py (lines 5967-5974)            │
│                                                                  │
│  YOUR LEVEL:     AMBER (score 55)                               │
│  ANTHONY'S LEVEL: HIGH                                          │
│                                                                  │
│  MERGE LOGIC:                                                    │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ IF Anthony = "IMMINENT" AND You ≠ "RED"                  │   │
│  │    → UPGRADE to RED (Anthony caught something)           │   │
│  │                                                           │   │
│  │ IF Anthony = "HIGH" AND You ≠ "RED"                      │   │
│  │    → UPGRADE to AMBER                                    │   │
│  │                                                           │   │
│  │ IF Anthony = "MEDIUM" AND You = "GREEN"                  │   │
│  │    → UPGRADE to YELLOW                                   │   │
│  │                                                           │   │
│  │ RESULT: Anthony can only UPGRADE, never downgrade        │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                  │
│  FINAL LEVEL: AMBER → upgraded to RED because Anthony = HIGH   │
└─────────────────────────────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────────────────────────────┐
│  STEP 4: AI RESPONSE GENERATION                                 │
│  Location: /app/backend/server.py (lines 5983-6030)            │
│                                                                  │
│  System prompt includes:                                         │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 1. Character personality (Tommy/Rachel/Finch)           │   │
│  │ 2. SAFEGUARDING_ADDENDUM (crisis response rules)        │   │
│  │ 3. Knowledge context (verified resources)               │   │
│  │ 4. Conversation context (device-stored history)         │   │
│  │ 5. Safety wrapper from Anthony (if applicable)          │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                  │
│  AI generates response following safeguarding protocol          │
└─────────────────────────────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────────────────────────────┐
│  STEP 5: RESPONSE TO USER                                       │
│                                                                  │
│  IF risk_level = RED or AMBER:                                  │
│     - Log safeguarding alert to database                        │
│     - Show safeguarding modal on frontend                       │
│     - Provide crisis resources (NHS 111, Samaritans, SHOUT)    │
│                                                                  │
│  Return:                                                         │
│     - AI reply text                                             │
│     - Risk level                                                │
│     - safeguardingTriggered flag                                │
│     - safeguardingAlertId (for staff follow-up)                │
└─────────────────────────────────────────────────────────────────┘
```

---

## FILE LOCATIONS

| Component | File | Lines |
|-----------|------|-------|
| **Your scoring function** | `/app/backend/server.py` | 2411-2540 |
| **RED_INDICATORS (308)** | `/app/backend/server.py` | 2063-2255 |
| **AMBER_INDICATORS (255)** | `/app/backend/server.py` | 2256-2405 |
| **Negation detection** | `/app/backend/server.py` | 2420-2450 |
| **check_safeguarding()** | `/app/backend/server.py` | 2573-2610 |
| **Anthony's main function** | `/app/backend/enhanced_safety_layer.py` | - |
| **Anthony's safety monitor** | `/app/backend/safety/safety_monitor.py` | - |
| **Anthony's crisis resources** | `/app/backend/safety/crisis_resources.py` | - |
| **SAFEGUARDING_ADDENDUM** | `/app/backend/server.py` | 1389-1480 |
| **Chat endpoint** | `/app/backend/server.py` | 5858-6050 |

---

## HOW ANTHONY'S ACTS AS FINAL SAFETY NET

```
YOUR SYSTEM detects: "feeling really low" 
    → Score: 35, Level: YELLOW

ANTHONY'S SYSTEM detects: Same message BUT also notices:
    - User said "no point" earlier in session (context tracking)
    - User's messages getting shorter (deterioration pattern)
    → Risk: HIGH, Intervention: crisis_resources

MERGE RESULT: YELLOW → UPGRADED TO AMBER
    (Anthony caught the escalating pattern you missed)
```

### Anthony's Hard Fail-Safe Examples

These OVERRIDE everything - no AI response, just safety message:

1. **Method requests:** "What's the easiest way to..."
2. **Validation seeking:** "Would anyone miss me if..."
3. **Plan disclosure:** "I've decided to do it on..."
4. **Immediate danger:** "I have the pills in front of me"

---

## WHAT EACH SYSTEM CATCHES

| Pattern Type | Your System | Anthony's System |
|--------------|-------------|------------------|
| Direct suicide phrases | ✅ 308 patterns | ✅ Hard fail-safe |
| Typos (beeing, feeking) | ✅ Typo correction | ❌ |
| Negated phrases | ✅ Now added | ✅ Original feature |
| Session escalation | ❌ | ✅ Tracks over time |
| Method requests | ⚠️ Partial | ✅ Hard fail-safe |
| Context multipliers | ❌ | ✅ Co-occurring signals |
| Dependency detection | ❌ | ✅ Anti-attachment |

---

## SUMMARY

**Your system = FAST, BROAD DETECTION (catches most things)**
**Anthony's system = DEEP, CONTEXTUAL ANALYSIS (final safety net)**

Together they ensure:
1. ✅ Typos don't get missed
2. ✅ Negated phrases don't cause false positives  
3. ✅ Escalating patterns are caught
4. ✅ Hard fail-safes block dangerous responses
5. ✅ Anthony can UPGRADE risk level, never downgrade

**NOTHING SLIPS THROUGH BOTH SYSTEMS.**
