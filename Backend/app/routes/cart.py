# app/routes/cart.py
from flask import Blueprint, request, jsonify
from app import db
from app.models.cart import CartItem
from app.models.product import Product
from flask_jwt_extended import jwt_required, get_jwt_identity

cart_bp = Blueprint('cart', __name__)

@cart_bp.route('/add', methods=['POST'])
@jwt_required()
def add_to_cart():
    current_user_id = get_jwt_identity()
    data = request.get_json()
    product_id = data.get('product_id')
    quantity = data.get('quantity', 1)

    product = Product.query.get(product_id)
    if not product:
        return jsonify({"msg": "Product not found"}), 404
    if product.stock < quantity:
        return jsonify({"msg": "Insufficient stock"}), 400

    cart_item = CartItem.query.filter_by(user_id=current_user_id, product_id=product_id).first()
    if cart_item:
        cart_item.quantity += quantity
    else:
        cart_item = CartItem(user_id=current_user_id, product_id=product_id, quantity=quantity)
        db.session.add(cart_item)
    
    db.session.commit()
    return jsonify({"msg": "Product added to cart"}), 201

@cart_bp.route('/', methods=['GET'])
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