# Database Models for Academic Navigator

from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import json

db = SQLAlchemy()

# Confidence threshold for AI classification (0.70 = 70%)
AI_CONFIDENCE_THRESHOLD = 0.70


class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    role = db.Column(db.String(20), nullable=False, default='student')  # student, facilitator, admin
    department = db.Column(db.String(100))
    avatar_url = db.Column(db.String(255))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    tickets = db.relationship('Ticket', backref='submitter', lazy=True, foreign_keys='Ticket.user_id')
    assigned_tickets = db.relationship('Ticket', backref='assignee', lazy=True, foreign_keys='Ticket.assigned_to')
    appointments = db.relationship('Appointment', backref='student', lazy=True, foreign_keys='Appointment.student_id')
    notifications = db.relationship('Notification', backref='user', lazy=True)
    office_hours = db.relationship('OfficeHours', backref='facilitator', lazy=True)
    
    def to_dict(self):
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


class Ticket(db.Model):
    __tablename__ = 'tickets'
    
    id = db.Column(db.Integer, primary_key=True)
    ticket_number = db.Column(db.String(20), unique=True, nullable=False)
    subject = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=False)
    category = db.Column(db.String(50), nullable=False)
    priority = db.Column(db.String(20), default='medium')  # low, medium, high
    status = db.Column(db.String(20), default='open')  # open, in-progress, answered, escalated, closed
    
    # AI Classification
    ai_category = db.Column(db.String(50))
    ai_confidence = db.Column(db.Float)
    needs_review = db.Column(db.Boolean, default=False)  # True if AI confidence < 0.70
    reviewed_by = db.Column(db.Integer, db.ForeignKey('users.id'))  # Admin who reviewed
    reviewed_at = db.Column(db.DateTime)  # When it was reviewed
    
    # Relationships
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    assigned_to = db.Column(db.Integer, db.ForeignKey('users.id'))
    department = db.Column(db.String(100))
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Responses
    responses = db.relationship('TicketResponse', backref='ticket', lazy=True, order_by='TicketResponse.created_at')
    reviewer = db.relationship('User', foreign_keys=[reviewed_by], backref='reviewed_tickets')
    
    def to_dict(self):
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


class TicketResponse(db.Model):
    __tablename__ = 'ticket_responses'
    
    id = db.Column(db.Integer, primary_key=True)
    ticket_id = db.Column(db.Integer, db.ForeignKey('tickets.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    message = db.Column(db.Text, nullable=False)
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


class Appointment(db.Model):
    __tablename__ = 'appointments'
    
    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    facilitator_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    
    date = db.Column(db.Date, nullable=False)
    time_slot = db.Column(db.String(20), nullable=False)
    duration = db.Column(db.Integer, default=30)  # minutes
    
    meeting_type = db.Column(db.String(50))  # homework, capstone, grades, general, other
    meeting_mode = db.Column(db.String(20), default='in-person')  # in-person, video, phone
    
    reason = db.Column(db.Text)
    notes = db.Column(db.Text)
    
    # Dynamic form data stored as JSON (for type-specific fields)
    form_data = db.Column(db.Text)  # JSON string
    
    status = db.Column(db.String(20), default='pending')  # pending, confirmed, cancelled, completed
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    facilitator = db.relationship('User', foreign_keys=[facilitator_id], backref='facilitated_appointments')
    
    def get_form_data(self):
        """Parse JSON form_data"""
        if self.form_data:
            try:
                return json.loads(self.form_data)
            except:
                return {}
        return {}
    
    def set_form_data(self, data):
        """Set form_data as JSON string"""
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


class Notification(db.Model):
    __tablename__ = 'notifications'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    title = db.Column(db.String(200), nullable=False)
    message = db.Column(db.Text, nullable=False)
    notification_type = db.Column(db.String(50), nullable=False)  # appointment, escalation, resolution
    reference_id = db.Column(db.Integer)  # ticket_id or appointment_id
    reference_type = db.Column(db.String(20))  # 'ticket' or 'appointment'
    is_read = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
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


class OfficeHours(db.Model):
    """Office Hours model for facilitator availability scheduling"""
    __tablename__ = 'office_hours'
    
    id = db.Column(db.Integer, primary_key=True)
    facilitator_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    day_of_week = db.Column(db.Integer, nullable=False)  # 0=Monday, 1=Tuesday, ..., 6=Sunday
    start_time = db.Column(db.String(10), nullable=False)  # "09:00"
    end_time = db.Column(db.String(10), nullable=False)  # "17:00"
    is_available = db.Column(db.Boolean, default=True)
    slot_duration = db.Column(db.Integer, default=30)  # minutes per slot
    location = db.Column(db.String(200))  # Office location or "Virtual"
    notes = db.Column(db.Text)  # Any special notes
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
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
        """Generate available time slots based on start/end time and duration"""
        from datetime import datetime, timedelta
        slots = []
        start = datetime.strptime(self.start_time, "%H:%M")
        end = datetime.strptime(self.end_time, "%H:%M")
        current = start
        while current + timedelta(minutes=self.slot_duration) <= end:
            slots.append(current.strftime("%I:%M %p"))
            current += timedelta(minutes=self.slot_duration)
        return slots
