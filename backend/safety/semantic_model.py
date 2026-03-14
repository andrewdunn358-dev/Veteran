"""
RadioCheck Safeguarding - Semantic Safety Model
================================================
Version 1.0 - March 2026

Semantic similarity detection using sentence embeddings.
Detects suicidal intent even when exact phrases don't match.

Uses sentence-transformers for embedding generation and
cosine similarity for phrase matching.
"""

import logging
import time
from typing import Dict, List, Optional, Tuple, Any
import numpy as np
from functools import lru_cache

logger = logging.getLogger(__name__)

# ============================================================================
# CONFIGURATION
# ============================================================================

# Similarity thresholds
SIMILARITY_THRESHOLD_HIGH = 0.80    # Strong semantic match
SIMILARITY_THRESHOLD_MEDIUM = 0.70  # Moderate semantic match  
SIMILARITY_THRESHOLD_LOW = 0.60     # Weak semantic match

# Risk weights based on similarity level
SIMILARITY_RISK_WEIGHTS = {
    "high": 40,
    "medium": 25,
    "low": 10,
}

# Model configuration
MODEL_NAME = "sentence-transformers/all-MiniLM-L6-v2"
EMBEDDING_DIMENSION = 384

# ============================================================================
# REFERENCE PHRASES FOR SEMANTIC MATCHING
# These are "gold standard" suicide-risk phrases with known embeddings
# ============================================================================

SEMANTIC_REFERENCE_PHRASES = {
    "ideation": [
        "I want to end my life",
        "I want to kill myself",
        "I don't want to live anymore",
        "I want to die",
        "I'm thinking about suicide",
        "I can't go on living",
        "Life isn't worth living anymore",
        "I'd be better off dead",
        "I want everything to end",
        "I want the pain to stop permanently",
    ],
    "hopelessness": [
        "There's no hope for me",
        "Nothing will ever get better",
        "I have no future",
        "It's never going to change",
        "I'm trapped with no way out",
        "I've lost all hope",
        "There's no point in anything",
        "I give up on everything",
        "I can't see any way forward",
        "I don't think I can keep fighting",
    ],
    "passive_death_wish": [
        "I wish I wasn't here",
        "I don't want to wake up tomorrow",
        "I wish I could just disappear",
        "I hope I don't wake up",
        "I'm tired of being alive",
        "I wish I was never born",
        "I just want to fade away",
        "I don't belong in this world",
        "I'm done with life",
        "I'm at the end of the road",
    ],
    "method": [
        "I'm thinking of ways to kill myself",
        "I know how I would do it",
        "I've been researching suicide methods",
        "I have a plan to end my life",
        "I'm going to take all my pills",
        "I'm going to drive off a cliff",
        "I'm going to hang myself",
        "I've been saving up medication",
        "I know where I would do it",
        "I've thought about how to make it quick",
    ],
    "intent": [
        "I've decided to end my life",
        "I'm going to do it tonight",
        "This is my final decision",
        "I won't be here tomorrow",
        "I've made up my mind to die",
        "I'm going through with it",
        "Nothing will change my mind",
        "I'm ready to end it all",
        "This is goodbye forever",
        "I'm doing it no matter what",
    ],
    "burden": [
        "Everyone would be better off without me",
        "I'm just a burden to everyone",
        "My family would be happier if I was gone",
        "Nobody would miss me if I was gone",
        "I'm making everyone's life worse",
        "I'm dragging everyone down with me",
        "They'd be relieved if I was dead",
        "I'm worthless and useless",
        "No one needs me around anymore",
        "The world doesn't need me",
    ],
}

# ============================================================================
# MODEL MANAGEMENT
# ============================================================================

_model = None
_reference_embeddings: Dict[str, List[np.ndarray]] = {}
_model_loaded = False


def _load_model():
    """Load the sentence transformer model."""
    global _model, _model_loaded
    
    if _model_loaded:
        return True
    
    try:
        from sentence_transformers import SentenceTransformer
        _model = SentenceTransformer(MODEL_NAME)
        _model_loaded = True
        logger.info(f"[SemanticSafetyModel] Loaded model: {MODEL_NAME}")
        return True
    except ImportError:
        logger.warning("[SemanticSafetyModel] sentence-transformers not installed. Semantic analysis disabled.")
        return False
    except Exception as e:
        logger.error(f"[SemanticSafetyModel] Failed to load model: {e}")
        return False


def _precompute_reference_embeddings():
    """Pre-compute embeddings for all reference phrases."""
    global _reference_embeddings
    
    if not _model:
        return
    
    start_time = time.time()
    
    for category, phrases in SEMANTIC_REFERENCE_PHRASES.items():
        embeddings = _model.encode(phrases, convert_to_numpy=True)
        _reference_embeddings[category] = list(embeddings)
    
    elapsed = (time.time() - start_time) * 1000
    total_phrases = sum(len(p) for p in SEMANTIC_REFERENCE_PHRASES.values())
    logger.info(f"[SemanticSafetyModel] Pre-computed {total_phrases} reference embeddings in {elapsed:.1f}ms")


