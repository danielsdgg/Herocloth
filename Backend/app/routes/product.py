# app/routes/product.py
from flask import Blueprint, jsonify, request
from app import db
from app.models.product import Product
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models.user import User

product_bp = Blueprint('product', __name__)

@product_bp.route('/', methods=['GET'])
@product_bp.route('', methods=['GET'])  # Handle both /product and /product/
def get_products():
    products = Product.query.all()
    return jsonify([{
        'id': p.id,
        'name': p.name,
        'description': p.description,
        'price': p.price,
        'stock': p.stock,
        'image1': p.image1,
        'image2': p.image2,
        'image3': p.image3
    } for p in products]), 200

@product_bp.route('/', methods=['POST'])
@product_bp.route('', methods=['POST'])
@jwt_required()
def create_product():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    if user.role != 'admin':
        return jsonify({"msg": "Admin access required"}), 403
    data = request.get_json()
    if not data.get('name') or not data.get('price') or not data.get('stock') or not data.get('image1'):
        return jsonify({"msg": "Missing required fields"}), 400
    if data.get('price') <= 0:
        return jsonify({"msg": "Price must be greater than 0"}), 400
    if data.get('stock') < 0:
        return jsonify({"msg": "Stock cannot be negative"}), 400
    product = Product(
        name=data['name'],
        description=data.get('description', ''),
        price=data['price'],
        stock=data['stock'],
        image1=data['image1'],
        image2=data.get('image2', ''),
        image3=data.get('image3', '')
    )
    db.session.add(product)
    db.session.commit()
    return jsonify({
        'id': product.id,
        'name': product.name,
        'description': product.description,
        'price': product.price,
        'stock': product.stock,
        'image1': product.image1,
        'image2': product.image2,
        'image3': product.image3
    }), 201

@product_bp.route('/<int:id>', methods=['PUT'])
@jwt_required()
def update_product(id):
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    if user.role != 'admin':
        return jsonify({"msg": "Admin access required"}), 403
    product = Product.query.get(id)
    if not product:
        return jsonify({"msg": "Product not found"}), 404
    data = request.get_json()
    if 'name' in data and not data['name']:
        return jsonify({"msg": "Product name is required"}), 400
    if 'price' in data and data['price'] <= 0:
        return jsonify({"msg": "Price must be greater than 0"}), 400
    if 'stock' in data and data['stock'] < 0:
        return jsonify({"msg": "Stock cannot be negative"}), 400
    product.name = data.get('name', product.name)
    product.description = data.get('description', product.description)
    product.price = data.get('price', product.price)
    product.stock = data.get('stock', product.stock)
    product.image1 = data.get('image1', product.image1)
    product.image2 = data.get('image2', product.image2)
    product.image3 = data.get('image3', product.image3)
    db.session.commit()
    return jsonify({
        'id': product.id,
        'name': product.name,
        'description': product.description,
        'price': product.price,
        'stock': product.stock,
        'image1': product.image1,
        'image2': product.image2,
        'image3': product.image3
    }), 200

@product_bp.route('/<int:id>', methods=['DELETE'])
@jwt_required()
def delete_product(id):
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    if user.role != 'admin':
        return jsonify({"msg": "Admin access required"}), 403
    product = Product.query.get(id)
    if not product:
        return jsonify({"msg": "Product not found"}), 404
    db.session.delete(product)
    db.session.commit()
    return jsonify({"msg": "Product deleted"}), 200