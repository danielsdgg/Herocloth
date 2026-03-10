from app import db
from datetime import datetime

class Contact(db.Model):
    __tablename__ = 'contacts'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), nullable=True)  # ← Added: sender's email
    subject = db.Column(db.String(200), nullable=False)
    message = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    user_id = db.Column(
        db.Integer,
        db.ForeignKey('users.id', name='fk_contact_user_id', ondelete='SET NULL'),
        nullable=True  # Optional - null if not logged in
    )

    # Relationship
    user = db.relationship('User', backref=db.backref('contacts', lazy='dynamic', cascade='all, delete-orphan'))

    def __repr__(self):
        return f'<Contact {self.subject} from {self.name}>'