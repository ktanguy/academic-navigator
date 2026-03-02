from flask import Blueprint, request, jsonify
import os

from models.models import Notification, db
from routes.auth import token_required
from services.notification_service import (
    get_user_notifications,
    mark_notification_read,
    mark_all_notifications_read
)
from services.email_service import get_email_config_status, send_email

notifications_bp = Blueprint('notifications', __name__)


@notifications_bp.route('', methods=['GET'])
@token_required
def get_notifications(current_user):
    """Get all notifications for the current user"""
    unread_only = request.args.get('unread_only', 'false').lower() == 'true'
    limit = request.args.get('limit', 50, type=int)
    
    notifications = get_user_notifications(current_user.id, unread_only, limit)
    unread_count = Notification.query.filter_by(user_id=current_user.id, is_read=False).count()
    
    return jsonify({
        'notifications': [n.to_dict() for n in notifications],
        'unread_count': unread_count
    })


@notifications_bp.route('/<int:notification_id>/read', methods=['POST'])
@token_required
def mark_as_read(current_user, notification_id):
    """Mark a notification as read"""
    success = mark_notification_read(notification_id, current_user.id)
    
    if success:
        return jsonify({'message': 'Notification marked as read'})
    else:
        return jsonify({'error': 'Notification not found'}), 404


@notifications_bp.route('/read-all', methods=['POST'])
@token_required
def mark_all_as_read(current_user):
    """Mark all notifications as read"""
    mark_all_notifications_read(current_user.id)
    return jsonify({'message': 'All notifications marked as read'})


@notifications_bp.route('/email-config', methods=['GET'])
@token_required
def get_email_config(current_user):
    """Get email configuration status (admin only)"""
    if current_user.role != 'admin':
        return jsonify({'error': 'Access denied'}), 403
    
    return jsonify(get_email_config_status())


@notifications_bp.route('/test-email', methods=['POST'])
@token_required
def test_email(current_user):
    """Send a test email to verify configuration (admin only)"""
    if current_user.role != 'admin':
        return jsonify({'error': 'Access denied'}), 403
    
    data = request.get_json() or {}
    to_email = data.get('email', current_user.email)
    
    success = send_email(
        to_email=to_email,
        subject="🧪 Test Email - Academic Navigator",
        body=f"Hello!\n\nThis is a test email from Academic Navigator.\n\nIf you received this, your email configuration is working correctly.\n\nBest regards,\nAcademic Navigator"
    )
    
    if success:
        return jsonify({'message': f'Test email sent to {to_email}'})
    else:
        config = get_email_config_status()
        return jsonify({
            'error': 'Failed to send email',
            'config': config,
            'hint': 'Check your EMAIL_PROVIDER and credentials in .env'
        }), 500


@notifications_bp.route('/send_gmail', methods=['POST'])
def send_gmail():
    """
    Legacy Gmail OAuth endpoint - deprecated in favor of SMTP.
    Use the email_service.py with Gmail SMTP instead.
    """
    return jsonify({
        'error': 'This endpoint is deprecated. Email is now sent via SMTP.',
        'hint': 'Configure GMAIL_ADDRESS and GMAIL_APP_PASSWORD in .env'
    }), 410
