# ============================================================
# auth.py — Handles Login, Register, and Logout
# ============================================================
# This file controls who can access the app and who they are.
# When someone logs in, we check their password and give them
# a "token" (like a key card). They use that token on every
# request to prove who they are.
# ============================================================

from flask import Blueprint, request, jsonify, redirect, session
from models.models import User, db
import bcrypt       # Used to safely hash passwords
import jwt          # Used to create and read tokens
import os
import requests     # Used for Google login
from datetime import datetime, timedelta
from functools import wraps

# A Blueprint groups related routes together.
# All routes in this file will start with /api/auth (set in app.py)
auth_bp = Blueprint('auth', __name__)

# Google login settings (only needed if Google login is used)
GOOGLE_CLIENT_ID = os.getenv('GOOGLE_CLIENT_ID')
GOOGLE_CLIENT_SECRET = os.getenv('GOOGLE_CLIENT_SECRET')
GOOGLE_REDIRECT_URI = os.getenv('GOOGLE_REDIRECT_URI', 'http://localhost:5173/auth/google/callback')


def get_secret_key():
    # This is the secret password used to sign our tokens.
    # Set it in the environment variables on Render — never hardcode it.
    return os.getenv('SECRET_KEY', 'dev-secret-key')


# ============================================================
# token_required — A guard that protects routes
# ============================================================
def token_required(f):
    # This is a decorator. Put @token_required above any route
    # that should only work for logged-in users.
    #
    # What it does step by step:
    #   1. Reads the token from the request header
    #   2. Checks if the token is valid and not expired
    #   3. Finds the user in the database using the ID inside the token
    #   4. Passes that user into the route function as "current_user"
    #
    # If anything is wrong, it returns an error before the route runs.
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        print(f"[DEBUG] /me Authorization header: {token}")

        if not token:
            print("[ERROR] Token is missing")
            return jsonify({'error': 'Token is missing'}), 401

        try:
            # Remove the word "Bearer " from the front to get just the token
            token = token.replace('Bearer ', '')

            # Decode the token — this checks if it was signed by us and not expired
            data = jwt.decode(token, get_secret_key(), algorithms=['HS256'])

            # Use the user ID inside the token to find the user in the database
            current_user = User.query.get(data['user_id'])
            if not current_user:
                print("[ERROR] User not found for token")
                return jsonify({'error': 'User not found'}), 401

        except jwt.ExpiredSignatureError:
            # Token is too old (tokens last 7 days) — user needs to log in again
            print("[ERROR] Token has expired")
            return jsonify({'error': 'Token has expired'}), 401
        except jwt.InvalidTokenError as e:
            # Token was changed or is broken
            print(f"[ERROR] Invalid token: {e}")
            return jsonify({'error': 'Invalid token'}), 401

        # Everything is fine — run the actual route with the user attached
        return f(current_user, *args, **kwargs)

    return decorated


