# app/routes/auth.py
from flask import Blueprint, request, jsonify, current_app
from app import db
from app.models.user import User
from flask_jwt_extended import create_access_token, create_refresh_token, jwt_required, get_jwt_identity
from datetime import timedelta
from flask_cors import cross_origin

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
@cross_origin(origins=["https://herocloth.vercel.app", "http://localhost:3000"], supports_credentials=True)
def register():
    data = request.get_json() or {}
    
    firstname = data.get('firstname')
    lastname = data.get('lastname')
    email = data.get('email')
    phone = data.get('phone')
    password = data.get('password')
    role = data.get('role', 'user')

    if not all([firstname, lastname, email, password]):
        return jsonify({"msg": "Firstname, lastname, email and password are required"}), 400

    # Convert phone to string if provided
    if phone is not None:
        phone = str(phone).strip()

    # Check uniqueness
    if User.query.filter_by(email=email).first():
        return jsonify({"msg": "Email already exists"}), 400

    if phone and User.query.filter_by(phone=phone).first():
        return jsonify({"msg": "Phone already exists"}), 400

    if role not in ['user', 'admin']:
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
        current_app.logger.info(f"User registered: {email}")
        return jsonify({"msg": "User registered successfully"}), 201
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Registration error: {str(e)}")
        return jsonify({"msg": "Internal server error"}), 500


@auth_bp.route('/login', methods=['POST'])
@cross_origin(origins=["https://herocloth.vercel.app", "http://localhost:3000"], supports_credentials=True)
def login():
    data = request.get_json() or {}
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({"msg": "Email and password are required"}), 400

    user = User.query.filter_by(email=email).first()

    if not user or not user.check_password(password):
        return jsonify({"msg": "Invalid credentials"}), 401

    try:
        access_token = create_access_token(identity=str(user.id), expires_delta=timedelta(hours=1))
        refresh_token = create_refresh_token(identity=str(user.id))

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
        current_app.logger.error(f"Login token error: {str(e)}")
        return jsonify({"msg": "Internal server error"}), 500