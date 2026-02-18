"""
Crisis Resources - Location-aware crisis routing
Adapted from the Veteran AI Safety Layer by Zentrafuge
https://github.com/TheAIOldtimer/veteran-ai-safety-layer

MIT License - Free to use with attribution

Provides crisis line numbers and emergency resources by country code.
Includes veteran-specific resources where available.

IMPORTANT FOR IMPLEMENTING ORGANISATIONS:
- Verify all numbers are current before deployment
- Numbers change. Set a calendar reminder to check every 6 months.
- Always include a local emergency services fallback (999, 911, 000 etc.)

Last verified: February 2026
"""

from typing import Dict, List, Any


# =============================================================================
# RESOURCE DEFINITIONS
# =============================================================================

CRISIS_RESOURCES: Dict[str, Dict[str, Any]] = {
    "GB": {
        "country": "United Kingdom",
        "emergency": "999",
        "general_crisis": [
            {
                "name": "Samaritans",
                "phone": "116 123",
                "text": None,
                "hours": "24/7",
                "url": "https://www.samaritans.org",
                "notes": "Free to call, 24 hours a day"
            },
            {
                "name": "Crisis Text Line UK",
                "phone": None,
                "text": "Text SHOUT to 85258",
                "hours": "24/7",
                "url": "https://giveusashout.org",
                "notes": "Free, confidential text support"
            },
            {
                "name": "NHS 111",
                "phone": "111",
                "text": None,
                "hours": "24/7",
                "url": "https://111.nhs.uk",
                "notes": "Option 2 for mental health crisis"
            },
        ],
        "veteran_specific": [
            {
                "name": "Combat Stress 24/7 Helpline",
                "phone": "0800 138 1619",
                "text": None,
                "hours": "24/7",
                "url": "https://www.combatstress.org.uk",
                "notes": "Free, specifically for UK veterans"
            },
            {
                "name": "Veterans Gateway",
                "phone": "0808 802 1212",
                "text": "Text 81212",
                "hours": "24/7",
                "url": "https://www.veteransgateway.org.uk",
                "notes": "Connects veterans to relevant support services"
            },
            {
                "name": "Op COURAGE (NHS)",
                "phone": "Refer via GP or self-refer",
                "text": None,
                "hours": "Office hours",
                "url": "https://www.nhs.uk/mental-health/veterans",
                "notes": "NHS specialist mental health service for veterans"
            },
        ]
    },
    "US": {
        "country": "United States",
        "emergency": "911",
        "general_crisis": [
            {
                "name": "988 Suicide and Crisis Lifeline",
                "phone": "988",
                "text": "Text 988",
                "hours": "24/7",
                "url": "https://988lifeline.org",
                "notes": "Call or text 988"
            },
            {
                "name": "Crisis Text Line",
                "phone": None,
                "text": "Text HOME to 741741",
                "hours": "24/7",
                "url": "https://www.crisistextline.org",
                "notes": "Free, confidential text support"
            },
        ],
        "veteran_specific": [
            {
                "name": "Veterans Crisis Line",
                "phone": "988 then press 1",
                "text": "Text 838255",
                "hours": "24/7",
                "url": "https://www.veteranscrisisline.net",
                "notes": "Dedicated support for veterans, service members, and families"
            },
            {
                "name": "Make the Connection",
                "phone": None,
                "text": None,
                "hours": None,
                "url": "https://maketheconnection.net",
                "notes": "VA resource connecting veterans to mental health support"
            },
        ]
    },
    "CA": {
        "country": "Canada",
        "emergency": "911",
        "general_crisis": [
            {
                "name": "Talk Suicide Canada",
                "phone": "1-833-456-4566",
                "text": "Text 45645 (4pm-midnight ET)",
                "hours": "24/7 phone, limited text hours",
                "url": "https://talksuicide.ca",
                "notes": "National crisis line"
            },
        ],
        "veteran_specific": [
            {
                "name": "Veterans Affairs Canada - OSI Crisis Line",
                "phone": "1-800-268-7708",
                "text": None,
                "hours": "24/7",
                "url": "https://www.veterans.gc.ca",
                "notes": "Operational stress injury support for Canadian veterans"
            },
        ]
    },
    "AU": {
        "country": "Australia",
        "emergency": "000",
        "general_crisis": [
            {
                "name": "Lifeline",
                "phone": "13 11 14",
                "text": "Text 0477 13 11 14",
                "hours": "24/7",
                "url": "https://www.lifeline.org.au",
                "notes": "Crisis support and suicide prevention"
            },
            {
                "name": "Beyond Blue",
                "phone": "1300 22 4636",
                "text": None,
                "hours": "24/7",
                "url": "https://www.beyondblue.org.au",
                "notes": "Anxiety, depression and suicide prevention support"
            },
        ],
        "veteran_specific": [
            {
                "name": "Open Arms - Veterans and Families Counselling",
                "phone": "1800 011 046",
                "text": None,
                "hours": "24/7",
                "url": "https://www.openarms.gov.au",
                "notes": "Free, confidential counselling for ADF members and families"
            },
        ]
    },
    "IE": {
        "country": "Ireland",
        "emergency": "999 or 112",
        "general_crisis": [
            {
                "name": "Samaritans Ireland",
                "phone": "116 123",
                "text": None,
                "hours": "24/7",
                "url": "https://www.samaritans.org/ireland",
                "notes": "Free to call at any time"
            },
            {
                "name": "Pieta",
                "phone": "116 123",
                "text": "Text HELLO to 51444",
                "hours": "24/7",
                "url": "https://www.pieta.ie",
                "notes": "Suicide and self-harm crisis intervention"
            },
        ],
        "veteran_specific": []
    },
    "NZ": {
        "country": "New Zealand",
        "emergency": "111",
        "general_crisis": [
            {
                "name": "Lifeline Aotearoa",
                "phone": "0800 543 354",
                "text": "Text 4357",
                "hours": "24/7",
                "url": "https://www.lifeline.org.nz",
                "notes": "Free crisis support"
            },
        ],
        "veteran_specific": [
            {
                "name": "Veterans Affairs New Zealand",
                "phone": "0800 483 8372",
                "text": None,
                "hours": "Office hours",
                "url": "https://www.veteransaffairs.mil.nz",
                "notes": "Support services for New Zealand veterans"
            },
        ]
    },
}

