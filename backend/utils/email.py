import os
import smtplib
import ssl as ssl_lib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart


def send_email(to_email: str, subject: str, html_content: str) -> bool:
    """
    Send email via Gmail SMTP (primary) with Resend as fallback.
    Set GMAIL_USER and GMAIL_APP_PASSWORD in .env to activate Gmail SMTP.
    """
    gmail_user = os.environ.get("GMAIL_USER", "").strip()
    gmail_app_password = os.environ.get("GMAIL_APP_PASSWORD", "").strip()

    # ── Gmail SMTP path ──────────────────────────────────────────────────────
    if gmail_user and gmail_app_password:
        try:
            msg = MIMEMultipart("alternative")
            msg["Subject"] = subject
            msg["From"] = f"Grainex <{gmail_user}>"
            msg["To"] = to_email
            msg.attach(MIMEText(html_content, "html"))

            ctx = ssl_lib.create_default_context()
            with smtplib.SMTP_SSL("smtp.gmail.com", 465, context=ctx) as server:
                server.login(gmail_user, gmail_app_password)
                server.sendmail(gmail_user, to_email, msg.as_string())

            print(f"[EMAIL SENT ✓ via Gmail] To={to_email} | Subject={subject}")
            return True
        except Exception as e:
            print(f"[GMAIL SMTP ERROR] {e}")
            # fall through to Resend

    # ── Resend API fallback ──────────────────────────────────────────────────
    import urllib.request, json, ssl as _ssl
    resend_key = os.environ.get("RESEND_API_KEY", "").strip()

    if resend_key:
        payload = {
            "from": "Grainex <onboarding@resend.dev>",
            "to": [to_email],
            "subject": subject,
            "html": html_content,
        }
        req = urllib.request.Request(
            "https://api.resend.com/emails",
            data=json.dumps(payload).encode(),
            headers={
                "Authorization": f"Bearer {resend_key}",
                "Content-Type": "application/json",
            },
            method="POST",
        )
        try:
            ctx = _ssl._create_unverified_context()
            with urllib.request.urlopen(req, context=ctx) as r:
                body = r.read().decode()
                print(f"[EMAIL SENT ✓ via Resend] To={to_email} | Response={body}")
                return True
        except urllib.error.HTTPError as e:
            print(f"[RESEND HTTP ERROR] {e.code} | {e.read().decode()}")
        except Exception as e:
            print(f"[RESEND ERROR] {e}")

    # ── Console fallback (no credentials set) ────────────────────────────────
    print("\n" + "=" * 80)
    print("[EMAIL — CONSOLE FALLBACK (no credentials configured)]")
    print(f"Recipient : {to_email}")
    print(f"Subject   : {subject}")
    print(f"Body      : {html_content[:300]}")
    print("=" * 80 + "\n")
    return False
