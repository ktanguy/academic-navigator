# Academic Navigator Backend

from flask import Flask, send_from_directory
from flask_cors import CORS
from dotenv import load_dotenv
import os
from sqlalchemy import text

load_dotenv()


def run_migrations(app):
    """Run database migrations to ensure schema is up to date"""
    from models.models import db
    
    try:
        # Check if needs_review column exists in tickets table
        result = db.session.execute(text("PRAGMA table_info(tickets)"))
        columns = [row[1] for row in result.fetchall()]
        
        if 'needs_review' not in columns:
            print("[MIGRATION] Adding needs_review column to tickets...")
            db.session.execute(text("ALTER TABLE tickets ADD COLUMN needs_review BOOLEAN DEFAULT 0"))
            db.session.commit()
        
        if 'reviewed_by' not in columns:
            print("[MIGRATION] Adding reviewed_by column to tickets...")
            db.session.execute(text("ALTER TABLE tickets ADD COLUMN reviewed_by INTEGER"))
            db.session.commit()
        
        if 'reviewed_at' not in columns:
            print("[MIGRATION] Adding reviewed_at column to tickets...")
            db.session.execute(text("ALTER TABLE tickets ADD COLUMN reviewed_at DATETIME"))
            db.session.commit()
        
        # Update existing low-confidence tickets to needs_review=True
        db.session.execute(text(
            "UPDATE tickets SET needs_review = 1 WHERE ai_confidence < 0.70 AND ai_confidence IS NOT NULL AND (needs_review IS NULL OR needs_review = 0)"
        ))
        db.session.commit()
        
        print("[MIGRATION] Database schema is up to date")
    except Exception as e:
        print(f"[MIGRATION] Warning: Could not run migrations: {e}")
        db.session.rollback()


def create_app():
    # Static folder for frontend (dist folder from Vite build)
    static_folder = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'dist')
    index_exists = os.path.exists(os.path.join(static_folder, 'index.html'))
    
    print(f"[DEBUG] Static folder: {static_folder}")
    print(f"[DEBUG] Index file exists: {index_exists}")
    
    # Create Flask app with static folder if frontend is built
    if index_exists:
        app = Flask(__name__, static_folder=static_folder, static_url_path='/static')
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
    
    # Create tables and run migrations
    with app.app_context():
        db.create_all()
        
        # Run database migrations for existing databases
        run_migrations(app)
        
        # Auto-seed default users if database is empty
        from models.models import User, OfficeHours
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
            
            # Add default office hours for facilitator (Monday-Friday, 9AM-5PM)
            for day in range(5):  # Monday=0 to Friday=4
                office_hour = OfficeHours(
                    facilitator_id=facilitator.id,
                    day_of_week=day,
                    start_time='09:00',
                    end_time='17:00',
                    is_available=True,
                    slot_duration=30,
                    location='Office 101, Academic Building'
                )
                db.session.add(office_hour)
            
            db.session.commit()
            
            print("[INFO] Default users created:")
            print("  - admin@alu.edu / password123 (Admin)")
            print("  - facilitator@alu.edu / password123 (Facilitator)")
            print("  - student@alu.edu / password123 (Student)")
            print("[INFO] Default office hours created for facilitator (Mon-Fri 9AM-5PM)")
        
        # Ensure all facilitators have office hours (for existing databases)
        facilitators_without_hours = User.query.filter_by(role='facilitator').all()
        for fac in facilitators_without_hours:
            existing_hours = OfficeHours.query.filter_by(facilitator_id=fac.id).count()
            if existing_hours == 0:
                print(f"[INFO] Adding default office hours for facilitator: {fac.name}")
                for day in range(5):  # Monday=0 to Friday=4
                    office_hour = OfficeHours(
                        facilitator_id=fac.id,
                        day_of_week=day,
                        start_time='09:00',
                        end_time='17:00',
                        is_available=True,
                        slot_duration=30,
                        location='Office, Academic Building'
                    )
                    db.session.add(office_hour)
                db.session.commit()
    
    # Health check route
    @app.route('/api/health')
    def health():
        return {'status': 'healthy', 'message': 'Academic Navigator API is running'}
    
    # Static folder for frontend
    dist_folder = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'dist')
    
    # Serve frontend - always register these routes
    @app.route('/')
    def serve_index():
        index_file = os.path.join(dist_folder, 'index.html')
        if os.path.exists(index_file):
            return send_from_directory(dist_folder, 'index.html')
        return {'message': 'Academic Navigator API', 'status': 'running', 'docs': '/api/health'}, 200
    
    # Catch-all route for SPA - must handle all frontend routes
    @app.route('/<path:path>')
    def serve_spa(path):
        # Don't intercept API routes
        if path.startswith('api/'):
            return {'error': 'API endpoint not found'}, 404
        
        # Try to serve static file (JS, CSS, images, etc.)
        file_path = os.path.join(dist_folder, path)
        if os.path.exists(file_path) and os.path.isfile(file_path):
            return send_from_directory(dist_folder, path)
        
        # For all other routes, serve index.html (SPA routing)
        index_file = os.path.join(dist_folder, 'index.html')
        if os.path.exists(index_file):
            return send_from_directory(dist_folder, 'index.html')
        
        return {'error': 'Not found'}, 404
    
    # Also handle 404 errors
    @app.errorhandler(404)
    def handle_404(e):
        # For API routes, return JSON error
        from flask import request
        if request.path.startswith('/api/'):
            return {'error': 'API endpoint not found'}, 404
        
        # For frontend routes, serve index.html
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
