from flask import Blueprint, jsonify, request, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models.order import Order, OrderItem
from app.models.cart import Cart
from app.models.user import User
from app.models.product import Product
from flask_cors import cross_origin
from datetime import datetime

order_bp = Blueprint('order', __name__)

@order_bp.route('/create', methods=['POST'])
@jwt_required()
@cross_origin(origins=["http://localhost:3000"], supports_credentials=True)
def create_order():
    current_user_id = get_jwt_identity()
    user = db.session.get(User, current_user_id)
    if not user:
        return jsonify({"msg": "User not found"}), 404

    data = request.get_json()
    if not data:
        return jsonify({"msg": "Invalid JSON payload"}), 400

    required_fields = ['payment_method', 'payment_timing', 'delivery_option']
    missing = [f for f in required_fields if f not in data or not data[f]]
    if missing:
        return jsonify({"msg": f"Missing required fields: {', '.join(missing)}"}), 400

    payment_method = data['payment_method']
    payment_timing = data['payment_timing']
    delivery_option = data['delivery_option']

    # Optional fields
    mpesa_phone = data.get('mpesa_phone')
    card_details = data.get('card_details')
    street = data.get('street')
    city = data.get('city')
    county = data.get('county')
    postal_code = data.get('postal_code')
    instructions = data.get('instructions')
    contact_phone = data.get('contact_phone')
    notes = data.get('notes')

    # Validate payment method specific fields
    if payment_method == 'mpesa' and not mpesa_phone:
        return jsonify({"msg": "M-Pesa phone number is required for M-Pesa payments"}), 400

    if payment_method == 'card' and not card_details:
        return jsonify({"msg": "Card details are required for card payments"}), 400

    # Fetch cart items
    cart_items = Cart.query.filter_by(user_id=current_user_id).all()
    if not cart_items:
        return jsonify({"msg": "Cart is empty"}), 400

    # Calculate amounts
    subtotal = sum(item.product.price * item.quantity for item in cart_items)
    delivery_fee = 200.0 if delivery_option == 'nairobi' else 0.0
    total_amount = subtotal + delivery_fee

    # Set initial status
    initial_status = 'pending' if payment_timing == 'prepay' else 'cod'

    order = Order(
        user_id=current_user_id,
        status=initial_status,
        payment_method=payment_method,
        payment_timing=payment_timing,
        delivery_option=delivery_option,
        delivery_fee=delivery_fee,
        total_amount=total_amount,
        mpesa_phone=mpesa_phone if payment_method == 'mpesa' else None,
        card_details=card_details if payment_method == 'card' else None,
        street=street,
        city=city,
        county=county,
        postal_code=postal_code,
        instructions=instructions,
        contact_phone=contact_phone,
        notes=notes,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )

    db.session.add(order)
    db.session.flush()  # Ensure order.id is available

    # Add order items (snapshot prices)
    for cart_item in cart_items:
        order_item = OrderItem(
            order_id=order.id,
            product_id=cart_item.product_id,
            quantity=cart_item.quantity,
            price=cart_item.product.price  # Snapshot at time of order
        )
        db.session.add(order_item)

    # Clear user's cart
    Cart.query.filter_by(user_id=current_user_id).delete()

    db.session.commit()

    current_app.logger.info(
        f"Order created: id={order.id}, user={current_user_id}, "
        f"total={total_amount}, status={initial_status}, timing={payment_timing}"
    )

    return jsonify({
        "msg": "Order created successfully",
        "order_id": order.id,
        "total": total_amount,
        "status": initial_status
    }), 201


@order_bp.route('/my-orders', methods=['GET'])
@jwt_required()
@cross_origin(origins=["http://localhost:3000"], supports_credentials=True)
def get_my_orders():
    current_user_id = get_jwt_identity()
    orders = Order.query.filter_by(user_id=current_user_id).order_by(Order.created_at.desc()).all()

    return jsonify([{
        "id": o.id,
        "status": o.status,
        "total": float(o.total_amount),  # ensure float serialization
        "created_at": o.created_at.isoformat(),
        "items": [{
            "product_name": i.product.name,
            "quantity": i.quantity,
            "price": float(i.price)
        } for i in o.items]
    } for o in orders]), 200


@order_bp.route('/<int:id>', methods=['GET'])
@jwt_required()
@cross_origin(origins=["http://localhost:3000"], supports_credentials=True)
def get_order(id):
    current_user_id = get_jwt_identity()
    order = db.session.get(Order, id)

    if not order or order.user_id != current_user_id:
        return jsonify({"msg": "Order not found or unauthorized"}), 404

    return jsonify({
        "id": order.id,
        "status": order.status,
        "payment_method": order.payment_method,
        "payment_timing": order.payment_timing,
        "delivery_option": order.delivery_option,
        "delivery_fee": float(order.delivery_fee),
        "total": float(order.total_amount),
        "created_at": order.created_at.isoformat(),
        "items": [{
            "product_name": i.product.name,
            "quantity": i.quantity,
            "price": float(i.price)
        } for i in order.items]
    }), 200


@order_bp.route('/all', methods=['GET'])
@jwt_required()
@cross_origin(origins=["http://localhost:3000"], supports_credentials=True)
def get_all_orders():
    current_user_id = get_jwt_identity()
    admin = db.session.get(User, current_user_id)

    if not admin or admin.role != 'admin':
        return jsonify({"msg": "Admin access required"}), 403

    orders = Order.query.order_by(Order.created_at.desc()).all()

    return jsonify([{
        "id": o.id,
        "user_name": f"{o.user.firstname} {o.user.lastname}",
        "status": o.status,
        "total": float(o.total_amount),
        "created_at": o.created_at.isoformat()
    } for o in orders]), 200


@order_bp.route('/<int:id>/update-status', methods=['PATCH'])
@jwt_required()
@cross_origin(origins=["http://localhost:3000"], supports_credentials=True)
def update_order_status(id):
    current_user_id = get_jwt_identity()
    admin = db.session.get(User, current_user_id)

    if not admin or admin.role != 'admin':
        return jsonify({"msg": "Admin access required"}), 403

    order = db.session.get(Order, id)
    if not order:
        return jsonify({"msg": "Order not found"}), 404

    data = request.get_json()
    if not data or 'status' not in data:
        return jsonify({"msg": "Missing status field"}), 400

    new_status = data['status']
    valid_statuses = ['pending', 'paid', 'cod', 'shipped', 'delivered', 'cancelled']

    if new_status not in valid_statuses:
        return jsonify({"msg": f"Invalid status. Must be one of: {', '.join(valid_statuses)}"}), 400

    order.status = new_status
    order.updated_at = datetime.utcnow()
    db.session.commit()

    current_app.logger.info(f"Order {id} status updated to {new_status} by admin {current_user_id}")

    return jsonify({"msg": "Order status updated successfully"}), 200