def initialize_semantic_model() -> bool:
    """Initialize the semantic model and pre-compute embeddings."""
    if not _load_model():
        return False
    
    _precompute_reference_embeddings()
    return True


# ============================================================================
# SEMANTIC ANALYSIS
# ============================================================================

def compute_embedding(text: str) -> Optional[np.ndarray]:
    """Compute embedding for a text string."""
    if not _model:
        if not _load_model():
            return None
    
    try:
        embedding = _model.encode(text, convert_to_numpy=True)
        return embedding
    except Exception as e:
        logger.error(f"[SemanticSafetyModel] Embedding failed: {e}")
        return None


def cosine_similarity(vec1: np.ndarray, vec2: np.ndarray) -> float:
    """Compute cosine similarity between two vectors."""
    if vec1 is None or vec2 is None:
        return 0.0
    
    dot_product = np.dot(vec1, vec2)
    norm1 = np.linalg.norm(vec1)
    norm2 = np.linalg.norm(vec2)
    
    if norm1 == 0 or norm2 == 0:
        return 0.0
    
    return float(dot_product / (norm1 * norm2))


def analyze_semantic_risk(
    message: str,
    return_details: bool = False
) -> Dict[str, Any]:
    """
    Analyze a message for semantic similarity to suicide-risk phrases.
    
    Returns:
        - semantic_risk_score: 0-100 score based on similarity
        - highest_similarity: highest cosine similarity found
        - matched_category: category with highest match
        - semantic_matches: list of matches above threshold
    """
    if not _model or not _reference_embeddings:
        # Try to initialize
        if not initialize_semantic_model():
            return {
                "semantic_risk_score": 0,
                "highest_similarity": 0.0,
                "matched_category": None,
                "semantic_matches": [],
                "model_available": False,
            }
    
    start_time = time.time()
    
    # Compute embedding for input message
    message_embedding = compute_embedding(message)
    if message_embedding is None:
        return {
            "semantic_risk_score": 0,
            "highest_similarity": 0.0,
            "matched_category": None,
            "semantic_matches": [],
            "model_available": True,
            "error": "Failed to compute embedding",
        }
    
    # Compare against all reference embeddings
    matches = []
    highest_similarity = 0.0
    matched_category = None
    
    for category, embeddings in _reference_embeddings.items():
        for idx, ref_embedding in enumerate(embeddings):
            similarity = cosine_similarity(message_embedding, ref_embedding)
            
            if similarity > highest_similarity:
                highest_similarity = similarity
                matched_category = category
            
            if similarity >= SIMILARITY_THRESHOLD_LOW:
                matches.append({
                    "category": category,
                    "phrase_index": idx,
                    "reference_phrase": SEMANTIC_REFERENCE_PHRASES[category][idx],
                    "similarity": round(similarity, 3),
                })
    
    # Calculate semantic risk score
    semantic_risk_score = 0
    
    if highest_similarity >= SIMILARITY_THRESHOLD_HIGH:
        semantic_risk_score = SIMILARITY_RISK_WEIGHTS["high"]
        # Additional bonus for critical categories
        if matched_category in ["intent", "method"]:
            semantic_risk_score += 20
    elif highest_similarity >= SIMILARITY_THRESHOLD_MEDIUM:
        semantic_risk_score = SIMILARITY_RISK_WEIGHTS["medium"]
    elif highest_similarity >= SIMILARITY_THRESHOLD_LOW:
        semantic_risk_score = SIMILARITY_RISK_WEIGHTS["low"]
    
    # Sort matches by similarity
    matches.sort(key=lambda x: x["similarity"], reverse=True)
    
    processing_time = (time.time() - start_time) * 1000
    
    result = {
        "semantic_risk_score": semantic_risk_score,
        "highest_similarity": round(highest_similarity, 3),
        "matched_category": matched_category,
        "semantic_matches": matches[:5] if return_details else [],  # Top 5 matches
        "model_available": True,
        "processing_time_ms": round(processing_time, 2),
    }
    
    # Log high-similarity detections
    if highest_similarity >= SIMILARITY_THRESHOLD_MEDIUM:
        logger.warning(
            f"[SemanticSafetyModel] High similarity detected: "
            f"{highest_similarity:.2f} -> {matched_category}"
        )
    
    return result


