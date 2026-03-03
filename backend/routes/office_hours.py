# Office Hours Routes
# Manages facilitator availability schedules

from flask import Blueprint, request, jsonify
from models.models import OfficeHours, User, Appointment, db
from routes.auth import token_required
from datetime import datetime, timedelta

office_hours_bp = Blueprint('office_hours', __name__)


@office_hours_bp.route('', methods=['GET'])
def get_all_office_hours():
    """Get all office hours (public endpoint for viewing availability)"""
    facilitator_id = request.args.get('facilitator_id', type=int)
    day = request.args.get('day', type=int)  # 0-6 for Monday-Sunday
    
    query = OfficeHours.query.filter_by(is_available=True)
    
    if facilitator_id:
        query = query.filter_by(facilitator_id=facilitator_id)
    if day is not None:
        query = query.filter_by(day_of_week=day)
    
    office_hours = query.all()
    
    return jsonify({
        'office_hours': [oh.to_dict() for oh in office_hours]
    })


@office_hours_bp.route('/facilitator/<int:facilitator_id>', methods=['GET'])
def get_facilitator_office_hours(facilitator_id):
    """Get office hours for a specific facilitator"""
    facilitator = User.query.filter_by(id=facilitator_id, role='facilitator').first()
    
    if not facilitator:
        return jsonify({'error': 'Facilitator not found'}), 404
    
    office_hours = OfficeHours.query.filter_by(facilitator_id=facilitator_id).order_by(OfficeHours.day_of_week).all()
    
    return jsonify({
        'facilitator': facilitator.to_dict(),
        'office_hours': [oh.to_dict() for oh in office_hours]
    })


@office_hours_bp.route('/facilitator/<int:facilitator_id>/available-slots', methods=['GET'])
def get_available_slots(facilitator_id):
    """
    Get available time slots for a facilitator on a specific date.
    Takes into account office hours and existing appointments.
    """
    date_str = request.args.get('date')  # YYYY-MM-DD format
    
    if not date_str:
        return jsonify({'error': 'Date parameter is required (YYYY-MM-DD)'}), 400
    
    try:
        date = datetime.strptime(date_str, '%Y-%m-%d').date()
    except ValueError:
        return jsonify({'error': 'Invalid date format. Use YYYY-MM-DD'}), 400
    
    # Get day of week (Python: Monday=0, Sunday=6)
    day_of_week = date.weekday()
    
    # Get office hours for this day
    office_hours = OfficeHours.query.filter_by(
        facilitator_id=facilitator_id,
        day_of_week=day_of_week,
        is_available=True
    ).all()
    
    if not office_hours:
        return jsonify({
            'date': date_str,
            'day_of_week': day_of_week,
            'available_slots': [],
            'message': 'No office hours on this day'
        })
    
    # Generate all possible time slots
    all_slots = []
    for oh in office_hours:
        slots = oh.get_time_slots()
        for slot in slots:
            all_slots.append({
                'time': slot,
                'duration': oh.slot_duration,
                'location': oh.location
            })
    
    # Get existing appointments on this date
    existing_appointments = Appointment.query.filter_by(
        facilitator_id=facilitator_id,
        date=date,
        status='confirmed'
    ).all()
    
    booked_times = [apt.time_slot for apt in existing_appointments]
    
    # Filter out booked slots
    available_slots = [
        slot for slot in all_slots 
        if slot['time'] not in booked_times
    ]
    
    return jsonify({
        'date': date_str,
        'day_of_week': day_of_week,
        'available_slots': available_slots,
        'booked_slots': booked_times
    })


@office_hours_bp.route('', methods=['POST'])
@token_required
def create_office_hours(current_user):
    """Create office hours (facilitators only)"""
    if current_user.role not in ['facilitator', 'admin']:
        return jsonify({'error': 'Access denied. Only facilitators can set office hours.'}), 403
    
    data = request.get_json()
    
    # Validate required fields
    required = ['day_of_week', 'start_time', 'end_time']
    for field in required:
        if field not in data:
            return jsonify({'error': f'{field} is required'}), 400
    
    # Validate day_of_week
    day = data['day_of_week']
    if not isinstance(day, int) or day < 0 or day > 6:
        return jsonify({'error': 'day_of_week must be 0-6 (Monday-Sunday)'}), 400
    
    # Validate time format
    try:
        start = datetime.strptime(data['start_time'], '%H:%M')
        end = datetime.strptime(data['end_time'], '%H:%M')
        if end <= start:
            return jsonify({'error': 'end_time must be after start_time'}), 400
    except ValueError:
        return jsonify({'error': 'Time must be in HH:MM format (e.g., 09:00)'}), 400
    
    # For admins setting hours for a specific facilitator
    facilitator_id = current_user.id
    if current_user.role == 'admin' and data.get('facilitator_id'):
        facilitator_id = data['facilitator_id']
        # Verify facilitator exists
        facilitator = User.query.filter_by(id=facilitator_id, role='facilitator').first()
        if not facilitator:
            return jsonify({'error': 'Facilitator not found'}), 404
    
    # Check for overlapping office hours
    existing = OfficeHours.query.filter_by(
        facilitator_id=facilitator_id,
        day_of_week=day
    ).all()
    
    for oh in existing:
        existing_start = datetime.strptime(oh.start_time, '%H:%M')
        existing_end = datetime.strptime(oh.end_time, '%H:%M')
        if not (end <= existing_start or start >= existing_end):
            return jsonify({'error': f'Overlapping office hours already exist on this day ({oh.start_time}-{oh.end_time})'}), 400
    
    office_hours = OfficeHours(
        facilitator_id=facilitator_id,
        day_of_week=day,
        start_time=data['start_time'],
        end_time=data['end_time'],
        is_available=data.get('is_available', True),
        slot_duration=data.get('slot_duration', 30),
        location=data.get('location'),
        notes=data.get('notes')
    )
    
    db.session.add(office_hours)
    db.session.commit()
    
    return jsonify({
        'message': 'Office hours created successfully',
        'office_hours': office_hours.to_dict()
    }), 201


