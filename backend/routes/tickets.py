# =============================================================================
# tickets.py — Everything to do with Support Tickets
# =============================================================================
# This is the most important file in the backend.
# Every support request a student submits goes through here.
#
# WHAT HAPPENS WHEN A STUDENT SUBMITS A TICKET:
#   1. Student writes a subject and description
#   2. The AI reads it and guesses the category (e.g. "assignment")
#   3. If the AI is 70% or more confident → automatically assign to a facilitator
#   4. If below 70% → flag it for an admin to review manually
#   5. A notification is sent to whoever needs to know
#
# ALL THE ROUTES IN THIS FILE:
#   GET    /api/tickets              → get a list of tickets (each role sees different ones)
#   POST   /api/tickets              → submit a new ticket
#   GET    /api/tickets/:id          → get one specific ticket
#   PATCH  /api/tickets/:id          → update a ticket (change status, assign, etc.)
#   POST   /api/tickets/:id/responses  → reply to a ticket
#   POST   /api/tickets/:id/escalate   → send ticket to a different department
#   POST   /api/tickets/:id/review     → admin manually reviews a flagged ticket
#   GET    /api/tickets/needs-review   → see all tickets waiting for manual review
#   GET    /api/tickets/stats          → numbers for the dashboard charts
#   GET    /api/tickets/classifier-info → check if the AI is online
# =============================================================================

from flask import Blueprint, request, jsonify
from models.models import Ticket, TicketResponse, User, db
from routes.auth import token_required
from datetime import datetime

# The AI classifier (in classifier.py) — this is what categorizes tickets
from classifier import classify_ticket, get_classifier_info

# Notification functions — each one creates an in-app alert AND sends an email
from services.notification_service import (
    notify_ticket_escalated,    # Ticket moved to a different department
    notify_ticket_resolved,     # Ticket marked as closed/resolved
    notify_ticket_assigned,     # Ticket assigned to a facilitator
    notify_ticket_needs_review, # Ticket flagged for admin because AI wasn't sure
    notify_ticket_reviewed,     # Admin finished reviewing a flagged ticket
    notify_ticket_response      # Someone replied to a ticket
)

tickets_bp = Blueprint('tickets', __name__)

# =============================================================================
# WHICH DEPARTMENT HANDLES EACH CATEGORY
# =============================================================================
# When the AI categorizes a ticket, this table tells us which department
# should handle it. That department is stored on the ticket.
CATEGORY_DEPARTMENT_MAP = {
    'assignment':     'Academic Affairs',
    'grades':         'Academic Affairs',
    'capstone':       'Capstone Committee',
    'administrative': "Registrar's Office",
    'technical':      'IT Support',
    'general':        'Academic Affairs'   # Default if nothing else matches
}


def get_department_for_category(category: str) -> str:
    # Returns the department name for a given category.
    # If the category is not in our list, defaults to 'Academic Affairs'.
    return CATEGORY_DEPARTMENT_MAP.get(category, 'Academic Affairs')


def find_best_facilitator(category: str):
    # Finds the right facilitator to assign a new ticket to.
    #
    # How it decides (in order):
    #   1. First try a specific demo facilitator (for consistent demos)
    #   2. Look for facilitators in the matching department with the fewest open tickets
    #      (this spreads the work evenly — no one gets overloaded)
    #   3. If no one in that department, pick any facilitator with the fewest tickets
    #   4. If there are no facilitators at all, return nothing (ticket stays unassigned)
    from sqlalchemy import func

    # For demo purposes: always try this specific facilitator first
    jolly = User.query.filter_by(
        role='facilitator',
        email='j.umulisa@alustudent.com'
    ).first()
    if jolly:
        return jolly

    department = get_department_for_category(category)

    # Look for facilitators in the right department
    facilitators_in_dept = User.query.filter_by(
        role='facilitator',
        department=department
    ).all()

    if facilitators_in_dept:
        # Pick the one with the fewest open tickets right now
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

    # No one in that department — find any available facilitator
    all_facilitators = User.query.filter_by(role='facilitator').all()

    if not all_facilitators:
        return None  # No facilitators in the system at all

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
    # Creates a human-friendly ticket ID like TKT-001, TKT-002, etc.
    # Uses the last ticket's ID to figure out what number comes next.
    # :03d means always show at least 3 digits (so TKT-001, not TKT-1).
    last_ticket = Ticket.query.order_by(Ticket.id.desc()).first()
    next_num = (last_ticket.id + 1) if last_ticket else 1
    return f"TKT-{next_num:03d}"


