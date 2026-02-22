"""
Prompt Improvement Workflow System
Analyzes chat patterns and helps improve AI responses
"""

from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional
from collections import Counter
import re


# Common topic categories for veteran support
TOPIC_CATEGORIES = {
    "transition": ["civvy", "leaving", "left the forces", "civilian", "adjustment", "new job", "career"],
    "mental_health": ["anxious", "depressed", "ptsd", "nightmare", "flashback", "panic", "can't sleep", "insomnia"],
    "relationships": ["wife", "husband", "partner", "family", "kids", "divorce", "marriage", "relationship"],
    "isolation": ["lonely", "alone", "no friends", "isolated", "nobody understands", "no one to talk"],
    "substance": ["drinking", "alcohol", "drugs", "addiction", "sober", "relapse"],
    "anger": ["angry", "rage", "temper", "lost it", "aggressive", "violence"],
    "grief": ["lost", "death", "died", "funeral", "mourning", "miss them", "gone"],
    "employment": ["job", "work", "unemployed", "career", "boss", "fired", "redundant"],
    "housing": ["homeless", "housing", "nowhere to live", "evicted", "rent"],
    "finances": ["money", "debt", "bills", "broke", "pension", "benefits"],
    "physical_health": ["injury", "pain", "disability", "medical", "doctor", "hospital"],
    "identity": ["who am i", "purpose", "meaning", "lost myself", "don't know who"],
    "positive": ["thank you", "helped", "better", "grateful", "good day", "progress"],
}

# Response quality indicators
QUALITY_INDICATORS = {
    "positive": [
        "thank you", "thanks", "that helps", "good advice", "makes sense",
        "i feel better", "appreciate", "exactly", "you understand"
    ],
    "negative": [
        "not helpful", "doesn't help", "you don't understand", "useless",
        "wrong", "that's not what i meant", "frustrated", "annoying"
    ],
    "disengagement": [
        "bye", "goodbye", "leave me alone", "stop", "nevermind", "forget it"
    ],
    "escalation_needed": [
        "real person", "human", "talk to someone", "counsellor", "call someone"
    ]
}


def categorize_message(message: str) -> List[str]:
    """Categorize a message into topic areas"""
    message_lower = message.lower()
    categories = []
    
    for category, keywords in TOPIC_CATEGORIES.items():
        for keyword in keywords:
            if keyword in message_lower:
                categories.append(category)
                break
    
    return categories if categories else ["general"]


def assess_response_quality(user_messages: List[str]) -> Dict[str, Any]:
    """Assess the quality of AI responses based on user reactions"""
    combined = " ".join(user_messages).lower()
    
    quality = {
        "positive_signals": 0,
        "negative_signals": 0,
        "disengagement_signals": 0,
        "escalation_requests": 0,
        "overall_sentiment": "neutral"
    }
    
    for indicator in QUALITY_INDICATORS["positive"]:
        if indicator in combined:
            quality["positive_signals"] += 1
    
    for indicator in QUALITY_INDICATORS["negative"]:
        if indicator in combined:
            quality["negative_signals"] += 1
    
    for indicator in QUALITY_INDICATORS["disengagement"]:
        if indicator in combined:
            quality["disengagement_signals"] += 1
    
    for indicator in QUALITY_INDICATORS["escalation_needed"]:
        if indicator in combined:
            quality["escalation_requests"] += 1
    
    # Determine overall sentiment
    if quality["positive_signals"] > quality["negative_signals"]:
        quality["overall_sentiment"] = "positive"
    elif quality["negative_signals"] > quality["positive_signals"]:
        quality["overall_sentiment"] = "negative"
    elif quality["disengagement_signals"] > 0:
        quality["overall_sentiment"] = "disengaged"
    
    return quality


def extract_improvement_insights(chat_sessions: List[Dict]) -> Dict[str, Any]:
    """
    Analyze multiple chat sessions to extract insights for prompt improvement
    
    Returns actionable insights for improving AI prompts
    """
    insights = {
        "total_sessions": len(chat_sessions),
        "topic_distribution": Counter(),
        "quality_metrics": {
            "positive_sessions": 0,
            "negative_sessions": 0,
            "neutral_sessions": 0,
            "escalation_rate": 0
        },
        "common_questions": [],
        "problematic_patterns": [],
        "character_performance": {},
        "improvement_suggestions": []
    }
    
    escalation_count = 0
    character_feedback = {}
    question_patterns = []
    
    for session in chat_sessions:
        messages = session.get("messages", [])
        character = session.get("character", "tommy")
        
        # Initialize character tracking
        if character not in character_feedback:
            character_feedback[character] = {"positive": 0, "negative": 0, "total": 0}
        character_feedback[character]["total"] += 1
        
        user_messages = [m["content"] for m in messages if m.get("role") == "user"]
        
        # Categorize topics
        for msg in user_messages:
            categories = categorize_message(msg)
            for cat in categories:
                insights["topic_distribution"][cat] += 1
            
            # Extract questions
            if "?" in msg:
                question_patterns.append(msg)
        
        # Assess quality
        quality = assess_response_quality(user_messages)
        
        if quality["overall_sentiment"] == "positive":
            insights["quality_metrics"]["positive_sessions"] += 1
            character_feedback[character]["positive"] += 1
        elif quality["overall_sentiment"] == "negative":
            insights["quality_metrics"]["negative_sessions"] += 1
            character_feedback[character]["negative"] += 1
        else:
            insights["quality_metrics"]["neutral_sessions"] += 1
        
        if quality["escalation_requests"] > 0:
            escalation_count += 1
    
    # Calculate escalation rate
    if len(chat_sessions) > 0:
        insights["quality_metrics"]["escalation_rate"] = round(
            (escalation_count / len(chat_sessions)) * 100, 1
        )
    
    # Find common questions
    insights["common_questions"] = find_common_patterns(question_patterns, min_count=2)
    
    # Character performance
    insights["character_performance"] = character_feedback
    
    # Generate improvement suggestions
    insights["improvement_suggestions"] = generate_suggestions(insights)
    
    return insights


