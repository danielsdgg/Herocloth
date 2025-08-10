# app/routes/auth.py
from flask import Blueprint, request, jsonify
from app import db
from app.models.user import User
from flask_jwt_extended import create_access_token
from werkzeug.security import check_password_hash
import logging  # Added for debugging

# Configure logging
logging.basicConfig(level=logging.INFO)

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')
    role = data.get('role', 'user')  # Default to 'user'

    if not username or not email or not password:
        return jsonify({"msg": "Missing required fields"}), 400

    if User.query.filter_by(username=username).first() or User.query.filter_by(email=email).first():
        return jsonify({"msg": "Username or email already exists"}), 400

    user = User(username=username, email=email, role=role)
    user.set_password(password)
    db.session.add(user)
    db.session.commit()

    return jsonify({"msg": "User registered successfully"}), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    user = User.query.filter_by(email=email).first()
    if not user or not user.check_password(password):
        return jsonify({"msg": "Invalid credentials"}), 401

    logging.info(f"Creating token for user_id: {user.id}, type: {type(user.id)}")
    access_token = create_access_token(identity=str(user.id))  # Explicitly convert to string
    return jsonify({"access_token": access_token, "role": user.role}), 200