# =============================================================================
# ROUTE: GET /api/tickets — Get a list of tickets
# =============================================================================
@tickets_bp.route('', methods=['GET'])
@token_required
def get_tickets(current_user):
    # Returns tickets based on who is asking:
    #   Student → only their own tickets
    #   Facilitator → tickets assigned to them, plus any unassigned ones
    #   Admin → all tickets in the system
    #
    # This filtering happens on the server side — students cannot see each other's tickets
    # even if they try to bypass the frontend.

    if current_user.role == 'student':
        tickets = Ticket.query.filter_by(user_id=current_user.id).order_by(Ticket.created_at.desc()).all()

    elif current_user.role == 'facilitator':
        # Show tickets assigned to this facilitator OR not assigned to anyone yet
        tickets = Ticket.query.filter(
            (Ticket.assigned_to == current_user.id) | (Ticket.assigned_to == None)
        ).order_by(Ticket.created_at.desc()).all()

    else:
        # Admin sees everything
        tickets = Ticket.query.order_by(Ticket.created_at.desc()).all()

    return jsonify({'tickets': [t.to_dict() for t in tickets]})


# =============================================================================
# ROUTE: POST /api/tickets — Submit a new ticket
# =============================================================================
@tickets_bp.route('', methods=['POST'])
@token_required
def create_ticket(current_user):
    # Creates a new support ticket.
    # After saving, the AI classifies it and either assigns it or flags it for review.
    #
    # What the student sends:
    #   subject     — short title of the problem (required)
    #   description — full explanation of the problem (required)
    #   priority    — how urgent it is: low / medium / high (optional, defaults to medium)
    #   category    — if the student chose a category themselves (optional)
    #
    # What the AI does:
    #   - Reads the subject + description together
    #   - Guesses the category (e.g. "assignment") and gives a confidence score
    #   - If confidence is 70% or above: ticket is auto-assigned to a facilitator
    #   - If confidence is below 70%: ticket is flagged for admin to review manually
    #
    # After creating the ticket, a system message is added to the thread
    # explaining what the AI decided.

    data = request.get_json()

    # Both subject and description are required
    if not data.get('subject') or not data.get('description'):
        return jsonify({'error': 'Subject and description are required'}), 400

    # Combine subject + description so the AI gets full context
    combined_text = f"{data['subject']} {data['description']}"
    ai_category, ai_confidence = classify_ticket(combined_text)

    # If the student manually picked a category, use that. Otherwise use the AI's guess.
    category = data.get('category') or ai_category

    # Find which department handles this category
    department = get_department_for_category(category)

    # 70% is the cutoff. Below this → needs human review.
    CONFIDENCE_THRESHOLD = 0.70
    needs_review = ai_confidence < CONFIDENCE_THRESHOLD

    # Only look for a facilitator if the AI was confident enough
    facilitator = None
    if not needs_review:
        facilitator = find_best_facilitator(category)

    # Save the ticket to the database
    ticket = Ticket(
        ticket_number=generate_ticket_number(),
        subject=data['subject'],
        description=data['description'],
        category=category,
        priority=data.get('priority', 'medium'),
        status='needs-review' if needs_review else 'open',
        ai_category=ai_category,         # What the AI guessed (shown in admin panel)
        ai_confidence=ai_confidence,      # How confident the AI was (shown in admin panel)
        needs_review=needs_review,        # Puts ticket in the review queue if True
        user_id=current_user.id,
        assigned_to=facilitator.id if facilitator else None,
        department=department or data.get('department')
    )

    db.session.add(ticket)
    db.session.commit()

    # If a facilitator was assigned, notify them by email
    if facilitator:
        notify_ticket_assigned(ticket, facilitator)

    # Add a system message to the ticket thread explaining what happened.
    # This appears in the conversation history as an automated note (not from a real person).
    if needs_review:
        system_message = (
            f"Ticket created and AI suggested category '{ai_category}' with "
            f"{int(ai_confidence * 100)}% confidence. Flagged for manual review "
            f"due to low confidence (threshold: 70%)."
        )
    else:
        system_message = (
            f"Ticket created and categorized as '{ai_category}' with "
            f"{int(ai_confidence * 100)}% confidence. Auto-assigned to support team."
        )

    system_response = TicketResponse(
        ticket_id=ticket.id,
        message=system_message,
        is_system=True  # Shown differently in the UI — it's an automated note
    )
    db.session.add(system_response)
    db.session.commit()

    # If the ticket needs review, notify all admins so they know to look at it
    if needs_review:
        notify_ticket_needs_review(ticket, ai_category, ai_confidence)

    return jsonify({
        'message': 'Ticket created successfully',
        'ticket': ticket.to_dict(),
        'ai_classification': {
            'category': ai_category,
            'confidence': ai_confidence,
            'needs_review': needs_review,
            'threshold': CONFIDENCE_THRESHOLD
        }
    }), 201


