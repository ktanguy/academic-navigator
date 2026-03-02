# Database Models for Academic Navigator

from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

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
    
    def to_dict(self):
        return {
            'id': self.id,
            'email': self.email,
            'name': self.name,
            'role': self.role,
            'department': self.department,
            'avatar_url': self.avatar_url,
            'created_at': self.created_at.isoformat()
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
    
    # Relationships
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    assigned_to = db.Column(db.Integer, db.ForeignKey('users.id'))
    department = db.Column(db.String(100))
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Responses
    responses = db.relationship('TicketResponse', backref='ticket', lazy=True, order_by='TicketResponse.created_at')
    
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
            'user_id': self.user_id,
            'assigned_to': self.assigned_to,
            'department': self.department,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat(),
            'submitter': self.submitter.to_dict() if self.submitter else None,
            'assignee': self.assignee.to_dict() if self.assignee else None,
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
    
    meeting_type = db.Column(db.String(50))  # academic, capstone, career, etc.
    meeting_mode = db.Column(db.String(20), default='in-person')  # in-person, video, phone
    
    reason = db.Column(db.Text)
    notes = db.Column(db.Text)
    
    status = db.Column(db.String(20), default='pending')  # pending, confirmed, cancelled, completed
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    facilitator = db.relationship('User', foreign_keys=[facilitator_id], backref='facilitated_appointments')
    
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
