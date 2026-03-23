from flask import Blueprint, jsonify, request, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models.review import Review
from app.models.user import User
from app.models.product import Product
from flask_cors import cross_origin
from datetime import datetime
from sqlalchemy import func
from sqlalchemy.orm import joinedload

review_bp = Blueprint('review', __name__)

# POST /review/ - Create a new review (authenticated user only)
@review_bp.route('/', methods=['POST'])
@jwt_required()
@cross_origin(origins=["http://localhost:3000",
                "http://127.0.0.1:3000",
                "https://herocloth.vercel.app",
                "https://herocloth-git-deploy-danielsdggs-projects.vercel.app",
                "https://herocloth-jza4vn2ab-danielsdggs-projects.vercel.app"], supports_credentials=True)
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

    # Prevent duplicate reviews
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
        current_app.logger.exception(f"Error creating review: {str(e)}")
        return jsonify({"msg": "Failed to submit review"}), 500


# GET /review/my-reviews - Get all reviews written by the current user
@review_bp.route('/my-reviews', methods=['GET'])
@jwt_required()
@cross_origin(origins=["http://localhost:3000",
                "http://127.0.0.1:3000",
                "https://herocloth.vercel.app",
                "https://herocloth-git-deploy-danielsdggs-projects.vercel.app",
                "https://herocloth-jza4vn2ab-danielsdggs-projects.vercel.app"], supports_credentials=True)
def get_my_reviews():
    current_user_id = get_jwt_identity()

    try:
        reviews = (
            Review.query
            .filter_by(user_id=current_user_id)
            .options(joinedload(Review.product))
            .order_by(Review.created_at.desc())
            .all()
        )

        serialized = []
        for r in reviews:
            serialized.append({
                "id": r.id,
                "product_id": r.product_id,
                "product_name": r.product.name if r.product else "Deleted Product",
                "rating": r.rating,
                "comment": r.comment or "",
                "created_at": r.created_at.isoformat()
            })

        return jsonify(serialized), 200
    except Exception as e:
        current_app.logger.exception(f"Error fetching my-reviews for user {current_user_id}")
        return jsonify({"msg": "Failed to fetch your reviews"}), 500


# PUT /review/<int:review_id> - Edit own review (only owner can edit)
@review_bp.route('/<int:review_id>', methods=['PUT'])
@jwt_required()
@cross_origin(origins=["http://localhost:3000",
                "http://127.0.0.1:3000",
                "https://herocloth.vercel.app",
                "https://herocloth-git-deploy-danielsdggs-projects.vercel.app",
                "https://herocloth-jza4vn2ab-danielsdggs-projects.vercel.app"], supports_credentials=True)
def update_review(review_id):
    current_user_id = get_jwt_identity()
    review = db.session.get(Review, review_id)

    if not review:
        return jsonify({"msg": "Review not found"}), 404

    if review.user_id != current_user_id:
        return jsonify({"msg": "You can only edit your own reviews"}), 403

    data = request.get_json()
    rating = data.get('rating')
    comment = data.get('comment', '').strip()

    if rating is not None:
        if not isinstance(rating, int) or rating < 1 or rating > 5:
            return jsonify({"msg": "Rating must be an integer between 1 and 5"}), 400
        review.rating = rating

    if 'comment' in data:
        review.comment = comment or None

    try:
        db.session.commit()
        current_app.logger.info(f"Review {review_id} updated by user {current_user_id}")
        return jsonify({"msg": "Review updated successfully"}), 200
    except Exception as e:
        db.session.rollback()
        current_app.logger.exception(f"Error updating review {review_id}")
        return jsonify({"msg": "Failed to update review"}), 500


# DELETE /review/<int:review_id> - Delete review (admin only)
@review_bp.route('/<int:review_id>', methods=['DELETE'])
@jwt_required()
@cross_origin(origins=["http://localhost:3000",
                "http://127.0.0.1:3000",
                "https://herocloth.vercel.app",
                "https://herocloth-git-deploy-danielsdggs-projects.vercel.app",
                "https://herocloth-jza4vn2ab-danielsdggs-projects.vercel.app"], supports_credentials=True)
