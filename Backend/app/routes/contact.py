from flask import Blueprint, jsonify, request, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from flask_mail import Message
from app import db, mail
from app.models.contact import Contact
from app.models.user import User
from flask_cors import cross_origin
from datetime import datetime

contact_bp = Blueprint('contact', __name__)

# POST /contact - Submit contact form (public, optional auth, sends formatted email)
@contact_bp.route('/contact', methods=['POST'])
@jwt_required(optional=True)
@cross_origin(origins=["http://localhost:3000"], supports_credentials=True)
def submit_contact():
    data = request.get_json()
    name = data.get('name')
    email = data.get('email')          # Now captured from frontend
    subject = data.get('subject')
    message = data.get('message')

    if not name or not subject or not message:
        return jsonify({"msg": "Name, subject, and message are required"}), 400

    user_id = get_jwt_identity()  # Will be None if not authenticated

    contact = Contact(
        name=name,
        email=email,                   # Now stored in DB
        subject=subject,
        message=message,
        user_id=user_id
    )

    try:
        db.session.add(contact)
        db.session.commit()

        # Beautiful HTML email for Gmail
        html_body = f"""
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>New Contact Message - Herocloth</title>
          <style>
            body {{ font-family: 'Helvetica Neue', Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4; color: #333; line-height: 1.6; }}
            .container {{ max-width: 600px; margin: 30px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 8px 30px rgba(0,0,0,0.1); }}
            .header {{ background: linear-gradient(135deg, #111111, #1a1a1a); color: white; padding: 40px 50px; text-align: center; }}
            .header h1 {{ margin: 0; font-size: 32px; font-weight: 300; letter-spacing: 2px; }}
            .content {{ padding: 40px 50px; }}
            .label {{ font-weight: 600; color: #444; margin-bottom: 6px; display: block; font-size: 14px; text-transform: uppercase; letter-spacing: 0.8px; }}
            .value {{ margin: 0 0 24px 0; font-size: 16px; color: #222; }}
            .message-box {{ background: #fafafa; padding: 24px; border-left: 5px solid #111111; border-radius: 6px; white-space: pre-wrap; font-size: 15px; line-height: 1.7; }}
            .button {{ display: inline-block; margin: 20px 0 30px; padding: 14px 36px; background: #111111; color: white; text-decoration: none; border-radius: 6px; font-weight: 500; font-size: 15px; transition: background 0.3s; }}
            .button:hover {{ background: #222222; }}
            .footer {{ background: #f8f8f8; padding: 24px 50px; text-align: center; font-size: 13px; color: #777; border-top: 1px solid #eee; }}
            .footer a {{ color: #111111; text-decoration: none; }}
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>New Contact Message</h1>
            </div>
            <div class="content">
              <span class="label">From</span>
              <p class="value">{name}</p>

              <span class="label">Email Address</span>
              <p class="value">{email if email else 'Not provided'}</p>

              <span class="label">User ID</span>
              <p class="value">{user_id if user_id else 'Guest (not logged in)'}</p>

              <span class="label">Subject</span>
              <p class="value">{subject}</p>

              <span class="label">Message</span>
              <div class="message-box">
                {message.replace('\n', '<br>')}
              </div>

              {f'<a href="mailto:{email}?subject=Re:%20{subject.replace(" ", "%20")}" class="button">Reply to {name}</a>' if email else '<p class="value">Reply not possible (email not provided)</p>'}
            </div>
            <div class="footer">
              Received on {datetime.utcnow().strftime('%B %d, %Y at %I:%M %p UTC')} via Herocloth Contact Form<br>
              <a href="https://herocloth.com">herocloth.com</a>
            </div>
          </div>
        </body>
        </html>
        """

        # Plain text fallback
        plain_body = f"""
New Contact Form Submission
============================

From: {name}
Email: {email if email else 'Not provided'}
User ID: {user_id or 'Guest (not logged in)'}
Subject: {subject}

Message:
{message}

Reply directly: {f"mailto:{email}?subject=Re: {subject}" if email else 'Email not provided'}
Received: {datetime.utcnow().strftime('%B %d, %Y at %I:%M %p UTC')}
        """

        msg = Message(
            subject=f"New Contact: {subject}",
            recipients=['danieldeploys@gmail.com'],
            sender=('Herocloth Contact Form', 'danieldeploys@gmail.com'),
            body=plain_body,
            html=html_body
        )
        mail.send(msg)

        current_app.logger.info(f"Contact submitted: id={contact.id}, subject={subject}")
        return jsonify({"msg": "Message sent successfully! We'll get back to you soon."}), 201

    except Exception as e:
        db.session.rollback()
        current_app.logger.exception(f"Error submitting contact: {str(e)}")
        return jsonify({"msg": "Failed to send message"}), 500


