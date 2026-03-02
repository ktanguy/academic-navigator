# Email Service
# Supports SendGrid, Gmail SMTP, and Gmail API

import os
import logging
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

logger = logging.getLogger(__name__)

# Configuration from environment variables
EMAIL_PROVIDER = os.getenv('EMAIL_PROVIDER', 'gmail_smtp')  # Default to gmail_smtp
SENDGRID_API_KEY = os.getenv('SENDGRID_API_KEY')

# Support both old and new env var names for Gmail
GMAIL_ADDRESS = os.getenv('GMAIL_ADDRESS') or os.getenv('SMTP_USERNAME')
GMAIL_APP_PASSWORD = os.getenv('GMAIL_APP_PASSWORD') or os.getenv('SMTP_PASSWORD')
SMTP_SERVER = os.getenv('SMTP_SERVER', 'smtp.gmail.com')
SMTP_PORT = int(os.getenv('SMTP_PORT', '587'))

EMAIL_FROM = os.getenv('EMAIL_FROM', GMAIL_ADDRESS or 'noreply@academic-navigator.com')

# Base URL for links in emails
APP_BASE_URL = os.getenv('APP_BASE_URL', 'https://academic-navigator-api.onrender.com')


def send_email(to_email: str, subject: str, body: str, html_body: str = None) -> bool:
    """
    Send email using the configured provider.
    Returns True if successful, False otherwise.
    """
    if EMAIL_PROVIDER == 'sendgrid':
        return _send_via_sendgrid(to_email, subject, body, html_body)
    elif EMAIL_PROVIDER == 'gmail_smtp':
        return _send_via_gmail_smtp(to_email, subject, body, html_body)
    elif EMAIL_PROVIDER == 'gmail_api':
        logger.info(f"Gmail API requires user OAuth. Skipping email to {to_email}")
        return False
    else:
        # Email disabled - just log
        logger.info(f"📧 [EMAIL DISABLED] Would send to {to_email}: {subject}")
        return False


def _send_via_sendgrid(to_email: str, subject: str, body: str, html_body: str = None) -> bool:
    """Send email using SendGrid API."""
    if not SENDGRID_API_KEY:
        logger.warning("SendGrid API key not configured")
        return False
    
    try:
        import sendgrid
        from sendgrid.helpers.mail import Mail, Email, To, Content
        
        sg = sendgrid.SendGridAPIClient(api_key=SENDGRID_API_KEY)
        
        message = Mail(
            from_email=Email(EMAIL_FROM, "Academic Navigator"),
            to_emails=To(to_email),
            subject=subject,
            plain_text_content=Content("text/plain", body)
        )
        
        if html_body:
            message.add_content(Content("text/html", html_body))
        
        response = sg.send(message)
        logger.info(f"✅ SendGrid email sent to {to_email}, status: {response.status_code}")
        return response.status_code in [200, 201, 202]
    
    except ImportError:
        logger.error("SendGrid library not installed. Run: pip install sendgrid")
        return False
    except Exception as e:
        logger.error(f"❌ SendGrid error: {e}")
        return False


def _send_via_gmail_smtp(to_email: str, subject: str, body: str, html_body: str = None) -> bool:
    """Send email using Gmail SMTP with App Password."""
    if not GMAIL_ADDRESS or not GMAIL_APP_PASSWORD:
        logger.warning(f"Gmail SMTP credentials not configured. GMAIL_ADDRESS: {bool(GMAIL_ADDRESS)}, GMAIL_APP_PASSWORD: {bool(GMAIL_APP_PASSWORD)}")
        return False
    
    try:
        # Create message
        msg = MIMEMultipart('alternative')
        msg['Subject'] = subject
        msg['From'] = f"Academic Navigator <{GMAIL_ADDRESS}>"
        msg['To'] = to_email
        
        # Attach plain text
        msg.attach(MIMEText(body, 'plain'))
        
        # Attach HTML if provided
        if html_body:
            msg.attach(MIMEText(html_body, 'html'))
        
        # Connect to SMTP server
        logger.info(f"Connecting to {SMTP_SERVER}:{SMTP_PORT}")
        
        if SMTP_PORT == 465:
            # SSL connection
            with smtplib.SMTP_SSL(SMTP_SERVER, SMTP_PORT) as server:
                server.login(GMAIL_ADDRESS, GMAIL_APP_PASSWORD)
                server.send_message(msg)
        else:
            # TLS connection (port 587)
            with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
                server.starttls()
                server.login(GMAIL_ADDRESS, GMAIL_APP_PASSWORD)
                server.send_message(msg)
        
        logger.info(f"✅ Gmail SMTP email sent to {to_email}")
        return True
    
    except Exception as e:
        logger.error(f"❌ Gmail SMTP error: {e}")
        return False


