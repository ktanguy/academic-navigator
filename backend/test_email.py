#!/usr/bin/env python3
"""
Gmail Notification Test Script
Run this to test your email configuration.

Usage:
  python test_email.py your-email@example.com
"""

import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from dotenv import load_dotenv
load_dotenv()

from services.email_service import send_email, get_email_config_status

def test_email(recipient_email: str):
    print("\n" + "="*60)
    print("📧 ACADEMIC NAVIGATOR - EMAIL TEST")
    print("="*60 + "\n")
    
    # Check configuration
    config = get_email_config_status()
    print("📋 Current Email Configuration:")
    print(f"   Provider: {config['provider']}")
    print(f"   Enabled: {config['enabled']}")
    print(f"   SendGrid configured: {config['sendgrid_configured']}")
    print(f"   Gmail SMTP configured: {config['gmail_smtp_configured']}")
    print(f"   From address: {config['from_address']}")
    print()
    
    if not config['enabled']:
        print("❌ Email is not enabled!")
        print("\n🔧 To enable Gmail SMTP, edit backend/.env and set:")
        print("   EMAIL_PROVIDER=gmail_smtp")
        print("   GMAIL_ADDRESS=your-email@gmail.com")
        print("   GMAIL_APP_PASSWORD=your-16-char-app-password")
        print("\n📖 See EMAIL_SETUP.md for detailed instructions")
        return False
    
    print(f"📤 Sending test email to: {recipient_email}")
    print("-"*60)
    
    success = send_email(
        to_email=recipient_email,
        subject="Test Email - Academic Navigator",
        body=f"""Hello!

This is a test email from Academic Navigator.

If you received this email, your email configuration is working correctly!

Configuration:
- Provider: {config['provider']}
- From: {config['from_address']}

You will now receive notifications for:
- New appointments booked
- Tickets assigned to you
- Ticket escalations
- Ticket resolutions

Best regards,
Academic Navigator Team
"""
    )
    
    print("-"*60)
    
    if success:
        print(f"\n✅ SUCCESS! Test email sent to {recipient_email}")
        print("   Check your inbox (and spam folder)")
    else:
        print(f"\n❌ FAILED to send email")
        print("\n🔧 Troubleshooting:")
        print("   1. Check your GMAIL_ADDRESS is correct")
        print("   2. Check your GMAIL_APP_PASSWORD (must be App Password, not regular password)")
        print("   3. Make sure 2-Step Verification is enabled on your Google account")
        print("   4. Check the terminal for error messages")
    
    return success


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python test_email.py <recipient-email>")
        print("Example: python test_email.py yourname@gmail.com")
        sys.exit(1)
    
    recipient = sys.argv[1]
    success = test_email(recipient)
    sys.exit(0 if success else 1)
