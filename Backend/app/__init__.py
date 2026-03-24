# app/__init__.py
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
mail = Mail()

def create_app():
    app = Flask(__name__)

    # =======================
    # DATABASE CONFIG - FIXED FOR RENDER
    # =======================
    database_url = os.environ.get('DATABASE_URL')

    if not database_url:
        raise RuntimeError("DATABASE_URL environment variable is not set! Check Render Environment Variables.")

    if database_url.startswith("postgres://"):
        database_url = database_url.replace("postgres://", "postgresql://", 1)

    app.config['SQLALCHEMY_DATABASE_URI'] = database_url
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY')
    app.config['JWT_SECRET_KEY'] = os.environ.get('SECRET_KEY')

    # Flask-Mail config
    app.config['MAIL_SERVER'] = 'smtp.gmail.com'
    app.config['MAIL_PORT'] = 587
    app.config['MAIL_USE_TLS'] = True
    app.config['MAIL_USERNAME'] = 'danieldeploys@gmail.com'
    app.config['MAIL_PASSWORD'] = os.environ.get('MAIL_PASSWORD')
    app.config['MAIL_DEFAULT_SENDER'] = 'danieldeploys@gmail.com'

    # =======================
    # CORS
    # =======================
    CORS(app, resources={
        r"/*": {
            "origins": [
                "http://localhost:3000",           # Vite dev server
                "http://127.0.0.1:3000",
                "https://herocloth.vercel.app",
                "https://herocloth-git-main-danielsdggs-projects.vercel.app",
                "https://herocloth-git-deploy-danielsdggs-projects.vercel.app"
            ],
            "methods": ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization"],
            "supports_credentials": True
        }
    })

    # =======================
    # INIT EXTENSIONS
    # =======================
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    mail.init_app(app)

    # =======================
    # Blueprints & Models
    # =======================
    with app.app_context():
        # Import models
        from app.models.user import User
        from app.models.product import Product
        from app.models.cart import Cart
        from app.models.review import Review
        from app.models.contact import Contact

        # Import routes
        from app.routes.auth import auth_bp
        from app.routes.cart import cart_bp
        from app.routes.product import product_bp
        from app.routes.user import user_bp
        from app.routes.review import review_bp
        from app.routes.order import order_bp
        from app.routes.mpesa import mpesa_bp
        from app.routes.wishlist import wishlist_bp
        from app.routes.contact import contact_bp

        # Register blueprints
        app.register_blueprint(auth_bp, url_prefix='/auth')
        app.register_blueprint(cart_bp, url_prefix='/cart')
        app.register_blueprint(product_bp, url_prefix='/product')
        app.register_blueprint(user_bp, url_prefix='/user')
        app.register_blueprint(review_bp, url_prefix='/review')
        app.register_blueprint(order_bp, url_prefix='/order')
        app.register_blueprint(mpesa_bp, url_prefix='/mpesa')
        app.register_blueprint(wishlist_bp, url_prefix='/wishlist')
        app.register_blueprint(contact_bp)

        # DO NOT use db.create_all() in production with migrations
        print("✅ App initialized successfully with PostgreSQL")
        print("Registered blueprints:", [rule.endpoint for rule in app.url_map.iter_rules()])

    return app