# =============================================================================
# ROUTE: GET /api/tickets/:id — Get one specific ticket
# =============================================================================
@tickets_bp.route('/<int:ticket_id>', methods=['GET'])
@token_required
def get_ticket(current_user, ticket_id):
    # Returns a single ticket including all its replies.
    #
    # Access rules:
    #   Students can only view their OWN tickets.
    #   Facilitators and admins can view any ticket.

    ticket = Ticket.query.get_or_404(ticket_id)

    # Block students from viewing other students' tickets
    if current_user.role == 'student' and ticket.user_id != current_user.id:
        return jsonify({'error': 'Access denied'}), 403

    return jsonify({'ticket': ticket.to_dict()})


# =============================================================================
# ROUTE: PATCH /api/tickets/:id — Update a ticket
# =============================================================================
@tickets_bp.route('/<int:ticket_id>', methods=['PATCH', 'PUT'])
@token_required
def update_ticket(current_user, ticket_id):
    # Updates one or more fields on a ticket.
    # Only facilitators and admins can do this — students cannot change ticket status.
    #
    # What can be updated:
    #   status      — open / in-progress / answered / escalated / closed / resolved
    #   assigned_to — ID of the facilitator to assign it to
    #   priority    — low / medium / high
    #   department  — which department handles it
    #   category    — the topic/type of the ticket
    #
    # Special rule: if the status changes to 'closed' or 'resolved',
    # the student automatically receives a notification that their issue is resolved.

    ticket = Ticket.query.get_or_404(ticket_id)

    if current_user.role == 'student':
        return jsonify({'error': 'Access denied'}), 403

    data = request.get_json()
    old_status = ticket.status  # Remember the old status so we can detect changes

    # Update only the fields that were included in the request
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

    # If the ticket just got resolved/closed for the first time, notify the student
    if 'status' in data and data['status'] in ['closed', 'resolved'] and old_status not in ['closed', 'resolved']:
        notify_ticket_resolved(ticket, current_user)

    return jsonify({
        'message': 'Ticket updated',
        'ticket': ticket.to_dict()
    })


# =============================================================================
# ROUTE: POST /api/tickets/:id/responses — Reply to a ticket
# =============================================================================
@tickets_bp.route('/<int:ticket_id>/responses', methods=['POST'])
@token_required
def add_response(current_user, ticket_id):
    # Adds a new message to a ticket's conversation thread.
    # Both students and facilitators can reply.
    #
    # What the sender provides:
    #   message — the reply text (required)
    #
    # What happens automatically:
    #   - If a facilitator replies to an 'open' ticket, status changes to 'in-progress'
    #     (this tells everyone that someone is now actively working on it)
    #   - The other person gets a notification:
    #       Facilitator replied → notify the student
    #       Student replied → notify the assigned facilitator

    ticket = Ticket.query.get_or_404(ticket_id)
    data = request.get_json()

    if not data.get('message'):
        return jsonify({'error': 'Message is required'}), 400

    response = TicketResponse(
        ticket_id=ticket_id,
        user_id=current_user.id,
        message=data['message'],
        is_system=False  # This is a real message from a real person
    )

    # When a facilitator first responds, mark the ticket as in-progress
    if current_user.role in ['facilitator', 'admin'] and ticket.status == 'open':
        ticket.status = 'in-progress'

    db.session.add(response)
    db.session.commit()

    # Notify whoever needs to know about this new reply
    notify_ticket_response(ticket, response, current_user)

    return jsonify({
        'message': 'Response added',
        'response': response.to_dict()
    }), 201


