# app/routes/auth.py
from flask import Blueprint, request, jsonify, current_app
from app import db
from app.models.user import User
from flask_jwt_extended import create_access_token, create_refresh_token, jwt_required, get_jwt_identity
from datetime import timedelta
from flask_cors import cross_origin
import logging

logging.basicConfig(level=logging.INFO)

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
@cross_origin(origins=["http://localhost:3000",
                "http://127.0.0.1:3000",
                "https://herocloth.vercel.app",
                "https://herocloth-git-deploy-danielsdggs-projects.vercel.app",
                "https://herocloth-jza4vn2ab-danielsdggs-projects.vercel.app" ],
               supports_credentials=True)
def register():
    data = request.get_json()
    firstname = data.get('firstname')
    lastname = data.get('lastname')
    email = data.get('email')
    phone = data.get('phone')  # Optional
    password = data.get('password')
    role = data.get('role', 'user')  # Default to 'user'

    if not firstname or not lastname or not email or not password:
        current_app.logger.warning(f"Missing required fields in register: {data}")
        return jsonify({"msg": "Firstname, lastname, email and password are required"}), 400

    # Check for existing unique fields
    if User.query.filter_by(firstname=firstname).first():
        current_app.logger.warning(f"Firstname already exists: {firstname}")
        return jsonify({"msg": "Firstname already exists"}), 400

    if User.query.filter_by(lastname=lastname).first():
        current_app.logger.warning(f"Lastname already exists: {lastname}")
        return jsonify({"msg": "Lastname already exists"}), 400

    if User.query.filter_by(email=email).first():
        current_app.logger.warning(f"Email already exists: {email}")
        return jsonify({"msg": "Email already exists"}), 400

    if phone is not None and User.query.filter_by(phone=phone).first():
        current_app.logger.warning(f"Phone already exists: {phone}")
        return jsonify({"msg": "Phone already exists"}), 400

    if role not in ['user', 'admin']:
        current_app.logger.warning(f"Invalid role requested: {role}")
        return jsonify({"msg": "Invalid role"}), 400

    user = User(
        firstname=firstname,
        lastname=lastname,
        email=email,
        phone=phone,
        role=role
    )
    user.set_password(password)

    try:
        db.session.add(user)
        db.session.commit()
        current_app.logger.info(f"User registered successfully: email={email}")
        return jsonify({"msg": "User registered successfully"}), 201
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error registering user {email}: {str(e)}")
        return jsonify({"msg": "Internal server error"}), 500

@auth_bp.route('/login', methods=['POST'])
@cross_origin(origins=["http://localhost:3000"], supports_credentials=True)
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        current_app.logger.warning(f"Missing email or password in login attempt")
        return jsonify({"msg": "Email and password are required"}), 400

    user = User.query.filter_by(email=email).first()
    if not user or not user.check_password(password):
        current_app.logger.warning(f"Failed login attempt for email: {email}")
        return jsonify({"msg": "Invalid credentials"}), 401

    try:
        access_token = create_access_token(
            identity=str(user.id),
            expires_delta=timedelta(hours=1)
        )
        refresh_token = create_refresh_token(identity=str(user.id))

        current_app.logger.info(f"User logged in successfully: email={email}, user_id={user.id}")
        return jsonify({
            "access_token": access_token,
            "refresh_token": refresh_token,
            "role": user.role,
            "user": {
                "id": user.id,
                "firstname": user.firstname,
                "lastname": user.lastname,
                "email": user.email,
                "phone": user.phone
            }
        }), 200
    except Exception as e:
        current_app.logger.error(f"Error generating tokens for user {email}: {str(e)}")
        return jsonify({"msg": "Internal server error"}), 500

@auth_bp.route('/refresh', methods=['POST'])
@jwt_required(refresh=True)
@cross_origin(origins=["http://localhost:3000",
                "http://127.0.0.1:3000",
                "https://herocloth.vercel.app",
                "https://herocloth-git-deploy-danielsdggs-projects.vercel.app",
                "https://herocloth-jza4vn2ab-danielsdggs-projects.vercel.app"], supports_credentials=True)
def refresh():
    current_user_id = get_jwt_identity()
    try:
        current_user_id = int(current_user_id)
    except (ValueError, TypeError):
        current_app.logger.error(f"Invalid JWT identity format: {current_user_id}")
        return jsonify({"msg": "Invalid token"}), 401

    new_access_token = create_access_token(
        identity=str(current_user_id),
        expires_delta=timedelta(hours=1)
    )
    current_app.logger.info(f"Access token refreshed for user_id: {current_user_id}")
    return jsonify({"access_token": new_access_token}), 200