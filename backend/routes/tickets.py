# Tickets Routes

from flask import Blueprint, request, jsonify
from models.models import Ticket, TicketResponse, User, db
from routes.auth import token_required
from datetime import datetime

# Import the AI classifier module
from classifier import classify_ticket, get_classifier_info

# Import notification service
from services.notification_service import (
    notify_ticket_escalated,
    notify_ticket_resolved,
    notify_ticket_assigned
)

tickets_bp = Blueprint('tickets', __name__)

# Department mapping based on ticket category
CATEGORY_DEPARTMENT_MAP = {
    'assignment': 'Academic Affairs',
    'grades': 'Academic Affairs',
    'capstone': 'Capstone Committee',
    'administrative': "Registrar's Office",
    'technical': 'IT Support',
    'general': 'Academic Affairs'
}

def get_department_for_category(category: str) -> str:
    """Get the appropriate department for a ticket category"""
    return CATEGORY_DEPARTMENT_MAP.get(category, 'Academic Affairs')


def find_best_facilitator(category: str):
    """
    Find the best facilitator to assign a ticket to.
    For testing: prioritize Jolly Umulisa if available.
    """
    from sqlalchemy import func
    
    # For testing: Try to find Jolly Umulisa first (use email to get the correct one)
    jolly = User.query.filter_by(
        role='facilitator',
        email='j.umulisa@alustudent.com'
    ).first()
    
    if jolly:
        return jolly
    
    department = get_department_for_category(category)
    
    # First, try to find a facilitator in the matching department with lowest workload
    facilitators_in_dept = User.query.filter_by(
        role='facilitator',
        department=department
    ).all()
    
    if facilitators_in_dept:
        # Find the one with fewest open tickets
        best_facilitator = None
        min_tickets = float('inf')
        
        for f in facilitators_in_dept:
            open_count = Ticket.query.filter(
                Ticket.assigned_to == f.id,
                Ticket.status.in_(['open', 'in-progress'])
            ).count()
            
            if open_count < min_tickets:
                min_tickets = open_count
                best_facilitator = f
        
        if best_facilitator:
            return best_facilitator
    
    # Fallback: find any facilitator with lowest workload
    all_facilitators = User.query.filter_by(role='facilitator').all()
    
    if not all_facilitators:
        return None
    
    best_facilitator = None
    min_tickets = float('inf')
    
    for f in all_facilitators:
        open_count = Ticket.query.filter(
            Ticket.assigned_to == f.id,
            Ticket.status.in_(['open', 'in-progress'])
        ).count()
        
        if open_count < min_tickets:
            min_tickets = open_count
            best_facilitator = f
    
    return best_facilitator


def generate_ticket_number():
    """Generate unique ticket number like TKT-001"""
    last_ticket = Ticket.query.order_by(Ticket.id.desc()).first()
    next_num = (last_ticket.id + 1) if last_ticket else 1
    return f"TKT-{next_num:03d}"


@tickets_bp.route('', methods=['GET'])
@token_required
def get_tickets(current_user):
    """Get tickets - students see their own, facilitators/admins see all"""
    
    if current_user.role == 'student':
        tickets = Ticket.query.filter_by(user_id=current_user.id).order_by(Ticket.created_at.desc()).all()
    elif current_user.role == 'facilitator':
        # Facilitators see tickets assigned to them
        tickets = Ticket.query.filter(
            (Ticket.assigned_to == current_user.id) | (Ticket.assigned_to == None)
        ).order_by(Ticket.created_at.desc()).all()
    else:
        # Admins see all tickets
        tickets = Ticket.query.order_by(Ticket.created_at.desc()).all()
    
    return jsonify({'tickets': [t.to_dict() for t in tickets]})


@tickets_bp.route('', methods=['POST'])
@token_required
def create_ticket(current_user):
    """Create a new ticket with AI classification"""
    data = request.get_json()
    
    # Validate
    if not data.get('subject') or not data.get('description'):
        return jsonify({'error': 'Subject and description are required'}), 400
    
    # AI Classification
    combined_text = f"{data['subject']} {data['description']}"
    ai_category, ai_confidence = classify_ticket(combined_text)
    
    # Use user-selected category if provided, otherwise use AI
    category = data.get('category') or ai_category
    
    # Smart facilitator assignment based on category and workload
    facilitator = find_best_facilitator(category)
    
    # Set department based on category
    department = get_department_for_category(category)
    
    ticket = Ticket(
        ticket_number=generate_ticket_number(),
        subject=data['subject'],
        description=data['description'],
        category=category,
        priority=data.get('priority', 'medium'),
        status='open',
        ai_category=ai_category,
        ai_confidence=ai_confidence,
        user_id=current_user.id,
        assigned_to=facilitator.id if facilitator else None,
        department=department or data.get('department')
    )
    
    db.session.add(ticket)
    db.session.commit()
    
    # Notify facilitator about the new ticket assignment
    if facilitator:
        notify_ticket_assigned(ticket, facilitator)
    
    # Add system response
    system_response = TicketResponse(
        ticket_id=ticket.id,
        message=f"Ticket created and categorized as '{ai_category}' with {int(ai_confidence * 100)}% confidence. Assigned to support team.",
        is_system=True
    )
    db.session.add(system_response)
    db.session.commit()
    
    return jsonify({
        'message': 'Ticket created successfully',
        'ticket': ticket.to_dict(),
        'ai_classification': {
            'category': ai_category,
            'confidence': ai_confidence
        }
    }), 201


