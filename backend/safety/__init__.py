"""
Safety Module - Veteran AI Safety Layer Integration
Adapted from https://github.com/TheAIOldtimer/veteran-ai-safety-layer

Enhanced with:
- Conversation trajectory monitoring
- Semantic similarity analysis
- Pattern detection
- 500+ phrase dataset

MIT License - Free to use with attribution to Zentrafuge
"""

from .safety_monitor import (
    EnhancedSafetyMonitor,
    RiskLevel,
    InterventionType,
    assess_message_safety,
)

from .crisis_resources import (
    get_crisis_resources,
    format_crisis_message,
    get_veteran_helplines,
    get_emergency_number,
    get_available_countries,
    CRISIS_RESOURCES,
)

from .phrase_dataset import (
    ALL_PHRASES,
    PHRASES_BY_CATEGORY,
    CATEGORY_SEVERITY_ORDER,
    PhraseEntry,
    get_phrase_count,
    get_high_severity_phrases,
)

from .conversation_monitor import (
    analyze_message_with_context,
    get_or_create_conversation_state,
    get_conversation_summary,
    clear_conversation_state,
    flag_candidate_phrase,
    get_candidate_phrases_for_review,
    get_audit_log,
)

from .semantic_model import (
    analyze_semantic_risk,
    full_semantic_analysis,
    initialize_semantic_model,
    check_indirect_expressions,
)

from .unified_safety import (
    analyze_message_unified,
    end_safety_session,
    get_session_safety_status,
    get_safety_audit_report,
    get_safety_system_status,
    initialize_safety_system,
)

__all__ = [
    # Safety Monitor (Original)
    'EnhancedSafetyMonitor',
    'RiskLevel',
    'InterventionType',
    'assess_message_safety',
    
    # Crisis Resources
    'get_crisis_resources',
    'format_crisis_message',
    'get_veteran_helplines',
    'get_emergency_number',
    'get_available_countries',
    'CRISIS_RESOURCES',
    
    # Phrase Dataset
    'ALL_PHRASES',
    'PHRASES_BY_CATEGORY',
    'CATEGORY_SEVERITY_ORDER',
    'PhraseEntry',
    'get_phrase_count',
    'get_high_severity_phrases',
    
    # Conversation Monitor
    'analyze_message_with_context',
    'get_or_create_conversation_state',
    'get_conversation_summary',
    'clear_conversation_state',
    'flag_candidate_phrase',
    'get_candidate_phrases_for_review',
    'get_audit_log',
    
    # Semantic Model
    'analyze_semantic_risk',
    'full_semantic_analysis',
    'initialize_semantic_model',
    'check_indirect_expressions',
    
    # Unified Safety System
    'analyze_message_unified',
    'end_safety_session',
    'get_session_safety_status',
    'get_safety_audit_report',
    'get_safety_system_status',
    'initialize_safety_system',
]
