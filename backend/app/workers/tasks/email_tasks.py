"""
LearnGraph — Celery Email Tasks
Async email delivery tasks executed by Celery workers.
Uses Python's smtplib with TLS for SMTP, with Jinja2-style f-string templates.
"""

import smtplib
import ssl
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from typing import Optional

import structlog

from app.core.config import settings
from app.workers.celery_app import celery_app

logger = structlog.get_logger(__name__)


# ── SMTP Helper ───────────────────────────────────────────────────────────────


def _send_smtp_email(
    to_email: str,
    subject: str,
    html_body: str,
    plain_body: Optional[str] = None,
) -> None:
    """
    Send a single email via SMTP with STARTTLS.

    Args:
        to_email: Recipient email address.
        subject: Email subject line.
        html_body: HTML version of the email body.
        plain_body: Optional plain-text fallback; generated from html_body if omitted.
    """
    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = f"{settings.EMAIL_FROM_NAME} <{settings.EMAIL_FROM}>"
    msg["To"] = to_email

    if plain_body is None:
        # Minimal HTML-stripping fallback
        import re
        plain_body = re.sub(r"<[^>]+>", "", html_body).strip()

    msg.attach(MIMEText(plain_body, "plain", "utf-8"))
    msg.attach(MIMEText(html_body, "html", "utf-8"))

    context = ssl.create_default_context()
    with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
        server.ehlo()
        server.starttls(context=context)
        server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
        server.sendmail(settings.EMAIL_FROM, to_email, msg.as_string())


# ── Task: Verification Email ──────────────────────────────────────────────────


@celery_app.task(
    name="app.workers.tasks.email_tasks.send_verification_email",
    bind=True,
    max_retries=3,
    default_retry_delay=60,
    queue="email_queue",
)
def send_verification_email(
    self,
    user_id: str,
    email: str,
    token: str,
) -> None:
    """
    Send an email-address verification link to a newly registered user.

    Args:
        user_id: UUID string of the user (used for logging context).
        email: Recipient email address.
        token: Short-lived JWT verification token.
    """
    verify_url = f"{settings.FRONTEND_URL}/verify-email?token={token}" if hasattr(settings, "FRONTEND_URL") else f"http://localhost:3000/verify-email?token={token}"

    html_body = f"""
    <!DOCTYPE html>
    <html>
    <body style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 24px;">
      <h2 style="color: #4F46E5;">Welcome to LearnGraph 🎓</h2>
      <p>Please verify your email address to activate your account.</p>
      <a href="{verify_url}"
         style="display:inline-block; padding: 12px 24px; background:#4F46E5; color:#fff;
                text-decoration:none; border-radius:6px; margin: 16px 0;">
        Verify My Email
      </a>
      <p style="color:#6B7280; font-size:12px;">
        This link expires in 24 hours. If you did not create an account, ignore this email.
      </p>
      <hr style="border:none; border-top:1px solid #E5E7EB;" />
      <p style="color:#9CA3AF; font-size:11px;">LearnGraph · AI-powered adaptive learning</p>
    </body>
    </html>
    """

    try:
        _send_smtp_email(
            to_email=email,
            subject="Verify your LearnGraph email address",
            html_body=html_body,
        )
        logger.info(
            "Verification email sent",
            user_id=user_id,
            email=email,
        )
    except Exception as exc:
        logger.error(
            "Failed to send verification email",
            user_id=user_id,
            email=email,
            error=str(exc),
        )
        raise self.retry(exc=exc)


# ── Task: Password Reset Email ────────────────────────────────────────────────


