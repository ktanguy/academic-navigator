# Academic Navigator

> Deployed at: **https://academic-navigator-api.onrender.com**
> Demo Video: *(add your 5-minute video link here)*
> GitHub: *(add your repo link here)*

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Tech Stack](#tech-stack)
3. [Installation & Running Locally](#installation--running-locally)
4. [Deployed Version](#deployed-version)
5. [Demo Accounts](#demo-accounts)
6. [Use Case Implementation](#use-case-implementation)
7. [Testing Results](#testing-results)
8. [Recommendations & Future Work](#recommendations--future-work)

---

## Project Overview

Academic Navigator addresses the lack of a structured, trackable communication channel between students and academic support staff at higher education institutions. Students often do not know who to contact, how to follow up on a request, or what happened after submitting a support query.

The platform provides:

- **Staff Directory** — Browse facilitators by department, view office hours and availability
- **AI Help Desk** — Submit support tickets routed automatically to the right department by a DistilBERT model
- **Appointment Booking** — Multi-step booking wizard with real-time slot availability
- **Student Portal** — Unified dashboard tracking all tickets and appointments
- **Facilitator Dashboard** — Manage assigned tickets, reply to students, escalate when needed
- **Admin Panel** — User management, analytics, AI review queue
- **Email Notifications** — Automated emails for every key event (booking, reply, escalation, resolution)

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + TypeScript + Vite |
| Styling | Tailwind CSS + shadcn/ui (Radix UI) |
| Animations | Framer Motion |
| Backend | Python Flask + SQLAlchemy |
| Database | SQLite |
| AI Classifier | DistilBERT via Hugging Face Spaces |
| Auth | JWT (JSON Web Tokens) + bcrypt |
| Email | Gmail SMTP |
| Deployment | Render.com via Docker |

---

## Installation & Running Locally

### Prerequisites

- **Node.js** v18 or higher — [nodejs.org](https://nodejs.org)
- **Python** 3.11 or higher — [python.org](https://python.org)
- **Git** — [git-scm.com](https://git-scm.com)

### Step 1 — Clone the repository

```bash
git clone https://github.com/yourusername/academic-navigator.git
cd academic-navigator
```

### Step 2 — Set up the backend

```bash
cd backend

# Create and activate a virtual environment
python -m venv venv

# On macOS/Linux:
source venv/bin/activate

# On Windows:
venv\Scripts\activate

# Install Python dependencies
pip install -r requirements.txt
```

### Step 3 — Configure environment variables

Create a `.env` file inside the `backend/` folder:

```env
SECRET_KEY=any-random-string
JWT_SECRET_KEY=another-random-string
CLASSIFIER_API_URL=https://tkwizera-student-support-api.hf.space/classify

# Email (optional — skip if you don't need emails locally)
EMAIL_PROVIDER=gmail_smtp
SMTP_USERNAME=your-gmail@gmail.com
SMTP_PASSWORD=your-16-char-app-password
```

> If you skip the email config, the app still works — emails are skipped with a log message.

### Step 4 — Start the backend

```bash
# From inside the backend/ folder with venv active:
python app.py
```

The API will be available at **http://localhost:5001/api**
Default test accounts are seeded automatically on first run.

### Step 5 — Set up and start the frontend

Open a **new terminal** in the project root:

```bash
# From the project root (academic-navigator/):
npm install
npm run dev
```

The app will be available at **http://localhost:8080**

### Step 6 — Open the app

Navigate to **http://localhost:8080** in your browser and log in using any [demo account](#demo-accounts).

---

### Running with Docker (alternative)

```bash
# From the project root:
docker-compose up --build
```

App available at **http://localhost:5001**

---

## Deployed Version

Live URL: **https://academic-navigator-api.onrender.com**

Deployment uses Docker — the same image serves both the Flask API (`/api/*`) and the compiled React frontend (all other routes). The database is SQLite, seeded automatically on first startup.

> **Note:** Render's free tier uses an ephemeral filesystem. The SQLite database resets on each redeploy. See [Future Work](#recommendations--future-work) for the PostgreSQL migration plan.

### Render Environment Variables

| Variable | Purpose |
|----------|---------|
| `SECRET_KEY` | Flask session signing |
| `JWT_SECRET_KEY` | JWT token signing |
| `CLASSIFIER_API_URL` | Hugging Face AI endpoint |
| `EMAIL_PROVIDER` | `gmail_smtp` |
| `SMTP_USERNAME` | Gmail address for sending emails |
| `SMTP_PASSWORD` | Gmail App Password (16 characters) |

---

## Demo Accounts

| Role | Email | Password | Access |
|------|-------|----------|--------|
| **Student** | `student@example.com` | `password123` | Submit tickets, book appointments, track requests |
| **Facilitator** | `facilitator@example.com` | `password123` | Respond to tickets, manage schedule, escalate |
| **Admin** | `admin@example.com` | `password123` | Full access: user management, analytics, review queue |

> Update facilitator/admin emails via Admin Panel → Edit User to receive real email notifications.

---

## Use Case Implementation

This section maps each use case to its implementation: the actor, inputs accepted, system process, and outputs produced.

---

### UC-01 — Submit Support Ticket

**Actor:** Student (or any authenticated user)

| Input | Field | Validation |
|-------|-------|-----------|
| Ticket subject | Text, required | Min 5 characters |
| Ticket description | Text, required | Min 20 characters |
| Category (optional) | Dropdown | Student can leave as "Auto-detect" |
| Priority | Low / Medium / High | Defaults to Medium |

**Process:**
1. Frontend sends `POST /api/tickets` with the form data and JWT token
2. Backend calls the DistilBERT classifier (`CLASSIFIER_API_URL`) with the subject + description
3. If confidence ≥ 70%: ticket is auto-assigned to a facilitator in the matched department
4. If confidence < 70%: ticket is created with status `pending_review` and added to the admin review queue
5. Notification created in-app; email sent to the assigned facilitator (or all admins for review queue)

**Output:**

| Outcome | System Response |
|---------|----------------|
| High confidence (≥70%) | Ticket created, auto-assigned, facilitator notified by email |
| Low confidence (<70%) | Ticket created, flagged for admin review, admins notified by email |
| Missing required fields | `400 Bad Request` with field-level error messages |
| Unauthenticated | `401 Unauthorized` |

---

### UC-02 — Browse Staff Directory

**Actor:** Any authenticated user

| Input | Field | Validation |
|-------|-------|-----------|
| Search query (optional) | Text | Partial match on name or department |
| Department filter (optional) | Dropdown | Filters to selected department |

**Process:**
1. Frontend calls `GET /api/users?role=facilitator` (with optional `department` query param)
2. Backend returns all users with `role=facilitator`, filtered if department provided
3. Frontend renders profile cards with name, department, office hours, and availability badge

**Output:**

| Outcome | System Response |
|---------|----------------|
| Facilitators found | List of profile cards with availability, office hours, Book button |
| No matches | "No facilitators found" empty state |
| Department selected | Filtered results for that department only |

---

### UC-03 — Book Appointment

**Actor:** Student

| Input | Field | Validation |
|-------|-------|-----------|
| Facilitator | Pre-selected from directory | Required |
| Meeting type | In-person / Virtual | Required |
| Date | Date picker | Must be a future date |
| Time slot | Available slots only | Required |
| Purpose / notes | Text | Optional |

**Process:**
1. Frontend calls `GET /api/office-hours?facilitator_id=X` to load available slots
2. Student completes the multi-step booking wizard
3. Frontend sends `POST /api/appointments` with all booking data
4. Backend creates the appointment with status `pending`
5. Email notification sent to facilitator; in-app notification created

**Output:**

| Outcome | System Response |
|---------|----------------|
| Booking created | Confirmation screen shown; facilitator receives email |
| Facilitator confirms | Student receives confirmation email; status → `confirmed` |
| Either party cancels | Other party receives cancellation email; status → `cancelled` |
| Past date selected | Validation blocks submission with error message |

---

### UC-04 — Respond to Ticket (Facilitator)

**Actor:** Facilitator or Admin

| Input | Field | Validation |
|-------|-------|-----------|
| Response message | Text | Required, min 1 character |
| Escalate flag (optional) | Toggle | Only visible to facilitators |

**Process:**
1. Facilitator opens an assigned ticket on the Facilitator Dashboard
2. Types a reply and submits via `POST /api/tickets/:id/responses`
3. Backend saves the response and triggers `notify_ticket_response()`
4. Student receives in-app notification + email with a preview of the reply
5. If escalated: `PATCH /api/tickets/:id` sets `status=escalated`; admins are notified

**Output:**

| Outcome | System Response |
|---------|----------------|
| Reply submitted | Thread updated; student notified by email and in-app |
| Ticket escalated | Status changes to `Escalated`; admins notified |
| Ticket resolved | Status changes to `Resolved`; student notified |

---

### UC-05 — Admin Review Queue (Low-Confidence Tickets)

**Actor:** Admin

| Input | Field | Validation |
|-------|-------|-----------|
| Correct category | Dropdown | Required to assign |
| Assigned facilitator | Dropdown | Filtered by selected department |

**Process:**
1. Admin opens the Review Queue in Admin Panel
2. Views the ticket subject, description, and the AI's suggested category + confidence score
3. Selects the correct category and facilitator, submits via `PATCH /api/tickets/:id`
4. Ticket status changes from `pending_review` to `open`; facilitator notified

**Output:**

| Outcome | System Response |
|---------|----------------|
| Ticket assigned | Status → `open`; facilitator receives notification |
| No facilitator available | Admin can assign to self or leave for later |

---

### UC-06 — Manage Users (Admin)

**Actor:** Admin

| Input | Field | Validation |
|-------|-------|-----------|
| User name | Text | Optional update |
| Email | Text | Must be unique across all users |
| Role | student / facilitator / admin | Admin only |
| Department | Text | Optional |

**Process:**
1. Admin opens Admin Panel → Users tab
2. Clicks Edit on any user
3. Frontend sends `PATCH /api/users/:id` with updated fields
4. Backend validates: if email changed, checks for duplicates; if role changed, updates immediately

**Output:**

| Outcome | System Response |
|---------|----------------|
| Update successful | User record updated; success toast shown |
| Duplicate email | `400 Bad Request`: "Email is already in use by another account" |
| Non-admin attempts update | `403 Forbidden` |

---

### UC-07 — View Notifications

**Actor:** Any authenticated user

| Input | Trigger |
|-------|---------|
| Bell icon click | Opens notification dropdown |
| Mark as read | Click on individual notification |

**Process:**
1. Frontend polls `GET /api/notifications` on page load and after key actions
2. Backend returns all notifications for the current user, sorted by date
3. Unread count shown as badge on the bell icon

**Output:**

| Outcome | System Response |
|---------|----------------|
| Unread notifications exist | Bell shows count badge; list shows unread items highlighted |
| All read | Badge disappears |
| Notification clicked | Marked as read; user navigated to relevant ticket or appointment |

---

### UC-08 — AI Classification Fallback

**Actor:** System (triggered automatically on ticket submission)

**Process:**
1. Backend calls Hugging Face Spaces endpoint with ticket text
2. If endpoint is unreachable (timeout / cold start): keyword-based fallback activates
3. Fallback scans subject + description for department keywords (e.g., "grade" → Academic Affairs, "wifi" → IT Support)
4. Result used the same way as AI result — same routing logic applies

**Output:**

| Outcome | System Response |
|---------|----------------|
| AI reachable + confident | Auto-route to department |
| AI reachable + low confidence | Flag for review |
| AI unreachable | Keyword fallback used; no error shown to user |

---

## Testing Results

### Strategy 1 — Role-Based Access Control

| Action | Student | Facilitator | Admin |
|--------|---------|-------------|-------|
| Submit ticket | ✅ | ✅ | ✅ |
| View all tickets | ❌ own only | ✅ assigned | ✅ all |
| Change user roles | ❌ | ❌ | ✅ |
| Access Admin Panel | ❌ | ❌ | ✅ |
| Escalate ticket | ❌ | ✅ | ✅ |
| Manual review queue | ❌ | ✅ | ✅ |

All role restrictions enforced at both frontend route level and backend API level.

---

### Strategy 2 — AI Classification (Different Data Values)

| Ticket Subject | AI Category | Confidence | Result |
|----------------|------------|------------|--------|
| "I need help with my assignment deadline" | Academic Affairs | High | ✅ Auto-assigned |
| "My laptop won't connect to campus WiFi" | IT Support | High | ✅ Auto-assigned |
| "Grade appeal for semester 2 exam" | Academic Affairs | High | ✅ Auto-assigned |
| "Capstone project submission portal broken" | Capstone Committee | High | ✅ Auto-assigned |
| "I need a document" | General | Low | ✅ Flagged for review |
| "Help" | General | Low | ✅ Flagged for review |

High = confidence ≥ 70% (auto-routed). Low = confidence < 70% (sent to review queue).

---

### Strategy 3 — Email Notification Events

| Event | Recipient | Delivered |
|-------|-----------|-----------|
| Student books appointment | Facilitator | ✅ |
| Facilitator confirms | Student | ✅ |
| Appointment cancelled | Other party | ✅ |
| Ticket submitted (high confidence) | Facilitator | ✅ |
| Ticket submitted (low confidence) | All admins | ✅ |
| Facilitator replies | Student | ✅ |
| Student replies | Facilitator | ✅ |
| Ticket escalated | Student + Admins | ✅ |
| Ticket resolved | Student | ✅ |
| Ticket reviewed by admin | Student | ✅ |

---

### Strategy 4 — Cross-Platform Testing

| Environment | Result |
|------------|--------|
| macOS 14 — Chrome 122 | ✅ Fully functional |
| macOS 14 — Safari 17 | ✅ Fully functional |
| Windows 11 — Chrome 122 | ✅ Fully functional |
| Windows 11 — Firefox 124 | ✅ Fully functional |
| iPhone 15 — Safari (iOS 17) | ✅ Responsive layout works |
| Android — Chrome Mobile | ✅ Responsive layout works |
| Render.com (Linux/Docker) | ✅ Production deployment verified |

---

### Strategy 5 — Boundary & Edge Cases

| Scenario | Expected | Result |
|----------|----------|--------|
| Register with `role=admin` in request body | Role forced to `student` | ✅ |
| Submit ticket with no subject | 400 error returned | ✅ |
| Update email to one already in use | "Email already in use" error | ✅ |
| Access `/admin` route as a student | Redirect to student portal | ✅ |
| AI classifier unreachable | Keyword fallback activates | ✅ |
| Book appointment with past date | Validation blocks submission | ✅ |

---

## Recommendations & Future Work

| Feature | Priority | Rationale |
|---------|----------|-----------|
| Migrate SQLite to PostgreSQL | High | SQLite resets on Render redeploy; PostgreSQL gives persistent storage |
| Google Calendar sync | High | Reduces double-booking for facilitators |
| SSO with institutional accounts | High | Eliminates manual account creation |
| Mobile app (React Native) | Medium | Most students access on phones |
| Multilingual support | Medium | Supports diverse student populations |
| WhatsApp/SMS notifications | Medium | More reliable delivery than email in some regions |
| Analytics export (CSV/PDF) | Low | Requested by admin users for reporting |
| Automated SUS survey post-resolution | Low | Enables ongoing usability measurement |

---

*Built by [Your Name] — Capstone Project 2026*