# Fallback for unknown country codes
DEFAULT_RESOURCES = {
    "country": "Unknown",
    "emergency": "Your local emergency number",
    "general_crisis": [
        {
            "name": "International Association for Suicide Prevention",
            "phone": None,
            "text": None,
            "hours": None,
            "url": "https://www.iasp.info/resources/Crisis_Centres/",
            "notes": "Directory of crisis centres worldwide"
        },
        {
            "name": "Findahelpline.com",
            "phone": None,
            "text": None,
            "hours": None,
            "url": "https://findahelpline.com",
            "notes": "Global directory of crisis helplines by country"
        },
    ],
    "veteran_specific": []
}


# =============================================================================
# PUBLIC INTERFACE
# =============================================================================

def get_crisis_resources(country_code: str) -> Dict[str, Any]:
    """
    Get crisis resources for a given country.
    
    Args:
        country_code: ISO 3166-1 alpha-2 country code (e.g. 'GB', 'US', 'AU')
                     Case insensitive.
    
    Returns:
        Dict containing emergency number, general crisis lines,
        and veteran-specific resources for that country.
        Falls back to DEFAULT_RESOURCES if country not found.
    """
    code = country_code.upper().strip() if country_code else ""
    return CRISIS_RESOURCES.get(code, DEFAULT_RESOURCES)


def format_crisis_message(
    country_code: str = "GB",
    prefer_veteran: bool = True,
    risk_level: str = "high"
) -> str:
    """
    Format a crisis message for display to a user in distress.
    
    Args:
        country_code: ISO country code of the user (default: GB)
        prefer_veteran: Whether to lead with veteran-specific resources
        risk_level: 'critical' or 'high' — affects message urgency
    
    Returns:
        A plain text crisis message suitable for display in chat.
    """
    resources = get_crisis_resources(country_code)
    
    lines = []
    
    if risk_level == "critical":
        lines.append(
            "I'm concerned about you right now and I want to make sure "
            "you're safe. Please reach out to one of these:"
        )
    else:
        lines.append(
            "I want you to know that support is available if you need it:"
        )
    
    lines.append("")
    
    # Lead with veteran-specific if available and preferred
    veteran_lines = resources.get("veteran_specific", [])
    general_lines = resources.get("general_crisis", [])
    
    primary = veteran_lines if (prefer_veteran and veteran_lines) else general_lines
    secondary = general_lines if (prefer_veteran and veteran_lines) else []
    
    for resource in primary[:2]:
        line = f"  {resource['name']}"
        if resource.get("phone"):
            line += f" — {resource['phone']}"
        if resource.get("text"):
            line += f" — {resource['text']}"
        if resource.get("hours"):
            line += f" ({resource['hours']})"
        lines.append(line)
    
    if secondary:
        lines.append("")
        for resource in secondary[:1]:
            line = f"  {resource['name']}"
            if resource.get("phone"):
                line += f" — {resource['phone']}"
            lines.append(line)
    
    lines.append("")
    lines.append(
        f"If you are in immediate danger, please call "
        f"{resources.get('emergency', 'your local emergency number')}."
    )
    
    return "\n".join(lines)


def get_veteran_helplines(country_code: str = "GB") -> List[Dict[str, Any]]:
    """
    Get veteran-specific helplines for a country.
    
    Args:
        country_code: ISO country code (default: GB)
    
    Returns:
        List of veteran-specific resources
    """
    resources = get_crisis_resources(country_code)
    return resources.get("veteran_specific", [])


def get_emergency_number(country_code: str = "GB") -> str:
    """
    Get the emergency services number for a country.
    
    Args:
        country_code: ISO country code (default: GB)
    
    Returns:
        Emergency number string (e.g. "999", "911")
    """
    resources = get_crisis_resources(country_code)
    return resources.get("emergency", "Your local emergency number")


def get_available_countries() -> List[str]:
    """Return list of country codes with configured resources."""
    return list(CRISIS_RESOURCES.keys())