def create_html_email(title: str, message: str, action_url: str = None, action_text: str = None) -> str:
    """Create a nicely formatted HTML email."""
    action_button = ""
    if action_url and action_text:
        action_button = f'''
        <tr>
            <td style="padding: 20px 0;">
                <a href="{action_url}" style="background-color: #1CA97A; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">{action_text}</a>
            </td>
        </tr>
        '''
    
    return f'''
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f5f5f5;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px;">
            <tr>
                <td align="center">
                    <table width="600" cellpadding="0" cellspacing="0" style="background-color: white; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                        <!-- Header -->
                        <tr>
                            <td style="background: linear-gradient(135deg, #1CA97A 0%, #0E7C61 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
                                <h1 style="color: white; margin: 0; font-size: 24px;">Academic Navigator</h1>
                                <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0; font-size: 14px;">Student Support Platform</p>
                            </td>
                        </tr>
                        <!-- Content -->
                        <tr>
                            <td style="padding: 30px;">
                                <h2 style="color: #1a2b36; margin: 0 0 20px 0;">{title}</h2>
                                <p style="color: #666; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">{message}</p>
                            </td>
                        </tr>
                        {action_button}
                        <!-- Footer -->
                        <tr>
                            <td style="background-color: #f9fafb; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; border-top: 1px solid #e5e7eb;">
                                <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                                    This is an automated message from Academic Navigator.<br>
                                    Please do not reply to this email.
                                </p>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    </body>
    </html>
    '''


# Email templates for different notification types
def send_appointment_booked_email(facilitator_email: str, facilitator_name: str, student_name: str, date: str, time: str, meeting_type: str):
    """Send email when appointment is booked."""
    subject = "New Appointment Booked - Academic Navigator"
    body = f"""Hello {facilitator_name},

{student_name} has booked an appointment with you.

Details:
- Date: {date}
- Time: {time}
- Type: {meeting_type}

Please log in to Academic Navigator to confirm or manage this appointment.

Best regards,
Academic Navigator Team
"""
    html = create_html_email(
        title="New Appointment Booked",
        message=f"{student_name} has booked an appointment with you on <strong>{date}</strong> at <strong>{time}</strong>.<br><br>Meeting Type: {meeting_type}",
        action_url=f"{APP_BASE_URL}/facilitator",
        action_text="View Appointment"
    )
    return send_email(facilitator_email, subject, body, html)


def send_ticket_escalated_email(admin_email: str, admin_name: str, ticket_number: str, ticket_subject: str, escalated_by: str, department: str, reason: str):
    """Send email when ticket is escalated."""
    subject = f"Ticket #{ticket_number} Escalated - Requires Attention"
    body = f"""Hello {admin_name},

A ticket has been escalated and requires your attention.

Ticket Details:
- Ticket #: {ticket_number}
- Subject: {ticket_subject}
- Escalated by: {escalated_by}
- Department: {department}
- Reason: {reason}

Please log in to Academic Navigator to review and address this escalation.

Best regards,
Academic Navigator Team
"""
    html = create_html_email(
        title="Ticket Escalated",
        message=f"Ticket <strong>#{ticket_number}</strong> has been escalated by {escalated_by}.<br><br><strong>Subject:</strong> {ticket_subject}<br><strong>Department:</strong> {department}<br><strong>Reason:</strong> {reason}",
        action_url=f"{APP_BASE_URL}/facilitator",
        action_text="Review Ticket"
    )
    return send_email(admin_email, subject, body, html)


def send_ticket_resolved_email(student_email: str, student_name: str, ticket_number: str, ticket_subject: str, resolved_by: str):
    """Send email when ticket is resolved."""
    subject = f"Ticket #{ticket_number} Resolved - Academic Navigator"
    body = f"""Hello {student_name},

Great news! Your support ticket has been resolved.

Ticket Details:
- Ticket #: {ticket_number}
- Subject: {ticket_subject}
- Resolved by: {resolved_by}

If you have any further questions, you can reopen the ticket or create a new one.

Thank you for using Academic Navigator!

Best regards,
Academic Navigator Team
"""
    html = create_html_email(
        title="Ticket Resolved",
        message=f"Your ticket <strong>#{ticket_number}</strong> ({ticket_subject}) has been resolved by {resolved_by}.<br><br>If you have further questions, you can reopen the ticket or create a new one.",
        action_url=f"{APP_BASE_URL}/student",
        action_text="View Ticket"
    )
    return send_email(student_email, subject, body, html)


def send_ticket_assigned_email(facilitator_email: str, facilitator_name: str, ticket_number: str, ticket_subject: str, student_name: str, category: str):
    """Send email when ticket is assigned."""
    subject = f"New Ticket #{ticket_number} Assigned - Academic Navigator"
    body = f"""Hello {facilitator_name},

A new support ticket has been assigned to you.

Ticket Details:
- Ticket #: {ticket_number}
- Subject: {ticket_subject}
- From: {student_name}
- Category: {category}

Please log in to Academic Navigator to review and respond to this ticket.

Best regards,
Academic Navigator Team
"""
    html = create_html_email(
        title="New Ticket Assigned",
        message=f"A new ticket <strong>#{ticket_number}</strong> has been assigned to you.<br><br><strong>Subject:</strong> {ticket_subject}<br><strong>From:</strong> {student_name}<br><strong>Category:</strong> {category}",
        action_url=f"{APP_BASE_URL}/facilitator",
        action_text="View Ticket"
    )
    return send_email(facilitator_email, subject, body, html)


def get_email_config_status() -> dict:
    """Get current email configuration status."""
    return {
        'provider': EMAIL_PROVIDER,
        'enabled': EMAIL_PROVIDER != 'none',
        'sendgrid_configured': bool(SENDGRID_API_KEY),
        'gmail_smtp_configured': bool(GMAIL_ADDRESS and GMAIL_APP_PASSWORD),
        'from_address': EMAIL_FROM
    }