@office_hours_bp.route('/<int:office_hours_id>', methods=['PUT', 'PATCH'])
@token_required
def update_office_hours(current_user, office_hours_id):
    """Update office hours"""
    office_hours = OfficeHours.query.get_or_404(office_hours_id)
    
    # Check permission
    if current_user.role == 'facilitator' and office_hours.facilitator_id != current_user.id:
        return jsonify({'error': 'Access denied'}), 403
    
    if current_user.role not in ['facilitator', 'admin']:
        return jsonify({'error': 'Access denied'}), 403
    
    data = request.get_json()
    
    if 'day_of_week' in data:
        if not isinstance(data['day_of_week'], int) or data['day_of_week'] < 0 or data['day_of_week'] > 6:
            return jsonify({'error': 'day_of_week must be 0-6'}), 400
        office_hours.day_of_week = data['day_of_week']
    
    if 'start_time' in data:
        try:
            datetime.strptime(data['start_time'], '%H:%M')
            office_hours.start_time = data['start_time']
        except ValueError:
            return jsonify({'error': 'Invalid start_time format'}), 400
    
    if 'end_time' in data:
        try:
            datetime.strptime(data['end_time'], '%H:%M')
            office_hours.end_time = data['end_time']
        except ValueError:
            return jsonify({'error': 'Invalid end_time format'}), 400
    
    if 'is_available' in data:
        office_hours.is_available = data['is_available']
    if 'slot_duration' in data:
        office_hours.slot_duration = data['slot_duration']
    if 'location' in data:
        office_hours.location = data['location']
    if 'notes' in data:
        office_hours.notes = data['notes']
    
    db.session.commit()
    
    return jsonify({
        'message': 'Office hours updated',
        'office_hours': office_hours.to_dict()
    })


@office_hours_bp.route('/<int:office_hours_id>', methods=['DELETE'])
@token_required
def delete_office_hours(current_user, office_hours_id):
    """Delete office hours"""
    office_hours = OfficeHours.query.get_or_404(office_hours_id)
    
    # Check permission
    if current_user.role == 'facilitator' and office_hours.facilitator_id != current_user.id:
        return jsonify({'error': 'Access denied'}), 403
    
    if current_user.role not in ['facilitator', 'admin']:
        return jsonify({'error': 'Access denied'}), 403
    
    db.session.delete(office_hours)
    db.session.commit()
    
    return jsonify({'message': 'Office hours deleted'})


@office_hours_bp.route('/my', methods=['GET'])
@token_required
def get_my_office_hours(current_user):
    """Get current facilitator's office hours"""
    if current_user.role != 'facilitator':
        return jsonify({'error': 'Only facilitators have office hours'}), 403
    
    office_hours = OfficeHours.query.filter_by(facilitator_id=current_user.id).order_by(OfficeHours.day_of_week).all()
    
    return jsonify({
        'office_hours': [oh.to_dict() for oh in office_hours]
    })


@office_hours_bp.route('/bulk', methods=['POST'])
@token_required
def set_weekly_schedule(current_user):
    """
    Set a full weekly schedule at once.
    Replaces all existing office hours for the facilitator.
    """
    if current_user.role not in ['facilitator', 'admin']:
        return jsonify({'error': 'Access denied'}), 403
    
    data = request.get_json()
    schedule = data.get('schedule', [])
    
    # For admins setting hours for a specific facilitator
    facilitator_id = current_user.id
    if current_user.role == 'admin' and data.get('facilitator_id'):
        facilitator_id = data['facilitator_id']
    
    # Delete existing office hours
    OfficeHours.query.filter_by(facilitator_id=facilitator_id).delete()
    
    # Create new office hours
    created = []
    for entry in schedule:
        if entry.get('is_available', True):
            oh = OfficeHours(
                facilitator_id=facilitator_id,
                day_of_week=entry['day_of_week'],
                start_time=entry['start_time'],
                end_time=entry['end_time'],
                is_available=True,
                slot_duration=entry.get('slot_duration', 30),
                location=entry.get('location'),
                notes=entry.get('notes')
            )
            db.session.add(oh)
            created.append(oh)
    
    db.session.commit()
    
    return jsonify({
        'message': f'Weekly schedule updated with {len(created)} office hour blocks',
        'office_hours': [oh.to_dict() for oh in created]
    }), 201
