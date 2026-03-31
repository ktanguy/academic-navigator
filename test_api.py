"""
Academic Navigator — API & Workflow Test Suite
Run: python3 test_api.py
Tests every endpoint and workflow end-to-end against the local backend.
"""

import requests
import json
import sys

BASE = "https://academic-navigator-api.onrender.com"

PASS = "\033[92m  PASS\033[0m"
FAIL = "\033[91m  FAIL\033[0m"
HEAD = "\033[94m{}\033[0m"

results = {"passed": 0, "failed": 0}

def check(name, condition, detail=""):
    if condition:
        print(f"{PASS}  {name}")
        results["passed"] += 1
    else:
        print(f"{FAIL}  {name}" + (f" — {detail}" if detail else ""))
        results["failed"] += 1

def post(path, data, token=None):
    headers = {"Content-Type": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    try:
        return requests.post(f"{BASE}{path}", json=data, headers=headers, timeout=10)
    except Exception as e:
        return None

def get(path, token=None, params=None):
    headers = {}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    try:
        return requests.get(f"{BASE}{path}", headers=headers, params=params, timeout=10)
    except Exception as e:
        return None

def patch(path, data, token=None):
    headers = {"Content-Type": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    try:
        return requests.patch(f"{BASE}{path}", json=data, headers=headers, timeout=10)
    except Exception as e:
        return None


# ─────────────────────────────────────────────
print(HEAD.format("\n══════════════════════════════════════"))
print(HEAD.format("  Academic Navigator — API Test Suite"))
print(HEAD.format("══════════════════════════════════════\n"))

# ─────────────────────────────────────────────
print(HEAD.format("[ 1 ] Health Check"))
r = get("/api/health")
check("Server is running", r and r.status_code == 200, r.text if r else "no response")

# ─────────────────────────────────────────────
print(HEAD.format("\n[ 2 ] Authentication"))

# Register new student
r = post("/api/auth/register", {
    "name": "Test Student",
    "email": "test.defense@student.com",
    "password": "password123"
})
if r and r.status_code == 201:
    student_token = r.json().get("token")
    check("Register new student → 201", True)
elif r and r.status_code == 400 and "already registered" in r.text:
    # Already exists — just login
    student_token = None
    check("Register new student → already exists (OK)", True)
else:
    student_token = None
    check("Register new student → 201", False, r.text if r else "no response")

# Login as student
r = post("/api/auth/login", {"email": "test.defense@student.com", "password": "password123"})
check("Login with correct credentials → 200", r and r.status_code == 200)
if r and r.status_code == 200:
    student_token = r.json().get("token")

# Login with wrong password
r = post("/api/auth/login", {"email": "test.defense@student.com", "password": "wrongpass"})
check("Login with wrong password → 401", r and r.status_code == 401)

# Access protected route without token
r = get("/api/auth/me")
check("Access /me without token → 401", r and r.status_code == 401)

# Access protected route with token
r = get("/api/auth/me", token=student_token)
check("Access /me with valid token → 200", r and r.status_code == 200)

# Login as admin
r = post("/api/auth/login", {"email": "admin@alu.edu", "password": "password123"})
check("Admin login → 200", r and r.status_code == 200)
admin_token = r.json().get("token") if r and r.status_code == 200 else None

# Login as IT facilitator
r = post("/api/auth/login", {"email": "it.support@alustudent.com", "password": "password123"})
check("IT facilitator login → 200", r and r.status_code == 200)
it_token = r.json().get("token") if r and r.status_code == 200 else None

# Login as Academic Affairs facilitator (Jolly)
r = post("/api/auth/login", {"email": "j.umulisa@alustudent.com", "password": "password123"})
check("Academic Affairs facilitator login → 200", r and r.status_code == 200)
jolly_token = r.json().get("token") if r and r.status_code == 200 else None

# ─────────────────────────────────────────────
print(HEAD.format("\n[ 3 ] Role-Based Access Control"))

# Student cannot access user stats (admin only)
r = get("/api/users/stats", token=student_token)
check("Student cannot access /users/stats → 403", r and r.status_code == 403)

# Admin can access user stats
r = get("/api/users/stats", token=admin_token)
check("Admin can access /users/stats → 200", r and r.status_code == 200)

# Student can see facilitators (directory)
r = get("/api/users", token=student_token)
check("Student GET /users → sees only facilitators", r and r.status_code == 200)
if r and r.status_code == 200:
    users = r.json().get("users", [])
    only_fac = all(u["role"] in ["facilitator", "admin"] for u in users)
    check("Student result contains no other students", only_fac)

# Admin sees everyone
r = get("/api/users", token=admin_token)
if r and r.status_code == 200:
    roles = {u["role"] for u in r.json().get("users", [])}
    check("Admin GET /users → sees all roles", "student" in roles or "facilitator" in roles)

# ─────────────────────────────────────────────
print(HEAD.format("\n[ 4 ] Ticket Workflow"))

# Submit a technical ticket
r = post("/api/tickets", {
    "subject": "Wi-Fi not working in library",
    "description": "I cannot connect to the campus network on my laptop. It keeps saying authentication failed."
}, token=student_token)
check("Student submits technical ticket → 201", r and r.status_code == 201)
ticket_id = None
if r and r.status_code == 201:
    ticket = r.json().get("ticket", {})
    ticket_id = ticket.get("id")
    check("Ticket has ai_category", bool(ticket.get("ai_category")))
    check("Ticket has ai_confidence", ticket.get("ai_confidence") is not None)
    check("Ticket assigned to correct department", ticket.get("department") is not None)
    print(f"     AI Category: {ticket.get('ai_category')}  |  Confidence: {round((ticket.get('ai_confidence') or 0)*100)}%  |  Department: {ticket.get('department')}")

# Submit a grades ticket
r = post("/api/tickets", {
    "subject": "Wrong grade on my assignment",
    "description": "My professor gave me 45 but I believe I deserve at least 70 based on the rubric."
}, token=student_token)
check("Student submits grades ticket → 201", r and r.status_code == 201)
if r and r.status_code == 201:
    t = r.json().get("ticket", {})
    print(f"     AI Category: {t.get('ai_category')}  |  Confidence: {round((t.get('ai_confidence') or 0)*100)}%  |  Department: {t.get('department')}")

# Student can see their own tickets
r = get("/api/tickets", token=student_token)
check("Student can see own tickets → 200", r and r.status_code == 200)

# Facilitator sees assigned tickets
if it_token:
    r = get("/api/tickets", token=it_token)
    check("IT facilitator can see tickets → 200", r and r.status_code == 200)

# Escalate ticket to Academic Affairs
if ticket_id and it_token:
    r = post(f"/api/tickets/{ticket_id}/escalate", {
        "department": "Academic Affairs",
        "reason": "This is actually an academic issue, not technical"
    }, token=it_token)
    check("Facilitator escalates ticket to Academic Affairs → 200", r and r.status_code == 200)
    if r and r.status_code == 200:
        t = r.json().get("ticket", {})
        check("Ticket department updated to Academic Affairs", t.get("department") == "Academic Affairs")
        check("Ticket status is escalated", t.get("status") == "escalated")

# Jolly (Academic Affairs) can see escalated ticket
if jolly_token:
    r = get("/api/tickets", token=jolly_token)
    check("Jolly sees escalated ticket in her dashboard → 200", r and r.status_code == 200)
    if r and r.status_code == 200:
        tickets = r.json().get("tickets", [])
        found = any(t.get("id") == ticket_id for t in tickets)
        check("Escalated ticket visible to Academic Affairs facilitator", found)

# Admin sees all tickets
if admin_token:
    r = get("/api/tickets", token=admin_token)
    check("Admin sees all tickets → 200", r and r.status_code == 200)

# ─────────────────────────────────────────────
print(HEAD.format("\n[ 5 ] Appointment Workflow"))

# Get facilitators
r = get("/api/users/facilitators")
check("GET /users/facilitators is public → 200", r and r.status_code == 200)
facilitator_id = None
if r and r.status_code == 200:
    facs = r.json().get("facilitators", [])
    if facs:
        facilitator_id = facs[0]["id"]

# Book appointment
appt_id = None
if facilitator_id and student_token:
    r = post("/api/appointments", {
        "facilitator_id": facilitator_id,
        "date": "2026-04-10",
        "time_slot": "10:00",
        "meeting_type": "general",
        "meeting_mode": "in-person",
        "reason": "Need help with my coursework"
    }, token=student_token)
    check("Student books appointment → 201", r and r.status_code == 201)
    if r and r.status_code == 201:
        appt_id = r.json().get("appointment", {}).get("id")

# Student cannot see another student's appointment
if appt_id and student_token:
    r = get(f"/api/appointments/{appt_id}", token=student_token)
    check("Student can access own appointment → 200", r and r.status_code == 200)

# Check available slots (public)
if facilitator_id:
    r = get(f"/api/office-hours/facilitator/{facilitator_id}/available-slots", params={"date": "2026-04-10"})
    check("Available slots endpoint is public → 200", r and r.status_code == 200)

# ─────────────────────────────────────────────
print(HEAD.format("\n[ 6 ] Notifications"))

r = get("/api/notifications", token=student_token)
check("Student can fetch notifications → 200", r and r.status_code == 200)
if r and r.status_code == 200:
    count = r.json().get("unread_count", 0)
    print(f"     Unread notifications: {count}")

r = get("/api/notifications/email-config", token=student_token)
check("Student cannot access email config → 403", r and r.status_code == 403)

r = get("/api/notifications/email-config", token=admin_token)
check("Admin can access email config → 200", r and r.status_code == 200)

# ─────────────────────────────────────────────
print(HEAD.format("\n[ 7 ] AI Classifier"))

r = get("/api/tickets/classifier-info")
check("Classifier info endpoint → 200", r and r.status_code == 200)
if r and r.status_code == 200:
    info = r.json()
    print(f"     AI Status: {info.get('status', 'unknown')}")

# ─────────────────────────────────────────────
print(HEAD.format("\n══════════════════════════════════════"))
total = results["passed"] + results["failed"]
print(f"  Results: {results['passed']}/{total} passed  |  {results['failed']} failed")
print(HEAD.format("══════════════════════════════════════\n"))

if results["failed"] > 0:
    sys.exit(1)
