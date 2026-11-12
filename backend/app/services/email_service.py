"""
LearnGraph — Unified Email Service Abstraction
Pluggable provider support for:
- SMTP (Gmail, any standard SMTP)
- SendGrid API
- Resend API
- AWS SES
- Mailgun API

Reads EMAIL_PROVIDER from settings/environment (default: "smtp").
"""

import smtplib
import ssl
import re
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from typing import Optional
import httpx
import structlog

from app.core.config import settings

logger = structlog.get_logger(__name__)


class EmailService:
    """Unified email service supporting multiple delivery backends."""

    def __init__(self) -> None:
        self.provider = getattr(settings, "EMAIL_PROVIDER", "smtp").lower()
        self.from_name = getattr(settings, "EMAIL_FROM_NAME", "LearnGraph")
        self.from_email = getattr(settings, "EMAIL_FROM", "noreply@learngraph.ai")

    async def send_email(
        self,
        to_email: str,
        subject: str,
        html_content: str,
        plain_content: Optional[str] = None,
    ) -> bool:
        """Route email delivery to the configured provider."""
        if not plain_content:
            plain_content = re.sub(r"<[^>]+>", "", html_content).strip()

        try:
            if self.provider == "sendgrid":
                return await self._send_sendgrid(to_email, subject, html_content, plain_content)
            elif self.provider == "resend":
                return await self._send_resend(to_email, subject, html_content)
            elif self.provider == "mailgun":
                return await self._send_mailgun(to_email, subject, html_content, plain_content)
            elif self.provider == "ses":
                return await self._send_ses(to_email, subject, html_content, plain_content)
            else:
                return self._send_smtp(to_email, subject, html_content, plain_content)
        except Exception as e:
            logger.error("Email dispatch failed", provider=self.provider, recipient=to_email, error=str(e))
            # In test/dev environment, don't crash auth flows on email delivery errors
            return False

    def _send_smtp(
        self,
        to_email: str,
        subject: str,
        html_content: str,
        plain_content: str,
    ) -> bool:
        """Standard TLS SMTP dispatch (e.g. Gmail App Password)."""
        host = getattr(settings, "SMTP_HOST", "smtp.gmail.com")
        port = int(getattr(settings, "SMTP_PORT", 587))
        user = getattr(settings, "SMTP_USER", "")
        password = getattr(settings, "SMTP_PASSWORD", "")

        if not user or not password:
            logger.error("SMTP credentials not configured; cannot deliver email", to=to_email)
            return False

        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = f"{self.from_name} <{self.from_email}>"
        msg["To"] = to_email

        msg.attach(MIMEText(plain_content, "plain", "utf-8"))
        msg.attach(MIMEText(html_content, "html", "utf-8"))

        context = ssl.create_default_context()
        with smtplib.SMTP(host, port) as server:
            server.ehlo()
            server.starttls(context=context)
            server.login(user, password)
            server.sendmail(self.from_email, to_email, msg.as_string())

        logger.info("SMTP email delivered successfully", recipient=to_email, subject=subject)
        return True

    async def _send_sendgrid(
        self,
        to_email: str,
        subject: str,
        html_content: str,
        plain_content: str,
    ) -> bool:
        """SendGrid v3 REST API dispatch."""
        api_key = getattr(settings, "SENDGRID_API_KEY", "")
        if not api_key:
            logger.error("SendGrid API key missing; cannot deliver email", to=to_email)
            return False

        payload = {
            "personalizations": [{"to": [{"email": to_email}]}],
            "from": {"email": self.from_email, "name": self.from_name},
            "subject": subject,
            "content": [
                {"type": "text/plain", "value": plain_content},
                {"type": "text/html", "value": html_content},
            ],
        }

        async with httpx.AsyncClient(timeout=10.0) as client:
            res = await client.post(
                "https://api.sendgrid.com/v3/mail/send",
                headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
                json=payload,
            )
            return res.status_code in (200, 202)

    async def _send_resend(
        self,
        to_email: str,
        subject: str,
        html_content: str,
    ) -> bool:
        """Resend.com REST API dispatch."""
        api_key = getattr(settings, "RESEND_API_KEY", "")
        if not api_key:
            logger.error("Resend API key missing; cannot deliver email", to=to_email)
            return False

        payload = {
            "from": f"{self.from_name} <{self.from_email}>",
            "to": [to_email],
            "subject": subject,
            "html": html_content,
        }

        async with httpx.AsyncClient(timeout=10.0) as client:
            res = await client.post(
                "https://api.resend.com/emails",
                headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
                json=payload,
            )
            return res.status_code in (200, 201)

    async def _send_mailgun(
        self,
        to_email: str,
        subject: str,
        html_content: str,
        plain_content: str,
    ) -> bool:
        """Mailgun v3 API dispatch."""
        api_key = getattr(settings, "MAILGUN_API_KEY", "")
        domain = getattr(settings, "MAILGUN_DOMAIN", "")
        if not api_key or not domain:
            logger.error("Mailgun credentials missing; cannot deliver email", to=to_email)
            return False

        data = {
            "from": f"{self.from_name} <{self.from_email}>",
            "to": to_email,
            "subject": subject,
            "text": plain_content,
            "html": html_content,
        }

        async with httpx.AsyncClient(timeout=10.0) as client:
            res = await client.post(
                f"https://api.mailgun.net/v3/{domain}/messages",
                auth=("api", api_key),
                data=data,
            )
            return res.status_code == 200

    async def _send_ses(
        self,
        to_email: str,
        subject: str,
        html_content: str,
        plain_content: str,
    ) -> bool:
        """AWS SES dispatch (via boto3 if available, otherwise SMTP fallback)."""
        try:
            import boto3
            client = boto3.client(
                "ses",
                region_name=getattr(settings, "AWS_REGION", "us-east-1"),
                aws_access_key_id=getattr(settings, "AWS_ACCESS_KEY_ID", ""),
                aws_secret_access_key=getattr(settings, "AWS_SECRET_ACCESS_KEY", ""),
            )
            client.send_email(
                Source=f"{self.from_name} <{self.from_email}>",
                Destination={"ToAddresses": [to_email]},
                Message={
                    "Subject": {"Data": subject, "Charset": "UTF-8"},
                    "Body": {
                        "Text": {"Data": plain_content, "Charset": "UTF-8"},
                        "Html": {"Data": html_content, "Charset": "UTF-8"},
                    },
                },
            )
            return True
        except ImportError:
            logger.warning("boto3 not installed; using SMTP fallback for SES")
            return self._send_smtp(to_email, subject, html_content, plain_content)

    # ── High-level Email Templates ──────────────────────────────────────────

    async def send_verification_email(self, to_email: str, user_name: str, token: str) -> bool:
        frontend_url = getattr(settings, "FRONTEND_URL", "http://localhost:5173")
        verify_url = f"{frontend_url}/verify-email?token={token}&email={to_email}"
        subject = "Verify your LearnGraph account"
        html = f"""
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px 24px; color: #1e293b;">
            <div style="margin-bottom: 24px;">
                <h1 style="color: #4f46e5; margin: 0; font-size: 24px; font-weight: 800;">LearnGraph</h1>
                <p style="color: #64748b; font-size: 13px; margin: 4px 0 0 0;">Adaptive Knowledge Graph for Continuous Education</p>
            </div>
            <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 28px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
                <h2 style="font-size: 18px; font-weight: 700; margin: 0 0 12px 0;">Welcome, {user_name}!</h2>
                <p style="font-size: 14px; line-height: 1.6; color: #475569; margin: 0 0 24px 0;">
                    Thank you for joining LearnGraph. Please confirm your email address to unlock your isolated learning dashboard, AI tutor, and personalized knowledge graph.
                </p>
                <div style="text-align: center; margin: 28px 0;">
                    <a href="{verify_url}" style="background: #4f46e5; color: #ffffff; text-decoration: none; padding: 12px 32px; border-radius: 10px; font-weight: 600; font-size: 14px; display: inline-block;">
                        Verify Email Address
                    </a>
                </div>
                <p style="font-size: 12px; color: #94a3b8; line-height: 1.5; margin: 24px 0 0 0;">
                    If the button does not work, copy and paste this link into your browser:<br>
                    <a href="{verify_url}" style="color: #4f46e5; word-break: break-all;">{verify_url}</a>
                </p>
            </div>
            <p style="font-size: 11px; color: #94a3b8; text-align: center; margin-top: 24px;">
                &copy; {self.from_name}. If you didn't create an account, you can safely ignore this email.
            </p>
        </div>
        """
        return await self.send_email(to_email, subject, html)

    async def send_password_reset_email(self, to_email: str, token: str) -> bool:
        frontend_url = getattr(settings, "FRONTEND_URL", "http://localhost:5173")
        reset_url = f"{frontend_url}/reset-password?token={token}&email={to_email}"
        subject = "Reset your LearnGraph password"
        html = f"""
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px 24px; color: #1e293b;">
            <div style="margin-bottom: 24px;">
                <h1 style="color: #4f46e5; margin: 0; font-size: 24px; font-weight: 800;">LearnGraph</h1>
            </div>
            <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 28px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
                <h2 style="font-size: 18px; font-weight: 700; margin: 0 0 12px 0;">Password Reset Request</h2>
                <p style="font-size: 14px; line-height: 1.6; color: #475569; margin: 0 0 20px 0;">
                    We received a request to reset your LearnGraph password. Click the button below to choose a new password. This link will expire in <strong>15 minutes</strong>.
                </p>
                <div style="text-align: center; margin: 28px 0;">
                    <a href="{reset_url}" style="background: #4f46e5; color: #ffffff; text-decoration: none; padding: 12px 32px; border-radius: 10px; font-weight: 600; font-size: 14px; display: inline-block;">
                        Reset Password
                    </a>
                </div>
                <p style="font-size: 12px; color: #94a3b8; line-height: 1.5; margin: 20px 0 0 0;">
                    If you did not request a password reset, no further action is required. Your account remains secure.
                </p>
            </div>
        </div>
        """
        return await self.send_email(to_email, subject, html)


email_service = EmailService()
