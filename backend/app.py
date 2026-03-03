# Academic Navigator Backend

from flask import Flask, send_from_directory
from flask_cors import CORS
from dotenv import load_dotenv
import os

load_dotenv()

def create_app():
    # Check if we're serving static files (production mode)
    # When running from /app/backend, parent dir is /app, and dist is at /app/dist
    static_folder = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'dist')
    index_file = os.path.join(static_folder, 'index.html')
    
    # Serve static files if dist folder exists with index.html (production build present)
    serve_static = os.path.exists(index_file)
    
    print(f"[DEBUG] Static folder: {static_folder}")
    print(f"[DEBUG] Index file exists: {os.path.exists(index_file)}")
    print(f"[DEBUG] FLASK_ENV: {os.getenv('FLASK_ENV')}")
    print(f"[DEBUG] Serving static files: {serve_static}")
    
    if serve_static:
        app = Flask(__name__, static_folder=static_folder, static_url_path='')
    else:
        app = Flask(__name__)
    
    # Configuration
    app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev-secret-key-change-in-production')
    
    # Database configuration - use absolute path for SQLite
    database_url = os.getenv('DATABASE_URL')
    if database_url:
        # Handle postgres:// vs postgresql:// (Render uses postgres://)
        if database_url.startswith('postgres://'):
            database_url = database_url.replace('postgres://', 'postgresql://', 1)
        app.config['SQLALCHEMY_DATABASE_URI'] = database_url
    else:
        # Use SQLite with absolute path
        db_path = os.path.join(os.path.dirname(__file__), 'instance', 'academic_navigator.db')
        os.makedirs(os.path.dirname(db_path), exist_ok=True)
        app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{db_path}'
    
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    
    # SQLite configuration for production
    app.config['SQLALCHEMY_ENGINE_OPTIONS'] = {
        'pool_pre_ping': True,
        'pool_recycle': 300,
    }
    
    # Enable CORS for frontend - allow all origins in development
    CORS(app, 
         resources={r"/api/*": {"origins": "*"}},
         supports_credentials=True,
         allow_headers=["Content-Type", "Authorization", "X-Requested-With"],
         methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
         expose_headers=["Content-Type", "Authorization"])
    
    # Initialize extensions
    from models.models import db
    db.init_app(app)
    
    # Register blueprints
    from routes.auth import auth_bp
    from routes.tickets import tickets_bp
    from routes.users import users_bp
    from routes.appointments import appointments_bp
    from routes.notifications import notifications_bp
    from routes.office_hours import office_hours_bp
    
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(tickets_bp, url_prefix='/api/tickets')
    app.register_blueprint(users_bp, url_prefix='/api/users')
    app.register_blueprint(appointments_bp, url_prefix='/api/appointments')
    app.register_blueprint(notifications_bp, url_prefix='/api/notifications')
    app.register_blueprint(office_hours_bp, url_prefix='/api/office-hours')
    
    # Create tables and seed default users if needed
    with app.app_context():
        db.create_all()
        
        # Auto-seed default users if database is empty
        from models.models import User
        if User.query.count() == 0:
            print("[INFO] Database is empty, seeding default users...")
            import bcrypt
            password_hash = bcrypt.hashpw('password123'.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
            
            # Create default admin
            admin = User(
                email='admin@alu.edu',
                password_hash=password_hash,
                name='System Administrator',
                role='admin',
                department='Administration'
            )
            db.session.add(admin)
            
            # Create default facilitator
            facilitator = User(
                email='facilitator@alu.edu',
                password_hash=password_hash,
                name='Jolly Umulisa',
                role='facilitator',
                department='Academic Affairs'
            )
            db.session.add(facilitator)
            
            # Create default student
            student = User(
                email='student@alu.edu',
                password_hash=password_hash,
                name='Test Student',
                role='student',
                department='Computer Science'
            )
            db.session.add(student)
            
            db.session.commit()
            print("[INFO] Default users created:")
            print("  - admin@alu.edu / password123 (Admin)")
            print("  - facilitator@alu.edu / password123 (Facilitator)")
            print("  - student@alu.edu / password123 (Student)")
    
    # Health check route
    @app.route('/api/health')
    def health():
        return {'status': 'healthy', 'message': 'Academic Navigator API is running'}
    
    # Serve frontend in production
    if serve_static:
        @app.route('/')
        def serve_index():
            return send_from_directory(app.static_folder, 'index.html')
        
        @app.route('/<path:path>')
        def serve_static_files(path):
            # Don't intercept API routes
            if path.startswith('api/'):
                return {'error': 'Not found'}, 404
            
            # Try to serve the file, fall back to index.html for SPA routing
            file_path = os.path.join(app.static_folder, path)
            if os.path.exists(file_path) and os.path.isfile(file_path):
                return send_from_directory(app.static_folder, path)
            # Return index.html for SPA client-side routing
            return send_from_directory(app.static_folder, 'index.html')
    else:
        # Even if serve_static is False initially, register routes for production
        # This handles cases where the check above fails but dist exists
        dist_folder = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'dist')
        
        @app.route('/')
        def serve_index_fallback():
            index_file = os.path.join(dist_folder, 'index.html')
            if os.path.exists(index_file):
                return send_from_directory(dist_folder, 'index.html')
            return {'message': 'Academic Navigator API', 'docs': '/api/health'}, 200
        
        @app.route('/<path:path>')
        def serve_spa_fallback(path):
            # Don't intercept API routes
            if path.startswith('api/'):
                return {'error': 'Not found'}, 404
            
            # Try to serve the file from dist
            file_path = os.path.join(dist_folder, path)
            if os.path.exists(file_path) and os.path.isfile(file_path):
                return send_from_directory(dist_folder, path)
            
            # Return index.html for SPA client-side routing
            index_file = os.path.join(dist_folder, 'index.html')
            if os.path.exists(index_file):
                return send_from_directory(dist_folder, 'index.html')
            
            return {'error': 'Not found'}, 404
    
    return app

# Create app instance for gunicorn
app = create_app()

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5001))
    app.run(debug=True, host='0.0.0.0', port=port)
