# =============================================================================
# app.py — This is the STARTING POINT of the entire backend
# =============================================================================
# When you run the backend, Python starts here.
# This file does 5 things:
#   1. Creates the Flask app (the thing that listens for requests)
#   2. Connects to the database
#   3. Registers all the route files (auth, tickets, users, etc.)
#   4. Creates database tables and adds any missing columns
#   5. Creates default accounts if this is a brand new database
# =============================================================================

from flask import Flask, send_from_directory
from flask_cors import CORS       # Lets the frontend (running on a different port) talk to the backend
from dotenv import load_dotenv    # Reads settings from the .env file (passwords, keys, etc.)
import os
from sqlalchemy import text       # Lets us write raw SQL when needed

# Load the .env file so environment variables like SECRET_KEY are available
load_dotenv()


def run_migrations(app):
    # This function adds new columns to the database when we add new features.
    #
    # The problem: when we add a new column to a model in models.py,
    # the database doesn't automatically update itself — the column just doesn't exist.
    # This function checks if each column exists, and adds it if it's missing.
    #
    # It runs every time the app starts. It's safe because it checks before adding.
    from models.models import db

    try:
        # Ask the database: what columns does the tickets table currently have?
        result = db.session.execute(text("PRAGMA table_info(tickets)"))
        columns = [row[1] for row in result.fetchall()]

        # If the 'needs_review' column doesn't exist yet, add it.
        # This column flags tickets where the AI wasn't confident enough (below 70%).
        if 'needs_review' not in columns:
            print("[MIGRATION] Adding needs_review column to tickets...")
            db.session.execute(text("ALTER TABLE tickets ADD COLUMN needs_review BOOLEAN DEFAULT 0"))
            db.session.commit()

        # If 'reviewed_by' doesn't exist, add it.
        # This stores the ID of the admin who manually reviewed a flagged ticket.
        if 'reviewed_by' not in columns:
            print("[MIGRATION] Adding reviewed_by column to tickets...")
            db.session.execute(text("ALTER TABLE tickets ADD COLUMN reviewed_by INTEGER"))
            db.session.commit()

        # If 'reviewed_at' doesn't exist, add it.
        # This stores the date and time when the review happened.
        if 'reviewed_at' not in columns:
            print("[MIGRATION] Adding reviewed_at column to tickets...")
            db.session.execute(text("ALTER TABLE tickets ADD COLUMN reviewed_at DATETIME"))
            db.session.commit()

        # Go back and flag any old tickets that should have been flagged for review.
        # These are tickets that existed before we added the needs_review feature.
        db.session.execute(text(
            "UPDATE tickets SET needs_review = 1 WHERE ai_confidence < 0.70 AND ai_confidence IS NOT NULL AND (needs_review IS NULL OR needs_review = 0)"
        ))
        db.session.commit()

        print("[MIGRATION] Database schema is up to date")
    except Exception as e:
        print(f"[MIGRATION] Warning: Could not run migrations: {e}")
        db.session.rollback()


