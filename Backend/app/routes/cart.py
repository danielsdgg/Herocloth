from flask import Blueprint, jsonify, current_app, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models.cart import Cart
from app.models.product import Product
from datetime import datetime
from flask_cors import cross_origin

cart_bp = Blueprint('cart', __name__)

@cart_bp.route('/', methods=['GET'])  # Changed from '/cart/'
@jwt_required()
@cross_origin(origins=["http://localhost:3000"], supports_credentials=True)
def get_cart():
    current_user_id = int(get_jwt_identity())
    try:
        cart_items = Cart.query.filter_by(user_id=current_user_id).all()
        cart_data = []
        for item in cart_items:
            product = Product.query.get(item.product_id)
            if not product:
                current_app.logger.warning(f"Product not found for cart item: {item.id}")
                continue
            cart_data.append({
                'id': item.id,
                'product_id': item.product_id,
                'product_name': product.name,
                'quantity': item.quantity,
                'price': float(product.price),
                'image1': product.image1
            })
        current_app.logger.info(f"Cart fetched for user_id: {current_user_id}")
        return jsonify(cart_data), 200
    except Exception as e:
        current_app.logger.error(f"Error fetching cart for user_id: {current_user_id}: {str(e)}")
        return jsonify({"msg": f"Internal server error: {str(e)}"}), 500

@cart_bp.route('/add', methods=['POST'])  # Changed from '/cart/add'
@jwt_required()
@cross_origin(origins=["http://localhost:3000"], supports_credentials=True)
def add_to_cart():
    current_user_id = int(get_jwt_identity())
    data = request.get_json()
    product_id = data.get('product_id')
    quantity = data.get('quantity', 1)

    if not product_id or not isinstance(quantity, int) or quantity <= 0:
        current_app.logger.warning(f"Invalid product_id or quantity: product_id={product_id}, quantity={quantity}")
        return jsonify({"msg": "Invalid product_id or quantity"}), 400

    product = Product.query.get(product_id)
    if not product:
        current_app.logger.warning(f"Product not found: product_id={product_id}")
        return jsonify({"msg": "Product not found"}), 404
    if product.stock < quantity:
        current_app.logger.warning(f"Insufficient stock for product_id={product_id}: requested={quantity}, available={product.stock}")
        return jsonify({"msg": "Insufficient stock"}), 400

    try:
        cart_item = Cart.query.filter_by(user_id=current_user_id, product_id=product_id).first()
        if cart_item:
            cart_item.quantity += quantity
            cart_item.updated_at = datetime.utcnow()
        else:
            cart_item = Cart(user_id=current_user_id, product_id=product_id, quantity=quantity)
            db.session.add(cart_item)
        db.session.commit()
        current_app.logger.info(f"Added to cart: user_id={current_user_id}, product_id={product_id}, quantity={quantity}")
        return jsonify({"msg": "Item added to cart"}), 200
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error adding to cart for user_id: {current_user_id}: {str(e)}")
        return jsonify({"msg": f"Internal server error: {str(e)}"}), 500

@cart_bp.route('/<int:cart_item_id>', methods=['PATCH'])
@jwt_required()
@cross_origin(origins=["http://localhost:3000"], supports_credentials=True)
def update_cart_item(cart_item_id):
    current_user_id = int(get_jwt_identity())
    data = request.get_json()
    quantity = data.get('quantity')

    if not isinstance(quantity, int) or quantity <= 0:
        current_app.logger.warning(f"Invalid quantity: cart_item_id={cart_item_id}, quantity={quantity}")
        return jsonify({"msg": "Invalid quantity"}), 400

    cart_item = Cart.query.filter_by(id=cart_item_id, user_id=current_user_id).first()
    if not cart_item:
        current_app.logger.warning(f"Cart item not found: cart_item_id={cart_item_id}, user_id={current_user_id}")
        return jsonify({"msg": "Cart item not found"}), 404

    product = Product.query.get(cart_item.product_id)
    if not product:
        current_app.logger.warning(f"Product not found for cart_item_id={cart_item_id}")
        return jsonify({"msg": "Product not found"}), 404
    if product.stock < quantity:
        current_app.logger.warning(f"Insufficient stock for product_id={cart_item.product_id}: requested={quantity}, available={product.stock}")
        return jsonify({"msg": "Insufficient stock"}), 400

    try:
        cart_item.quantity = quantity
        cart_item.updated_at = datetime.utcnow()
        db.session.commit()
        current_app.logger.info(f"Updated cart item: user_id={current_user_id}, cart_item_id={cart_item_id}, quantity={quantity}")
        return jsonify({"msg": "Cart item updated"}), 200
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error updating cart item for user_id: {current_user_id}: {str(e)}")
        return jsonify({"msg": f"Internal server error: {str(e)}"}), 500

@cart_bp.route('/<int:cart_item_id>', methods=['DELETE'])
@jwt_required()
@cross_origin(origins=["http://localhost:3000"], supports_credentials=True)
def delete_cart_item(cart_item_id):
    current_user_id = int(get_jwt_identity())
    cart_item = Cart.query.filter_by(id=cart_item_id, user_id=current_user_id).first()
    if not cart_item:
        current_app.logger.warning(f"Cart item not found: cart_item_id={cart_item_id}, user_id={current_user_id}")
        return jsonify({"msg": "Cart item not found"}), 404

    try:
        db.session.delete(cart_item)
        db.session.commit()
        current_app.logger.info(f"Deleted cart item: user_id={current_user_id}, cart_item_id={cart_item_id}")
        return jsonify({"msg": "Cart item deleted"}), 200
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error deleting cart item for user_id: {current_user_id}: {str(e)}")
        return jsonify({"msg": f"Internal server error: {str(e)}"}), 500

@cart_bp.route('/', methods=['DELETE'])  # Changed from '/cart/'
@jwt_required()
@cross_origin(origins=["http://localhost:3000"], supports_credentials=True)
def clear_cart():
    current_user_id = int(get_jwt_identity())
    try:
        Cart.query.filter_by(user_id=current_user_id).delete()
        db.session.commit()
        current_app.logger.info(f"Cleared cart for user_id: {current_user_id}")
        return jsonify({"msg": "Cart cleared"}), 200
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error clearing cart for user_id: {current_user_id}: {str(e)}")
        return jsonify({"msg": f"Internal server error: {str(e)}"}), 500