# =============================================================================
# ROUTE: POST /api/tickets/:id/escalate — Move ticket to another department
# =============================================================================
@tickets_bp.route('/<int:ticket_id>/escalate', methods=['POST'])
@token_required
def escalate_ticket(current_user, ticket_id):
    # Escalates a ticket to a different department.
    # Only facilitators and admins can do this.
    #
    # Example: A student submits a "technical" ticket but the real problem is
    # an academic matter. The facilitator escalates it to Academic Affairs.
    #
    # What the facilitator sends:
    #   department — which department should now handle it
    #   reason     — why it's being escalated
    #
    # What happens:
    #   - Status changes to 'escalated'
    #   - Department is updated
    #   - A system note is added to the thread
    #   - The student and all admins get a notification

    if current_user.role not in ['facilitator', 'admin']:
        return jsonify({'error': 'Access denied'}), 403

    ticket = Ticket.query.get_or_404(ticket_id)
    data = request.get_json()

    new_department = data.get('department', ticket.department)
    reason = data.get('reason', 'No reason provided')

    ticket.status = 'escalated'
    ticket.department = new_department

    # Add a system note to the ticket thread so everyone can see why it was moved
    response = TicketResponse(
        ticket_id=ticket_id,
        message=f"Ticket escalated to {new_department}. Reason: {reason}",
        is_system=True
    )

    db.session.add(response)
    db.session.commit()

    # Notify the student and admins
    notify_ticket_escalated(ticket, current_user, reason, new_department)

    return jsonify({
        'message': 'Ticket escalated',
        'ticket': ticket.to_dict()
    })


# =============================================================================
# ROUTE: POST /api/tickets/:id/review — Admin reviews a flagged ticket
# =============================================================================
@tickets_bp.route('/<int:ticket_id>/review', methods=['POST'])
@token_required
def review_ticket(current_user, ticket_id):
    # This is for tickets that the AI wasn't confident enough to auto-assign.
    # An admin opens the review queue, reads the ticket, and decides:
    #   A) Agree with the AI's category → confirm it and assign to a facilitator
    #   B) Disagree → change the category and assign to the right facilitator
    #
    # Only facilitators and admins can do this.
    #
    # What the admin sends:
    #   category  — the correct category (optional — can confirm AI's guess)
    #   assign_to — ID of a specific facilitator to assign to (optional)
    #
    # What happens:
    #   - 'needs_review' is set to False (removes from review queue)
    #   - Records who reviewed it and when
    #   - Status changes to 'open' so a facilitator can now respond
    #   - A system note is added to the thread
    #   - The student is notified that their ticket has been reviewed

    if current_user.role not in ['facilitator', 'admin']:
        return jsonify({'error': 'Access denied. Only facilitators and admins can review tickets.'}), 403

    ticket = Ticket.query.get_or_404(ticket_id)

    # Only tickets that were flagged as needing review can be reviewed here
    ai_confidence = ticket.ai_confidence or 0
    if not ticket.needs_review and ai_confidence >= 0.70:
        return jsonify({'error': 'This ticket does not require review (confidence >= 70%)'}), 400

    data = request.get_json()

    # Use the admin's chosen category, or fall back to what the AI originally guessed
    approved_category = data.get('category', ticket.ai_category)
    assign_to = data.get('assign_to')  # Optional: ID of a specific facilitator

    # Update the ticket
    ticket.category = approved_category
    ticket.needs_review = False             # Remove from the review queue
    ticket.reviewed_by = current_user.id   # Record which admin reviewed it
    ticket.reviewed_at = datetime.utcnow() # Record the time of review
    ticket.status = 'open'                 # Ticket is now open for a facilitator to respond
    ticket.department = get_department_for_category(approved_category)

    # Assign to a specific person or let the system find the best available one
    if assign_to:
        facilitator = User.query.filter_by(id=assign_to, role='facilitator').first()
    else:
        facilitator = find_best_facilitator(approved_category)

    if facilitator:
        ticket.assigned_to = facilitator.id
        notify_ticket_assigned(ticket, facilitator)

    # Build a summary message to add to the ticket thread
    review_message = f"Ticket reviewed by {current_user.name}. "
    if approved_category != ticket.ai_category:
        review_message += f"Category changed from '{ticket.ai_category}' to '{approved_category}'. "
    else:
        review_message += f"AI category '{approved_category}' confirmed. "
    if facilitator:
        review_message += f"Assigned to {facilitator.name}."

    system_response = TicketResponse(
        ticket_id=ticket.id,
        message=review_message,
        is_system=True
    )
    db.session.add(system_response)
    db.session.commit()

    # Let the student know their ticket was reviewed
    notify_ticket_reviewed(ticket, current_user)

    return jsonify({
        'message': 'Ticket reviewed and assigned successfully',
        'ticket': ticket.to_dict()
    })


