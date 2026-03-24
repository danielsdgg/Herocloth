# app/routes/user.py
from flask import Blueprint, jsonify, request, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models.user import User
from flask_cors import cross_origin

user_bp = Blueprint('user', __name__)

@user_bp.route('/profile', methods=['GET'])
@jwt_required()
@cross_origin(origins=["http://localhost:3000",
                "http://127.0.0.1:3000",
                "https://herocloth.vercel.app",
                "https://herocloth-git-deploy-danielsdggs-projects.vercel.app",
                "https://herocloth-jza4vn2ab-danielsdggs-projects.vercel.app"], supports_credentials=True)
def get_profile():
    current_user_id = get_jwt_identity()
    user = db.session.get(User, current_user_id)
    if not user:
        current_app.logger.warning(f"User not found: id={current_user_id}")
        return jsonify({"msg": "User not found"}), 404
    return jsonify({
        "id": user.id,
        "firstname": user.firstname,
        "lastname": user.lastname,
        "email": user.email,
        "phone": user.phone,
        "role": user.role
    }), 200

@user_bp.route('/profile', methods=['PUT'])
@jwt_required()
@cross_origin(origins=["http://localhost:3000",
                "http://127.0.0.1:3000",
                "https://herocloth.vercel.app",
                "https://herocloth-git-deploy-danielsdggs-projects.vercel.app",
                "https://herocloth-jza4vn2ab-danielsdggs-projects.vercel.app"], supports_credentials=True)
def update_profile():
    current_user_id = get_jwt_identity()
    user = db.session.get(User, current_user_id)
    if not user:
        current_app.logger.warning(f"User not found: id={current_user_id}")
        return jsonify({"msg": "User not found"}), 404

    data = request.get_json()
    firstname = data.get('firstname')
    lastname = data.get('lastname')
    email = data.get('email')
    phone = data.get('phone')
    password = data.get('password')

    if not any([firstname, lastname, email, phone, password]):
        current_app.logger.warning(f"No fields provided for profile update: id={current_user_id}")
        return jsonify({"msg": "At least one field (firstname, lastname, email, phone, password) is required"}), 400

    # Validation
    if firstname is not None:
        if not isinstance(firstname, str) or not firstname.strip():
            return jsonify({"msg": "Firstname must be a non-empty string"}), 400
        if firstname != user.firstname and db.session.query(User).filter_by(firstname=firstname).first():
            return jsonify({"msg": "Firstname already exists"}), 400
        user.firstname = firstname

    if lastname is not None:
        if not isinstance(lastname, str) or not lastname.strip():
            return jsonify({"msg": "Lastname must be a non-empty string"}), 400
        if lastname != user.lastname and db.session.query(User).filter_by(lastname=lastname).first():
            return jsonify({"msg": "Lastname already exists"}), 400
        user.lastname = lastname

    if email is not None:
        if not isinstance(email, str) or '@' not in email:
            return jsonify({"msg": "Invalid email format"}), 400
        if email != user.email and db.session.query(User).filter_by(email=email).first():
            return jsonify({"msg": "Email already exists"}), 400
        user.email = email

    if phone is not None:
        if db.session.query(User).filter(User.phone == phone, User.id != user.id).first():
            return jsonify({"msg": "Phone already exists"}), 400
        user.phone = phone

    if password is not None:
        if not isinstance(password, str) or len(password) < 6:
            return jsonify({"msg": "Password must be at least 6 characters"}), 400
        user.set_password(password)

    try:
        db.session.commit()
        current_app.logger.info(f"Profile updated successfully: id={current_user_id}")
        return jsonify({
            "id": user.id,
            "firstname": user.firstname,
            "lastname": user.lastname,
            "email": user.email,
            "phone": user.phone,
            "role": user.role
        }), 200
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error updating profile for user_id {current_user_id}: {str(e)}")
        return jsonify({"msg": "Internal server error"}), 500

@user_bp.route('/all', methods=['GET'])
@jwt_required()
@cross_origin(origins=["http://localhost:3000",
                "http://127.0.0.1:3000",
                "https://herocloth.vercel.app",
                "https://herocloth-git-deploy-danielsdggs-projects.vercel.app",
                "https://herocloth-jza4vn2ab-danielsdggs-projects.vercel.app"], supports_credentials=True)
