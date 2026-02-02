from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
import requests
from datetime import datetime
from base64 import b64encode
import os

mpesa_bp = Blueprint('mpesa', __name__)

# ------------------ REPLACE THESE WITH YOUR REAL DARAJA CREDENTIALS ------------------
CONSUMER_KEY = "your_consumer_key"
CONSUMER_SECRET = "your_consumer_secret"
SHORTCODE = "174379"           # Sandbox test shortcode
PASSKEY = "your_passkey"       # Sandbox: "bfb279f9aa9bbd5a5b5e1f2d4f5e6d7f8g9h0i1j2k3l4m5n6o7p8q9r0s1t2u3v4w5x6y7z8"
CALLBACK_URL = "https://your-domain.com/mpesa/callback"  # Must be public HTTPS
# ------------------------------------------------------------------------------------

def get_access_token():
    url = "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials"
    auth = b64encode(f"{CONSUMER_KEY}:{CONSUMER_SECRET}".encode()).decode()
    headers = {"Authorization": f"Basic {auth}"}
    res = requests.get(url, headers=headers)
    return res.json()["access_token"]

@mpesa_bp.route('/stk-push', methods=['POST'])
@jwt_required()
def stk_push():
    current_user_id = get_jwt_identity()
    data = request.get_json()

    phone = data.get('phone')
    amount = data.get('amount')
    order_id = data.get('order_id')

    if not all([phone, amount]):
        return jsonify({"success": False, "message": "Missing phone or amount"}), 400

    # Format phone: must be 2547XXXXXXXX
    if phone.startswith("0"):
        phone = "254" + phone[1:]
    elif not phone.startswith("254"):
        return jsonify({"success": False, "message": "Invalid phone format"}), 400

    try:
        access_token = get_access_token()

        timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
        password_str = f"{SHORTCODE}{PASSKEY}{timestamp}"
        password = b64encode(password_str.encode()).decode()

        payload = {
            "BusinessShortCode": SHORTCODE,
            "Password": password,
            "Timestamp": timestamp,
            "TransactionType": "CustomerPayBillOnline",
            "Amount": str(int(amount)),
            "PartyA": phone,
            "PartyB": SHORTCODE,
            "PhoneNumber": phone,
            "CallBackURL": CALLBACK_URL,
            "AccountReference": f"Order-{order_id}",
            "TransactionDesc": f"Payment for order {order_id}"
        }

        headers = {"Authorization": f"Bearer {access_token}"}
        url = "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest"

        res = requests.post(url, json=payload, headers=headers)
        result = res.json()

        if result.get("ResponseCode") == "0":
            return jsonify({
                "success": True,
                "message": "STK Push initiated — check your phone",
                "checkout_request_id": result["CheckoutRequestID"]
            })
        else:
            return jsonify({"success": False, "message": result.get("errorMessage", "STK Push failed")}), 400

    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500