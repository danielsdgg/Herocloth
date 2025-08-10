from flask import Flask, jsonify, request
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from config import Config

db = SQLAlchemy()
migrate = Migrate()
jwt = JWTManager()

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    # In app/__init__.py, inside create_app()
    @app.route('/test-cors', methods=['GET', 'OPTIONS'])
    def test_cors():
        return jsonify({"msg": "CORS test successful"}), 200

    # Enable logging
    import logging
    logging.basicConfig(level=logging.DEBUG)
    logger = logging.getLogger(__name__)
    app.logger.setLevel(logging.DEBUG)

    # Log all incoming requests
    @app.before_request
    def log_request():
        app.logger.debug(f"Received {request.method} request for {request.url}")

    # Initialize extensions
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    CORS(app, resources={r"/*": {
        "origins": ["http://localhost:3000"],
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"]
    }})

    # Register blueprints
    from app.routes.auth import auth_bp
    from app.routes.user import user_bp
    from app.routes.product import product_bp
    from app.routes.cart import cart_bp

    app.register_blueprint(auth_bp, url_prefix='/auth')
    app.register_blueprint(user_bp, url_prefix='/user')
    app.register_blueprint(product_bp, url_prefix='/product')
    app.register_blueprint(cart_bp, url_prefix='/cart')

    return app