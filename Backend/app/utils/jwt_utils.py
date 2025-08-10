# app/utils/jwt_utils.py
from flask_jwt_extended import get_jwt_identity, jwt_required
from app.models.user import User
from functools import wraps
from flask import jsonify
import logging  # Added for debugging

# Configure logging
logging.basicConfig(level=logging.INFO)

def admin_required(f):
    @wraps(f)
    @jwt_required()
    def decorated_function(*args, **kwargs):
        current_user_id = get_jwt_identity()
        logging.info(f"JWT Identity: {current_user_id}, Type: {type(current_user_id)}")
        try:
            current_user_id = int(current_user_id)  # Convert to int for User.query.get
        except (ValueError, TypeError):
            logging.error(f"Invalid JWT identity: {current_user_id}")
            return jsonify({"msg": "Invalid user identity"}), 401
        user = User.query.get(current_user_id)
        if not user or not user.is_admin():
            logging.warning(f"Admin access denied for user_id: {current_user_id}")
            return jsonify({"msg": "Admin access required"}), 403
        return f(*args, **kwargs)
    return decorated_function