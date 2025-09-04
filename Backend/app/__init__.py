from flask import Flask, jsonify, request
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager
from flask_cors import CORS
import os

db = SQLAlchemy()
migrate = Migrate()
jwt = JWTManager()

def create_app():
    app = Flask(__name__)

    # Use absolute path for database to avoid path resolution issues
    basedir = os.path.abspath(os.path.dirname(__file__))
    default_db_path = os.path.join(basedir, 'ecommerce.db')
    app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', f'sqlite:///{default_db_path}')
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'fc06b4467efe565d9368c0259f61788e')

    # Initialize CORS with global configuration
    CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}}, supports_credentials=True)

    # Handle OPTIONS requests globally
    @app.before_request
    def handle_options():
        if request.method == "OPTIONS":
            response = jsonify({"msg": "CORS preflight successful"})
            response.headers.add("Access-Control-Allow-Origin", "http://localhost:3000")
            response.headers.add("Access-Control-Allow-Headers", "Content-Type, Authorization")
            response.headers.add("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE, OPTIONS")
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
        print("Registered blueprints:", [rule.endpoint for rule in app.url_map.iter_rules()])  # Debug statement

    return app