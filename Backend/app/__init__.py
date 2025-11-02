# Backend/app/__init__.py
import os
from flask import Flask, jsonify, request
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from dotenv import load_dotenv
load_dotenv()

db = SQLAlchemy()
migrate = Migrate()
jwt = JWTManager()

def create_app():
    app = Flask(__name__)

    # Use DATABASE_URL for PostgreSQL; no SQLite fallback
    app.config['SQLALCHEMY_DATABASE_URI'] = os.environ['DATABASE_URL']
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['SECRET_KEY'] = os.environ['SECRET_KEY']
    app.config['JWT_SECRET_KEY'] = os.environ['SECRET_KEY']

    # Initialize CORS
    CORS(app, resources={
        r"/*": {
            "origins": ["http://localhost:3000", "https://heroclothline.netlify.app"],
            "methods": ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization"],
            "supports_credentials": True
        }
    })

    # Handle OPTIONS requests for CORS preflight
    @app.before_request
    def handle_options():
        if request.method == "OPTIONS":
            response = jsonify({"msg": "CORS preflight successful"})
            response.headers.add("Access-Control-Allow-Origin", "http://localhost:3000,https://heroclothline.netlify.app")
            response.headers.add("Access-Control-Allow-Headers", "Content-Type,Authorization")
            response.headers.add("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS")
            response.headers.add("Access-Control-Allow-Credentials", "true")
            return response, 200

    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)

    with app.app_context():
        from app.models.user import User
        from app.models.product import Product
        from app.models.cart import Cart
        from app.routes.auth import auth_bp
        from app.routes.cart import cart_bp
        from app.routes.product import product_bp
        from app.routes.user import user_bp
        app.register_blueprint(auth_bp, url_prefix='/auth')
        app.register_blueprint(cart_bp, url_prefix='/cart')
        app.register_blueprint(product_bp, url_prefix='/product')
        app.register_blueprint(user_bp, url_prefix='/user')
        db.create_all()
        print("Registered blueprints:", [rule.endpoint for rule in app.url_map.iter_rules()])

    return app