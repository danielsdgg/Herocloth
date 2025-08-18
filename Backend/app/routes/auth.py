from flask import Blueprint, request, jsonify, current_app
from app import db
from app.models.user import User
from flask_jwt_extended import create_access_token, create_refresh_token, jwt_required, get_jwt_identity
from werkzeug.security import check_password_hash
from datetime import timedelta
from flask_cors import cross_origin
import logging

logging.basicConfig(level=logging.INFO)

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
@cross_origin(origins=["http://localhost:3000"], supports_credentials=True)
def register():
    data = request.get_json()
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')
    role = data.get('role', 'user')

    if not username or not email or not password:
        current_app.logger.warning(f"Missing required fields in register: {data}")
        return jsonify({"msg": "Missing required fields"}), 400

    if User.query.filter_by(username=username).first() or User.query.filter_by(email=email).first():
        current_app.logger.warning(f"Username or email already exists: username={username}, email={email}")
        return jsonify({"msg": "Username or email already exists"}), 400

    if role not in ['user', 'admin']:
        current_app.logger.warning(f"Invalid role: {role}")
        return jsonify({"msg": "Invalid role"}), 400

    user = User(username=username, email=email, role=role)
    user.set_password(password)
    try:
        db.session.add(user)
        db.session.commit()
        current_app.logger.info(f"User registered: email={email}")
        return jsonify({"msg": "User registered successfully"}), 201
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error registering user {email}: {str(e)}")
        return jsonify({"msg": f"Internal server error: {str(e)}"}), 500

@auth_bp.route('/login', methods=['POST'])
@cross_origin(origins=["http://localhost:3000"], supports_credentials=True)
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        current_app.logger.warning(f"Missing email or password in login: {data}")
        return jsonify({"msg": "Email and password are required"}), 400

    user = User.query.filter_by(email=email).first()
    if not user or not user.check_password(password):
        current_app.logger.warning(f"Failed login attempt for email: {email}")
        return jsonify({"msg": "Invalid credentials"}), 401

    try:
        access_token = create_access_token(identity=str(user.id), expires_delta=timedelta(hours=1))
        refresh_token = create_refresh_token(identity=str(user.id))
        current_app.logger.info(f"User logged in: email={email}, user_id={user.id}")
        return jsonify({"access_token": access_token, "refresh_token": refresh_token, "role": user.role}), 200
    except Exception as e:
        current_app.logger.error(f"Error generating token for user {email}: {str(e)}")
        return jsonify({"msg": f"Internal server error: {str(e)}"}), 500

@auth_bp.route('/refresh', methods=['POST'])
@jwt_required(refresh=True)
@cross_origin(origins=["http://localhost:3000"], supports_credentials=True)
def refresh():
    current_user_id = get_jwt_identity()
    try:
        current_user_id = int(current_user_id)
    except (ValueError, TypeError):
        current_app.logger.error(f"Invalid JWT identity: {current_user_id}")
        return jsonify({"msg": "Invalid user identity"}), 401
    new_access_token = create_access_token(identity=str(current_user_id), expires_delta=timedelta(hours=1))
    current_app.logger.info(f"Access token refreshed for user_id: {current_user_id}")
    return jsonify({"access_token": new_access_token}), 200