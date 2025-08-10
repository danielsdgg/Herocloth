from flask import Blueprint, request, jsonify
from flask_cors import cross_origin
from flask_jwt_extended import jwt_required
from app import db
from app.models.product import Product
from app.utils.jwt_utils import admin_required
import logging

product_bp = Blueprint('product', __name__)
logger = logging.getLogger(__name__)

# Create a new product (Admin only)
@product_bp.route('/', methods=['POST'])
@jwt_required()
@admin_required
@cross_origin(origins=["http://localhost:3000"], methods=["POST", "OPTIONS"], allow_headers=["Content-Type", "Authorization"])
def create_product():
    try:
        data = request.get_json()
        name = data.get('name')
        description = data.get('description')
        price = data.get('price')
        stock = data.get('stock')
        image1 = data.get('image1')
        image2 = data.get('image2')
        image3 = data.get('image3')

        if not name or not isinstance(price, (int, float)) or not isinstance(stock, int):
            logger.error("Missing or invalid required fields: name, price, or stock")
            return jsonify({"msg": "Missing or invalid required fields: name, price, stock"}), 400

        product = Product(
            name=name,
            description=description,
            price=price,
            stock=stock,
            image1=image1,
            image2=image2,
            image3=image3
        )
        db.session.add(product)
        db.session.commit()
        logger.debug(f"Product created: {product.name}")

        return jsonify({
            "msg": "Product created successfully",
            "product_id": product.id,
            "product": {
                "id": product.id,
                "name": product.name,
                "description": product.description,
                "price": product.price,
                "stock": product.stock,
                "image1": product.image1,
                "image2": product.image2,
                "image3": product.image3
            }
        }), 201
    except Exception as e:
        logger.error(f"Error creating product: {str(e)}")
        db.session.rollback()
        return jsonify({"msg": f"Server error: {str(e)}"}), 500

# Read all products (Public)
@product_bp.route('/', methods=['GET'])
@cross_origin(origins=["http://localhost:3000"], methods=["GET", "OPTIONS"], allow_headers=["Content-Type", "Authorization"])
def get_products():
    logger.debug("Handling GET request for /product")
    try:
        products = Product.query.all()
        if not products:
            logger.debug("No products found in database")
            return jsonify([]), 200
        return jsonify([{
            "id": p.id,
            "name": p.name,
            "description": p.description,
            "price": p.price,
            "stock": p.stock,
            "image1": p.image1,
            "image2": p.image2,
            "image3": p.image3
        } for p in products]), 200
    except Exception as e:
        logger.error(f"Error retrieving products: {str(e)}")
        return jsonify({"msg": f"Server error: {str(e)}"}), 500

# Read a single product by ID (Public)
@product_bp.route('/<int:id>', methods=['GET'])
@cross_origin(origins=["http://localhost:3000"], methods=["GET", "OPTIONS"], allow_headers=["Content-Type", "Authorization"])
def get_product(id):
    try:
        product = Product.query.get(id)
        if not product:
            logger.debug(f"Product with ID {id} not found")
            return jsonify({"msg": "Product not found"}), 404
        return jsonify({
            "id": product.id,
            "name": product.name,
            "description": product.description,
            "price": product.price,
            "stock": product.stock,
            "image1": product.image1,
            "image2": product.image2,
            "image3": product.image3
        }), 200
    except Exception as e:
        logger.error(f"Error retrieving product {id}: {str(e)}")
        return jsonify({"msg": f"Server error: {str(e)}"}), 500

# Update a product by ID (Admin only)
@product_bp.route('/<int:id>', methods=['PUT'])
@jwt_required()
@admin_required
@cross_origin(origins=["http://localhost:3000"], methods=["PUT", "OPTIONS"], allow_headers=["Content-Type", "Authorization"])
def update_product(id):
    try:
        product = Product.query.get(id)
        if not product:
            logger.debug(f"Product with ID {id} not found")
            return jsonify({"msg": "Product not found"}), 404

        data = request.get_json()
        name = data.get('name')
        description = data.get('description')
        price = data.get('price')
        stock = data.get('stock')
        image1 = data.get('image1')
        image2 = data.get('image2')
        image3 = data.get('image3')

        if name and name != product.name:
            product.name = name
        if description is not None:
            product.description = description
        if price is not None and isinstance(price, (int, float)):
            product.price = price
        if stock is not None and isinstance(stock, int):
            product.stock = stock
        if image1:
            product.image1 = image1
        if image2:
            product.image2 = image2
        if image3:
            product.image3 = image3

        db.session.commit()
        logger.debug(f"Product updated: {product.name}")

        return jsonify({
            "msg": "Product updated successfully",
            "product": {
                "id": product.id,
                "name": product.name,
                "description": product.description,
                "price": product.price,
                "stock": product.stock,
                "image1": product.image1,
                "image2": product.image2,
                "image3": product.image3
            }
        }), 200
    except Exception as e:
        logger.error(f"Error updating product {id}: {str(e)}")
        db.session.rollback()
        return jsonify({"msg": f"Server error: {str(e)}"}), 500

# Delete a product by ID (Admin only)
@product_bp.route('/<int:id>', methods=['DELETE'])
@jwt_required()
@admin_required
@cross_origin(origins=["http://localhost:3000"], methods=["DELETE", "OPTIONS"], allow_headers=["Content-Type", "Authorization"])
def delete_product(id):
    try:
        product = Product.query.get(id)
        if not product:
            logger.debug(f"Product with ID {id} not found")
            return jsonify({"msg": "Product not found"}), 404

        db.session.delete(product)
        db.session.commit()
        logger.debug(f"Product deleted: ID {id}")

        return jsonify({"msg": "Product deleted successfully"}), 200
    except Exception as e:
        logger.error(f"Error deleting product {id}: {str(e)}")
        db.session.rollback()
        return jsonify({"msg": f"Server error: {str(e)}"}), 500