def batch_analyze_semantic_risk(messages: List[str]) -> List[Dict[str, Any]]:
    """
    Analyze multiple messages for semantic risk.
    More efficient than calling analyze_semantic_risk individually.
    """
    if not _model or not _reference_embeddings:
        if not initialize_semantic_model():
            return [{"semantic_risk_score": 0, "model_available": False} for _ in messages]
    
    # Batch encode all messages
    try:
        message_embeddings = _model.encode(messages, convert_to_numpy=True)
    except Exception as e:
        logger.error(f"[SemanticSafetyModel] Batch encoding failed: {e}")
        return [{"semantic_risk_score": 0, "error": str(e)} for _ in messages]
    
    results = []
    for msg_idx, msg_embedding in enumerate(message_embeddings):
        highest_similarity = 0.0
        matched_category = None
        
        for category, embeddings in _reference_embeddings.items():
            for ref_embedding in embeddings:
                similarity = cosine_similarity(msg_embedding, ref_embedding)
                if similarity > highest_similarity:
                    highest_similarity = similarity
                    matched_category = category
        
        # Calculate score
        semantic_risk_score = 0
        if highest_similarity >= SIMILARITY_THRESHOLD_HIGH:
            semantic_risk_score = SIMILARITY_RISK_WEIGHTS["high"]
            if matched_category in ["intent", "method"]:
                semantic_risk_score += 20
        elif highest_similarity >= SIMILARITY_THRESHOLD_MEDIUM:
            semantic_risk_score = SIMILARITY_RISK_WEIGHTS["medium"]
        elif highest_similarity >= SIMILARITY_THRESHOLD_LOW:
            semantic_risk_score = SIMILARITY_RISK_WEIGHTS["low"]
        
        results.append({
            "semantic_risk_score": semantic_risk_score,
            "highest_similarity": round(highest_similarity, 3),
            "matched_category": matched_category,
            "model_available": True,
        })
    
    return results


# ============================================================================
# INDIRECT EXPRESSION DETECTION
# ============================================================================

# Phrases that express suicidal intent indirectly
INDIRECT_EXPRESSIONS = [
    # Metaphorical death wishes
    ("not sure I'll make it through", "passive_death_wish", 0.75),
    ("don't know how much longer I can do this", "hopelessness", 0.65),
    ("running out of fight", "hopelessness", 0.70),
    ("lost the will to keep going", "hopelessness", 0.75),
    ("at the end of my rope", "hopelessness", 0.70),
    ("can't see the light anymore", "hopelessness", 0.65),
    ("darkness is winning", "passive_death_wish", 0.70),
    ("losing this battle", "hopelessness", 0.65),
    ("the pain is too much", "passive_death_wish", 0.65),
    ("can't take any more", "hopelessness", 0.70),
    
    # Final arrangements
    ("getting my affairs in order", "finality", 0.80),
    ("making sure my family is taken care of", "finality", 0.75),
    ("won't need these anymore", "finality", 0.80),
    ("giving away my things", "finality", 0.85),
    ("just want to say goodbye", "finality", 0.75),
    
    # Indirect suicidal statements
    ("found a way to make the pain stop", "method", 0.85),
    ("know what I need to do", "intent", 0.80),
    ("made peace with everything", "finality", 0.75),
    ("it'll all be over soon", "intent", 0.85),
    ("won't have to worry much longer", "passive_death_wish", 0.80),
]


def check_indirect_expressions(message: str) -> List[Dict[str, Any]]:
    """
    Check for indirect expressions of suicidal intent.
    These are phrases that don't use explicit suicide language
    but semantically indicate suicidal thinking.
    """
    message_lower = message.lower()
    detected = []
    
    for phrase, category, weight in INDIRECT_EXPRESSIONS:
        if phrase.lower() in message_lower:
            detected.append({
                "phrase": phrase,
                "category": category,
                "weight": weight,
                "type": "indirect_expression",
            })
    
    return detected


# ============================================================================
# COMBINED SEMANTIC ANALYSIS
# ============================================================================

def full_semantic_analysis(message: str) -> Dict[str, Any]:
    """
    Perform full semantic analysis combining:
    1. Embedding-based similarity
    2. Indirect expression detection
    
    Returns comprehensive semantic risk assessment.
    """
    # Get embedding-based analysis
    embedding_analysis = analyze_semantic_risk(message, return_details=True)
    
    # Get indirect expression matches
    indirect_matches = check_indirect_expressions(message)
    
    # Combine scores
    combined_score = embedding_analysis["semantic_risk_score"]
    
    # Add indirect expression scores
    for match in indirect_matches:
        combined_score += int(match["weight"] * 20)
    
    combined_score = min(combined_score, 100)  # Cap at 100
    
    # Determine if intervention is needed
    requires_intervention = (
        combined_score >= 50 or
        embedding_analysis["highest_similarity"] >= SIMILARITY_THRESHOLD_HIGH or
        any(m["category"] in ["intent", "method"] for m in indirect_matches)
    )
    
    return {
        "combined_semantic_score": combined_score,
        "embedding_score": embedding_analysis["semantic_risk_score"],
        "highest_similarity": embedding_analysis["highest_similarity"],
        "matched_category": embedding_analysis["matched_category"],
        "semantic_matches": embedding_analysis.get("semantic_matches", []),
        "indirect_expressions": indirect_matches,
        "requires_intervention": requires_intervention,
        "model_available": embedding_analysis.get("model_available", False),
        "processing_time_ms": embedding_analysis.get("processing_time_ms", 0),
    }


# ============================================================================
# INITIALIZATION
# ============================================================================

# Attempt to initialize on module load (will gracefully fail if dependencies missing)
try:
    initialize_semantic_model()
except Exception as e:
    logger.warning(f"[SemanticSafetyModel] Initialization skipped: {e}")

print("[SemanticSafetyModel] Module loaded - semantic similarity analysis ready")
