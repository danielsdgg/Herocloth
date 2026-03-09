from app import db
from datetime import datetime

class Cart(db.Model):
    __tablename__ = 'cart'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False) 
    product_id = db.Column(
        db.Integer,
        db.ForeignKey('product.id', name='fk_cart_product_id', ondelete='CASCADE'),  # ← add name=
        nullable=False
    )
    quantity = db.Column(db.Integer, nullable=False, default=1)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = db.relationship('User', backref=db.backref('cart_items', lazy=True))
    product = db.relationship('Product', backref=db.backref('cart_items', lazy=True))

    def __repr__(self):
        return f'<Cart user_id={self.user_id}, product_id={self.product_id}, quantity={self.quantity}>'