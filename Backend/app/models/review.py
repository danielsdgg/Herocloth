from app import db
from datetime import datetime

class Review(db.Model):
    __tablename__ = 'reviews'

    id = db.Column(db.Integer, primary_key=True)
    rating = db.Column(db.Integer, nullable=False)  # 1 to 5
    comment = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)

    # Foreign keys with explicit names + CASCADE
    user_id = db.Column(
        db.Integer,
        db.ForeignKey('users.id', name='fk_reviews_user_id', ondelete='CASCADE'),
        nullable=False
    )
    product_id = db.Column(
        db.Integer,
        db.ForeignKey('product.id', name='fk_reviews_product_id', ondelete='CASCADE'),
        nullable=False
    )

    # Relationships (backrefs defined here - safe and no conflict)
    user = db.relationship('User', backref=db.backref('reviews', lazy='dynamic', cascade='all, delete-orphan'))
    product = db.relationship('Product', backref=db.backref('reviews', lazy='dynamic', cascade='all, delete-orphan'))

    def __repr__(self):
        return f'<Review {self.rating}★ by User {self.user_id} for Product {self.product_id}>'