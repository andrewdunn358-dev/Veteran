# Prompt Improvement Workflow

## Overview

This system helps you continuously improve AI responses by analyzing chat patterns and user feedback.

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Chats     │────▶│  Analysis   │────▶│  Insights   │────▶│   Update    │
│   Happen    │     │   System    │     │  Generated  │     │   Prompts   │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
```

---

## The Workflow

### Step 1: Collect Data (Automatic)
Chat sessions are automatically logged to the database including:
- User messages
- AI responses
- Character used
- Session duration
- Risk levels triggered

### Step 2: Analyze Patterns (Weekly)
Run the analysis endpoints to see:
- **Topic distribution** - What are users talking about?
- **Character performance** - Which AI is getting best feedback?
- **Common questions** - What do users ask repeatedly?
- **Quality metrics** - Are users satisfied?

### Step 3: Review Insights (Admin Portal)
The system generates:
- Improvement suggestions
- Problematic patterns
- FAQ opportunities
- Character-specific recommendations

### Step 4: Update Prompts (Manual)
Based on insights:
1. Identify areas needing improvement
2. Draft prompt changes
3. Save new version (audit trail)
4. Deploy updates

---

## API Endpoints

### Get Chat Analytics
```bash
GET /api/admin/chat-analytics?days=7
Authorization: Bearer <admin-token>
```

Returns:
```json
{
  "period_days": 7,
  "total_sessions": 150,
  "topic_distribution": {
    "mental_health": 45,
    "transition": 32,
    "relationships": 28
  },
  "quality_metrics": {
    "positive_sessions": 89,
    "negative_sessions": 12,
    "escalation_rate": 8.5
  },
  "improvement_suggestions": [...]
}
```

### Get Formatted Report
```bash
GET /api/admin/chat-analytics/report?days=7
Authorization: Bearer <admin-token>
```

Returns a human-readable report for prompt updates.

### Get Topic Breakdown
```bash
GET /api/admin/topic-breakdown?days=7
Authorization: Bearer <admin-token>
```

Shows what topics users are discussing most.

### Get Prompt Suggestions
```bash
GET /api/admin/prompt-suggestions?days=30
Authorization: Bearer <admin-token>
```

Returns specific actionable suggestions for improving prompts.

### Save Prompt Version
```bash
POST /api/admin/prompt-versions
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "character": "tommy",
  "change_summary": "Added better responses for transition topics",
  "prompt_text": "Full prompt text here..."
}
```

---

## Topic Categories Tracked

| Topic | Keywords Detected |
|-------|-------------------|
| transition | civvy, leaving, civilian, adjustment |
| mental_health | anxious, depressed, ptsd, nightmare |
| relationships | wife, partner, family, divorce |
| isolation | lonely, alone, no friends, isolated |
| substance | drinking, alcohol, drugs, addiction |
| anger | angry, rage, temper, aggressive |
| grief | lost, death, died, mourning |
| employment | job, work, unemployed, career |
| housing | homeless, housing, evicted |
| finances | money, debt, bills, benefits |
| physical_health | injury, pain, disability |
| identity | who am i, purpose, lost myself |
| positive | thank you, helped, better, grateful |

---

## Quality Signals Detected

### Positive Signals
- "thank you", "that helps", "makes sense"
- "i feel better", "you understand"
- "good advice", "appreciate"

### Negative Signals
- "not helpful", "you don't understand"
- "useless", "wrong", "frustrated"

### Escalation Requests
- "real person", "human", "talk to someone"
- "counsellor", "call someone"

---

## Weekly Review Process

### Monday Morning Routine

1. **Pull the report**
   ```bash
   curl -H "Authorization: Bearer $TOKEN" \
     "$API_URL/api/admin/chat-analytics/report?days=7"
   ```

2. **Review topic distribution**
   - Are there spikes in specific topics?
   - Any new topics emerging?

3. **Check character performance**
   - Which character has lowest positive rate?
   - Any character getting escalation requests?

4. **Review suggestions**
   - Prioritize HIGH priority items
   - Create task list for prompt updates

5. **Update prompts**
   - Make targeted changes
   - Save new version with summary
   - Document what changed and why

---

## Example Improvement Cycle

### Scenario: High "Transition" Topic Volume

**Data Shows:**
- 45% of conversations mention transition
- Users frequently ask "what do I do now?"
- Many sessions end with escalation requests

**Action:**
1. Add transition-specific guidance to Tommy/Hugo prompts
2. Include practical resources for CV help, job searching
3. Add empathetic acknowledgment of transition difficulty
4. Include Veterans Gateway referral for career support

**Prompt Addition:**
```
=== TRANSITION SUPPORT ===
When users discuss leaving the forces or civilian adjustment:
- Acknowledge this is one of the biggest changes they'll face
- Validate that feeling lost or uncertain is completely normal
- Offer practical next steps:
  - Veterans Gateway (0808 802 1212) has career advisors
  - CTP (Career Transition Partnership) if still serving
  - Local RFEA employment support
- Remind them their skills ARE valuable, even if civilian world doesn't see it yet
```

**Save Version:**
```bash
POST /api/admin/prompt-versions
{
  "character": "tommy",
  "change_summary": "Enhanced transition support based on 45% topic volume",
  "prompt_text": "..."
}
```

---

## Best Practices

### DO:
- Review analytics weekly
- Make small, targeted changes
- Document every change
- Track metrics after changes
- Focus on high-volume topics

### DON'T:
- Rewrite entire prompts at once
- Ignore negative feedback patterns
- Skip the version history
- Make changes without data backing
- Forget to test after changes

---

## Metrics to Track

| Metric | Target | Action if Below |
|--------|--------|-----------------|
| Positive session rate | >60% | Review negative sessions |
| Escalation rate | <20% | Improve AI handling |
| Session length | >3 messages | Improve engagement |
| Return users | >30% | Improve experience |

---

## Integration with Admin Portal

The admin portal will show:
- Chat analytics dashboard
- Topic trends over time
- Character comparison
- Prompt version history
- One-click report generation

*(Coming in next update)*

---

## Contact

Questions about the prompt improvement system?
- Technical: Check `/app/backend/prompt_improvement.py`
- Process: Review this document
- Support: admin@radiocheck.me
