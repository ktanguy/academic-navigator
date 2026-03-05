import sys
sys.path.insert(0, '.')

from app import create_app
from models.models import db, User
import bcrypt

ADMIN_EMAIL = 't.kwizera@alustudent.com'
ADMIN_NAME = 'System Administrator'
ADMIN_PASSWORD = 'password123'
ADMIN_ROLE = 'admin'
ADMIN_DEPARTMENT = 'Administration'

def add_admin():
    app = create_app()
    with app.app_context():
        admin = User.query.filter_by(email=ADMIN_EMAIL).first()
        if admin:
            print(f"Admin user {ADMIN_EMAIL} already exists.")
            return
        password_hash = bcrypt.hashpw(ADMIN_PASSWORD.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        admin = User(
            email=ADMIN_EMAIL,
            password_hash=password_hash,
            name=ADMIN_NAME,
            role=ADMIN_ROLE,
            department=ADMIN_DEPARTMENT
        )
        db.session.add(admin)
        db.session.commit()
        print(f"Admin user {ADMIN_EMAIL} added successfully.")

if __name__ == '__main__':
    add_admin()
