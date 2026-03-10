# app/utils/__init__.py
from flask import Flask, jsonify, request
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from flask_mail import Mail
from dotenv import load_dotenv
import os

load_dotenv()

db = SQLAlchemy()
migrate = Migrate()
jwt = JWTManager()
mail = Mail()  # ← Added Flask-Mail

def create_app():
    app = Flask(__name__)

    # Database config
    app.config['SQLALCHEMY_DATABASE_URI'] = os.environ['DATABASE_URL']
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['SECRET_KEY'] = os.environ['SECRET_KEY']
    app.config['JWT_SECRET_KEY'] = os.environ['SECRET_KEY']

    # Flask-Mail configuration (Gmail example - use app password!)
    app.config['MAIL_SERVER'] = 'smtp.gmail.com'
    app.config['MAIL_PORT'] = 587
    app.config['MAIL_USE_TLS'] = True
    app.config['MAIL_USERNAME'] = 'danieldeploys@gmail.com'  # Your receiving email
    app.config['MAIL_PASSWORD'] = os.environ.get('MAIL_PASSWORD')  # Add to .env: MAIL_PASSWORD=your-app-password
    app.config['MAIL_DEFAULT_SENDER'] = 'danieldeploys@gmail.com'

    # Initialize extensions
    CORS(app, resources={
        r"/*": {
            "origins": ["http://localhost:3000"],
            "methods": ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization"],
            "supports_credentials": True
        }
    })

    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    mail.init_app(app)  # ← Initialize Mail

    # Handle OPTIONS for CORS preflight
    @app.before_request
    def handle_options():
        if request.method == "OPTIONS":
            response = jsonify({"msg": "CORS preflight successful"})
            response.headers.add("Access-Control-Allow-Origin", "http://localhost:3000")
            response.headers.add("Access-Control-Allow-Headers", "Content-Type, Authorization")
            response.headers.add("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS")
            response.headers.add("Access-Control-Allow-Credentials", "true")
            return response, 200

    with app.app_context():
        # Models
        from app.models.user import User
        from app.models.product import Product
        from app.models.cart import Cart
        from app.models.review import Review
        from app.models.contact import Contact  # ← New: Contact model

        # Routes
        from app.routes.auth import auth_bp
        from app.routes.cart import cart_bp
        from app.routes.product import product_bp
        from app.routes.user import user_bp
        from app.routes.review import review_bp
        from app.routes.order import order_bp
        from app.routes.mpesa import mpesa_bp
        from app.routes.wishlist import wishlist_bp
        from app.routes.contact import contact_bp  # ← New: Contact routes

        # Register blueprints
        app.register_blueprint(auth_bp, url_prefix='/auth')
        app.register_blueprint(cart_bp, url_prefix='/cart')
        app.register_blueprint(product_bp, url_prefix='/product')
        app.register_blueprint(user_bp, url_prefix='/user')
        app.register_blueprint(review_bp, url_prefix='/review')
        app.register_blueprint(order_bp, url_prefix='/order')
        app.register_blueprint(mpesa_bp, url_prefix='/mpesa')
        app.register_blueprint(wishlist_bp, url_prefix='/wishlist')
        app.register_blueprint(contact_bp)  # ← Register contact (no prefix needed)

        db.create_all()
        print("Registered blueprints:", [rule.endpoint for rule in app.url_map.iter_rules()])

    return app