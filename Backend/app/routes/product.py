from flask import Blueprint, jsonify, request, current_app
from app import db
from app.models.product import Product
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models.user import User
from flask_cors import cross_origin

product_bp = Blueprint('product', __name__)

@product_bp.route('/', methods=['GET'])
@product_bp.route('', methods=['GET'])
@cross_origin(origins=["http://localhost:3000"], supports_credentials=True)
def get_products():
    try:
        products = Product.query.all()
        return jsonify([{
            'id': p.id,
            'name': p.name,
            'description': p.description,
            'price': float(p.price),
            'stock': int(p.stock),
            'image1': p.image1,
            'image2': p.image2,
            'image3': p.image3
        } for p in products]), 200
    except Exception as e:
        current_app.logger.error(f"Error fetching products: {str(e)}")
        return jsonify({"msg": f"Internal server error: {str(e)}"}), 500

@product_bp.route('/<int:id>', methods=['GET'])
@cross_origin(origins=["http://localhost:3000"], supports_credentials=True)
def get_product(id):
    try:
        product = Product.query.get(id)
        if not product:
            current_app.logger.warning(f"Product not found: id={id}")
            return jsonify({"msg": "Product not found"}), 404
        return jsonify({
            'id': product.id,
            'name': product.name,
            'description': product.description,
            'price': float(product.price),
            'stock': int(product.stock),
            'image1': product.image1,
            'image2': product.image2,
            'image3': product.image3
        }), 200
    except Exception as e:
        current_app.logger.error(f"Error fetching product {id}: {str(e)}")
        return jsonify({"msg": f"Internal server error: {str(e)}"}), 500

@product_bp.route('/', methods=['POST'])
@product_bp.route('', methods=['POST'])
@jwt_required()
@cross_origin(origins=["http://localhost:3000"], supports_credentials=True)
def create_product():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    if user.role != 'admin':
        current_app.logger.warning(f"Admin access denied for user_id: {current_user_id}")
        return jsonify({"msg": "Admin access required"}), 403
    data = request.get_json()
    if not data.get('name') or not data.get('price') or not data.get('stock') or not data.get('image1'):
        current_app.logger.warning(f"Missing required fields in create_product: {data}")
        return jsonify({"msg": "Missing required fields"}), 400
    if data.get('price') <= 0:
        current_app.logger.warning(f"Invalid price in create_product: {data.get('price')}")
        return jsonify({"msg": "Price must be greater than 0"}), 400
    if data.get('stock') < 0:
        current_app.logger.warning(f"Invalid stock in create_product: {data.get('stock')}")
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
    try:
        db.session.add(product)
        db.session.commit()
        current_app.logger.info(f"Product created: id={product.id}, name={product.name}")
        return jsonify({
            'id': product.id,
            'name': product.name,
            'description': product.description,
            'price': float(product.price),
            'stock': int(product.stock),
            'image1': product.image1,
            'image2': product.image2,
            'image3': product.image3
        }), 201
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error creating product: {str(e)}")
        return jsonify({"msg": f"Internal server error: {str(e)}"}), 500

@product_bp.route('/<int:id>', methods=['PUT'])
@jwt_required()
@cross_origin(origins=["http://localhost:3000"], supports_credentials=True)
def update_product(id):
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    if user.role != 'admin':
        current_app.logger.warning(f"Admin access denied for user_id: {current_user_id}")
        return jsonify({"msg": "Admin access required"}), 403
    product = Product.query.get(id)
    if not product:
        current_app.logger.warning(f"Product not found: id={id}")
        return jsonify({"msg": "Product not found"}), 404
    data = request.get_json()
    if 'name' in data and not data['name']:
        current_app.logger.warning(f"Invalid product name: {data.get('name')}")
        return jsonify({"msg": "Product name is required"}), 400
    if 'price' in data and data['price'] <= 0:
        current_app.logger.warning(f"Invalid price: {data.get('price')}")
        return jsonify({"msg": "Price must be greater than 0"}), 400
    if 'stock' in data and data['stock'] < 0:
        current_app.logger.warning(f"Invalid stock: {data.get('stock')}")
        return jsonify({"msg": "Stock cannot be negative"}), 400
    product.name = data.get('name', product.name)
    product.description = data.get('description', product.description)
    product.price = data.get('price', product.price)
    product.stock = data.get('stock', product.stock)
    product.image1 = data.get('image1', product.image1)
    product.image2 = data.get('image2', product.image2)
    product.image3 = data.get('image3', product.image3)
    try:
        db.session.commit()
        current_app.logger.info(f"Product updated: id={id}, name={product.name}")
        return jsonify({
            'id': product.id,
            'name': product.name,
            'description': product.description,
            'price': float(product.price),
            'stock': int(product.stock),
            'image1': product.image1,
            'image2': product.image2,
            'image3': product.image3
        }), 200
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error updating product {id}: {str(e)}")
        return jsonify({"msg": f"Internal server error: {str(e)}"}), 500

@product_bp.route('/<int:id>', methods=['DELETE'])
@jwt_required()
@cross_origin(origins=["http://localhost:3000"], supports_credentials=True)
def delete_product(id):
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    if user.role != 'admin':
        current_app.logger.warning(f"Admin access denied for user_id: {current_user_id}")
        return jsonify({"msg": "Admin access required"}), 403
    product = Product.query.get(id)
    if not product:
        current_app.logger.warning(f"Product not found: id={id}")
        return jsonify({"msg": "Product not found"}), 404
    try:
        db.session.delete(product)
        db.session.commit()
        current_app.logger.info(f"Product deleted: id={id}")
        return jsonify({"msg": "Product deleted"}), 200
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error deleting product {id}: {str(e)}")
        return jsonify({"msg": f"Internal server error: {str(e)}"}), 500