from app import db
from werkzeug.security import generate_password_hash, check_password_hash

class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    firstname = db.Column(db.String(80), nullable=False)
    lastname = db.Column(db.String(80), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    phone = db.Column(db.String(30), unique=True, nullable=True)
    password_hash = db.Column(db.String(128), nullable=False)
    role = db.Column(db.String(20), nullable=False, default='user')

    # Relationships (only define backrefs here - no duplicates)
    # Wishlist is commented out until you add the Wishlist model properly
    # wishlist_items = db.relationship(
    #     'Wishlist',
    #     backref='user',
    #     lazy='dynamic',
    #     cascade='all, delete-orphan'
    # )

    # Backrefs from other models will point here automatically
    # (reviews, cart_items, etc. already defined in those models)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def is_admin(self):
        return self.role == 'admin'

    def __repr__(self):
        return f'<User {self.email} ({self.role})>'