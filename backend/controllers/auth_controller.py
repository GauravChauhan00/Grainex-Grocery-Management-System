"""Controller logic for authentication and account operations."""

import re
from flask import jsonify
from werkzeug.security import check_password_hash, generate_password_hash

from models import auth_model
from utils.auth import generate_token

import os

# Configurable super admin credentials
ADMIN_EMAIL = os.getenv("ADMIN_EMAIL", "admin@grainex.com")
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "adminpassword")

# Email format validator — must be something@something.tld
_EMAIL_RE = re.compile(r'^[\w.+\-]+@[\w\-]+\.[a-zA-Z]{2,}$')


def register_store(payload: dict):
    """Validate owner fields and register a new store tenant."""
    name = str(payload.get("store_name", "")).strip()
    owner_name = str(payload.get("owner_name", "")).strip()
    email = str(payload.get("email", "")).strip().lower()
    phone = str(payload.get("phone", "")).strip()
    password = str(payload.get("password", ""))

    if not name or not owner_name or not email or not password:
        return jsonify({"message": "All required fields must be filled."}), 400

    # Strict email format check
    if not _EMAIL_RE.match(email):
        return jsonify({"message": "Please enter a valid email address (e.g. name@gmail.com)."}), 400

    if len(password) < 6:
        return (
            jsonify({"message": "Password must be at least 6 characters long."}),
            400,
        )

    if email == ADMIN_EMAIL:
        return jsonify({"message": "This email address is reserved."}), 400

    if auth_model.store_exists_by_email(email):
        return (
            jsonify({"message": "A store owner with this email already exists."}),
            409,
        )

    if auth_model.store_exists_by_name(name):
        return jsonify({"message": "A store with this name already exists."}), 409

    password_hash = generate_password_hash(password)

    try:
        store_id = auth_model.create_store(
            {
                "name": name,
                "owner_name": owner_name,
                "email": email,
                "phone": phone,
                "password_hash": password_hash,
            }
        )

        user_payload = {
            "store_id": store_id,
            "role": "store_owner",
            "email": email,
            "name": owner_name,
            "store_name": name,
        }

        token = generate_token(user_payload)

        # Trigger admin notification email
        from utils.email import send_email
        from config import ADMIN_NOTIFICATION_EMAIL

        email_subject = f"New Store Registered: {name}"
        email_html = f"""
        <h3>New Store Registered on Grainex</h3>
        <p><strong>Store Name:</strong> {name}</p>
        <p><strong>Owner Name:</strong> {owner_name}</p>
        <p><strong>Email Address:</strong> {email}</p>
        <p><strong>Phone:</strong> {phone}</p>
        <p><strong>Store ID:</strong> #{store_id}</p>
        <br/>
        <p>— Grainex Autopilot Notifications</p>
        """
        send_email(ADMIN_NOTIFICATION_EMAIL, email_subject, email_html)

        return (
            jsonify(
                {
                    "message": "Store registered successfully.",
                    "token": token,
                    "user": user_payload,
                }
            ),
            201,
        )
    except Exception as e:
        return jsonify({"message": f"Registration failed: {str(e)}"}), 500


def login(payload: dict):
    """Authenticate either the super admin or a store owner."""
    email = str(payload.get("email", "")).strip().lower()
    password = str(payload.get("password", ""))

    if not email or not password:
        return jsonify({"message": "Email and password are required."}), 400

    # Validate email format (skip for admin login)
    if email != ADMIN_EMAIL and not _EMAIL_RE.match(email):
        return jsonify({"message": "Please enter a valid email address (e.g. name@gmail.com)."}), 400

    # 1. Super Admin authentication
    if email == ADMIN_EMAIL:
        if password == ADMIN_PASSWORD:
            user_payload = {
                "role": "admin",
                "email": ADMIN_EMAIL,
                "name": "System Admin",
            }
            token = generate_token(user_payload)
            return jsonify(
                {
                    "message": "Welcome back, Administrator.",
                    "token": token,
                    "user": user_payload,
                }
            )
        else:
            return jsonify({"message": "Invalid password for administrator."}), 401

    # 2. Store Owner tenant authentication
    store = auth_model.get_store_by_email(email)
    if not store:
        return jsonify({"message": "No account found with this email."}), 401

    if store["status"] == "suspended":
        return (
            jsonify(
                {
                    "message": "This store account has been suspended. Please contact customer support."
                }
            ),
            403,
        )

    if not check_password_hash(store["password_hash"], password):
        return jsonify({"message": "Invalid email or password."}), 401

    user_payload = {
        "store_id": store["id"],
        "role": "store_owner",
        "email": store["email"],
        "name": store["owner_name"],
        "store_name": store["name"],
    }

    token = generate_token(user_payload)

    return jsonify(
        {
            "message": f"Welcome back, {store['owner_name']}.",
            "token": token,
            "user": user_payload,
        }
    )


def forgot_password(payload: dict):
    """Simulate sending password reset instructions."""
    email = str(payload.get("email", "")).strip().lower()
    if not email:
        return jsonify({"message": "Email is required."}), 400

    if email == ADMIN_EMAIL:
        print(
            "\n[ADMIN RESET MOCK] http://localhost:5173/reset-password?role=admin\n"
        )
        return jsonify(
            {
                "message": "Password reset instructions have been logged in the console."
            }
        )

    store = auth_model.get_store_by_email(email)
    if not store:
        return jsonify({"message": "No account found with this email."}), 404

    print(
        f"\n[STORE OWNER RESET MOCK] http://localhost:5173/reset-password?store_id={store['id']}\n"
    )
    return jsonify(
        {"message": "Password reset link has been logged on the server console."}
    )


def submit_contact_form(payload: dict):
    """Receive a contact/feedback form and email it to the admin."""
    name = str(payload.get("name", "")).strip()
    email = str(payload.get("email", "")).strip()
    message = str(payload.get("message", "")).strip()

    if not name or not email or not message:
        return jsonify({"message": "Name, email, and message are required."}), 400

    from utils.email import send_email
    from config import ADMIN_NOTIFICATION_EMAIL

    subject = f"New Feedback/Contact from {name}"
    html_content = f"""
    <h3>New Grainex Contact Form Submission</h3>
    <p><strong>Sender Name:</strong> {name}</p>
    <p><strong>Sender Email:</strong> {email}</p>
    <p><strong>Message:</strong></p>
    <blockquote style="background: #f1f5f9; padding: 12px; border-left: 4px solid #cbd5e1; margin: 0;">
      {message}
    </blockquote>
    <br/>
    <p>— Grainex Public Support Nodes</p>
    """

    success = send_email(ADMIN_NOTIFICATION_EMAIL, subject, html_content)
    if success:
        return jsonify({"message": "Thank you! Your feedback has been sent to our developer."}), 200
    else:
        return jsonify({"message": "Feedback submitted successfully (simulated log generated)."}), 200

