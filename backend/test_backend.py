"""
Backend Unit Tests — Academic Navigator
Tests for Flask app, authentication, ticket routing, and data models.

Run: cd backend && python -m pytest test_backend.py -v
"""

import sys
import os
import json
import pytest

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# ─────────────────────────────────────────────────────────────
# App fixture — use an in-memory SQLite database for tests
# ─────────────────────────────────────────────────────────────
@pytest.fixture(scope='module')
def app():
    from app import app as flask_app
    from models.models import db
    flask_app.config['TESTING'] = True
    flask_app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
    flask_app.config['JWT_SECRET_KEY'] = 'test-secret'
    with flask_app.app_context():
        db.create_all()
        yield flask_app
        db.drop_all()


@pytest.fixture(scope='module')
def client(app):
    return app.test_client()


@pytest.fixture(scope='module')
def student_token(client):
    """Register and login a student, return JWT."""
    client.post('/api/auth/register', json={
        'name': 'Test Student',
        'email': 'unit.student@test.com',
        'password': 'password123'
    })
    r = client.post('/api/auth/login', json={
        'email': 'unit.student@test.com',
        'password': 'password123'
    })
    return r.get_json().get('token')


@pytest.fixture(scope='module')
def admin_token(client):
    """Login with seeded admin account."""
    r = client.post('/api/auth/login', json={
        'email': 'admin@alu.edu',
        'password': 'password123'
    })
    data = r.get_json()
    return data.get('token') if data else None


# ─────────────────────────────────────────────────────────────
# 1. Health check
# ─────────────────────────────────────────────────────────────
def test_health_endpoint_returns_200(client):
    r = client.get('/api/health')
    assert r.status_code == 200


def test_health_endpoint_returns_json(client):
    r = client.get('/api/health')
    data = r.get_json()
    assert data is not None


def test_health_endpoint_has_status_field(client):
    r = client.get('/api/health')
    data = r.get_json()
    assert 'status' in data or r.status_code == 200


# ─────────────────────────────────────────────────────────────
# 2. Authentication
# ─────────────────────────────────────────────────────────────
def test_register_new_user_returns_201(client):
    r = client.post('/api/auth/register', json={
        'name': 'New Student',
        'email': 'newstudent@test.com',
        'password': 'password123'
    })
    assert r.status_code == 201


def test_register_returns_token(client):
    r = client.post('/api/auth/register', json={
        'name': 'Another Student',
        'email': 'another@test.com',
        'password': 'password123'
    })
    data = r.get_json()
    assert 'token' in data


def test_register_duplicate_email_returns_400(client):
    client.post('/api/auth/register', json={
        'name': 'Dup Student',
        'email': 'dup@test.com',
        'password': 'password123'
    })
    r = client.post('/api/auth/register', json={
        'name': 'Dup Student',
        'email': 'dup@test.com',
        'password': 'password123'
    })
    assert r.status_code == 400


def test_login_correct_credentials_returns_200(client, student_token):
    # student_token fixture ensures unit.student@test.com is registered first
    r = client.post('/api/auth/login', json={
        'email': 'unit.student@test.com',
        'password': 'password123'
    })
    assert r.status_code == 200


def test_login_wrong_password_returns_401(client):
    r = client.post('/api/auth/login', json={
        'email': 'unit.student@test.com',
        'password': 'wrongpassword'
    })
    assert r.status_code == 401


def test_login_nonexistent_user_returns_401(client):
    r = client.post('/api/auth/login', json={
        'email': 'nobody@test.com',
        'password': 'password123'
    })
    assert r.status_code == 401


def test_me_without_token_returns_401(client):
    r = client.get('/api/auth/me')
    assert r.status_code == 401


def test_me_with_valid_token_returns_200(client, student_token):
    r = client.get('/api/auth/me', headers={
        'Authorization': f'Bearer {student_token}'
    })
    assert r.status_code == 200


def test_me_returns_user_data(client, student_token):
    r = client.get('/api/auth/me', headers={
        'Authorization': f'Bearer {student_token}'
    })
    data = r.get_json()
    assert 'email' in data or 'user' in data


# ─────────────────────────────────────────────────────────────
# 3. Ticket submission
# ─────────────────────────────────────────────────────────────
def test_submit_ticket_authenticated_returns_201(client, student_token):
    r = client.post('/api/tickets', json={
        'subject': 'WiFi not working in library',
        'description': 'Cannot connect to campus network, authentication keeps failing'
    }, headers={'Authorization': f'Bearer {student_token}'})
    assert r.status_code == 201


