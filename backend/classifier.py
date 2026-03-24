# ============================================================
# classifier.py — AI Ticket Classification
# ============================================================
# This file decides which department a support ticket belongs to.
#
# How it works:
#   1. A student submits a ticket with a subject and description
#   2. We send that text to an AI model on Hugging Face
#   3. The AI reads it and says: "This looks like an IT issue, 91% sure"
#   4. If the AI is 70% or more confident → ticket is auto-assigned
#   5. If below 70% → ticket is flagged for a human to review
#
# If the AI is unavailable (cold start, internet issue), we fall back
# to a simpler method: checking for keywords in the text.
# ============================================================

import logging
import os
import requests

logger = logging.getLogger(__name__)

# The web address of the AI model hosted on Hugging Face
# You can change this in the .env file using CLASSIFIER_API_URL
CLASSIFIER_API_URL = os.environ.get(
    'CLASSIFIER_API_URL',
    'https://tkwizera-student-support-api.hf.space/classify'
)

# The 6 categories tickets can be sorted into
CATEGORIES = [
    'assignment',       # Problems with homework or deadlines
    'grades',           # Grade appeals or exam issues
    'capstone',         # Final project or thesis issues
    'administrative',   # Registration, transcripts, documents
    'technical',        # WiFi, software, login problems
    'general'           # Anything that doesn't fit above
]

# The AI sometimes returns names like "Assignment Issues" instead of "assignment"
# This table converts all formats to our standard lowercase names
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
    'Assignment Issues': 'assignment',
    'Grade Appeals': 'grades',
    'Capstone Project': 'capstone',
    'Administrative Issues': 'administrative',
    'Technical Support': 'technical',
    'General Inquiry': 'general',
}

logger.info(f"Remote classifier API configured: {CLASSIFIER_API_URL}")


# ============================================================
# classify_with_api — Ask the AI model
# ============================================================
def classify_with_api(text: str) -> tuple[str, float]:
    # Send the ticket text to the Hugging Face AI model.
    # It returns two things:
    #   - a category name (e.g. "assignment")
    #   - a confidence score (e.g. 0.92 means 92% sure)
    try:
        response = requests.post(
            CLASSIFIER_API_URL,
            json={'text': text},
            headers={'Content-Type': 'application/json'},
            timeout=10  # Wait max 10 seconds — if no reply, use fallback
        )

        if response.status_code == 200:
            data = response.json()

            # Read the result from the API response
            predicted_category = data.get('predicted_category', 'general')
            confidence = data.get('confidence', 0.5)

            # Normalize the category name to our standard format
            category = CATEGORY_MAP.get(predicted_category, 'general')

            logger.info(f"AI Classification: '{text[:50]}...' -> {category} ({confidence:.2%})")
            return category, round(confidence, 2)

        # API responded but with an error — use keyword fallback
        logger.warning(f"API returned status {response.status_code}, falling back to keywords")
        return classify_with_keywords(text)

    except requests.exceptions.Timeout:
        # AI took too long to respond (common on free Hugging Face tier)
        logger.warning("API timeout, falling back to keyword classification")
        return classify_with_keywords(text)
    except requests.exceptions.RequestException as e:
        # No internet, DNS error, connection refused, etc.
        logger.warning(f"API request failed: {e}, falling back to keyword classification")
        return classify_with_keywords(text)
    except Exception as e:
        # Something else went wrong — still use fallback so the app doesn't crash
        logger.error(f"Unexpected error in API classification: {e}")
        return classify_with_keywords(text)


# ============================================================
# classify_with_keywords — Backup: guess by looking for words
# ============================================================
def classify_with_keywords(text: str) -> tuple[str, float]:
    # This is a simple backup when the AI is unavailable.
    # It scans the ticket text for common words related to each category.
    # The category with the most matches wins.
    #
    # Example: if the text contains "wifi", "login", "password"
    # it will match the 'technical' category with high confidence.
    import random

    text_lower = text.lower()

    # Keywords for each category
    keywords = {
        'assignment': ['assignment', 'homework', 'submit', 'upload', 'deadline', 'canvas', 'coursework', 'exercise', 'problem set'],
        'grades':     ['grade', 'score', 'marks', 'appeal', 'exam', 'midterm', 'final', 'test', 'evaluation', 'gpa', 'transcript'],
        'capstone':   ['capstone', 'thesis', 'project', 'proposal', 'research', 'dissertation', 'senior project'],
        'administrative': ['transcript', 'registration', 'enroll', 'document', 'certificate', 'form', 'records', 'registrar'],
        'technical':  ['wifi', 'internet', 'login', 'password', 'system', 'error', 'bug', 'computer', 'access', 'account'],
    }

    # Count how many keywords from each category appear in the text
    scores = {}
    for category, kws in keywords.items():
        score = sum(1 for kw in kws if kw in text_lower)
        if score > 0:
            scores[category] = score

    if scores:
        # Pick the category with the most keyword matches
        best_category = max(scores, key=scores.get)
        # More matches = higher confidence, but never above 98%
        confidence = min(0.98, 0.7 + (scores[best_category] * 0.1))
        return best_category, round(confidence, 2)

    # No keywords matched at all — default to general with low confidence
    # Low confidence means it will be flagged for human review
    return 'general', round(random.uniform(0.55, 0.70), 2)


# ============================================================
# classify_ticket — Main function called from tickets.py
# ============================================================
def classify_ticket(text: str) -> tuple[str, float]:
    # This is the only function tickets.py calls.
    # It tries the AI first, and the fallback happens automatically inside.
    return classify_with_api(text)


# ============================================================
# get_classifier_info — Check if the AI is online
# ============================================================
def get_classifier_info() -> dict:
    # Used by the admin panel to show whether the AI is currently working.
    api_available = False
    try:
        # Send a test request to see if the AI responds
        response = requests.post(
            CLASSIFIER_API_URL,
            json={'text': 'test'},
            headers={'Content-Type': 'application/json'},
            timeout=5
        )
        api_available = response.status_code == 200 and 'predicted_category' in response.json()
    except:
        pass  # If it fails, api_available stays False

    return {
        'using_ai': True,
        'api_url': CLASSIFIER_API_URL,
        'api_available': api_available,
        'model': 'AI Classifier (Hugging Face Spaces)',
        'fallback': 'keyword-based',
        'categories': CATEGORIES
    }
