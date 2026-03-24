# ============================================================
# models.py — Database Tables
# ============================================================
# This file defines all the tables in our database.
# Each class here = one table. Each variable = one column.
#
# We use SQLAlchemy so we can write Python instead of raw SQL.
# For example instead of:
#   SELECT * FROM users WHERE email = 'x@y.com'
# We write:
#   User.query.filter_by(email='x@y.com').first()
#
# TABLES IN THIS FILE:
#   User         — everyone who can log in
#   Ticket       — support requests from students
#   TicketResponse — replies inside a ticket thread
#   Appointment  — meeting bookings
#   Notification — alerts shown in the bell icon
#   OfficeHours  — when facilitators are available
# ============================================================

from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import json

# db is the database connection. It gets connected to Flask in app.py.
db = SQLAlchemy()

# If the AI confidence is 70% or above, the ticket is auto-assigned.
# If below 70%, it needs a human to review it.
AI_CONFIDENCE_THRESHOLD = 0.70


# ============================================================
# TABLE 1: User
# ============================================================
class User(db.Model):
    # Stores everyone who has an account: students, facilitators, and admins.
    __tablename__ = 'users'

    id           = db.Column(db.Integer, primary_key=True)          # Auto-generated ID number
    email        = db.Column(db.String(120), unique=True, nullable=False)   # Must be unique
    password_hash = db.Column(db.String(255), nullable=False)               # Scrambled password
    name         = db.Column(db.String(100), nullable=False)
    role         = db.Column(db.String(20), nullable=False, default='student')  # student / facilitator / admin
    department   = db.Column(db.String(100))                                # e.g. "Academic Affairs"
    avatar_url   = db.Column(db.String(255))                                # Link to profile picture
    created_at   = db.Column(db.DateTime, default=datetime.utcnow)          # When the account was created

    # These link this table to other tables.
    # For example: user.tickets gives you all tickets this user submitted.
    tickets          = db.relationship('Ticket', backref='submitter', lazy=True, foreign_keys='Ticket.user_id')
    assigned_tickets = db.relationship('Ticket', backref='assignee', lazy=True, foreign_keys='Ticket.assigned_to')
    appointments     = db.relationship('Appointment', backref='student', lazy=True, foreign_keys='Appointment.student_id')
    notifications    = db.relationship('Notification', backref='user', lazy=True)
    office_hours     = db.relationship('OfficeHours', backref='facilitator', lazy=True)

    def to_dict(self):
        # Converts a User object into a plain dictionary so it can be sent as JSON.
        # Notice: password_hash is NOT included here — we never send it to the frontend.
        return {
            'id': self.id,
            'email': self.email,
            'name': self.name,
            'role': self.role,
            'department': self.department,
            'avatar_url': self.avatar_url,
            'created_at': self.created_at.isoformat(),
            'office_hours': [oh.to_dict() for oh in self.office_hours] if self.office_hours else []
        }


