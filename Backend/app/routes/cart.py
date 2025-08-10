# app/routes/cart.py
from flask import Blueprint, request, jsonify
from app import db
from app.models.cart import CartItem
from app.models.product import Product
from flask_jwt_extended import jwt_required, get_jwt_identity

cart_bp = Blueprint('cart', __name__)

@cart_bp.route('/', methods=['GET'])
@cart_bp.route('', methods=['GET'])
@jwt_required()
def get_cart():
    current_user_id = get_jwt_identity()
    cart_items = CartItem.query.filter_by(user_id=current_user_id).all()
    return jsonify([{
        "id": item.id,
        "product_id": item.product_id,
        "product_name": item.product.name,
        "quantity": item.quantity,
        "price": item.product.price
    } for item in cart_items]), 200

@cart_bp.route('/add', methods=['POST'])
@jwt_required()
def add_to_cart():
    current_user_id = get_jwt_identity()
    data = request.get_json()
    product_id = data.get('product_id')
    quantity = data.get('quantity', 1)

    if not product_id or not isinstance(quantity, int) or quantity < 1:
        return jsonify({"msg": "Invalid product_id or quantity"}), 400

    product = Product.query.get(product_id)
    if not product:
        return jsonify({"msg": "Product not found"}), 404
    if product.stock < quantity:
        return jsonify({"msg": "Insufficient stock"}), 400

    cart_item = CartItem.query.filter_by(user_id=current_user_id, product_id=product_id).first()
    if cart_item:
        if product.stock < cart_item.quantity + quantity:
            return jsonify({"msg": "Insufficient stock for updated quantity"}), 400
        cart_item.quantity += quantity
    else:
        cart_item = CartItem(user_id=current_user_id, product_id=product_id, quantity=quantity)
        db.session.add(cart_item)
    
    product.stock -= quantity
    db.session.commit()
    return jsonify({"msg": "Product added to cart"}), 201

@cart_bp.route('/<int:cart_item_id>', methods=['PATCH'])
@jwt_required()
def update_cart_item(cart_item_id):
    current_user_id = get_jwt_identity()
    data = request.get_json()
    quantity = data.get('quantity')

    if not isinstance(quantity, int) or quantity < 1:
        return jsonify({"msg": "Invalid quantity"}), 400

    cart_item = CartItem.query.filter_by(id=cart_item_id, user_id=current_user_id).first()
    if not cart_item:
        return jsonify({"msg": "Cart item not found"}), 404

    product = Product.query.get(cart_item.product_id)
    if not product:
        return jsonify({"msg": "Product not found"}), 404
    quantity_diff = quantity - cart_item.quantity
    if product.stock < quantity_diff:
        return jsonify({"msg": "Insufficient stock"}), 400

    cart_item.quantity = quantity
    product.stock -= quantity_diff
    db.session.commit()
    return jsonify({"msg": "Cart item updated"}), 200

@cart_bp.route('/<int:cart_item_id>', methods=['DELETE'])
@jwt_required()
def remove_from_cart(cart_item_id):
    current_user_id = get_jwt_identity()
    cart_item = CartItem.query.filter_by(id=cart_item_id, user_id=current_user_id).first()
    if not cart_item:
        return jsonify({"msg": "Cart item not found"}), 404

    product = Product.query.get(cart_item.product_id)
    if product:
        product.stock += cart_item.quantity
    db.session.delete(cart_item)
    db.session.commit()
    return jsonify({"msg": "Cart item removed"}), 200

@cart_bp.route('/', methods=['DELETE'])
@cart_bp.route('', methods=['DELETE'])
@jwt_required()
def clear_cart():
    current_user_id = get_jwt_identity()
    cart_items = CartItem.query.filter_by(user_id=current_user_id).all()
    for item in cart_items:
        product = Product.query.get(item.product_id)
        if product:
            product.stock += item.quantity
    CartItem.query.filter_by(user_id=current_user_id).delete()
    db.session.commit()
    return jsonify({"msg": "Cart cleared"}), 200