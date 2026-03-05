# Notification Service
# Handles creating and sending notifications for various events

import os
import logging
from models.models import Notification, User, db
from services.email_service import (
    send_appointment_booked_email,
    send_ticket_escalated_email,
    send_ticket_resolved_email,
    send_ticket_assigned_email,
    send_email
)

logger = logging.getLogger(__name__)


def notify_appointment_booked(appointment):
    """
    Send notification when a meeting/appointment is booked.
    Notifies the facilitator about the new booking.
    """
    student = User.query.get(appointment.student_id)
    facilitator = User.query.get(appointment.facilitator_id)
    
    if not facilitator:
        return None
    
    message = f"{student.name if student else 'A student'} has booked an appointment with you on {appointment.date.strftime('%B %d, %Y')} at {appointment.time_slot}. Meeting type: {appointment.meeting_type or 'General'}."
    
    notification = Notification(
        user_id=facilitator.id,
        title="New Appointment Booked",
        message=message,
        notification_type="appointment_booked",
        reference_id=appointment.id,
        reference_type="appointment"
    )
    
    db.session.add(notification)
    db.session.commit()
    
    # Send email notification using template
    send_appointment_booked_email(
        facilitator_email=facilitator.email,
        facilitator_name=facilitator.name,
        student_name=student.name if student else 'A student',
        date=appointment.date.strftime('%B %d, %Y'),
        time=appointment.time_slot,
        meeting_type=appointment.meeting_type or 'General'
    )
    
    return notification


def notify_appointment_confirmed(appointment):
    """
    Send notification when an appointment is confirmed.
    Notifies the student that their appointment was confirmed.
    """
    facilitator = User.query.get(appointment.facilitator_id)
    
    notification = Notification(
        user_id=appointment.student_id,
        title="Appointment Confirmed",
        message=f"Your appointment with {facilitator.name if facilitator else 'the facilitator'} on {appointment.date.strftime('%B %d, %Y')} at {appointment.time_slot} has been confirmed.",
        notification_type="appointment_confirmed",
        reference_id=appointment.id,
        reference_type="appointment"
    )
    
    db.session.add(notification)
    db.session.commit()
    
    return notification


def notify_appointment_cancelled(appointment, cancelled_by_user):
    """
    Send notification when an appointment is cancelled.
    """
    # Notify the other party
    if cancelled_by_user.id == appointment.student_id:
        # Student cancelled, notify facilitator
        recipient_id = appointment.facilitator_id
        student = User.query.get(appointment.student_id)
        message = f"{student.name if student else 'A student'} has cancelled their appointment on {appointment.date.strftime('%B %d, %Y')} at {appointment.time_slot}."
    else:
        # Facilitator cancelled, notify student
        recipient_id = appointment.student_id
        facilitator = User.query.get(appointment.facilitator_id)
        message = f"Your appointment with {facilitator.name if facilitator else 'the facilitator'} on {appointment.date.strftime('%B %d, %Y')} at {appointment.time_slot} has been cancelled."
    
    notification = Notification(
        user_id=recipient_id,
        title="Appointment Cancelled",
        message=message,
        notification_type="appointment_cancelled",
        reference_id=appointment.id,
        reference_type="appointment"
    )
    
    db.session.add(notification)
    db.session.commit()
    
    return notification


def notify_ticket_escalated(ticket, escalated_by_user, reason=None, new_department=None):
    """
    Send notifications when a ticket is escalated.
    Notifies the student (ticket owner) and admins.
    """
    notifications = []
    student = User.query.get(ticket.user_id)
    student_message = f"Your ticket #{ticket.ticket_number} '{ticket.subject}' has been escalated to {new_department or 'another department'}. Reason: {reason or 'For further review'}."
    
    # Notify the student who submitted the ticket
    notification = Notification(
        user_id=ticket.user_id,
        title="Ticket Escalated",
        message=student_message,
        notification_type="ticket_escalated",
        reference_id=ticket.id,
        reference_type="ticket"
    )
    db.session.add(notification)
    notifications.append(notification)
    
    # Send formatted email to student about escalation
    if student:
        send_ticket_escalated_email(
            admin_email=student.email,
            admin_name=student.name,
            ticket_number=ticket.ticket_number,
            ticket_subject=ticket.subject,
            escalated_by=escalated_by_user.name,
            department=new_department or 'Unspecified',
            reason=reason or 'For further review'
        )
    
    # Notify all admins about the escalation
    admins = User.query.filter_by(role='admin').all()
    for admin in admins:
        admin_notification = Notification(
            user_id=admin.id,
            title="Ticket Escalated - Requires Attention",
            message=f"Ticket #{ticket.ticket_number} '{ticket.subject}' has been escalated by {escalated_by_user.name} to {new_department or 'another department'}.",
            notification_type="ticket_escalated",
            reference_id=ticket.id,
            reference_type="ticket"
        )
        db.session.add(admin_notification)
        notifications.append(admin_notification)
        
        # Send formatted email to admin
        send_ticket_escalated_email(
            admin_email=admin.email,
            admin_name=admin.name,
            ticket_number=ticket.ticket_number,
            ticket_subject=ticket.subject,
            escalated_by=escalated_by_user.name,
            department=new_department or 'Unspecified',
            reason=reason or 'No reason provided'
        )
    
    db.session.commit()
    
    return notifications


