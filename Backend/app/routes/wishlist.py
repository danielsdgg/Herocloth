from flask import Blueprint, jsonify, request, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy import func
from app import db
from app.models.wishlist import Wishlist
from app.models.product import Product
from app.models.user import User
from flask_cors import cross_origin
from datetime import datetime

wishlist_bp = Blueprint('wishlist', __name__, url_prefix='/wishlist')


# ────────────────────────────────────────────────
# POST    /wishlist/add
# ────────────────────────────────────────────────
@wishlist_bp.route('/add', methods=['POST'])
@jwt_required()
@cross_origin(origins=["http://localhost:3000"], supports_credentials=True)
def add_to_wishlist():
    """Add a product to the authenticated user's wishlist."""
    user_id = get_jwt_identity()
    data = request.get_json(silent=True) or {}

    product_id = data.get('product_id')
    if not product_id:
        return jsonify({"success": False, "message": "product_id is required"}), 400

    product = Product.query.get(product_id)
    if not product:
        return jsonify({"success": False, "message": "Product not found"}), 404

    # Prevent duplicates (unique constraint should also catch this, but we check early)
    if Wishlist.query.filter_by(user_id=user_id, product_id=product_id).first():
        return jsonify({"success": False, "message": "Product is already in your wishlist"}), 409

    new_item = Wishlist(
        user_id=user_id,
        product_id=product_id,
        # created_at set automatically by model default
    )

    try:
        db.session.add(new_item)
        db.session.commit()
        current_app.logger.info(f"Wishlist add: user={user_id}, product={product_id}")
        return jsonify({
            "success": True,
            "message": "Added to wishlist",
            "product_id": product_id
        }), 201
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Wishlist add failed: user={user_id}, product={product_id} → {str(e)}")
        return jsonify({"success": False, "message": "Failed to add to wishlist"}), 500


# ────────────────────────────────────────────────
# DELETE  /wishlist/remove/<int:product_id>
# ────────────────────────────────────────────────
@wishlist_bp.route('/remove/<int:product_id>', methods=['DELETE'])
@jwt_required()
@cross_origin(origins=["http://localhost:3000"], supports_credentials=True)
def remove_from_wishlist(product_id):
    """Remove a specific product from the authenticated user's wishlist."""
    user_id = get_jwt_identity()

    item = Wishlist.query.filter_by(user_id=user_id, product_id=product_id).first()
    if not item:
        return jsonify({"success": False, "message": "Product not found in your wishlist"}), 404

    try:
        db.session.delete(item)
        db.session.commit()
        current_app.logger.info(f"Wishlist remove: user={user_id}, product={product_id}")
        return jsonify({
            "success": True,
            "message": "Removed from wishlist",
            "product_id": product_id
        }), 200
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Wishlist remove failed: user={user_id}, product={product_id} → {str(e)}")
        return jsonify({"success": False, "message": "Failed to remove item"}), 500


# ────────────────────────────────────────────────
# DELETE  /wishlist/clear
# ────────────────────────────────────────────────
@wishlist_bp.route('/clear', methods=['DELETE'])
@jwt_required()
@cross_origin(origins=["http://localhost:3000"], supports_credentials=True)
def clear_wishlist():
    """Remove ALL items from the authenticated user's wishlist."""
    user_id = get_jwt_identity()

    try:
        count = Wishlist.query.filter_by(user_id=user_id).delete()
        db.session.commit()

        if count == 0:
            return jsonify({"success": True, "message": "Wishlist was already empty"}), 200

        current_app.logger.info(f"Wishlist cleared: user={user_id}, removed={count} items")
        return jsonify({
            "success": True,
            "message": f"Cleared wishlist ({count} items removed)"
        }), 200
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Wishlist clear failed: user={user_id} → {str(e)}")
        return jsonify({"success": False, "message": "Failed to clear wishlist"}), 500


# ────────────────────────────────────────────────
# GET     /wishlist/my-wishlist
# ────────────────────────────────────────────────
@wishlist_bp.route('/my-wishlist', methods=['GET'])
@jwt_required()
@cross_origin(origins=["http://localhost:3000"], supports_credentials=True)
def get_my_wishlist():
    """Return the authenticated user's wishlist items with product details."""
    user_id = get_jwt_identity()

    try:
        items = (
            Wishlist.query
            .filter_by(user_id=user_id)
            .join(Product)
            .order_by(Wishlist.created_at.desc())
            .all()
        )

        result = [
            {
                "wishlist_id": item.id,
                "product_id": item.product_id,
                "name": item.product.name,
                "price": float(item.product.price),  # ensure JSON-safe
                "image1": item.product.image1,
                "category": item.product.category,
                "added_at": item.created_at.isoformat()
            }
            for item in items
        ]

        return jsonify({
            "success": True,
            "count": len(result),
            "data": result
        }), 200

    except Exception as e:
        current_app.logger.error(f"Get wishlist failed: user={user_id} → {str(e)}")
        return jsonify({"success": False, "message": "Failed to fetch wishlist"}), 500


# ────────────────────────────────────────────────
# GET     /wishlist/all   (Admin only)
# ────────────────────────────────────────────────
@wishlist_bp.route('/all', methods=['GET'])
@jwt_required()
@cross_origin(origins=["http://localhost:3000"], supports_credentials=True)
def get_all_wishlists():
    """Admin-only: Get aggregated wishlist data for all users."""
    user_id = get_jwt_identity()
    current_user = db.session.get(User, user_id)

    if not current_user or not current_user.is_admin():
        return jsonify({"success": False, "message": "Admin access required"}), 403

    try:
        # Get users who have at least one wishlist item + summary
        user_wishlists = (
            db.session.query(
                User.id.label('user_id'),
                func.concat(User.firstname, ' ', User.lastname).label('full_name'),
                User.email,
                func.count(Wishlist.id).label('item_count'),
                func.min(Wishlist.created_at).label('first_added'),
                func.max(Wishlist.created_at).label('last_added')
            )
            .outerjoin(Wishlist, User.id == Wishlist.user_id)
            .group_by(User.id)
            .having(func.count(Wishlist.id) > 0)
            .order_by(func.count(Wishlist.id).desc())
            .all()
        )

        result = []
        for uw in user_wishlists:
            items = (
                Wishlist.query
                .filter(Wishlist.user_id == uw.user_id)
                .join(Product)
                .order_by(Wishlist.created_at.desc())
                .all()
            )

            result.append({
                "user_id": uw.user_id,
                "full_name": uw.full_name,
                "email": uw.email,
                "wishlist_count": uw.item_count,
                "first_added": uw.first_added.isoformat() if uw.first_added else None,
                "last_added": uw.last_added.isoformat() if uw.last_added else None,
                "items": [
                    {
                        "wishlist_id": i.id,
                        "product_id": i.product_id,
                        "name": i.product.name,
                        "price": float(i.product.price),
                        "image1": i.product.image1,
                        "category": i.product.category,
                        "added_at": i.created_at.isoformat()
                    }
                    for i in items
                ]
            })

        return jsonify({
            "success": True,
            "count": len(result),
            "data": result
        }), 200

    except Exception as e:
        current_app.logger.error(f"Admin get all wishlists failed: {str(e)}")
        return jsonify({"success": False, "message": "Failed to fetch wishlists"}), 500