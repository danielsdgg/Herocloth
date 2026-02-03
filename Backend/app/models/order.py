# app/models/order.py
from app import db
from datetime import datetime

class Order(db.Model):
    __tablename__ = 'orders'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    status = db.Column(db.String(50), nullable=False, default='pending')  # pending, paid, cod, shipped, delivered, cancelled
    payment_method = db.Column(db.String(50), nullable=True)  # mpesa, card
    payment_timing = db.Column(db.String(50), nullable=False)  # prepay, postpay
    delivery_option = db.Column(db.String(50), nullable=False)  # nairobi, outside
    delivery_fee = db.Column(db.Float, nullable=False, default=0.0)
    total_amount = db.Column(db.Float, nullable=False)
    mpesa_phone = db.Column(db.String(20), nullable=True)
    card_details = db.Column(db.JSON, nullable=True)  # For later: {last4, expiry}
    street = db.Column(db.String(255), nullable=True)
    city = db.Column(db.String(100), nullable=True)
    county = db.Column(db.String(100), nullable=True)
    postal_code = db.Column(db.String(20), nullable=True)
    instructions = db.Column(db.Text, nullable=True)
    contact_phone = db.Column(db.String(20), nullable=True)
    notes = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = db.relationship('User', backref=db.backref('orders', lazy='dynamic'))
    items = db.relationship('OrderItem', backref='order', lazy='dynamic', cascade="all, delete-orphan")

    def __repr__(self):
        return f'<Order {self.id} - Status: {self.status}>'

class OrderItem(db.Model):
    __tablename__ = 'order_items'

    id = db.Column(db.Integer, primary_key=True)
    order_id = db.Column(db.Integer, db.ForeignKey('orders.id'), nullable=False)
    product_id = db.Column(db.Integer, db.ForeignKey('product.id'), nullable=False)
    quantity = db.Column(db.Integer, nullable=False)
    price = db.Column(db.Float, nullable=False)  # Snapshot of price at order time

    product = db.relationship('Product', backref=db.backref('order_items', lazy='dynamic'))