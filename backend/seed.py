# Seed script to populate initial data

import sys
sys.path.insert(0, '.')

from app import create_app
from models.models import db, User, Ticket, TicketResponse, Appointment
import bcrypt
from datetime import datetime, timedelta

def seed_database():
    app = create_app()
    
    with app.app_context():
        # Ensure all tables are created from models
        db.create_all()
        
        # Clear existing data
        print("Clearing existing data...")
        TicketResponse.query.delete()
        Ticket.query.delete()
        Appointment.query.delete()
        User.query.delete()
        
        # Create users
        print("Creating users...")
        
        # Hash password
        password_hash = bcrypt.hashpw('password123'.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        
        # Admin
        admin = User(
            email='t.kwizera@alustudent.com',
            password_hash=password_hash,
            name='System Administrator',
            role='admin',
            department='Administration'
        )
        
        # Main Admin for ALU (only add if not present)
        main_admin = User.query.filter_by(email='t.kwizera@alustudent.com').first()
        if not main_admin:
            db.session.add(admin)
        else:
            admin = main_admin
        
        # Facilitators
        facilitators = [
            User(email='jolly.umulisa@university.edu', password_hash=password_hash, name='Jolly Umulisa', role='facilitator', department='Academic Affairs'),
            User(email='sarah.chen@university.edu', password_hash=password_hash, name='Dr. Sarah Chen', role='facilitator', department='Academic Affairs'),
            User(email='michael.torres@university.edu', password_hash=password_hash, name='Prof. Michael Torres', role='facilitator', department='Academic Affairs'),
            User(email='emily.rodriguez@university.edu', password_hash=password_hash, name='Dr. Emily Rodriguez', role='facilitator', department='Capstone Committee'),
            User(email='james.wilson@university.edu', password_hash=password_hash, name='James Wilson', role='facilitator', department='IT Support'),
            User(email='lisa.park@university.edu', password_hash=password_hash, name='Lisa Park', role='facilitator', department="Registrar's Office"),
        ]
        
        # Students
        students = [
            User(email='john.doe@university.edu', password_hash=password_hash, name='John Doe', role='student', department='Computer Science'),
            User(email='jane.smith@university.edu', password_hash=password_hash, name='Jane Smith', role='student', department='Business Administration'),
            User(email='alex.johnson@university.edu', password_hash=password_hash, name='Alex Johnson', role='student', department='Software Engineering'),
        ]
        
        for f in facilitators:
            db.session.add(f)
        for s in students:
            db.session.add(s)
        
        db.session.commit()
        
        # Create sample tickets
        print("Creating sample tickets...")
        
        tickets_data = [
            {
                'ticket_number': 'TKT-001',
                'subject': "Can't Submit Assignment on Canvas",
                'description': "I can't submit my assignment on Canvas. The deadline is tomorrow and the upload keeps failing.",
                'category': 'assignment',
                'priority': 'high',
                'status': 'open',
                'ai_category': 'assignment',
                'ai_confidence': 0.92,
                'user_id': students[0].id,
                'assigned_to': facilitators[0].id,
                'department': 'Academic Affairs'
            },
            {
                'ticket_number': 'TKT-002',
                'subject': 'Midterm Grade Appeal',
                'description': 'I believe my midterm exam was graded incorrectly. Question 5 was marked wrong but my answer matches the solution key.',
                'category': 'grades',
                'priority': 'medium',
                'status': 'in-progress',
                'ai_category': 'grades',
                'ai_confidence': 0.85,
                'user_id': students[1].id,
                'assigned_to': facilitators[1].id,
                'department': 'Academic Affairs'
            },
            {
                'ticket_number': 'TKT-003',
                'subject': 'Capstone Proposal Feedback',
                'description': 'Need feedback on my capstone project proposal before the submission deadline.',
                'category': 'capstone',
                'priority': 'medium',
                'status': 'answered',
                'ai_category': 'capstone',
                'ai_confidence': 0.94,
                'user_id': students[2].id,
                'assigned_to': facilitators[2].id,
                'department': 'Capstone Committee'
            },
        ]
        
        for t_data in tickets_data:
            ticket = Ticket(**t_data)
            db.session.add(ticket)
        
        db.session.commit()
        
        # Add responses to tickets
        print("Adding ticket responses...")
        
        responses_data = [
            {'ticket_id': 1, 'message': 'Ticket created and categorized. Assigned to support team.', 'is_system': True},
            {'ticket_id': 1, 'user_id': facilitators[0].id, 'message': 'Try compressing your file or splitting it into smaller parts. Canvas has a 500MB limit per upload.', 'is_system': False},
            {'ticket_id': 2, 'message': 'Ticket created and categorized. Assigned to support team.', 'is_system': True},
            {'ticket_id': 2, 'user_id': facilitators[1].id, 'message': "I'm reviewing your submission. Will respond within 48 hours.", 'is_system': False},
            {'ticket_id': 3, 'message': 'Ticket created and categorized. Assigned to support team.', 'is_system': True},
            {'ticket_id': 3, 'user_id': facilitators[2].id, 'message': 'Great topic! Schedule a meeting to discuss your methodology section.', 'is_system': False},
        ]
        
        for r_data in responses_data:
            response = TicketResponse(**r_data)
            db.session.add(response)
        
        db.session.commit()
        
        # Create sample appointments
        print("Creating sample appointments...")
        
        today = datetime.now().date()
        
        appointments_data = [
            {
                'student_id': students[0].id,
                'facilitator_id': facilitators[0].id,
                'date': today + timedelta(days=2),
                'time_slot': '10:00',
                'duration': 30,
                'meeting_type': 'academic',
                'meeting_mode': 'in-person',
                'reason': 'Discuss assignment submission issues',
                'status': 'confirmed'
            },
            {
                'student_id': students[2].id,
                'facilitator_id': facilitators[2].id,
                'date': today + timedelta(days=3),
                'time_slot': '14:00',
                'duration': 45,
                'meeting_type': 'capstone',
                'meeting_mode': 'video',
                'reason': 'Capstone proposal review',
                'status': 'pending'
            },
        ]
        
        for a_data in appointments_data:
            appointment = Appointment(**a_data)
            db.session.add(appointment)
        
        db.session.commit()
        
        print("\n✅ Database seeded successfully!")
        print("\n📧 Test Accounts:")
        print("   Admin: admin@university.edu / password123")
        print("   Facilitator: sarah.chen@university.edu / password123")
        print("   Student: john.doe@university.edu / password123")


if __name__ == '__main__':
    seed_database()