# ============================================================
# REGISTER — Create a new account
# ============================================================
@auth_bp.route('/register', methods=['POST', 'OPTIONS'])
def register():
    # OPTIONS is a browser check before sending a real request (CORS).
    # We just say "OK" and let the real request come through.
    if request.method == 'OPTIONS':
        return '', 200

    data = request.get_json()

    # Make sure the request has all required fields
    required = ['email', 'password', 'name']
    for field in required:
        if field not in data:
            return jsonify({'error': f'{field} is required'}), 400

    # Check if someone already registered with this email
    if User.query.filter_by(email=data['email']).first():
        return jsonify({'error': 'Email already registered'}), 400

    # Hash the password before saving it.
    # We never store the real password — only a scrambled version.
    # bcrypt makes it impossible to reverse back to the original password.
    password_hash = bcrypt.hashpw(data['password'].encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

    # Create the user — always as 'student'. Nobody can register as admin.
    # Only an existing admin can promote someone later.
    user = User(
        email=data['email'],
        password_hash=password_hash,
        name=data['name'],
        role='student',
        department=data.get('department')
    )

    db.session.add(user)
    db.session.commit()

    # Create a token so the user is automatically logged in right after registering.
    # The token contains the user's ID and expires in 7 days.
    token = jwt.encode({
        'user_id': user.id,
        'exp': datetime.utcnow() + timedelta(days=7)
    }, get_secret_key(), algorithm='HS256')

    return jsonify({
        'message': 'User registered successfully',
        'token': token,
        'user': user.to_dict()
    }), 201


# ============================================================
# LOGIN — Check credentials and return a token
# ============================================================
@auth_bp.route('/login', methods=['POST', 'OPTIONS'])
def login():
    if request.method == 'OPTIONS':
        return '', 200

    data = request.get_json()

    if not data.get('email') or not data.get('password'):
        return jsonify({'error': 'Email and password are required'}), 400

    # Look up the user by their email
    user = User.query.filter_by(email=data['email']).first()

    # Check if the user exists AND if the password matches.
    # bcrypt.checkpw compares the plain password to the saved hash.
    # We return the same error message whether the email or password is wrong —
    # this way hackers can't tell which one was incorrect.
    if not user or not bcrypt.checkpw(data['password'].encode('utf-8'), user.password_hash.encode('utf-8')):
        return jsonify({'error': 'Invalid email or password'}), 401

    # Password is correct — create a token for this user
    token = jwt.encode({
        'user_id': user.id,
        'exp': datetime.utcnow() + timedelta(days=7)
    }, get_secret_key(), algorithm='HS256')

    return jsonify({
        'message': 'Login successful',
        'token': token,
        'user': user.to_dict()
    })


# ============================================================
# /ME — Return the currently logged-in user's info
# ============================================================
@auth_bp.route('/me', methods=['GET'])
@token_required   # Only works if the request has a valid token
def get_current_user(current_user):
    # The frontend calls this every time the page loads to check
    # if the user's token is still valid and get their latest info.
    print(f"[DEBUG] /me returning user: {current_user.email if current_user else None}")
    return jsonify({'user': current_user.to_dict()})


# ============================================================
# LOGOUT — End the session
# ============================================================
@auth_bp.route('/logout', methods=['POST'])
@token_required
def logout(current_user):
    # Tokens can't be "deleted" from the server because we don't store them.
    # Logout works by having the frontend delete the token from its storage.
    # This route just confirms the logout happened.
    return jsonify({'message': 'Logged out successfully'})


# ============================================================
# GOOGLE LOGIN — Optional sign-in with Google
# ============================================================
@auth_bp.route('/auth/google')
def google_auth():
    # Send the user to Google's login page.
    # After they approve, Google sends them back to our app with a code.
    google_auth_url = (
        'https://accounts.google.com/o/oauth2/v2/auth?'
        f'client_id={GOOGLE_CLIENT_ID}&'
        f'redirect_uri={GOOGLE_REDIRECT_URI}&'
        'response_type=code&'
        'scope=email profile https://www.googleapis.com/auth/gmail.send https://www.googleapis.com/auth/calendar.events&'
        'access_type=offline&'
        'prompt=consent'
    )
    return redirect(google_auth_url)


@auth_bp.route('/auth/google/callback', methods=['POST'])
def google_callback():
    # Google sent us a code. We swap that code for the user's info.
    code = request.json.get('code')
    token_url = 'https://oauth2.googleapis.com/token'
    data = {
        'code': code,
        'client_id': GOOGLE_CLIENT_ID,
        'client_secret': GOOGLE_CLIENT_SECRET,
        'redirect_uri': GOOGLE_REDIRECT_URI,
        'grant_type': 'authorization_code',
    }
    # Ask Google to give us an access token in exchange for the code
    token_res = requests.post(token_url, data=data)
    token_json = token_res.json()
    access_token = token_json.get('access_token')
    id_token = token_json.get('id_token')

    # Use the access token to get the user's name and email from Google
    userinfo_res = requests.get(
        'https://www.googleapis.com/oauth2/v2/userinfo',
        headers={'Authorization': f'Bearer {access_token}'}
    )
    userinfo = userinfo_res.json()

    user = {
        'id': userinfo.get('id'),
        'name': userinfo.get('name'),
        'email': userinfo.get('email'),
        'role': 'student',
    }
    return jsonify({'user': user, 'access_token': access_token})