@celery_app.task(
    name="app.workers.tasks.email_tasks.send_password_reset_email",
    bind=True,
    max_retries=3,
    default_retry_delay=60,
    queue="email_queue",
)
def send_password_reset_email(
    self,
    email: str,
    token: str,
) -> None:
    """
    Send a password-reset link to the specified email address.

    Args:
        email: Recipient email address.
        token: Short-lived JWT password-reset token (1-hour TTL).
    """
    reset_url = f"{settings.FRONTEND_URL}/reset-password?token={token}" if hasattr(settings, "FRONTEND_URL") else f"http://localhost:3000/reset-password?token={token}"

    html_body = f"""
    <!DOCTYPE html>
    <html>
    <body style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 24px;">
      <h2 style="color: #4F46E5;">Reset Your LearnGraph Password 🔐</h2>
      <p>We received a request to reset the password for your account.</p>
      <a href="{reset_url}"
         style="display:inline-block; padding: 12px 24px; background:#EF4444; color:#fff;
                text-decoration:none; border-radius:6px; margin: 16px 0;">
        Reset My Password
      </a>
      <p style="color:#6B7280; font-size:12px;">
        This link expires in <strong>1 hour</strong>. If you did not request a password
        reset, you can safely ignore this email — your account is secure.
      </p>
      <hr style="border:none; border-top:1px solid #E5E7EB;" />
      <p style="color:#9CA3AF; font-size:11px;">LearnGraph · AI-powered adaptive learning</p>
    </body>
    </html>
    """

    try:
        _send_smtp_email(
            to_email=email,
            subject="Reset your LearnGraph password",
            html_body=html_body,
        )
        logger.info("Password reset email sent", email=email)
    except Exception as exc:
        logger.error(
            "Failed to send password reset email", email=email, error=str(exc)
        )
        raise self.retry(exc=exc)


# ── Task: Welcome Email ───────────────────────────────────────────────────────


@celery_app.task(
    name="app.workers.tasks.email_tasks.send_welcome_email",
    bind=True,
    max_retries=3,
    default_retry_delay=60,
    queue="email_queue",
)
def send_welcome_email(
    self,
    email: str,
    full_name: str,
) -> None:
    """
    Send a personalised welcome email after the user verifies their account.

    Args:
        email: Recipient email address.
        full_name: User's display name for personalisation.
    """
    dashboard_url = f"{settings.FRONTEND_URL}/dashboard" if hasattr(settings, "FRONTEND_URL") else "http://localhost:3000/dashboard"
    first_name = full_name.split()[0] if full_name else "Learner"

    html_body = f"""
    <!DOCTYPE html>
    <html>
    <body style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 24px;">
      <h2 style="color: #4F46E5;">Welcome aboard, {first_name}! 🚀</h2>
      <p>Your LearnGraph account is now active. Here's what you can do:</p>
      <ul style="line-height: 2;">
        <li>📚 Explore personalised learning paths</li>
        <li>🧠 Take adaptive quizzes powered by AI</li>
        <li>📊 Track your progress with detailed analytics</li>
        <li>💬 Chat with your AI tutor anytime</li>
      </ul>
      <a href="{dashboard_url}"
         style="display:inline-block; padding: 12px 24px; background:#4F46E5; color:#fff;
                text-decoration:none; border-radius:6px; margin: 16px 0;">
        Go to My Dashboard
      </a>
      <p>Happy learning! 🎯</p>
      <hr style="border:none; border-top:1px solid #E5E7EB;" />
      <p style="color:#9CA3AF; font-size:11px;">LearnGraph · AI-powered adaptive learning</p>
    </body>
    </html>
    """

    try:
        _send_smtp_email(
            to_email=email,
            subject=f"Welcome to LearnGraph, {first_name}!",
            html_body=html_body,
        )
        logger.info("Welcome email sent", email=email, full_name=full_name)
    except Exception as exc:
        logger.error(
            "Failed to send welcome email",
            email=email,
            full_name=full_name,
            error=str(exc),
        )
        raise self.retry(exc=exc)


# ── Task: Weekly Progress Report (Beat-triggered) ─────────────────────────────


@celery_app.task(
    name="app.workers.tasks.email_tasks.send_weekly_progress_reports",
    queue="email_queue",
)
def send_weekly_progress_reports() -> None:
    """
    Periodic beat task: dispatch weekly learning-progress summary emails
    to all active students. Triggered every Sunday at 09:00 UTC.

    This task fans out individual send tasks asynchronously.
    """
    logger.info("Weekly progress report task triggered")
    # In production this would query DB for active students and
    # dispatch individual send_weekly_summary_email.delay(user_id) calls.
    # Placeholder logged to signal the beat schedule is wired correctly.