# GET /contact/all - Get all submissions (admin only)
@contact_bp.route('/contact/all', methods=['GET'])
@jwt_required()
@cross_origin(origins=["http://localhost:3000"], supports_credentials=True)
def get_all_contacts():
    current_user_id = get_jwt_identity()
    user = db.session.get(User, current_user_id)
    if not user or user.role != 'admin':
        return jsonify({"msg": "Admin access required"}), 403

    try:
        contacts = Contact.query.order_by(Contact.created_at.desc()).all()
        serialized = [
            {
                "id": c.id,
                "name": c.name,
                "email": c.email,               # Now available since we added it to model
                "subject": c.subject,
                "message": c.message,
                "created_at": c.created_at.isoformat(),
                "user_id": c.user_id
            } for c in contacts
        ]
        return jsonify(serialized), 200
    except Exception as e:
        current_app.logger.exception("Error fetching contacts")
        return jsonify({"msg": "Failed to fetch contacts"}), 500


# GET /contact/<int:id> - Get single submission (admin or owner)
@contact_bp.route('/contact/<int:id>', methods=['GET'])
@jwt_required()
@cross_origin(origins=["http://localhost:3000"], supports_credentials=True)
def get_contact(id):
    current_user_id = get_jwt_identity()
    user = db.session.get(User, current_user_id)
    contact = db.session.get(Contact, id)
    if not contact:
        return jsonify({"msg": "Contact not found"}), 404

    if user.role != 'admin' and contact.user_id != current_user_id:
        return jsonify({"msg": "Access denied"}), 403

    return jsonify({
        "id": contact.id,
        "name": contact.name,
        "email": contact.email,
        "subject": contact.subject,
        "message": contact.message,
        "created_at": contact.created_at.isoformat(),
        "user_id": contact.user_id
    }), 200


# PUT /contact/<int:id> - Update submission (admin only)
@contact_bp.route('/contact/<int:id>', methods=['PUT'])
@jwt_required()
@cross_origin(origins=["http://localhost:3000"], supports_credentials=True)
def update_contact(id):
    current_user_id = get_jwt_identity()
    user = db.session.get(User, current_user_id)
    if not user or user.role != 'admin':
        return jsonify({"msg": "Admin access required"}), 403

    contact = db.session.get(Contact, id)
    if not contact:
        return jsonify({"msg": "Contact not found"}), 404

    data = request.get_json()
    contact.name = data.get('name', contact.name)
    contact.email = data.get('email', contact.email)   # Now updatable
    contact.subject = data.get('subject', contact.subject)
    contact.message = data.get('message', contact.message)

    try:
        db.session.commit()
        return jsonify({"msg": "Contact updated"}), 200
    except Exception as e:
        db.session.rollback()
        current_app.logger.exception(f"Error updating contact {id}")
        return jsonify({"msg": "Failed to update"}), 500


# DELETE /contact/<int:id> - Delete submission (admin only)
@contact_bp.route('/contact/<int:id>', methods=['DELETE'])
@jwt_required()
@cross_origin(origins=["http://localhost:3000"], supports_credentials=True)
def delete_contact(id):
    current_user_id = get_jwt_identity()
    user = db.session.get(User, current_user_id)
    if not user or user.role != 'admin':
        return jsonify({"msg": "Admin access required"}), 403

    contact = db.session.get(Contact, id)
    if not contact:
        return jsonify({"msg": "Contact not found"}), 404

    try:
        db.session.delete(contact)
        db.session.commit()
        return jsonify({"msg": "Contact deleted"}), 200
    except Exception as e:
        db.session.rollback()
        current_app.logger.exception(f"Error deleting contact {id}")
        return jsonify({"msg": "Failed to delete"}), 500