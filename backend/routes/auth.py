# Authentication Routes

from flask import Blueprint, request, jsonify, redirect, session
from models.models import User, db
import bcrypt
import jwt
import os
import requests
from datetime import datetime, timedelta
from functools import wraps

auth_bp = Blueprint('auth', __name__)

GOOGLE_CLIENT_ID = os.getenv('GOOGLE_CLIENT_ID')
GOOGLE_CLIENT_SECRET = os.getenv('GOOGLE_CLIENT_SECRET')
GOOGLE_REDIRECT_URI = os.getenv('GOOGLE_REDIRECT_URI', 'http://localhost:5173/auth/google/callback')

def get_secret_key():
    return os.getenv('SECRET_KEY', 'dev-secret-key')

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        print(f"[DEBUG] /me Authorization header: {token}")
        if not token:
            print("[ERROR] Token is missing")
            return jsonify({'error': 'Token is missing'}), 401
        try:
            token = token.replace('Bearer ', '')
            data = jwt.decode(token, get_secret_key(), algorithms=['HS256'])
            current_user = User.query.get(data['user_id'])
            if not current_user:
                print("[ERROR] User not found for token")
                return jsonify({'error': 'User not found'}), 401
        except jwt.ExpiredSignatureError:
            print("[ERROR] Token has expired")
            return jsonify({'error': 'Token has expired'}), 401
        except jwt.InvalidTokenError as e:
            print(f"[ERROR] Invalid token: {e}")
            return jsonify({'error': 'Invalid token'}), 401
        return f(current_user, *args, **kwargs)
    return decorated


@auth_bp.route('/register', methods=['POST', 'OPTIONS'])
def register():
    # Handle preflight request
    if request.method == 'OPTIONS':
        return '', 200
        
    data = request.get_json()
    
    # Validate required fields
    required = ['email', 'password', 'name']
    for field in required:
        if field not in data:
            return jsonify({'error': f'{field} is required'}), 400
    
    # Check if user exists
    if User.query.filter_by(email=data['email']).first():
        return jsonify({'error': 'Email already registered'}), 400
    
    # Hash password
    password_hash = bcrypt.hashpw(data['password'].encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    
    # Create user
    user = User(
        email=data['email'],
        password_hash=password_hash,
        name=data['name'],
        role='student',
        department=data.get('department')
    )
    
    db.session.add(user)
    db.session.commit()
    
    # Generate token
    token = jwt.encode({
        'user_id': user.id,
        'exp': datetime.utcnow() + timedelta(days=7)
    }, get_secret_key(), algorithm='HS256')
    
    return jsonify({
        'message': 'User registered successfully',
        'token': token,
        'user': user.to_dict()
    }), 201


@auth_bp.route('/login', methods=['POST', 'OPTIONS'])
def login():
    # Handle preflight request
    if request.method == 'OPTIONS':
        return '', 200
        
    data = request.get_json()
    
    if not data.get('email') or not data.get('password'):
        return jsonify({'error': 'Email and password are required'}), 400
    
    user = User.query.filter_by(email=data['email']).first()
    
    if not user or not bcrypt.checkpw(data['password'].encode('utf-8'), user.password_hash.encode('utf-8')):
        return jsonify({'error': 'Invalid email or password'}), 401
    
    # Generate token
    token = jwt.encode({
        'user_id': user.id,
        'exp': datetime.utcnow() + timedelta(days=7)
    }, get_secret_key(), algorithm='HS256')
    
    return jsonify({
        'message': 'Login successful',
        'token': token,
        'user': user.to_dict()
    })


@auth_bp.route('/me', methods=['GET'])
@token_required
def get_current_user(current_user):
    print(f"[DEBUG] /me returning user: {current_user.email if current_user else None}")
    return jsonify({'user': current_user.to_dict()})


@auth_bp.route('/logout', methods=['POST'])
@token_required
def logout(current_user):
    # In a real app, you might invalidate the token here
    return jsonify({'message': 'Logged out successfully'})


@auth_bp.route('/auth/google')
def google_auth():
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
    code = request.json.get('code')
    token_url = 'https://oauth2.googleapis.com/token'
    data = {
        'code': code,
        'client_id': GOOGLE_CLIENT_ID,
        'client_secret': GOOGLE_CLIENT_SECRET,
        'redirect_uri': GOOGLE_REDIRECT_URI,
        'grant_type': 'authorization_code',
    }
    token_res = requests.post(token_url, data=data)
    token_json = token_res.json()
    access_token = token_json.get('access_token')
    id_token = token_json.get('id_token')

    # Get user info
    userinfo_res = requests.get(
        'https://www.googleapis.com/oauth2/v2/userinfo',
        headers={'Authorization': f'Bearer {access_token}'}
    )
    userinfo = userinfo_res.json()
    user = {
        'id': userinfo.get('id'),
        'name': userinfo.get('name'),
        'email': userinfo.get('email'),
        'role': 'student',  # Default role, update as needed
    }
    return jsonify({'user': user, 'access_token': access_token})
