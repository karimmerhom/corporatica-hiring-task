from app import db
from datetime import datetime

class TabularData(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    filename = db.Column(db.String(255), nullable=False)
    uploaded_at = db.Column(db.DateTime, default=datetime.utcnow)
    data = db.Column(db.JSON, nullable=False)  # Storing as JSON for simplicity

    def __repr__(self):
        return f"<TabularData {self.filename}>"