def get_all_users():
    current_user_id = get_jwt_identity()
    admin = db.session.get(User, current_user_id)
    if not admin or admin.role != 'admin':
        current_app.logger.warning(f"Admin access denied: user_id={current_user_id}")
        return jsonify({"msg": "Admin access required"}), 403

    try:
        users = db.session.query(User).all()
        return jsonify([{
            "id": u.id,
            "firstname": u.firstname,
            "lastname": u.lastname,
            "email": u.email,
            "phone": u.phone,
            "role": u.role
        } for u in users]), 200
    except Exception as e:
        current_app.logger.error(f"Error fetching all users: {str(e)}")
        return jsonify({"msg": "Internal server error"}), 500

@user_bp.route('/<int:id>', methods=['GET'])
@jwt_required()
@cross_origin(origins=["http://localhost:3000",
                "http://127.0.0.1:3000",
                "https://herocloth.vercel.app",
                "https://herocloth-git-deploy-danielsdggs-projects.vercel.app",
                "https://herocloth-jza4vn2ab-danielsdggs-projects.vercel.app"], supports_credentials=True)
def get_user(id):
    current_user_id = get_jwt_identity()
    admin = db.session.get(User, current_user_id)
    if not admin or admin.role != 'admin':
        current_app.logger.warning(f"Admin access denied: user_id={current_user_id}")
        return jsonify({"msg": "Admin access required"}), 403

    user = db.session.get(User, id)
    if not user:
        current_app.logger.warning(f"User not found: id={id}")
        return jsonify({"msg": "User not found"}), 404

    return jsonify({
        "id": user.id,
        "firstname": user.firstname,
        "lastname": user.lastname,
        "email": user.email,
        "phone": user.phone,
        "role": user.role
    }), 200

@user_bp.route('/<int:id>', methods=['PUT'])
@jwt_required()
@cross_origin(origins=["http://localhost:3000",
                "http://127.0.0.1:3000",
                "https://herocloth.vercel.app",
                "https://herocloth-git-deploy-danielsdggs-projects.vercel.app",
                "https://herocloth-jza4vn2ab-danielsdggs-projects.vercel.app"], supports_credentials=True)
def update_user_role(id):
    current_user_id = get_jwt_identity()
    admin = db.session.get(User, current_user_id)
    if not admin or admin.role != 'admin':
        current_app.logger.warning(f"Admin access denied: user_id={current_user_id}")
        return jsonify({"msg": "Admin access required"}), 403

    user = db.session.get(User, id)
    if not user:
        current_app.logger.warning(f"User not found: id={id}")
        return jsonify({"msg": "User not found"}), 404

    data = request.get_json()
    role = data.get('role')
    if not role or role not in ['user', 'admin']:
        current_app.logger.warning(f"Invalid role requested: {role}")
        return jsonify({"msg": "Role must be 'user' or 'admin'"}), 400

    if user.id == current_user_id and role != 'admin':
        current_app.logger.warning(f"Admin attempted self-demotion: user_id={current_user_id}")
        return jsonify({"msg": "Admin cannot demote themselves"}), 403

    user.role = role
    try:
        db.session.commit()
        current_app.logger.info(f"User role updated: id={id}, new_role={role}")
        return jsonify({
            "id": user.id,
            "firstname": user.firstname,
            "lastname": user.lastname,
            "email": user.email,
            "phone": user.phone,
            "role": user.role
        }), 200
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error updating user role id={id}: {str(e)}")
        return jsonify({"msg": "Internal server error"}), 500

@user_bp.route('/<int:id>', methods=['DELETE'])
@jwt_required()
@cross_origin(origins=["http://localhost:3000",
                "http://127.0.0.1:3000",
                "https://herocloth.vercel.app",
                "https://herocloth-git-deploy-danielsdggs-projects.vercel.app",
                "https://herocloth-jza4vn2ab-danielsdggs-projects.vercel.app"], supports_credentials=True)
def delete_user(id):
    current_user_id = get_jwt_identity()
    admin = db.session.get(User, current_user_id)
    if not admin or admin.role != 'admin':
        current_app.logger.warning(f"Admin access denied: user_id={current_user_id}")
        return jsonify({"msg": "Admin access required"}), 403

    user = db.session.get(User, id)
    if not user:
        current_app.logger.warning(f"User not found: id={id}")
        return jsonify({"msg": "User not found"}), 404

    if user.id == current_user_id:
        current_app.logger.warning(f"Admin attempted self-deletion: user_id={current_user_id}")
        return jsonify({"msg": "Admin cannot delete themselves"}), 403

    try:
        db.session.delete(user)
        db.session.commit()
        current_app.logger.info(f"User deleted successfully: id={id}")
        return jsonify({"msg": "User deleted successfully"}), 200
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error deleting user id={id}: {str(e)}")
        return jsonify({"msg": "Internal server error"}), 500