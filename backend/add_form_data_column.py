import sqlite3

DB_PATH = "instance/academic_navigator.db"

conn = sqlite3.connect(DB_PATH)
cursor = conn.cursor()

# Check if 'form_data' column exists
cursor.execute("PRAGMA table_info(appointments);")
columns = [col[1] for col in cursor.fetchall()]

if "form_data" not in columns:
    print("Adding 'form_data' column to appointments table...")
    cursor.execute("ALTER TABLE appointments ADD COLUMN form_data TEXT;")
    conn.commit()
    print("Column added.")
else:
    print("'form_data' column already exists.")

conn.close()