# ============================================================
# TABLE 2: Ticket
# ============================================================
class Ticket(db.Model):
    # Stores every support request submitted by a student.
    #
    # A ticket goes through these stages:
    #   Student submits → AI classifies it
    #     → Confident (≥70%): auto-assigned to a facilitator → status = 'open'
    #     → Not confident (<70%): flagged for admin review → status = 'needs-review'
    #   Facilitator replies → status = 'in-progress'
    #   Facilitator resolves → status = 'closed' or 'resolved'
    #   Facilitator escalates → status = 'escalated'
    __tablename__ = 'tickets'

    id            = db.Column(db.Integer, primary_key=True)
    ticket_number = db.Column(db.String(20), unique=True, nullable=False)  # Human-readable ID like TKT-001
    subject       = db.Column(db.String(200), nullable=False)
    description   = db.Column(db.Text, nullable=False)
    category      = db.Column(db.String(50), nullable=False)    # The final category used for routing
    priority      = db.Column(db.String(20), default='medium')  # low / medium / high
    status        = db.Column(db.String(20), default='open')    # open / in-progress / answered / escalated / closed / needs-review

    # What the AI said about this ticket (stored for transparency)
    ai_category   = db.Column(db.String(50))    # What the AI predicted
    ai_confidence = db.Column(db.Float)          # How confident the AI was (0.0 to 1.0)
    needs_review  = db.Column(db.Boolean, default=False)  # True = AI wasn't confident enough
    reviewed_by   = db.Column(db.Integer, db.ForeignKey('users.id'))   # Which admin reviewed it
    reviewed_at   = db.Column(db.DateTime)                              # When it was reviewed

    # Who submitted it and who is handling it
    user_id    = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    assigned_to = db.Column(db.Integer, db.ForeignKey('users.id'))
    department = db.Column(db.String(100))

    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # All the replies in this ticket's thread, ordered by time
    responses = db.relationship('TicketResponse', backref='ticket', lazy=True, order_by='TicketResponse.created_at')
    reviewer  = db.relationship('User', foreign_keys=[reviewed_by], backref='reviewed_tickets')

    def to_dict(self):
        # Converts the ticket and all its replies into a dictionary for the frontend
        return {
            'id': self.id,
            'ticket_number': self.ticket_number,
            'subject': self.subject,
            'description': self.description,
            'category': self.category,
            'priority': self.priority,
            'status': self.status,
            'ai_category': self.ai_category,
            'ai_confidence': self.ai_confidence,
            'needs_review': self.needs_review,
            'reviewed_by': self.reviewed_by,
            'reviewed_at': self.reviewed_at.isoformat() if self.reviewed_at else None,
            'user_id': self.user_id,
            'assigned_to': self.assigned_to,
            'department': self.department,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat(),
            'submitter': self.submitter.to_dict() if self.submitter else None,
            'assignee': self.assignee.to_dict() if self.assignee else None,
            'reviewer': self.reviewer.to_dict() if self.reviewer else None,
            'responses': [r.to_dict() for r in self.responses]
        }


# ============================================================
# TABLE 3: TicketResponse
# ============================================================
class TicketResponse(db.Model):
    # A single message in a ticket thread.
    # Could be written by a student, a facilitator, or auto-generated by the system.
    #
    # is_system = True  → written automatically (e.g. "AI classified this as IT Support")
    # is_system = False → written by a real person
    __tablename__ = 'ticket_responses'

    id        = db.Column(db.Integer, primary_key=True)
    ticket_id = db.Column(db.Integer, db.ForeignKey('tickets.id'), nullable=False)
    user_id   = db.Column(db.Integer, db.ForeignKey('users.id'))  # Empty for system messages
    message   = db.Column(db.Text, nullable=False)
    is_system = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    user = db.relationship('User', backref='responses')

    def to_dict(self):
        return {
            'id': self.id,
            'ticket_id': self.ticket_id,
            'user_id': self.user_id,
            'message': self.message,
            'is_system': self.is_system,
            'created_at': self.created_at.isoformat(),
            'user': self.user.to_dict() if self.user else None
        }


# ============================================================
# TABLE 4: Appointment
# ============================================================
class Appointment(db.Model):
    # Stores a booked meeting between a student and a facilitator.
    #
    # Flow:
    #   Student books → status = 'pending', facilitator gets email
    #   Facilitator confirms → status = 'confirmed', student gets email
    #   Either cancels → status = 'cancelled', other person gets email
    #
    # meeting_type: what the meeting is about (homework, grades, capstone, etc.)
    # meeting_mode: how they meet (in-person, video, phone)
    # form_data: extra info stored as JSON (e.g. which course, what grade)
    __tablename__ = 'appointments'

    id             = db.Column(db.Integer, primary_key=True)
    student_id     = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    facilitator_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)

    date      = db.Column(db.Date, nullable=False)          # e.g. 2026-03-25
    time_slot = db.Column(db.String(20), nullable=False)    # e.g. "10:00 AM"
    duration  = db.Column(db.Integer, default=30)           # Length in minutes

    meeting_type = db.Column(db.String(50))                 # homework / capstone / grades / general / other
    meeting_mode = db.Column(db.String(20), default='in-person')  # in-person / video / phone

    reason    = db.Column(db.Text)   # Why the student wants to meet
    notes     = db.Column(db.Text)   # Any extra notes

    # Extra fields stored as JSON because different meeting types need different info
    form_data = db.Column(db.Text)

    status    = db.Column(db.String(20), default='pending')  # pending / confirmed / cancelled / completed

    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    facilitator = db.relationship('User', foreign_keys=[facilitator_id], backref='facilitated_appointments')

    def get_form_data(self):
        # Reads the JSON string from the database and turns it into a Python dict
        if self.form_data:
            try:
                return json.loads(self.form_data)
            except:
                return {}
        return {}

    def set_form_data(self, data):
        # Turns a Python dict into a JSON string so it can be saved in the database
        self.form_data = json.dumps(data) if data else None

    def to_dict(self):
        return {
            'id': self.id,
            'student_id': self.student_id,
            'facilitator_id': self.facilitator_id,
            'date': self.date.isoformat(),
            'time_slot': self.time_slot,
            'duration': self.duration,
            'meeting_type': self.meeting_type,
            'meeting_mode': self.meeting_mode,
            'reason': self.reason,
            'notes': self.notes,
            'form_data': self.get_form_data(),
            'status': self.status,
            'created_at': self.created_at.isoformat(),
            'student': self.student.to_dict() if self.student else None,
            'facilitator': self.facilitator.to_dict() if self.facilitator else None
        }


