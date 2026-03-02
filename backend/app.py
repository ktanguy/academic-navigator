# Academic Navigator Backend

from flask import Flask, send_from_directory
from flask_cors import CORS
from dotenv import load_dotenv
import os

load_dotenv()

def create_app():
    # Check if we're serving static files (production mode)
    static_folder = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'dist')
    serve_static = os.path.exists(static_folder) and os.getenv('FLASK_ENV') == 'production'
    
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
    
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(tickets_bp, url_prefix='/api/tickets')
    app.register_blueprint(users_bp, url_prefix='/api/users')
    app.register_blueprint(appointments_bp, url_prefix='/api/appointments')
    app.register_blueprint(notifications_bp, url_prefix='/api/notifications')
    
    # Create tables
    with app.app_context():
        db.create_all()
    
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
            # Try to serve the file, fall back to index.html for SPA routing
            if os.path.exists(os.path.join(app.static_folder, path)):
                return send_from_directory(app.static_folder, path)
            return send_from_directory(app.static_folder, 'index.html')
    
    return app

# Create app instance for gunicorn
app = create_app()

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5001))
    app.run(debug=True, host='0.0.0.0', port=port)
