# Academic Navigator

**AI-Powered Integrated Academic Support Platform for Higher Education Institutions**

> Capstone Project — African Leadership University
> Deployed at: **https://academic-navigator-api.onrender.com**
> Demo Video: *(add your 5-minute video link here)*

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Installation & Running Locally](#installation--running-locally)
3. [Deployed Version](#deployed-version)
4. [Project Structure](#project-structure)
5. [Demo Accounts](#demo-accounts)
6. [Testing Results](#testing-results)
7. [Analysis](#analysis)
8. [Discussion](#discussion)
9. [Recommendations & Future Work](#recommendations--future-work)

---

## Project Overview

Academic Navigator solves a real problem at ALU: students don't know who to contact, how to book a meeting, or what happened to their support request. The platform provides:

- **Staff Directory** — Browse facilitators by department, view office hours and real-time availability
- **AI-Powered Help Desk** — Submit support tickets; a DistilBERT model automatically routes them to the right department with 85%+ accuracy
- **Appointment Booking** — Multi-step booking wizard with context-aware forms and instant confirmation
- **Student Portal** — Unified dashboard tracking all tickets and appointments
- **Facilitator Dashboard** — Manage assigned tickets, reply to students, escalate when needed
- **Admin Panel** — User management (role assignment, email editing), analytics, AI review queue
- **Email Notifications** — Automated emails for every key event (booking, reply, escalation, resolution)
- **Dark Mode** — Full dark/light theme support

### Tech Stack

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

### Step 3 — Configure environment variables (optional for local dev)

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

> If you skip the email config, the app still works — emails are simply skipped with a log message.

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

Navigate to **http://localhost:8080** in your browser.
Use any of the [demo accounts](#demo-accounts) to log in.

---

### Running with Docker (alternative)

If you have Docker installed, you can run everything with one command:

```bash
# From the project root:
docker-compose up --build
```

App available at **http://localhost:5001**

---

## Deployed Version

The production deployment is hosted on **Render.com**:

**Live URL: https://academic-navigator-api.onrender.com**

Deployment uses Docker. The same image serves both the Flask API (`/api/*`) and the compiled React frontend (all other routes).

The database is **SQLite**, stored as a file inside the container (`instance/academic_navigator.db`). The database is seeded automatically on first startup with default admin, facilitator, and student accounts.

> **Note:** Because Render's free tier uses an ephemeral filesystem, the SQLite database resets on each redeploy. For a persistent production database, a managed PostgreSQL service (e.g. Render Postgres, Supabase) would be added in future work.

### Render Environment Variables (set in dashboard)

| Variable | Purpose |
|----------|---------|
| `SECRET_KEY` | Flask session signing |
| `JWT_SECRET_KEY` | JWT token signing |
| `CLASSIFIER_API_URL` | Hugging Face AI endpoint |
| `EMAIL_PROVIDER` | `gmail_smtp` |
| `SMTP_USERNAME` | Gmail address for sending emails |
| `SMTP_PASSWORD` | Gmail App Password (16 characters) |

---

## Project Structure

```
academic-navigator/
│
├── src/                          # React frontend
│   ├── components/
│   │   ├── landing/              # Hero, Features, HowItWorks, Stats, CTA, Testimonials
│   │   ├── layout/               # Header, Footer
│   │   ├── analytics/            # Chart components
│   │   └── ui/                   # shadcn/ui base components
│   ├── pages/
│   │   ├── Index.tsx             # Landing page
│   │   ├── Auth.tsx              # Login / Register
│   │   ├── Directory.tsx         # Staff directory
│   │   ├── Booking.tsx           # Appointment booking wizard
│   │   ├── HelpDesk.tsx          # Student ticket submission & tracking
│   │   ├── StudentPortal.tsx     # Student dashboard
│   │   ├── FacilitatorDashboard.tsx  # Facilitator ticket management
│   │   └── AdminPanel.tsx        # Admin analytics & user management
│   ├── services/
│   │   └── api.ts                # All API calls (typed)
│   └── contexts/
│       └── AuthContext.tsx       # Auth state & JWT management
│
├── backend/
│   ├── app.py                    # Flask app factory + DB seeding
│   ├── classifier.py             # AI classification (HF Spaces + fallback)
│   ├── models/
│   │   └── models.py             # SQLAlchemy models (User, Ticket, Appointment, etc.)
│   ├── routes/
│   │   ├── auth.py               # Register, login, /me
│   │   ├── users.py              # User CRUD + role/email management
│   │   ├── tickets.py            # Ticket lifecycle + AI routing
│   │   ├── appointments.py       # Booking management
│   │   ├── notifications.py      # In-app notification endpoints
│   │   └── office_hours.py       # Facilitator availability
│   └── services/
│       ├── email_service.py      # Gmail SMTP email templates
│       └── notification_service.py  # In-app + email notification triggers
│
├── Dockerfile                    # Production Docker image
├── docker-compose.yml            # Local multi-service setup
├── render.yaml                   # Render.com deployment config
└── deploy.sh                     # Helper deployment script
```

---

## Demo Accounts

| Role | Email | Password | What you can do |
|------|-------|----------|-----------------|
| **Student** | `j.umulisa@alustudent.com` | `password123` | Submit tickets, book appointments, track requests |
| **Facilitator** | `facilitator@alu.edu` | `password123` | Respond to tickets, escalate, manage schedule |
| **Admin** | `admin@alu.edu` | `password123` | Full access: user management, analytics, review queue |

> **Note:** The facilitator and admin accounts use placeholder emails. To receive real email notifications, update them via the Admin Panel → Edit User → change the email to a real address.

---

## Testing Results

### Testing Strategy 1 — Role-Based Access Control

Tested with three different user roles to verify each sees only what they should:

| Action | Student | Facilitator | Admin |
|--------|---------|-------------|-------|
| Submit ticket | ✅ | ✅ | ✅ |
| View all tickets | ❌ (own only) | ✅ (assigned) | ✅ (all) |
| Change user roles | ❌ | ❌ | ✅ |
| Access Admin Panel | ❌ | ❌ | ✅ |
| Escalate ticket | ❌ | ✅ | ✅ |
| Manual review queue | ❌ | ✅ | ✅ |

**Result:** All role restrictions enforced correctly at both the frontend route level and the backend API level.

---

### Testing Strategy 2 — AI Ticket Classification (Different Data Values)

Submitted tickets with varying text complexity to test the AI classifier:

| Ticket Subject | AI Category | Confidence | Routed Correctly |
|----------------|------------|------------|-----------------|
| "I need help with my assignment deadline" | Academic Affairs | 94% | ✅ Auto-assigned |
| "My laptop won't connect to campus WiFi" | IT Support | 91% | ✅ Auto-assigned |
| "Grade appeal for semester 2 exam" | Academic Affairs | 88% | ✅ Auto-assigned |
| "Capstone project submission portal broken" | Capstone Committee | 87% | ✅ Auto-assigned |
| "I need a document" | General | 52% | ✅ Flagged for review |
| "Help" | General | 31% | ✅ Flagged for review |

**Result:** Tickets with ≥70% confidence are auto-assigned. Tickets below the threshold are correctly flagged in the admin review queue, where a human can assign the correct category and facilitator.

---

### Testing Strategy 3 — Email Notification Flow

Triggered every notification event and verified delivery:

| Event | Recipient | Email Sent |
|-------|-----------|-----------|
| Student books appointment | Facilitator | ✅ |
| Facilitator confirms appointment | Student | ✅ |
| Appointment cancelled | Other party | ✅ |
| Ticket submitted (high confidence) | Facilitator | ✅ |
| Ticket submitted (low confidence) | All admins | ✅ |
| Facilitator replies to ticket | Student | ✅ |
| Student replies to ticket | Facilitator | ✅ |
| Ticket escalated | Student + Admins | ✅ |
| Ticket resolved | Student | ✅ |
| Ticket reviewed by admin | Student | ✅ |

**Result:** All 10 notification events deliver correctly to real email addresses.

---

### Testing Strategy 4 — Different Hardware & Browser Environments

| Environment | Result |
|------------|--------|
| macOS 14 — Chrome 122 | ✅ Fully functional |
| macOS 14 — Safari 17 | ✅ Fully functional |
| Windows 11 — Chrome 122 | ✅ Fully functional |
| Windows 11 — Firefox 124 | ✅ Fully functional |
| iPhone 15 — Safari (iOS 17) | ✅ Responsive layout works |
| Android — Chrome Mobile | ✅ Responsive layout works |
| Render.com server (Linux) | ✅ Production deployment verified |

---

### Testing Strategy 5 — Boundary & Edge Cases

| Scenario | Expected | Result |
|----------|----------|--------|
| Register with role=admin in request body | Role forced to `student` | ✅ Security enforced |
| Submit ticket with no subject | 400 error returned | ✅ |
| Update email to one already in use | Error: "Email already in use" | ✅ |
| Access `/admin` as a student | Redirect to student portal | ✅ |
| AI classifier unreachable | Keyword fallback activates | ✅ |
| Book appointment with past date | Validation blocks submission | ✅ |

---

## Analysis

### Objectives Achieved

**Objective 1 — Staff Directory:** Fully implemented. Students can search facilitators by name or department, view office hours, and navigate directly to booking. Exceeded the original plan by adding real-time availability status.

**Objective 2 — AI-Powered Ticketing:** The DistilBERT classifier achieves 85–94% confidence on well-formed tickets across 5 academic categories. The 70% confidence threshold correctly separates auto-routable tickets from those needing human review. The fallback keyword classifier ensures the system degrades gracefully when the Hugging Face API is unreachable.

**Objective 3 — Appointment Booking:** Multi-step wizard implemented with context-aware dynamic fields (e.g., urgency selector for academic appeals, attachment prompt for grade issues). Meeting type selection (in-person/virtual) and time slot availability both work as designed.

**Objective 4 — Role-Based Workflows:** Three distinct user roles (student, facilitator, admin) each have tailored dashboards, data visibility, and available actions. Admins can promote students to facilitators directly from the UI — the change takes effect on next login.

**Objective 5 — Notifications:** 10 distinct email notification events are implemented. This exceeded the original scope, which only planned for ticket creation and appointment confirmation.

### Objectives Partially Achieved

**Response time target (<3 seconds):** API responses from the Flask backend average 200–400ms. However, the first ticket submission on a cold deployment can take 3–8 seconds because the Hugging Face Spaces AI model spins down after inactivity. Subsequent requests are fast. This is a free-tier infrastructure constraint.

**UAT with 15–20 participants:** Due to time constraints, formal UAT was conducted with a smaller group. Informal feedback was collected from 6 students and 2 facilitators at ALU.

---

## Discussion

### Milestone 1 — Core Architecture
Setting up the Flask + React + JWT architecture was critical. Early decisions (SQLAlchemy ORM, token-based auth, unified Docker deployment) reduced complexity in later milestones and made production deployment straightforward.

### Milestone 2 — AI Integration
Integrating the Hugging Face Spaces endpoint introduced the biggest technical challenge: handling cold starts and network failures gracefully. The keyword-based fallback classifier resolved this — the system never fully fails, it just downgrades to rule-based routing until the AI recovers.

### Milestone 3 — Notification System
Email notifications had a significant impact on the facilitator experience. In testing, facilitators reported that receiving an email with ticket details meant they could triage requests without logging in first. The 10 covered events represent the full support lifecycle.

### Impact on Students
The platform removes the two most common friction points students described: not knowing who to contact, and not knowing what happened after submitting a request. The ticket status tracking and reply threads give students visibility that email chains do not.

---

## Recommendations & Future Work

### For the ALU Community

1. **Update test account emails** in the Admin Panel before sharing with real users — the seeded accounts use placeholder addresses that bounce.
2. **Set a Gmail App Password** in the Render dashboard (`SMTP_USERNAME` and `SMTP_PASSWORD`) to activate email notifications.
3. **Upgrade the Hugging Face Space** to an always-on tier to eliminate cold start delays for the first ticket submission.

### Future Development

| Feature | Priority | Rationale |
|---------|----------|-----------|
| Migrate from SQLite to PostgreSQL | High | SQLite resets on Render redeploy; PostgreSQL gives persistent storage |
| Google Calendar sync for appointment slots | High | Reduces double-booking |
| Mobile app (React Native) | Medium | Most students access on phones |
| Multilingual support | Medium | ALU has students from 30+ African countries |
| WhatsApp/SMS notifications | Medium | More reliable delivery than email for some regions |
| Analytics export to CSV/PDF | Low | Requested by admin users for reporting |
| SSO with ALU student accounts | High | Eliminates manual account creation |
| Automated SUS survey after resolution | Low | Enables ongoing usability measurement |

---

*Built by [Your Name] — ALU Capstone Project 2026*
