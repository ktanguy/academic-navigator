# Academic Navigator

**AI-Powered Integrated Academic Support Platform for Higher Education Institutions**

---

## 📋 Project Overview

Academic Navigator is a web-based platform that integrates staff directory management, intelligent appointment booking, AI-powered request categorization, and institutional analytics to improve student-facilitator interactions at universities and colleges.

### Key Features

- **Staff Directory** - Search and filter facilitators by department, view office hours and availability
- **Appointment Booking** - Multi-step booking wizard with dynamic forms, urgency levels, and meeting modes
- **AI-Powered Help Desk** - DistilBERT-powered ticket categorization with automatic routing
- **Student Portal** - Unified dashboard for viewing appointments and support tickets
- **Facilitator Dashboard** - AI-assisted request management with escalation workflows
- **Admin Panel** - Analytics dashboard with institutional insights and user management
- **Email Notifications** - Automatic email alerts for ticket updates and appointments
- **Dark Mode** - Full dark mode support across all components

---

## 🛠️ Tech Stack

### Frontend
- **React.js** - Component-based UI development
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first styling
- **shadcn/ui** - Modern UI component library
- **Framer Motion** - Animations and transitions
- **Recharts** - Data visualization
- **React Router** - Client-side routing
- **Zod** - Form validation

### Backend
- **Python Flask** - REST API
- **SQLite/PostgreSQL** - Database
- **Hugging Face Spaces** - AI Classifier API (DistilBERT)
- **JWT** - Authentication
- **Gmail SMTP** - Email notifications

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- Python 3.11+
- Docker (for production deployment)

### Development Setup

```bash
# Clone the repository
git clone https://github.com/yourusername/academic-navigator.git
cd academic-navigator

# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
pip install -r requirements.txt
cd ..

# Start backend (Terminal 1)
cd backend && python app.py

# Start frontend (Terminal 2)
npm run dev
```

### Access the Application
- **Frontend**: http://localhost:8080
- **Backend API**: http://localhost:5001/api

---

## 🐳 Production Deployment

### Using Docker

```bash
# 1. Copy environment file and configure
cp .env.example .env
# Edit .env with your production values

# 2. Build and start
./deploy.sh build
./deploy.sh start

# 3. Access at http://localhost:5001
```

### Deployment Commands

```bash
./deploy.sh build    # Build Docker images
./deploy.sh start    # Start the application
./deploy.sh stop     # Stop the application
./deploy.sh restart  # Restart the application
./deploy.sh logs     # View application logs
./deploy.sh status   # Show application status
./deploy.sh seed     # Seed the database
```

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `SECRET_KEY` | Flask secret key | Required |
| `JWT_SECRET_KEY` | JWT signing key | Required |
| `DATABASE_URL` | Database connection string | SQLite |
| `CLASSIFIER_API_URL` | AI classifier endpoint | HuggingFace |
| `MAIL_USERNAME` | SMTP username | - |
| `MAIL_PASSWORD` | SMTP app password | - |
| `VITE_API_URL` | Frontend API URL | /api |

---

## 📁 Project Structure

```
academic-navigator/
├── src/                    # Frontend React application
│   ├── components/         # Reusable UI components
│   ├── pages/              # Page components
│   ├── services/           # API service layer
│   ├── contexts/           # React contexts
│   └── hooks/              # Custom hooks
├── backend/                # Flask backend
│   ├── models/             # Database models
│   ├── routes/             # API endpoints
│   ├── services/           # Business logic
│   └── app.py              # Application entry
├── public/                 # Static assets
├── Dockerfile              # Production container
├── docker-compose.yml      # Container orchestration
└── deploy.sh               # Deployment script
```

---

## 🔐 Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| Student | j.umulisa@alustudent.com | password123 |
| Facilitator | facilitator@alu.edu | password123 |
| Admin | admin@alu.edu | admin123 |

---

## 🤖 AI Classification

The platform uses a DistilBERT model hosted on Hugging Face Spaces for automatic ticket categorization:

- **API Endpoint**: `https://tkwizera-student-support-api.hf.space/classify`
- **Categories**: Academic Affairs, Capstone Committee, Career Services, IT Support, Library, Registrar's Office, Student Life
- **Accuracy**: ~89% on test data

---

## 📧 Email Notifications

Configured with Gmail SMTP for sending:
- Ticket creation confirmations
- Status update notifications
- Escalation alerts
- Appointment reminders

---

## 🚀 Getting Started
# Clone the repository
git clone https://github.com/yourusername/academic-navigator.git
cd academic-navigator

# Install dependencies
npm install
# or
bun install

# Start development server
npm run dev
# or
bun dev
```

The application will be available at `http://localhost:8080`

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |
| `npm run test` | Run tests |
| `npm run test:watch` | Run tests in watch mode |

---

## 📁 Project Structure

```
src/
├── components/
│   ├── analytics/     # Analytics charts and visualizations
│   ├── landing/       # Landing page components (Hero, Features, CTA)
│   ├── layout/        # Header and Footer
│   └── ui/            # shadcn/ui components
├── hooks/             # Custom React hooks
├── lib/               # Utility functions
├── pages/
│   ├── Index.tsx           # Landing page
│   ├── Auth.tsx            # Login/Signup
│   ├── Directory.tsx       # Staff directory
│   ├── Booking.tsx         # Appointment booking wizard
│   ├── HelpDesk.tsx        # AI-powered ticketing
│   ├── StudentPortal.tsx   # Student dashboard
│   ├── FacilitatorDashboard.tsx  # Facilitator view
│   └── AdminPanel.tsx      # Admin analytics
└── test/              # Test files
```

---

## 🎯 Research Objectives

1. Analyze current challenges in student-facilitator interaction management at higher education institutions
2. Develop an integrated platform with staff directory, dynamic appointment booking, AI-powered ticketing, and escalation workflows
3. Evaluate system performance through technical metrics (85% ML accuracy, <3s response time), usability testing (SUS score ≥70), and user acceptance testing

---

## 📊 Target Metrics

| Metric | Target |
|--------|--------|
| ML Classification Accuracy | ≥85% |
| Response Time | <3 seconds |
| System Usability Scale (SUS) | ≥70 |
| User Acceptance Testing | 15-20 participants |

---

## 📄 License

MIT License - Feel free to use and modify for your institution.

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