def create_app():
    # This function creates and sets up the whole Flask app.
    #
    # Why a function instead of just writing it at the top?
    # Because wrapping it in a function makes it easier to restart cleanly
    # and easier to test. The production server (gunicorn) calls this function
    # to get the app object.

    # -------------------------------------------------------------------------
    # STEP 1: Find the React frontend files
    # -------------------------------------------------------------------------
    # When we run "npm run build", React compiles into a dist/ folder.
    # We tell Flask where that folder is so it can serve the frontend pages.
    static_folder = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'dist')
    index_exists = os.path.exists(os.path.join(static_folder, 'index.html'))

    print(f"[DEBUG] Static folder: {static_folder}")
    print(f"[DEBUG] Index file exists: {index_exists}")

    # Create the Flask app. If React is built, point it to the dist folder.
    if index_exists:
        app = Flask(__name__, static_folder=static_folder, static_url_path='/static')
    else:
        app = Flask(__name__)

    # -------------------------------------------------------------------------
    # STEP 2: Configure the app settings
    # -------------------------------------------------------------------------
    # SECRET_KEY is used to sign login tokens. Keep it secret in production.
    app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev-secret-key-change-in-production')

    # DATABASE: Use environment variable if set (production server like Render),
    # otherwise use a local SQLite file stored on your computer.
    database_url = os.getenv('DATABASE_URL')
    if database_url:
        # Render gives us a "postgres://" URL but SQLAlchemy needs "postgresql://"
        if database_url.startswith('postgres://'):
            database_url = database_url.replace('postgres://', 'postgresql://', 1)
        app.config['SQLALCHEMY_DATABASE_URI'] = database_url
    else:
        # Local development: store the database as a file inside backend/instance/
        db_path = os.path.join(os.path.dirname(__file__), 'instance', 'academic_navigator.db')
        os.makedirs(os.path.dirname(db_path), exist_ok=True)
        app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{db_path}'

    # Turn off a feature we don't use (saves memory)
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    # These settings help the database handle connection drops gracefully
    app.config['SQLALCHEMY_ENGINE_OPTIONS'] = {
        'pool_pre_ping': True,   # Test the connection before using it
        'pool_recycle': 300,     # Refresh connections every 5 minutes
    }

    # -------------------------------------------------------------------------
    # STEP 3: Allow the frontend to call the backend (CORS)
    # -------------------------------------------------------------------------
    # In development: frontend is at localhost:8080, backend at localhost:5001.
    # By default, browsers block requests between different ports (for security).
    # CORS tells the browser: "it's OK, the frontend is allowed to talk to the API."
    CORS(app,
         resources={r"/api/*": {"origins": "*"}},   # Allow any origin to call /api/...
         supports_credentials=True,                  # Allow login tokens in headers
         allow_headers=["Content-Type", "Authorization", "X-Requested-With"],
         methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
         expose_headers=["Content-Type", "Authorization"])

    # -------------------------------------------------------------------------
    # STEP 4: Connect the database and register route files
    # -------------------------------------------------------------------------
    # Each route file handles one area of the app.
    # By registering them here with a URL prefix, we keep the code organized.
    from models.models import db
    db.init_app(app)

    from routes.auth import auth_bp
    from routes.tickets import tickets_bp
    from routes.users import users_bp
    from routes.appointments import appointments_bp
    from routes.notifications import notifications_bp
    from routes.office_hours import office_hours_bp

    # Every route inside auth_bp will start with /api/auth
    # Every route inside tickets_bp will start with /api/tickets
    # ...and so on
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(tickets_bp, url_prefix='/api/tickets')
    app.register_blueprint(users_bp, url_prefix='/api/users')
    app.register_blueprint(appointments_bp, url_prefix='/api/appointments')
    app.register_blueprint(notifications_bp, url_prefix='/api/notifications')
    app.register_blueprint(office_hours_bp, url_prefix='/api/office-hours')

    # -------------------------------------------------------------------------
    # STEP 5: Create tables, add missing columns, and seed default users
    # -------------------------------------------------------------------------
    with app.app_context():
        # Create any tables that don't exist yet.
        # This is safe — it won't delete or change existing tables.
        db.create_all()

        # Add any new columns that were added to models.py since last run
        run_migrations(app)

        # If the database has no users at all (brand new install),
        # create a default admin, facilitator, and student account.
        from models.models import User, OfficeHours
        if User.query.count() == 0:
            print("[INFO] Database is empty, seeding default users...")
            import bcrypt

            # Create a scrambled version of "password123" to store safely
            password_hash = bcrypt.hashpw('password123'.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

            # Admin account — can see and do everything
            admin = User(
                email='admin@alu.edu',
                password_hash=password_hash,
                name='System Administrator',
                role='admin',
                department='Administration'
            )
            db.session.add(admin)

            # Facilitator account — handles assigned tickets, manages appointments
            facilitator = User(
                email='facilitator@alu.edu',
                password_hash=password_hash,
                name='Jolly Umulisa',
                role='facilitator',
                department='Academic Affairs'
            )
            db.session.add(facilitator)

            # Student account — submits tickets and books appointments
            student = User(
                email='student@alu.edu',
                password_hash=password_hash,
                name='Test Student',
                role='student',
                department='Computer Science'
            )
            db.session.add(student)

            db.session.commit()

            # Give the default facilitator availability Monday to Friday, 9AM-5PM.
            # range(5) means days 0 to 4, which is Monday to Friday.
            for day in range(5):
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

        # Ensure each department has a facilitator account.
        # This runs on every startup — safe because it checks before creating.
        # These are the demo accounts used for routing in the defense.
        import bcrypt as _bcrypt
        _pw = _bcrypt.hashpw('password123'.encode('utf-8'), _bcrypt.gensalt()).decode('utf-8')

        dept_facilitators = [
            {'email': 'academic@navigator.edu',  'name': 'Academic Affairs Facilitator',  'department': 'Academic Affairs'},
            {'email': 'it@navigator.edu',         'name': 'IT Support Facilitator',         'department': 'IT Support'},
            {'email': 'registrar@navigator.edu',  'name': 'Registrar Office Facilitator',   'department': "Registrar's Office"},
            {'email': 'capstone@navigator.edu',   'name': 'Capstone Committee Facilitator', 'department': 'Capstone Committee'},
        ]

        for fd in dept_facilitators:
            if not User.query.filter_by(email=fd['email']).first():
                fac = User(
                    email=fd['email'],
                    password_hash=_pw,
                    name=fd['name'],
                    role='facilitator',
                    department=fd['department']
                )
                db.session.add(fac)
                db.session.commit()
                for day in range(5):
                    db.session.add(OfficeHours(
                        facilitator_id=fac.id,
                        day_of_week=day,
                        start_time='09:00',
                        end_time='17:00',
                        is_available=True,
                        slot_duration=30,
                        location='Office, Academic Building'
                    ))
                db.session.commit()
                print(f"[INFO] Created facilitator: {fd['name']} ({fd['department']})")

        # Also check if any facilitator added later never got office hours.
        # If they don't have any, give them the default Mon-Fri schedule.
        facilitators_without_hours = User.query.filter_by(role='facilitator').all()
        for fac in facilitators_without_hours:
            existing_hours = OfficeHours.query.filter_by(facilitator_id=fac.id).count()
            if existing_hours == 0:
                print(f"[INFO] Adding default office hours for facilitator: {fac.name}")
                for day in range(5):
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

    # -------------------------------------------------------------------------
    # STEP 6: Serve the React frontend
    # -------------------------------------------------------------------------

    # Health check — Render uses this to verify the app is alive
    @app.route('/api/health')
    def health():
        return {'status': 'healthy', 'message': 'Academic Navigator API is running'}

    dist_folder = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'dist')

    # When someone visits the root URL ("/"), send them the React app
    @app.route('/')
    def serve_index():
        index_file = os.path.join(dist_folder, 'index.html')
        if os.path.exists(index_file):
            return send_from_directory(dist_folder, 'index.html')
        # If React hasn't been built yet, show a simple message
        return {'message': 'Academic Navigator API', 'status': 'running', 'docs': '/api/health'}, 200

    # This catches ANY URL that isn't an API call (like /helpdesk or /directory).
    # Why? Because React handles its own navigation. When someone refreshes the page
    # on /helpdesk, the browser asks the server for /helpdesk. But Flask doesn't know
    # that page — it would give a 404. This rule tells Flask: if you don't recognize it,
    # just send back the React app and let React figure out what to show.
    @app.route('/<path:path>')
    def serve_spa(path):
        # Don't intercept actual API calls
        if path.startswith('api/'):
            return {'error': 'API endpoint not found'}, 404

        # Serve actual files like JavaScript, CSS, or images
        file_path = os.path.join(dist_folder, path)
        if os.path.exists(file_path) and os.path.isfile(file_path):
            return send_from_directory(dist_folder, path)

        # For everything else, send the React app
        index_file = os.path.join(dist_folder, 'index.html')
        if os.path.exists(index_file):
            return send_from_directory(dist_folder, 'index.html')

        return {'error': 'Not found'}, 404

    # Custom error handler for 404s
    # API paths get a JSON error; frontend paths get the React app
    @app.errorhandler(404)
    def handle_404(e):
        from flask import request
        if request.path.startswith('/api/'):
            return {'error': 'API endpoint not found'}, 404
        index_file = os.path.join(dist_folder, 'index.html')
        if os.path.exists(index_file):
            return send_from_directory(dist_folder, 'index.html')
        return {'error': 'Not found'}, 404

    return app


# =============================================================================
# Start the app
# =============================================================================
# This creates the app object. Both ways to run the backend use this:
#   - "python app.py" starts the development server
#   - gunicorn (the production server on Render) imports `app` from here
app = create_app()

if __name__ == '__main__':
    # Only runs in development. In production, gunicorn handles this.
    # 0.0.0.0 means "accept connections from any device" (required inside Docker)
    port = int(os.environ.get('PORT', 5001))
    app.run(debug=True, host='0.0.0.0', port=port)
