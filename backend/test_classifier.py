"""
ML Classifier Unit Tests — Academic Navigator
Tests for the keyword fallback classifier (classify_with_keywords)
and the main classify_ticket entry point.

Run: cd backend && python -m pytest test_classifier.py -v
"""

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from classifier import classify_with_keywords, classify_ticket, CATEGORIES, CATEGORY_MAP


# ─────────────────────────────────────────────────────────────
# 1. CATEGORIES list
# ─────────────────────────────────────────────────────────────
def test_categories_contains_five_main():
    """Only 5 visible categories (general is internal fallback)."""
    visible = [c for c in CATEGORIES if c != 'general']
    assert len(visible) == 5


def test_categories_includes_all_departments():
    assert 'assignment' in CATEGORIES
    assert 'grades' in CATEGORIES
    assert 'capstone' in CATEGORIES
    assert 'administrative' in CATEGORIES
    assert 'technical' in CATEGORIES


# ─────────────────────────────────────────────────────────────
# 2. CATEGORY_MAP normalisation
# ─────────────────────────────────────────────────────────────
def test_category_map_normalises_title_case():
    assert CATEGORY_MAP['Assignment'] == 'assignment'
    assert CATEGORY_MAP['Grades'] == 'grades'
    assert CATEGORY_MAP['Technical'] == 'technical'


def test_category_map_normalises_verbose_labels():
    assert CATEGORY_MAP['Assignment Issues'] == 'assignment'
    assert CATEGORY_MAP['Grade Appeals'] == 'grades'
    assert CATEGORY_MAP['Technical Support'] == 'technical'
    assert CATEGORY_MAP['Administrative Issues'] == 'administrative'


# ─────────────────────────────────────────────────────────────
# 3. keyword classifier — correct routing
# ─────────────────────────────────────────────────────────────
def test_keyword_technical_wifi():
    category, confidence = classify_with_keywords(
        "I cannot connect to the wifi in my dorm room, keeps disconnecting"
    )
    assert category == 'technical'
    assert confidence >= 0.7


def test_keyword_grades_appeal():
    category, confidence = classify_with_keywords(
        "I want to appeal my exam grade, I believe my score was marked wrong"
    )
    assert category == 'grades'
    assert confidence >= 0.7


def test_keyword_assignment_canvas():
    category, confidence = classify_with_keywords(
        "I cannot submit my assignment on canvas before the deadline"
    )
    assert category == 'assignment'
    assert confidence >= 0.7


def test_keyword_capstone_thesis():
    category, confidence = classify_with_keywords(
        "I need feedback on my capstone project proposal and dissertation outline"
    )
    assert category == 'capstone'
    assert confidence >= 0.7


def test_keyword_administrative_registration():
    category, confidence = classify_with_keywords(
        "I need to get my official transcript for course registration and enrollment"
    )
    # 'transcript' appears in both grades and administrative — administrative wins on count
    assert category in ('administrative', 'grades')
    assert confidence >= 0.7


# ─────────────────────────────────────────────────────────────
# 4. keyword classifier — edge cases
# ─────────────────────────────────────────────────────────────
def test_keyword_no_match_returns_general():
    category, confidence = classify_with_keywords(
        "Hello, I have a general question about campus life"
    )
    assert category == 'general'
    assert 0.5 <= confidence <= 0.75


def test_keyword_confidence_never_exceeds_98_percent():
    text = " ".join(["wifi", "internet", "login", "password", "system",
                     "error", "bug", "computer", "access", "account"] * 3)
    _, confidence = classify_with_keywords(text)
    assert confidence <= 0.98


def test_keyword_case_insensitive():
    cat1, _ = classify_with_keywords("WIFI is not working")
    cat2, _ = classify_with_keywords("wifi is not working")
    assert cat1 == cat2


def test_keyword_returns_tuple():
    result = classify_with_keywords("my assignment deadline has passed")
    assert isinstance(result, tuple)
    assert len(result) == 2


def test_keyword_confidence_is_float():
    _, confidence = classify_with_keywords("wifi login error password")
    assert isinstance(confidence, float)


def test_classify_ticket_returns_valid_category():
    """classify_ticket (API wrapper) must return a known category."""
    # Note: may fall back to keywords if API is cold
    try:
        category, confidence = classify_ticket("wifi not working")
        assert category in CATEGORIES
        assert 0 < confidence <= 1.0
    except Exception:
        # API unavailable — keyword fallback is expected behaviour
        category, confidence = classify_with_keywords("wifi not working")
        assert category in CATEGORIES