# ============================================================
# TABLE 5: Notification
# ============================================================
class Notification(db.Model):
    # Stores alerts shown in the bell icon at the top of the page.
    # Every important event creates both an in-app notification (here)
    # AND sends an email.
    #
    # is_read = False → shows as unread (bold / highlighted)
    # is_read = True  → user has seen it
    #
    # reference_id and reference_type let the app know where to navigate
    # when the user clicks the notification (e.g. go to ticket #5)
    __tablename__ = 'notifications'

    id                = db.Column(db.Integer, primary_key=True)
    user_id           = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    title             = db.Column(db.String(200), nullable=False)
    message           = db.Column(db.Text, nullable=False)
    notification_type = db.Column(db.String(50), nullable=False)  # appointment / escalation / resolution / response
    reference_id      = db.Column(db.Integer)    # The ID of the related ticket or appointment
    reference_type    = db.Column(db.String(20)) # 'ticket' or 'appointment'
    is_read           = db.Column(db.Boolean, default=False)
    created_at        = db.Column(db.DateTime, default=datetime.utcnow)

    recipient = db.relationship('User', backref='user_notifications')

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'title': self.title,
            'message': self.message,
            'notification_type': self.notification_type,
            'reference_id': self.reference_id,
            'reference_type': self.reference_type,
            'is_read': self.is_read,
            'created_at': self.created_at.isoformat()
        }


# ============================================================
# TABLE 6: OfficeHours
# ============================================================
class OfficeHours(db.Model):
    # Stores when a facilitator is available for bookings.
    # Each row = one day of availability for one facilitator.
    # A facilitator available Mon-Fri would have 5 rows.
    #
    # The get_time_slots() method divides the time range into
    # individual bookable slots. For example:
    #   9:00 AM to 11:00 AM with 30-min slots =
    #   ["09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM"]
    __tablename__ = 'office_hours'

    id             = db.Column(db.Integer, primary_key=True)
    facilitator_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    day_of_week    = db.Column(db.Integer, nullable=False)      # 0=Monday, 1=Tuesday, ..., 6=Sunday
    start_time     = db.Column(db.String(10), nullable=False)   # "09:00"
    end_time       = db.Column(db.String(10), nullable=False)   # "17:00"
    is_available   = db.Column(db.Boolean, default=True)        # Set to False to block a day off
    slot_duration  = db.Column(db.Integer, default=30)          # How many minutes per booking
    location       = db.Column(db.String(200))                  # "Office 101" or "Virtual (Zoom)"
    notes          = db.Column(db.Text)
    created_at     = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at     = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        day_names = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
        return {
            'id': self.id,
            'facilitator_id': self.facilitator_id,
            'day_of_week': self.day_of_week,
            'day_name': day_names[self.day_of_week] if 0 <= self.day_of_week <= 6 else 'Unknown',
            'start_time': self.start_time,
            'end_time': self.end_time,
            'is_available': self.is_available,
            'slot_duration': self.slot_duration,
            'location': self.location,
            'notes': self.notes
        }

    def get_time_slots(self):
        # Generates a list of bookable time slots for this day.
        # Splits the start-to-end range into chunks of slot_duration minutes.
        from datetime import datetime, timedelta
        slots = []
        start = datetime.strptime(self.start_time, "%H:%M")
        end = datetime.strptime(self.end_time, "%H:%M")
        current = start
        while current + timedelta(minutes=self.slot_duration) <= end:
            slots.append(current.strftime("%I:%M %p"))  # Format: "09:00 AM"
            current += timedelta(minutes=self.slot_duration)
        return slots