@tickets_bp.route('/<int:ticket_id>', methods=['GET'])
@token_required
def get_ticket(current_user, ticket_id):
    """Get a specific ticket"""
    ticket = Ticket.query.get_or_404(ticket_id)
    
    # Check permission
    if current_user.role == 'student' and ticket.user_id != current_user.id:
        return jsonify({'error': 'Access denied'}), 403
    
    return jsonify({'ticket': ticket.to_dict()})


@tickets_bp.route('/<int:ticket_id>', methods=['PATCH', 'PUT'])
@token_required
def update_ticket(current_user, ticket_id):
    """Update ticket status or assignment"""
    ticket = Ticket.query.get_or_404(ticket_id)
    
    # Only facilitators and admins can update tickets
    if current_user.role == 'student':
        return jsonify({'error': 'Access denied'}), 403
    
    data = request.get_json()
    old_status = ticket.status
    
    if 'status' in data:
        ticket.status = data['status']
    if 'assigned_to' in data:
        ticket.assigned_to = data['assigned_to']
    if 'priority' in data:
        ticket.priority = data['priority']
    if 'department' in data:
        ticket.department = data['department']
    if 'category' in data:
        ticket.category = data['category']
    
    db.session.commit()
    
    # Send notification when ticket is resolved/closed
    if 'status' in data and data['status'] in ['closed', 'resolved'] and old_status not in ['closed', 'resolved']:
        notify_ticket_resolved(ticket, current_user)
    
    return jsonify({
        'message': 'Ticket updated',
        'ticket': ticket.to_dict()
    })


@tickets_bp.route('/<int:ticket_id>/responses', methods=['POST'])
@token_required
def add_response(current_user, ticket_id):
    """Add a response to a ticket"""
    ticket = Ticket.query.get_or_404(ticket_id)
    data = request.get_json()
    
    if not data.get('message'):
        return jsonify({'error': 'Message is required'}), 400
    
    response = TicketResponse(
        ticket_id=ticket_id,
        user_id=current_user.id,
        message=data['message'],
        is_system=False
    )
    
    # Update ticket status if facilitator responds
    if current_user.role in ['facilitator', 'admin'] and ticket.status == 'open':
        ticket.status = 'in-progress'
    
    db.session.add(response)
    db.session.commit()
    
    return jsonify({
        'message': 'Response added',
        'response': response.to_dict()
    }), 201


@tickets_bp.route('/<int:ticket_id>/escalate', methods=['POST'])
@token_required
def escalate_ticket(current_user, ticket_id):
    """Escalate a ticket to another department"""
    if current_user.role not in ['facilitator', 'admin']:
        return jsonify({'error': 'Access denied'}), 403
    
    ticket = Ticket.query.get_or_404(ticket_id)
    data = request.get_json()
    
    new_department = data.get('department', ticket.department)
    reason = data.get('reason', 'No reason provided')
    
    ticket.status = 'escalated'
    ticket.department = new_department
    
    # Add system message
    response = TicketResponse(
        ticket_id=ticket_id,
        message=f"Ticket escalated to {new_department}. Reason: {reason}",
        is_system=True
    )
    
    db.session.add(response)
    db.session.commit()
    
    # Send notifications to student and admins
    notify_ticket_escalated(ticket, current_user, reason, new_department)
    
    return jsonify({
        'message': 'Ticket escalated',
        'ticket': ticket.to_dict()
    })


@tickets_bp.route('/stats', methods=['GET'])
@token_required
def get_ticket_stats(current_user):
    """Get ticket statistics for dashboard"""
    
    if current_user.role == 'student':
        base_query = Ticket.query.filter_by(user_id=current_user.id)
    else:
        base_query = Ticket.query
    
    # Count by status
    by_status = {
        'open': base_query.filter_by(status='open').count(),
        'in-progress': base_query.filter_by(status='in-progress').count(),
        'answered': base_query.filter_by(status='answered').count(),
        'escalated': base_query.filter_by(status='escalated').count(),
        'closed': base_query.filter_by(status='closed').count()
    }
    
    # Count by category
    categories = ['assignment', 'grades', 'capstone', 'administrative', 'technical', 'general']
    by_category = {}
    for cat in categories:
        by_category[cat] = base_query.filter_by(category=cat).count()
    
    # Count by priority
    by_priority = {
        'low': base_query.filter_by(priority='low').count(),
        'medium': base_query.filter_by(priority='medium').count(),
        'high': base_query.filter_by(priority='high').count()
    }
    
    return jsonify({
        'total': base_query.count(),
        'by_status': by_status,
        'by_category': by_category,
        'by_priority': by_priority
    })


@tickets_bp.route('/classifier-info', methods=['GET'])
def get_classifier_status():
    """Get information about the AI classifier being used"""
    return jsonify(get_classifier_info())