def find_common_patterns(messages: List[str], min_count: int = 2) -> List[Dict]:
    """Find common question/message patterns"""
    # Normalize messages
    normalized = []
    for msg in messages:
        # Remove specific details, keep structure
        clean = re.sub(r'\d+', 'NUM', msg.lower())
        clean = re.sub(r'[^\w\s?]', '', clean)
        normalized.append(clean.strip())
    
    # Count occurrences
    counts = Counter(normalized)
    
    common = []
    for pattern, count in counts.most_common(20):
        if count >= min_count and len(pattern) > 10:
            common.append({
                "pattern": pattern,
                "count": count,
                "example": messages[normalized.index(pattern)] if pattern in normalized else pattern
            })
    
    return common


def generate_suggestions(insights: Dict) -> List[Dict]:
    """Generate actionable prompt improvement suggestions"""
    suggestions = []
    
    # Topic-based suggestions
    top_topics = insights["topic_distribution"].most_common(5)
    for topic, count in top_topics:
        if count > 5:
            suggestions.append({
                "type": "topic_enhancement",
                "priority": "high" if count > 20 else "medium",
                "topic": topic,
                "suggestion": f"Many users discuss '{topic}'. Consider adding specific guidance for this topic in the system prompt.",
                "action": f"Add {topic}-specific coping strategies and resources to AI prompts"
            })
    
    # Quality-based suggestions
    if insights["quality_metrics"]["negative_sessions"] > insights["quality_metrics"]["positive_sessions"]:
        suggestions.append({
            "type": "quality_improvement",
            "priority": "high",
            "suggestion": "More negative than positive feedback detected. Review recent conversations for issues.",
            "action": "Analyze negative sessions and identify response patterns that need improvement"
        })
    
    # Escalation rate
    if insights["quality_metrics"]["escalation_rate"] > 30:
        suggestions.append({
            "type": "escalation_reduction",
            "priority": "high",
            "suggestion": f"High escalation rate ({insights['quality_metrics']['escalation_rate']}%). Users frequently request human support.",
            "action": "Improve AI's ability to handle common issues before escalation needed"
        })
    
    # Character performance
    for char, stats in insights.get("character_performance", {}).items():
        if stats["total"] > 10:
            positive_rate = (stats["positive"] / stats["total"]) * 100
            if positive_rate < 30:
                suggestions.append({
                    "type": "character_improvement",
                    "priority": "medium",
                    "character": char,
                    "suggestion": f"{char.title()} has low positive feedback ({positive_rate:.0f}%). Review this character's prompt.",
                    "action": f"Adjust {char}'s personality or response style in system prompt"
                })
    
    # Common questions without good answers
    if insights.get("common_questions"):
        suggestions.append({
            "type": "faq_addition",
            "priority": "medium",
            "suggestion": f"Found {len(insights['common_questions'])} frequently asked questions. Consider adding these to prompts.",
            "action": "Add common Q&A patterns to system prompts for better responses",
            "questions": [q["example"] for q in insights["common_questions"][:5]]
        })
    
    return suggestions


def format_prompt_update_report(insights: Dict) -> str:
    """Format insights into a readable report for prompt updates"""
    report = []
    report.append("=" * 60)
    report.append("PROMPT IMPROVEMENT REPORT")
    report.append(f"Generated: {datetime.utcnow().isoformat()}")
    report.append("=" * 60)
    report.append("")
    
    # Overview
    report.append("## OVERVIEW")
    report.append(f"Total Sessions Analyzed: {insights['total_sessions']}")
    report.append(f"Positive Sessions: {insights['quality_metrics']['positive_sessions']}")
    report.append(f"Negative Sessions: {insights['quality_metrics']['negative_sessions']}")
    report.append(f"Escalation Rate: {insights['quality_metrics']['escalation_rate']}%")
    report.append("")
    
    # Top Topics
    report.append("## TOP TOPICS")
    for topic, count in insights["topic_distribution"].most_common(10):
        report.append(f"  - {topic}: {count} mentions")
    report.append("")
    
    # Character Performance
    report.append("## CHARACTER PERFORMANCE")
    for char, stats in insights.get("character_performance", {}).items():
        if stats["total"] > 0:
            pos_rate = (stats["positive"] / stats["total"]) * 100
            report.append(f"  - {char.title()}: {stats['total']} sessions, {pos_rate:.0f}% positive")
    report.append("")
    
    # Suggestions
    report.append("## IMPROVEMENT SUGGESTIONS")
    for i, suggestion in enumerate(insights.get("improvement_suggestions", []), 1):
        report.append(f"\n{i}. [{suggestion['priority'].upper()}] {suggestion['type']}")
        report.append(f"   {suggestion['suggestion']}")
        report.append(f"   Action: {suggestion['action']}")
        if "questions" in suggestion:
            report.append("   Common questions:")
            for q in suggestion["questions"]:
                report.append(f"     - {q[:80]}...")
    
    report.append("")
    report.append("=" * 60)
    
    return "\n".join(report)