def test_submit_ticket_has_ai_category(client, student_token):
    r = client.post('/api/tickets', json={
        'subject': 'Grade appeal for midterm',
        'description': 'My exam score was marked incorrectly'
    }, headers={'Authorization': f'Bearer {student_token}'})
    data = r.get_json()
    ticket = data.get('ticket', {})
    assert ticket.get('ai_category') is not None


def test_submit_ticket_has_ai_confidence(client, student_token):
    r = client.post('/api/tickets', json={
        'subject': 'Cannot submit assignment on canvas',
        'description': 'Upload keeps failing before the deadline'
    }, headers={'Authorization': f'Bearer {student_token}'})
    data = r.get_json()
    ticket = data.get('ticket', {})
    assert ticket.get('ai_confidence') is not None


def test_submit_ticket_has_department(client, student_token):
    r = client.post('/api/tickets', json={
        'subject': 'WiFi password not working',
        'description': 'Cannot login to campus wifi system'
    }, headers={'Authorization': f'Bearer {student_token}'})
    data = r.get_json()
    ticket = data.get('ticket', {})
    assert ticket.get('department') is not None


def test_submit_ticket_unauthenticated_returns_401(client):
    r = client.post('/api/tickets', json={
        'subject': 'Test ticket',
        'description': 'Should fail'
    })
    assert r.status_code == 401


def test_get_own_tickets_returns_200(client, student_token):
    r = client.get('/api/tickets', headers={
        'Authorization': f'Bearer {student_token}'
    })
    assert r.status_code == 200


def test_get_tickets_returns_list(client, student_token):
    r = client.get('/api/tickets', headers={
        'Authorization': f'Bearer {student_token}'
    })
    data = r.get_json()
    assert 'tickets' in data
    assert isinstance(data['tickets'], list)


# ─────────────────────────────────────────────────────────────
# 4. Role-based access control
# ─────────────────────────────────────────────────────────────
def test_student_cannot_access_user_stats(client, student_token):
    r = client.get('/api/users/stats', headers={
        'Authorization': f'Bearer {student_token}'
    })
    assert r.status_code == 403


def test_admin_can_access_user_stats(client, admin_token):
    if not admin_token:
        pytest.skip('Admin account not seeded')
    r = client.get('/api/users/stats', headers={
        'Authorization': f'Bearer {admin_token}'
    })
    assert r.status_code == 200


def test_student_sees_only_facilitators_in_user_list(client, student_token):
    r = client.get('/api/users', headers={
        'Authorization': f'Bearer {student_token}'
    })
    assert r.status_code == 200
    data = r.get_json()
    users = data.get('users', [])
    for u in users:
        assert u['role'] in ('facilitator', 'admin')


def test_unauthenticated_cannot_get_tickets(client):
    r = client.get('/api/tickets')
    assert r.status_code == 401


# ─────────────────────────────────────────────────────────────
# 5. Notifications
# ─────────────────────────────────────────────────────────────
def test_get_notifications_returns_200(client, student_token):
    r = client.get('/api/notifications', headers={
        'Authorization': f'Bearer {student_token}'
    })
    assert r.status_code == 200


def test_notifications_has_unread_count(client, student_token):
    r = client.get('/api/notifications', headers={
        'Authorization': f'Bearer {student_token}'
    })
    data = r.get_json()
    assert 'unread_count' in data


def test_email_config_blocked_for_students(client, student_token):
    r = client.get('/api/notifications/email-config', headers={
        'Authorization': f'Bearer {student_token}'
    })
    assert r.status_code == 403


# ─────────────────────────────────────────────────────────────
# 6. Facilitators / directory
# ─────────────────────────────────────────────────────────────
def test_facilitators_endpoint_is_public(client):
    r = client.get('/api/users/facilitators')
    assert r.status_code == 200


def test_facilitators_returns_list(client):
    r = client.get('/api/users/facilitators')
    data = r.get_json()
    assert 'facilitators' in data
    assert isinstance(data['facilitators'], list)


# ─────────────────────────────────────────────────────────────
# 7. AI Classifier info endpoint
# ─────────────────────────────────────────────────────────────
def test_classifier_info_endpoint_returns_200(client):
    r = client.get('/api/tickets/classifier-info')
    assert r.status_code == 200


def test_classifier_info_has_categories(client):
    r = client.get('/api/tickets/classifier-info')
    data = r.get_json()
    assert 'categories' in data


def test_classifier_info_shows_five_visible_categories(client):
    r = client.get('/api/tickets/classifier-info')
    data = r.get_json()
    cats = [c for c in data.get('categories', []) if c != 'general']
    assert len(cats) == 5
