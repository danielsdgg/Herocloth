from app import db
from datetime import datetime

class Review(db.Model):
    __tablename__ = 'reviews'

    id = db.Column(db.Integer, primary_key=True)
    rating = db.Column(db.Integer, nullable=False)  # 1 to 5
    comment = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)

    # Foreign keys
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    product_id = db.Column(db.Integer, db.ForeignKey('product.id'), nullable=False)

    # Relationships
    user = db.relationship('User', backref=db.backref('reviews', lazy='dynamic'))
    product = db.relationship('Product', backref=db.backref('reviews', lazy='dynamic'))

    def __repr__(self):
        return f'<Review {self.rating}★ by User {self.user_id} for Product {self.product_id}>'