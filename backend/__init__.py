from flask import Flask

app = Flask(__name__)

# Import and register blueprints - done in app.py
# This file is kept minimal to avoid circular imports

if __name__ == "__main__":
    from app import app as main_app
    main_app.run(debug=True)