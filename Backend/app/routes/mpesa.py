from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
import requests
from datetime import datetime
from base64 import b64encode
import traceback

mpesa_bp = Blueprint('mpesa', __name__)

# ------------------ REAL DARAJA CREDENTIALS ------------------
CONSUMER_KEY = "yJFJXyZDVWa3YJCi4dco2Cv1gD2CxdnxAoD8vWD2gLDCVyYd"
CONSUMER_SECRET = "GcGyCfuRrzvLaMVo2ynxvKF8LIW0Ylf4sBOxnfFlU2QsEwGKuVivXtLtVTaydG56"
SHORTCODE = "174379"           # Sandbox test shortcode
PASSKEY = "bfb279f9aa9bbd5a5b5e1f2d4f5e6d7f8g9h0i1j2k3l4m5n6o7p8q9r0s1t2u3v4w5x6y7z8"
CALLBACK_URL = "https://your-domain.com/mpesa/callback"  # ← Replace with real public URL (ngrok or production)
# ------------------------------------------------------------------------------------

def get_access_token():
    try:
        url = "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials"
        auth = b64encode(f"{CONSUMER_KEY}:{CONSUMER_SECRET}".encode()).decode()
        headers = {"Authorization": f"Basic {auth}"}
        res = requests.get(url, headers=headers, timeout=10)
        res.raise_for_status()
        return res.json()["access_token"]
    except Exception as e:
        raise Exception(f"Failed to get access token: {str(e)}")

@mpesa_bp.route('/stk-push', methods=['POST'])
@jwt_required()
def stk_push():
    try:
        current_user_id = get_jwt_identity()
        data = request.get_json()

        # Get phone and force it to string right away
        phone = data.get('phone')
        amount = data.get('amount')
        order_id = data.get('order_id')

        if not all([phone, amount]):
            return jsonify({"success": False, "message": "Missing phone or amount"}), 400

        # Convert phone to string immediately (fixes int issue)
        phone = str(phone)

        # Format phone: must be 2547XXXXXXXX
        if phone.startswith("0"):
            phone = "254" + phone[1:]
        elif not phone.startswith("254"):
            return jsonify({"success": False, "message": "Invalid phone format. Use 2547XXXXXXXX"}), 400

        # Optional: basic length check
        if len(phone) != 12:
            return jsonify({"success": False, "message": "Phone number must be 12 digits (2547XXXXXXXX)"}), 400

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
            "AccountReference": f"Order-{order_id or 'test'}",
            "TransactionDesc": f"Payment for order {order_id or 'test'}"
        }

        headers = {"Authorization": f"Bearer {access_token}"}
        url = "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest"

        res = requests.post(url, json=payload, headers=headers, timeout=15)
        res.raise_for_status()  # Raise if HTTP error (e.g. 400/401/500 from Safaricom)
        result = res.json()

        if result.get("ResponseCode") == "0":
            return jsonify({
                "success": True,
                "message": "STK Push initiated — check your phone",
                "checkout_request_id": result.get("CheckoutRequestID"),
                "customer_message": result.get("CustomerMessage", "")
            })
        else:
            error_msg = result.get("errorMessage") or result.get("ResponseDescription") or "STK Push failed"
            return jsonify({"success": False, "message": error_msg}), 400

    except requests.exceptions.RequestException as req_err:
        return jsonify({
            "success": False,
            "message": f"Network error contacting Safaricom: {str(req_err)}"
        }), 502
    except Exception as e:
        print("MPESA CRITICAL ERROR:", str(e))
        print(traceback.format_exc())
        return jsonify({
            "success": False,
            "message": f"Server error: {str(e)}"
        }), 500