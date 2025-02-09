from .database import db
from datetime import datetime

class TextDocument(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    content = db.Column(db.Text, nullable=False)
    title = db.Column(db.String(200))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    category = db.Column(db.String(100))
    sentiment_score = db.Column(db.Float)
    keywords = db.Column(db.JSON)
    summary = db.Column(db.Text)
