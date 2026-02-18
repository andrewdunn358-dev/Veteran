"""
Safety Module - Veteran AI Safety Layer Integration
Adapted from https://github.com/TheAIOldtimer/veteran-ai-safety-layer

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

__all__ = [
    # Safety Monitor
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
]