def notify_ticket_resolved(ticket, resolved_by_user):
    """
    Send notification when a ticket is resolved/closed.
    Notifies the student who submitted the ticket.
    """
    student = User.query.get(ticket.user_id)
    message = f"Your ticket #{ticket.ticket_number} '{ticket.subject}' has been resolved by {resolved_by_user.name}. If you have further questions, you can reopen the ticket."
    
    notification = Notification(
        user_id=ticket.user_id,
        title="Ticket Resolved",
        message=message,
        notification_type="ticket_resolved",
        reference_id=ticket.id,
        reference_type="ticket"
    )
    
    db.session.add(notification)
    db.session.commit()
    
    # Send formatted email to student
    if student:
        send_ticket_resolved_email(
            student_email=student.email,
            student_name=student.name,
            ticket_number=ticket.ticket_number,
            ticket_subject=ticket.subject,
            resolved_by=resolved_by_user.name
        )
    
    return notification


def notify_ticket_assigned(ticket, facilitator):
    """
    Send notification when a ticket is assigned to a facilitator.
    """
    student = User.query.get(ticket.user_id)
    
    # Notify the facilitator
    notification = Notification(
        user_id=facilitator.id,
        title="New Ticket Assigned",
        message=f"A new ticket #{ticket.ticket_number} '{ticket.subject}' from {student.name if student else 'a student'} has been assigned to you.",
        notification_type="ticket_assigned",
        reference_id=ticket.id,
        reference_type="ticket"
    )
    
    db.session.add(notification)
    db.session.commit()
    
    # Send email notification to facilitator
    send_ticket_assigned_email(
        facilitator_email=facilitator.email,
        facilitator_name=facilitator.name,
        ticket_number=ticket.ticket_number,
        ticket_subject=ticket.subject,
        student_name=student.name if student else 'A student',
        category=ticket.category or 'General'
    )
    
    return notification


def get_user_notifications(user_id, unread_only=False, limit=50):
    """
    Get notifications for a user.
    """
    query = Notification.query.filter_by(user_id=user_id)
    
    if unread_only:
        query = query.filter_by(is_read=False)
    
    return query.order_by(Notification.created_at.desc()).limit(limit).all()


def mark_notification_read(notification_id, user_id):
    """
    Mark a notification as read.
    """
    notification = Notification.query.filter_by(id=notification_id, user_id=user_id).first()
    
    if notification:
        notification.is_read = True
        db.session.commit()
        return True
    
    return False


def mark_all_notifications_read(user_id):
    """
    Mark all notifications for a user as read.
    """
    Notification.query.filter_by(user_id=user_id, is_read=False).update({'is_read': True})
    db.session.commit()


def notify_ticket_needs_review(ticket, ai_category, ai_confidence):
    """
    Send notifications when a ticket is flagged for manual review due to low AI confidence.
    Notifies all admins and facilitators.
    """
    notifications = []
    student = User.query.get(ticket.user_id)
    
    # Notify all admins
    admins = User.query.filter_by(role='admin').all()
    for admin in admins:
        notification = Notification(
            user_id=admin.id,
            title="Ticket Needs Manual Review",
            message=f"Ticket #{ticket.ticket_number} '{ticket.subject}' from {student.name if student else 'a student'} requires manual review. AI confidence: {int(ai_confidence * 100)}% (below 70% threshold). Suggested category: {ai_category}.",
            notification_type="ticket_needs_review",
            reference_id=ticket.id,
            reference_type="ticket"
        )
        db.session.add(notification)
        notifications.append(notification)
        
        # Send email to admin
        send_email(
            to_email=admin.email,
            subject=f"Ticket #{ticket.ticket_number} Needs Manual Review",
            body=f"""A new ticket requires your manual review due to low AI classification confidence.

Ticket Details:
- Ticket Number: {ticket.ticket_number}
- Subject: {ticket.subject}
- From: {student.name if student else 'A student'}
- AI Suggested Category: {ai_category}
- AI Confidence: {int(ai_confidence * 100)}%
- Threshold: 70%

Please review and assign this ticket manually.
"""
        )
    
    db.session.commit()
    logger.info(f"Sent {len(notifications)} notifications for ticket #{ticket.ticket_number} needing review")
    
    return notifications


def notify_ticket_reviewed(ticket, reviewer):
    """
    Send notification to student when their ticket has been reviewed and assigned.
    """
    student = User.query.get(ticket.user_id)
    facilitator = User.query.get(ticket.assigned_to) if ticket.assigned_to else None
    
    message = f"Your ticket #{ticket.ticket_number} '{ticket.subject}' has been reviewed and categorized as '{ticket.category}'. "
    if facilitator:
        message += f"It has been assigned to {facilitator.name}."
    else:
        message += "A facilitator will be assigned shortly."
    
    notification = Notification(
        user_id=ticket.user_id,
        title="Ticket Reviewed",
        message=message,
        notification_type="ticket_reviewed",
        reference_id=ticket.id,
        reference_type="ticket"
    )
    
    db.session.add(notification)
    db.session.commit()
    
    # Send email to student
    if student:
        send_email(
            to_email=student.email,
            subject=f"Ticket #{ticket.ticket_number} Has Been Reviewed",
            body=f"""Good news! Your support ticket has been reviewed.

Ticket Details:
- Ticket Number: {ticket.ticket_number}
- Subject: {ticket.subject}
- Category: {ticket.category}
- Status: {ticket.status}
{f'- Assigned to: {facilitator.name}' if facilitator else ''}

You will receive updates as your ticket is processed.
"""
        )
    
    return notification
