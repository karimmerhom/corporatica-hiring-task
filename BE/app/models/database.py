from app import db

def init_db():
    """Create database tables."""
    db.create_all()

def drop_db():
    """Drop all tables (use carefully!)."""
    db.drop_all()
