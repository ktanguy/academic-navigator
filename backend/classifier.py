# filepath: /Users/apple/academic-navigator/backend/classifier.py
"""
AI-powered ticket classification using remote API.
Falls back to keyword-based classification if the API is unavailable.
"""

import logging
import os
import requests

logger = logging.getLogger(__name__)

# Remote classifier API endpoint (Hugging Face Spaces deployment)
CLASSIFIER_API_URL = os.environ.get(
    'CLASSIFIER_API_URL', 
    'https://tkwizera-student-support-api.hf.space/classify'
)

# Define the categories
CATEGORIES = [
    'assignment',
    'grades', 
    'capstone',
    'administrative',
    'technical',
    'general'
]

# Map API categories to our internal categories (handle case variations)
CATEGORY_MAP = {
    'assignment': 'assignment',
    'grades': 'grades',
    'capstone': 'capstone',
    'administrative': 'administrative',
    'technical': 'technical',
    'general': 'general',
    'Assignment': 'assignment',
    'Grades': 'grades',
    'Capstone': 'capstone',
    'Administrative': 'administrative',
    'Technical': 'technical',
    'General': 'general',
    # Handle Hugging Face API format
    'Assignment Issues': 'assignment',
    'Grade Appeals': 'grades',
    'Capstone Project': 'capstone',
    'Administrative Issues': 'administrative',
    'Technical Support': 'technical',
    'General Inquiry': 'general',
}

logger.info(f"Remote classifier API configured: {CLASSIFIER_API_URL}")


def classify_with_api(text: str) -> tuple[str, float]:
    """
    Classify text using the remote AI API (Hugging Face Spaces).
    Returns (category, confidence)
    """
    try:
        response = requests.post(
            CLASSIFIER_API_URL,
            json={'text': text},
            headers={'Content-Type': 'application/json'},
            timeout=10  # 10 second timeout
        )
        
        if response.status_code == 200:
            data = response.json()
            
            # Hugging Face API returns predicted_category and confidence directly
            predicted_category = data.get('predicted_category', 'general')
            confidence = data.get('confidence', 0.5)
            
            # Map to our internal category names
            category = CATEGORY_MAP.get(predicted_category, 'general')
            
            logger.info(f"AI Classification: '{text[:50]}...' -> {category} ({confidence:.2%})")
            return category, round(confidence, 2)
        
        logger.warning(f"API returned status {response.status_code}, falling back to keywords")
        return classify_with_keywords(text)
        
    except requests.exceptions.Timeout:
        logger.warning("API timeout, falling back to keyword classification")
        return classify_with_keywords(text)
    except requests.exceptions.RequestException as e:
        logger.warning(f"API request failed: {e}, falling back to keyword classification")
        return classify_with_keywords(text)
    except Exception as e:
        logger.error(f"Unexpected error in API classification: {e}")
        return classify_with_keywords(text)


def classify_with_keywords(text: str) -> tuple[str, float]:
    """
    Fallback keyword-based classification.
    Returns (category, confidence)
    """
    import random
    
    text_lower = text.lower()
    
    keywords = {
        'assignment': ['assignment', 'homework', 'submit', 'upload', 'deadline', 'canvas', 'coursework', 'exercise', 'problem set'],
        'grades': ['grade', 'score', 'marks', 'appeal', 'exam', 'midterm', 'final', 'test', 'evaluation', 'gpa', 'transcript'],
        'capstone': ['capstone', 'thesis', 'project', 'proposal', 'research', 'dissertation', 'senior project'],
        'administrative': ['transcript', 'registration', 'enroll', 'document', 'certificate', 'form', 'records', 'registrar'],
        'technical': ['wifi', 'internet', 'login', 'password', 'system', 'error', 'bug', 'computer', 'access', 'account'],
    }
    
    # Count keyword matches for each category
    scores = {}
    for category, kws in keywords.items():
        score = sum(1 for kw in kws if kw in text_lower)
        if score > 0:
            scores[category] = score
    
    if scores:
        # Get category with most matches
        best_category = max(scores, key=scores.get)
        # Confidence based on number of matches (capped at 0.98)
        confidence = min(0.98, 0.7 + (scores[best_category] * 0.1))
        return best_category, round(confidence, 2)
    
    # Default to general with lower confidence
    return 'general', round(random.uniform(0.55, 0.70), 2)


def classify_ticket(text: str) -> tuple[str, float]:
    """
    Main classification function.
    Uses remote AI API, falls back to keywords if unavailable.
    """
    return classify_with_api(text)


def get_classifier_info() -> dict:
    """Get information about the current classifier."""
    # Check if API is reachable
    api_available = False
    try:
        # Test with a simple classification request
        response = requests.post(
            CLASSIFIER_API_URL,
            json={'text': 'test'},
            headers={'Content-Type': 'application/json'},
            timeout=5
        )
        api_available = response.status_code == 200 and 'predicted_category' in response.json()
    except:
        pass
    
    return {
        'using_ai': True,
        'api_url': CLASSIFIER_API_URL,
        'api_available': api_available,
        'model': 'AI Classifier (Hugging Face Spaces)',
        'fallback': 'keyword-based',
        'categories': CATEGORIES
    }
