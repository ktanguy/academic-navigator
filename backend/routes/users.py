# Users Routes

from flask import Blueprint, request, jsonify
from models.models import User, db
from routes.auth import token_required

users_bp = Blueprint('users', __name__)


@users_bp.route('', methods=['GET'])
@token_required
def get_users(current_user):
    """Get all users (admin only) or facilitators (for directory)"""
    role_filter = request.args.get('role')
    department_filter = request.args.get('department')
    
    query = User.query
    
    # Students can only see facilitators (for directory)
    if current_user.role == 'student':
        query = query.filter(User.role.in_(['facilitator', 'admin']))
    elif role_filter:
        query = query.filter_by(role=role_filter)
    
    if department_filter:
        query = query.filter_by(department=department_filter)
    
    users = query.all()
    
    return jsonify({'users': [u.to_dict() for u in users]})


@users_bp.route('/facilitators', methods=['GET'])
def get_facilitators():
    """Public endpoint to get facilitators for directory"""
    department = request.args.get('department')
    
    query = User.query.filter_by(role='facilitator')
    
    if department:
        query = query.filter_by(department=department)
    
    facilitators = query.all()
    
    return jsonify({'facilitators': [f.to_dict() for f in facilitators]})


@users_bp.route('/<int:user_id>', methods=['GET'])
@token_required
def get_user(current_user, user_id):
    """Get a specific user"""
    user = User.query.get_or_404(user_id)
    return jsonify({'user': user.to_dict()})


@users_bp.route('/<int:user_id>', methods=['PATCH'])
@token_required
def update_user(current_user, user_id):
    """Update user profile"""
    # Users can only update themselves, admins can update anyone
    if current_user.id != user_id and current_user.role != 'admin':
        return jsonify({'error': 'Access denied'}), 403
    
    user = User.query.get_or_404(user_id)
    data = request.get_json()
    
    if 'name' in data:
        user.name = data['name']
    if 'department' in data:
        user.department = data['department']
    if 'avatar_url' in data:
        user.avatar_url = data['avatar_url']
    
    # Only admins can change roles
    if 'role' in data and current_user.role == 'admin':
        user.role = data['role']
    
    db.session.commit()
    
    return jsonify({
        'message': 'User updated',
        'user': user.to_dict()
    })


@users_bp.route('/<int:user_id>', methods=['DELETE'])
@token_required
def delete_user(current_user, user_id):
    """Delete a user (admin only)"""
    if current_user.role != 'admin':
        return jsonify({'error': 'Access denied'}), 403
    
    user = User.query.get_or_404(user_id)
    
    db.session.delete(user)
    db.session.commit()
    
    return jsonify({'message': 'User deleted'})


@users_bp.route('/stats', methods=['GET'])
@token_required
def get_user_stats(current_user):
    """Get user statistics (admin only)"""
    if current_user.role != 'admin':
        return jsonify({'error': 'Access denied'}), 403
    
    stats = {
        'total': User.query.count(),
        'students': User.query.filter_by(role='student').count(),
        'facilitators': User.query.filter_by(role='facilitator').count(),
        'admins': User.query.filter_by(role='admin').count()
    }
    
    return jsonify({'stats': stats})
