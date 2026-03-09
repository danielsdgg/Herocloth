from app import db
class Wishlist(db.Model):
    __tablename__ = 'wishlist'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    product_id = db.Column(db.Integer, db.ForeignKey('product.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=db.func.current_timestamp(), nullable=False)

    # Relationships — NO backref on user (already defined in User)
    # user = db.relationship('User')
    # product = db.relationship('Product', backref='wished_by', lazy='dynamic')

    __table_args__ = (
        db.UniqueConstraint('user_id', 'product_id', name='unique_user_product_wishlist'),
    )

    def __repr__(self):
        return f'<Wishlist user:{self.user_id} product:{self.product_id}>'