def delete_review(review_id):
    current_user_id = get_jwt_identity()
    current_user = db.session.get(User, current_user_id)

    if not current_user or current_user.role != 'admin':
        return jsonify({"msg": "Admin access required"}), 403

    review = db.session.get(Review, review_id)
    if not review:
        return jsonify({"msg": "Review not found"}), 404

    try:
        db.session.delete(review)
        db.session.commit()
        current_app.logger.info(f"Review {review_id} deleted by admin {current_user_id}")
        return jsonify({"msg": "Review deleted successfully"}), 200
    except Exception as e:
        db.session.rollback()
        current_app.logger.exception(f"Error deleting review {review_id}")
        return jsonify({"msg": "Failed to delete review"}), 500


# GET /review/product/<int:product_id>/reviews - Get all reviews for a product (public)
@review_bp.route('/product/<int:product_id>/reviews', methods=['GET'])
@cross_origin(origins=["http://localhost:3000",
                "http://127.0.0.1:3000",
                "https://herocloth.vercel.app",
                "https://herocloth-git-deploy-danielsdggs-projects.vercel.app",
                "https://herocloth-jza4vn2ab-danielsdggs-projects.vercel.app"], supports_credentials=True)
def get_product_reviews(product_id):
    product = db.session.get(Product, product_id)
    if not product:
        return jsonify({"msg": "Product not found"}), 404

    try:
        reviews = (
            Review.query
            .filter_by(product_id=product_id)
            .options(joinedload(Review.user))
            .order_by(Review.created_at.desc())
            .all()
        )

        serialized = []
        for r in reviews:
            serialized.append({
                "id": r.id,
                "rating": r.rating,
                "comment": r.comment or "",
                "created_at": r.created_at.isoformat(),
                "user": {
                    "firstname": r.user.firstname,
                    "lastname": r.user.lastname,
                    "email": r.user.email
                }
            })

        return jsonify(serialized), 200
    except Exception as e:
        current_app.logger.exception(f"Error fetching reviews for product {product_id}")
        return jsonify({"msg": "Failed to fetch reviews"}), 500


# GET /review/product/<int:product_id>/rating-summary - Average rating + count (public)
@review_bp.route('/product/<int:product_id>/rating-summary', methods=['GET'])
@cross_origin(origins=["http://localhost:3000",
                "http://127.0.0.1:3000",
                "https://herocloth.vercel.app",
                "https://herocloth-git-deploy-danielsdggs-projects.vercel.app",
                "https://herocloth-jza4vn2ab-danielsdggs-projects.vercel.app"], supports_credentials=True)
def get_rating_summary(product_id):
    product = db.session.get(Product, product_id)
    if not product:
        return jsonify({"msg": "Product not found"}), 404

    try:
        result = (
            db.session.query(
                func.avg(Review.rating).label('average_rating'),
                func.count(Review.id).label('review_count')
            )
            .filter_by(product_id=product_id)
            .one()
        )

        average = round(result.average_rating or 0, 1)
        count = result.review_count or 0

        return jsonify({
            "average_rating": average,
            "review_count": count
        }), 200
    except Exception as e:
        current_app.logger.exception(f"Error calculating summary for product {product_id}")
        return jsonify({"msg": "Failed to fetch rating summary"}), 500


# GET /review/all - Get ALL reviews (admin only)
@review_bp.route('/all', methods=['GET'])
@jwt_required()
@cross_origin(origins=["http://localhost:3000",
                "http://127.0.0.1:3000",
                "https://herocloth.vercel.app",
                "https://herocloth-git-deploy-danielsdggs-projects.vercel.app",
                "https://herocloth-jza4vn2ab-danielsdggs-projects.vercel.app"], supports_credentials=True)
def get_all_reviews():
    current_user_id = get_jwt_identity()
    current_user = db.session.get(User, current_user_id)

    if not current_user or current_user.role != 'admin':
        return jsonify({"msg": "Admin access required"}), 403

    try:
        reviews = (
            Review.query
            .options(joinedload(Review.user), joinedload(Review.product))
            .order_by(Review.created_at.desc())
            .all()
        )

        serialized = []
        for r in reviews:
            serialized.append({
                "id": r.id,
                "product_id": r.product_id,
                "product_name": r.product.name if r.product else "Deleted",
                "rating": r.rating,
                "comment": r.comment or "",
                "created_at": r.created_at.isoformat(),
                "user": {
                    "id": r.user_id,
                    "firstname": r.user.firstname,
                    "lastname": r.user.lastname,
                    "email": r.user.email
                }
            })

        return jsonify(serialized), 200
    except Exception as e:
        current_app.logger.exception(f"Error fetching all reviews")
        return jsonify({"msg": "Failed to fetch reviews"}), 500