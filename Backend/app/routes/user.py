from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models.user import User
from flask_cors import cross_origin

user_bp = Blueprint('user', __name__)

@user_bp.route('/profile', methods=['GET'])
@jwt_required()
@cross_origin(origins=["http://localhost:3000"], supports_credentials=True)
def get_profile():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    if not user:
        return jsonify({"msg": "User not found"}), 404
    return jsonify({
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "role": user.role
    }), 200