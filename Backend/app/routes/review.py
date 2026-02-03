# app/routes/review.py
from flask import Blueprint, jsonify, request, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models.review import Review
from app.models.user import User
from app.models.product import Product
from flask_cors import cross_origin
from datetime import datetime

review_bp = Blueprint('review', __name__)

# POST /review - Create a new review (authenticated user only)
@review_bp.route('/', methods=['POST'])
@jwt_required()
@cross_origin(origins=["http://localhost:3000"], supports_credentials=True)
def create_review():
    current_user_id = get_jwt_identity()
    user = db.session.get(User, current_user_id)
    if not user:
        return jsonify({"msg": "User not found"}), 404

    data = request.get_json()
    product_id = data.get('product_id')
    rating = data.get('rating')
    comment = data.get('comment', '').strip()

    if not product_id or rating is None:
        return jsonify({"msg": "Product ID and rating are required"}), 400

    if not isinstance(rating, int) or rating < 1 or rating > 5:
        return jsonify({"msg": "Rating must be an integer between 1 and 5"}), 400

    product = db.session.get(Product, product_id)
    if not product:
        return jsonify({"msg": "Product not found"}), 404

    # Optional: Prevent duplicate reviews from same user on same product
    existing_review = Review.query.filter_by(user_id=current_user_id, product_id=product_id).first()
    if existing_review:
        return jsonify({"msg": "You have already reviewed this product"}), 400

    review = Review(
        rating=rating,
        comment=comment or None,
        user_id=current_user_id,
        product_id=product_id,
        created_at=datetime.utcnow()
    )

    try:
        db.session.add(review)
        db.session.commit()
        current_app.logger.info(f"Review created by user {current_user_id} for product {product_id}")
        return jsonify({"msg": "Review submitted successfully"}), 201
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error creating review: {str(e)}")
        return jsonify({"msg": "Failed to submit review"}), 500

# GET /product/<int:product_id>/reviews - Get all reviews for a product with user details
@review_bp.route('/product/<int:product_id>/reviews', methods=['GET'])
@cross_origin(origins=["http://localhost:3000"], supports_credentials=True)
def get_product_reviews(product_id):
    product = db.session.get(Product, product_id)
    if not product:
        return jsonify({"msg": "Product not found"}), 404

    try:
        reviews = (
            db.session.query(Review)
            .filter_by(product_id=product_id)
            .order_by(Review.created_at.desc())
            .all()
        )

        serialized_reviews = []
        for review in reviews:
            serialized_reviews.append({
                "id": review.id,
                "rating": review.rating,
                "comment": review.comment or "",
                "created_at": review.created_at.isoformat(),
                "user": {
                    "id": review.user.id,
                    "firstname": review.user.firstname,
                    "lastname": review.user.lastname,
                    "email": review.user.email,
                    # Phone optional - only include if present
                    "phone": review.user.phone if review.user.phone else None
                }
            })

        return jsonify(serialized_reviews), 200
    except Exception as e:
        current_app.logger.error(f"Error fetching reviews for product {product_id}: {str(e)}")
        return jsonify({"msg": "Failed to fetch reviews"}), 500

# Optional: GET /product/<int:product_id>/rating-summary - Get average rating and count
@review_bp.route('/product/<int:product_id>/rating-summary', methods=['GET'])
@cross_origin(origins=["http://localhost:3000"], supports_credentials=True)
def get_rating_summary(product_id):
    product = db.session.get(Product, product_id)
    if not product:
        return jsonify({"msg": "Product not found"}), 404

    try:
        from sqlalchemy import func

        result = (
            db.session.query(
                func.avg(Review.rating).label('average_rating'),
                func.count(Review.id).label('review_count')
            )
            .filter_by(product_id=product_id)
            .one()
        )

        average_rating = round(result.average_rating, 1) if result.average_rating else 0.0
        review_count = result.review_count

        return jsonify({
            "average_rating": average_rating,
            "review_count": review_count
        }), 200
    except Exception as e:
        current_app.logger.error(f"Error calculating rating summary for product {product_id}: {str(e)}")
        return jsonify({"msg": "Failed to fetch rating summary"}), 500