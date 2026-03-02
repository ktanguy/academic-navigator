# 📧 Email Notifications Setup Guide

This guide explains how to set up email notifications in Academic Navigator.

## Quick Overview

Academic Navigator supports **3 email providers**:

| Provider | Difficulty | Free Tier | Best For |
|----------|------------|-----------|----------|
| **SendGrid** | Easy | 100 emails/day | Production |
| **Gmail SMTP** | Medium | Unlimited (with limits) | Development |
| **Gmail API** | Complex | OAuth-based | User-initiated |

---

## Option 1: SendGrid (Recommended)

### Step 1: Create a SendGrid Account
1. Go to [https://sendgrid.com](https://sendgrid.com)
2. Click "Start for Free"
3. Complete the signup process

### Step 2: Create an API Key
1. Go to **Settings → API Keys**
2. Click **Create API Key**
3. Name it "Academic Navigator"
4. Select **Full Access** or **Restricted Access** with Mail Send permission
5. Copy the API key (you won't see it again!)

### Step 3: Configure Your Backend
Edit your `backend/.env` file:

```env
EMAIL_PROVIDER=sendgrid
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxxx
EMAIL_FROM=noreply@yourdomain.com
```

### Step 4: Verify Sender Identity
1. Go to **Settings → Sender Authentication**
2. Either verify a single sender email OR
3. Authenticate your domain (recommended for production)

---

## Option 2: Gmail SMTP

### Step 1: Enable 2-Factor Authentication
1. Go to [https://myaccount.google.com/security](https://myaccount.google.com/security)
2. Enable **2-Step Verification**

### Step 2: Create an App Password
1. Go to [https://myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
2. Select **Mail** and **Other (Custom name)**
3. Enter "Academic Navigator"
4. Click **Generate**
5. Copy the 16-character password (e.g., `abcd efgh ijkl mnop`)

### Step 3: Configure Your Backend
Edit your `backend/.env` file:

```env
EMAIL_PROVIDER=gmail_smtp
GMAIL_ADDRESS=your-email@gmail.com
GMAIL_APP_PASSWORD=abcdefghijklmnop
EMAIL_FROM=your-email@gmail.com
```

> ⚠️ **Important**: Remove spaces from the App Password

---

## Option 3: Disable Email (Development)

To run without email notifications:

```env
EMAIL_PROVIDER=none
```

Notifications will still be saved in the database and shown in the UI bell icon.

---

## Testing Your Configuration

### Method 1: Use the API Endpoint

```bash
# First, login to get a token (as admin)
TOKEN=$(curl -s -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}' | jq -r '.token')

# Check email configuration
curl -s http://localhost:5001/api/notifications/email-config \
  -H "Authorization: Bearer $TOKEN"

# Send a test email
curl -s -X POST http://localhost:5001/api/notifications/test-email \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"email":"your-test-email@example.com"}'
```

### Method 2: Check Server Logs

When emails are sent (or would be sent), you'll see log messages:

```
✅ SendGrid email sent to user@example.com, status: 202
```

or

```
📧 [EMAIL DISABLED] Would send to user@example.com: Subject
```

---

## Notification Events

The following events trigger email notifications:

| Event | Recipients | Email Content |
|-------|------------|---------------|
| **Appointment Booked** | Facilitator | Student name, date, time, type |
| **Ticket Assigned** | Facilitator | Ticket details, student name |
| **Ticket Escalated** | Student + Admins | Reason, department |
| **Ticket Resolved** | Student | Resolution confirmation |
| **Appointment Confirmed** | Student | Confirmation details |
| **Appointment Cancelled** | Other party | Cancellation notice |

---

## Troubleshooting

### "Failed to send email"
1. Check `EMAIL_PROVIDER` is set correctly
2. Verify your API key or credentials
3. Check server logs for detailed error messages

### SendGrid: "The from address does not match a verified Sender Identity"
1. Go to SendGrid dashboard → Settings → Sender Authentication
2. Verify your sender email address

### Gmail: "Username and Password not accepted"
1. Make sure you're using an **App Password**, not your regular password
2. Ensure 2-Factor Authentication is enabled
3. Remove any spaces from the App Password

### Emails going to spam
1. Use SendGrid with domain authentication
2. Set a proper FROM address (not noreply@localhost)
3. Add SPF/DKIM records to your domain

---

## Production Checklist

- [ ] Use SendGrid or a proper email service
- [ ] Set up domain authentication
- [ ] Use environment variables (never commit credentials)
- [ ] Set a professional FROM address
- [ ] Test email delivery before going live