# =============================================================================
# ROUTE: GET /api/tickets/needs-review — Review queue
# =============================================================================
@tickets_bp.route('/needs-review', methods=['GET'])
@token_required
def get_tickets_needing_review(current_user):
    # Returns all tickets that are waiting for a human to review them.
    # Only facilitators and admins can access this.
    #
    # A ticket appears here if:
    #   - It was flagged by the AI (needs_review = True)
    #   - OR its AI confidence was below 70%
    #   - OR it was created before AI was added (no confidence score)
    #
    # A ticket is excluded if:
    #   - It's already closed
    #   - It has already been reviewed (reviewed_by is set)
    #
    # This is what fills the "Review Queue" tab in the Admin Panel.

    if current_user.role not in ['facilitator', 'admin']:
        return jsonify({'error': 'Access denied'}), 403

    tickets = Ticket.query.filter(
        (Ticket.needs_review == True) |
        (Ticket.ai_confidence < 0.70) |
        (Ticket.ai_confidence == None)
    ).filter(
        Ticket.status != 'closed'
    ).order_by(Ticket.created_at.desc()).all()

    # Remove any that have already been reviewed
    tickets = [t for t in tickets if t.reviewed_by is None]

    return jsonify({
        'tickets': [t.to_dict() for t in tickets],
        'count': len(tickets)
    })


# =============================================================================
# ROUTE: GET /api/tickets/stats — Dashboard statistics
# =============================================================================
@tickets_bp.route('/stats', methods=['GET'])
@token_required
def get_ticket_stats(current_user):
    # Returns counts and numbers used by the dashboard charts.
    #
    # Students see stats for only their own tickets.
    # Facilitators and admins see stats for all tickets.
    #
    # Returns:
    #   total           — total number of tickets
    #   by_status       — how many tickets are in each status
    #   by_category     — how many tickets belong to each category
    #   by_priority     — how many are low / medium / high priority
    #   needs_review    — how many are waiting for human review
    #   avg_ai_confidence — the average confidence score across all tickets

    if current_user.role == 'student':
        base_query = Ticket.query.filter_by(user_id=current_user.id)
    else:
        base_query = Ticket.query

    # Count tickets for each status
    by_status = {
        'open':         base_query.filter_by(status='open').count(),
        'in-progress':  base_query.filter_by(status='in-progress').count(),
        'answered':     base_query.filter_by(status='answered').count(),
        'escalated':    base_query.filter_by(status='escalated').count(),
        'closed':       base_query.filter_by(status='closed').count(),
        'needs-review': base_query.filter_by(status='needs-review').count()
    }

    # How many tickets are still waiting for review
    needs_review_count = base_query.filter_by(needs_review=True).count()

    # Count tickets for each AI category
    categories = ['assignment', 'grades', 'capstone', 'administrative', 'technical', 'general']
    by_category = {cat: base_query.filter_by(category=cat).count() for cat in categories}

    # Count tickets by priority level
    by_priority = {
        'low':    base_query.filter_by(priority='low').count(),
        'medium': base_query.filter_by(priority='medium').count(),
        'high':   base_query.filter_by(priority='high').count()
    }

    # Average confidence score across all tickets (for the analytics chart)
    from sqlalchemy import func
    avg_confidence = db.session.query(func.avg(Ticket.ai_confidence)).scalar() or 0

    return jsonify({
        'total': base_query.count(),
        'by_status': by_status,
        'by_category': by_category,
        'by_priority': by_priority,
        'needs_review': needs_review_count,
        'avg_ai_confidence': round(avg_confidence, 2)
    })


# =============================================================================
# ROUTE: GET /api/tickets/classifier-info — Is the AI online?
# =============================================================================
@tickets_bp.route('/classifier-info', methods=['GET'])
def get_classifier_status():
    # Checks whether the AI classifier on Hugging Face is currently reachable.
    # The admin panel shows a status indicator based on this.
    # No login required — it's just a status check.
    return jsonify(get_classifier_info())
