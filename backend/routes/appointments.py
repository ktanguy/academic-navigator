# Appointments Routes

from flask import Blueprint, request, jsonify
from models.models import Appointment, User, db
from routes.auth import token_required
from datetime import datetime
from services.notification_service import (
    notify_appointment_booked,
    notify_appointment_confirmed,
    notify_appointment_cancelled
)

appointments_bp = Blueprint('appointments', __name__)


@appointments_bp.route('', methods=['GET'])
@token_required
def get_appointments(current_user):
    """Get appointments based on user role"""
    
    if current_user.role == 'student':
        appointments = Appointment.query.filter_by(student_id=current_user.id).order_by(Appointment.date.desc()).all()
    elif current_user.role == 'facilitator':
        appointments = Appointment.query.filter_by(facilitator_id=current_user.id).order_by(Appointment.date.desc()).all()
    else:
        appointments = Appointment.query.order_by(Appointment.date.desc()).all()
    
    return jsonify({'appointments': [a.to_dict() for a in appointments]})


@appointments_bp.route('', methods=['POST'])
@token_required
def create_appointment(current_user):
    """Book a new appointment"""
    data = request.get_json()
    
    # Validate required fields
    required = ['facilitator_id', 'date', 'time_slot']
    for field in required:
        if field not in data:
            return jsonify({'error': f'{field} is required'}), 400
    
    # Check if facilitator exists
    facilitator = User.query.filter_by(id=data['facilitator_id'], role='facilitator').first()
    if not facilitator:
        return jsonify({'error': 'Facilitator not found'}), 404
    
    # Check for conflicting appointments
    existing = Appointment.query.filter_by(
        facilitator_id=data['facilitator_id'],
        date=datetime.strptime(data['date'], '%Y-%m-%d').date(),
        time_slot=data['time_slot'],
        status='confirmed'
    ).first()
    
    if existing:
        return jsonify({'error': 'This time slot is already booked'}), 400
    
    appointment = Appointment(
        student_id=current_user.id,
        facilitator_id=data['facilitator_id'],
        date=datetime.strptime(data['date'], '%Y-%m-%d').date(),
        time_slot=data['time_slot'],
        duration=data.get('duration', 30),
        meeting_type=data.get('meeting_type'),
        meeting_mode=data.get('meeting_mode', 'in-person'),
        reason=data.get('reason'),
        notes=data.get('notes'),
        status='pending'
    )
    
    db.session.add(appointment)
    db.session.commit()
    
    # Send notification to facilitator about the new booking
    notify_appointment_booked(appointment)
    
    return jsonify({
        'message': 'Appointment booked successfully',
        'appointment': appointment.to_dict()
    }), 201


@appointments_bp.route('/<int:appointment_id>', methods=['GET'])
@token_required
def get_appointment(current_user, appointment_id):
    """Get a specific appointment"""
    appointment = Appointment.query.get_or_404(appointment_id)
    
    # Check permission
    if current_user.role == 'student' and appointment.student_id != current_user.id:
        return jsonify({'error': 'Access denied'}), 403
    
    return jsonify({'appointment': appointment.to_dict()})


@appointments_bp.route('/<int:appointment_id>', methods=['PATCH'])
@token_required
def update_appointment(current_user, appointment_id):
    """Update appointment (confirm, cancel, reschedule)"""
    appointment = Appointment.query.get_or_404(appointment_id)
    
    # Students can only cancel their own appointments
    # Facilitators can confirm/cancel appointments assigned to them
    if current_user.role == 'student':
        if appointment.student_id != current_user.id:
            return jsonify({'error': 'Access denied'}), 403
    elif current_user.role == 'facilitator':
        if appointment.facilitator_id != current_user.id:
            return jsonify({'error': 'Access denied'}), 403
    
    data = request.get_json()
    
    old_status = appointment.status
    
    if 'status' in data:
        appointment.status = data['status']
    if 'date' in data:
        appointment.date = datetime.strptime(data['date'], '%Y-%m-%d').date()
    if 'time_slot' in data:
        appointment.time_slot = data['time_slot']
    if 'notes' in data:
        appointment.notes = data['notes']
    
    db.session.commit()
    
    # Send notifications based on status change
    if 'status' in data:
        if data['status'] == 'confirmed' and old_status != 'confirmed':
            notify_appointment_confirmed(appointment)
        elif data['status'] == 'cancelled' and old_status != 'cancelled':
            notify_appointment_cancelled(appointment, current_user)
    
    return jsonify({
        'message': 'Appointment updated',
        'appointment': appointment.to_dict()
    })


@appointments_bp.route('/<int:appointment_id>', methods=['DELETE'])
@token_required
def delete_appointment(current_user, appointment_id):
    """Cancel/delete an appointment"""
    appointment = Appointment.query.get_or_404(appointment_id)
    
    # Check permission
    if current_user.role == 'student' and appointment.student_id != current_user.id:
        return jsonify({'error': 'Access denied'}), 403
    
    db.session.delete(appointment)
    db.session.commit()
    
    return jsonify({'message': 'Appointment cancelled'})


@appointments_bp.route('/available-slots', methods=['GET'])
def get_available_slots():
    """Get available time slots for a facilitator on a specific date"""
    facilitator_id = request.args.get('facilitator_id')
    date = request.args.get('date')
    
    if not facilitator_id or not date:
        return jsonify({'error': 'facilitator_id and date are required'}), 400
    
    # All possible time slots
    all_slots = [
        '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
        '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00'
    ]
    
    # Get booked slots
    booked = Appointment.query.filter_by(
        facilitator_id=facilitator_id,
        date=datetime.strptime(date, '%Y-%m-%d').date()
    ).filter(Appointment.status.in_(['pending', 'confirmed'])).all()
    
    booked_slots = [a.time_slot for a in booked]
    available_slots = [s for s in all_slots if s not in booked_slots]
    
    return jsonify({
        'date': date,
        'facilitator_id': facilitator_id,
        'available_slots': available_slots,
        'booked_slots': booked_slots
    })


@appointments_bp.route('/stats', methods=['GET'])
@token_required
def get_appointment_stats(current_user):
    """Get appointment statistics"""
    
    if current_user.role == 'student':
        base_query = Appointment.query.filter_by(student_id=current_user.id)
    elif current_user.role == 'facilitator':
        base_query = Appointment.query.filter_by(facilitator_id=current_user.id)
    else:
        base_query = Appointment.query
    
    stats = {
        'total': base_query.count(),
        'pending': base_query.filter_by(status='pending').count(),
        'confirmed': base_query.filter_by(status='confirmed').count(),
        'completed': base_query.filter_by(status='completed').count(),
        'cancelled': base_query.filter_by(status='cancelled').count()
    }
    
    return jsonify({'stats': stats})
