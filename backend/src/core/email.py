import logging
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

import aiosmtplib

from src.config import settings

logger = logging.getLogger(__name__)


async def send_invitation_email(
    to_email: str,
    invitee_name: str,
    workspace_name: str,
    temp_password: str,
    invited_by: str,
) -> bool:
    if not settings.smtp_user or not settings.smtp_password:
        logger.warning("Email credentials not configured — skipping invitation email.")
        return False

    login_url = "http://localhost:3000/login"

    subject = f"You've been invited to {workspace_name} on Camparc"

    html = f"""
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <style>
    body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f5f8ff; margin: 0; padding: 32px 0; }}
    .card {{ max-width: 520px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(46,107,228,0.10); }}
    .header {{ background: linear-gradient(135deg, #2e6be4, #5b8ef0); padding: 36px 40px 28px; text-align: center; }}
    .header h1 {{ color: #ffffff; font-size: 22px; font-weight: 700; margin: 0; letter-spacing: -0.3px; }}
    .header p {{ color: rgba(255,255,255,0.75); font-size: 13px; margin: 6px 0 0; }}
    .body {{ padding: 36px 40px; }}
    .body p {{ color: #374151; font-size: 14px; line-height: 1.65; margin: 0 0 16px; }}
    .creds {{ background: #f5f8ff; border: 1px solid #dbeafe; border-radius: 10px; padding: 18px 22px; margin: 24px 0; }}
    .creds table {{ width: 100%; border-collapse: collapse; }}
    .creds td {{ font-size: 13px; padding: 4px 0; }}
    .creds td:first-child {{ color: #6b7280; width: 110px; }}
    .creds td:last-child {{ color: #111827; font-weight: 600; word-break: break-all; }}
    .btn {{ display: block; width: fit-content; margin: 8px auto 0; background: linear-gradient(135deg, #2e6be4, #5b8ef0); color: #ffffff; font-weight: 700; font-size: 14px; text-decoration: none; padding: 13px 32px; border-radius: 10px; }}
    .footer {{ text-align: center; padding: 20px 40px 28px; }}
    .footer p {{ color: #9ca3af; font-size: 11px; margin: 0; }}
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <h1>You're invited to Camparc</h1>
      <p>{invited_by} has added you to <strong>{workspace_name}</strong></p>
    </div>
    <div class="body">
      <p>Hi {invitee_name},</p>
      <p>
        You've been invited to join the <strong>{workspace_name}</strong> workspace on Camparc —
        the campaign intelligence platform for managing and standardizing campaigns across ad platforms.
      </p>
      <p>Use the credentials below to sign in. You can change your password from your profile settings.</p>
      <div class="creds">
        <table>
          <tr><td>Email</td><td>{to_email}</td></tr>
          <tr><td>Password</td><td>{temp_password}</td></tr>
        </table>
      </div>
      <a href="{login_url}" class="btn">Sign in to Camparc →</a>
    </div>
    <div class="footer">
      <p>If you weren't expecting this invitation, you can safely ignore this email.</p>
    </div>
  </div>
</body>
</html>
"""

    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = settings.email_from or settings.smtp_user
    msg["To"] = to_email
    msg.attach(MIMEText(html, "html"))

    try:
        await aiosmtplib.send(
            msg,
            hostname=settings.smtp_host,
            port=settings.smtp_port,
            username=settings.smtp_user,
            password=settings.smtp_password,
            start_tls=True,
        )
        logger.info("Invitation email sent to %s", to_email)
        return True
    except Exception as exc:
        logger.error("Failed to send invitation email to %s: %s", to_email, exc)
        return False


async def send_password_reset_email(to_email: str, reset_url: str) -> bool:
    if not settings.smtp_user or not settings.smtp_password:
        logger.warning("Email credentials not configured — skipping password reset email.")
        return False

    subject = "Reset your Camparc password"

    html = f"""
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <style>
    body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f5f8ff; margin: 0; padding: 32px 0; }}
    .card {{ max-width: 520px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(46,107,228,0.10); }}
    .header {{ background: linear-gradient(135deg, #2e6be4, #5b8ef0); padding: 36px 40px 28px; text-align: center; }}
    .header h1 {{ color: #ffffff; font-size: 22px; font-weight: 700; margin: 0; letter-spacing: -0.3px; }}
    .body {{ padding: 36px 40px; }}
    .body p {{ color: #374151; font-size: 14px; line-height: 1.65; margin: 0 0 16px; }}
    .btn {{ display: block; width: fit-content; margin: 8px auto 0; background: linear-gradient(135deg, #2e6be4, #5b8ef0); color: #ffffff; font-weight: 700; font-size: 14px; text-decoration: none; padding: 13px 32px; border-radius: 10px; }}
    .footer {{ text-align: center; padding: 20px 40px 28px; }}
    .footer p {{ color: #9ca3af; font-size: 11px; margin: 0 0 4px; }}
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <h1>Reset your password</h1>
    </div>
    <div class="body">
      <p>We got a request to reset the password on your Camparc account.</p>
      <p>This link expires in 1 hour and can only be used once.</p>
      <a href="{reset_url}" class="btn">Reset password →</a>
    </div>
    <div class="footer">
      <p>If you didn't request this, you can safely ignore this email — your password won't change.</p>
      <p>{reset_url}</p>
    </div>
  </div>
</body>
</html>
"""

    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = settings.email_from or settings.smtp_user
    msg["To"] = to_email
    msg.attach(MIMEText(html, "html"))

    try:
        await aiosmtplib.send(
            msg,
            hostname=settings.smtp_host,
            port=settings.smtp_port,
            username=settings.smtp_user,
            password=settings.smtp_password,
            start_tls=True,
        )
        logger.info("Password reset email sent to %s", to_email)
        return True
    except Exception as exc:
        logger.error("Failed to send password reset email to %s: %s", to_email, exc)
        return False
