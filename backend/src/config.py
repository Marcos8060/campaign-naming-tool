import logging
import secrets
from typing import List

from cryptography.fernet import Fernet
from pydantic import field_validator
from pydantic_settings import BaseSettings

logger = logging.getLogger(__name__)

MIN_JWT_SECRET_LENGTH = 32


class Settings(BaseSettings):
    database_url: str = "postgresql+asyncpg://campaign_user:dev_password_123@localhost:5432/campaign_intelligence"
    jwt_secret: str = ""
    jwt_algorithm: str = "HS256"
    # Short-lived on purpose — this is what actually authorizes every API
    # call, so if one ever leaks (compromised device, malicious extension,
    # a logging mistake somewhere), the exposure window is minutes, not
    # days. refresh_token_expiration_days is what carries the "stay logged
    # in for a week" experience instead; see POST /auth/refresh.
    jwt_expiration: int = 900  # 15 minutes
    refresh_token_expiration_days: int = 7
    allowed_origins: str = "http://localhost:3000"
    environment: str = "development"

    smtp_host: str = "smtp.gmail.com"
    smtp_port: int = 587
    smtp_user: str = ""
    smtp_password: str = ""
    email_from: str = ""

    frontend_url: str = "http://localhost:3000"
    oauth_redirect_base_url: str = "http://localhost:8000"

    encryption_key: str = ""

    meta_app_id: str = ""
    meta_app_secret: str = ""
    meta_api_version: str = "v21.0"

    # How often the background job re-pulls performance data from Meta for
    # every deployed campaign, across all workspaces. 6 hours balances
    # freshness against Meta's API rate limits for a small account.
    sync_interval_hours: int = 6

    @field_validator("encryption_key", mode="before")
    @classmethod
    def validate_encryption_key(cls, v: str) -> str:
        if not v:
            generated = Fernet.generate_key().decode("utf-8")
            logger.warning(
                "\n"
                "⚠️  ENCRYPTION_KEY is not set. A random key has been generated for this session.\n"
                "   Unlike JWT_SECRET, losing this key is destructive: any platform connection\n"
                "   tokens already encrypted with it become permanently unreadable on restart,\n"
                "   and every connected ad account will need to be reconnected.\n"
                f"   Add to your .env:  ENCRYPTION_KEY={generated}\n"
            )
            return generated
        try:
            Fernet(v.encode("utf-8"))
        except Exception:
            raise ValueError(
                "ENCRYPTION_KEY must be a valid 32-byte urlsafe-base64 Fernet key. "
                "Generate one with: python -c \"from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())\""
            )
        return v

    @field_validator("jwt_secret", mode="before")
    @classmethod
    def validate_jwt_secret(cls, v: str) -> str:
        if not v:
            if True:  # always generate/warn on missing secret
                generated = secrets.token_hex(32)
                logger.warning(
                    "\n"
                    "⚠️  JWT_SECRET is not set. A random secret has been generated for this session.\n"
                    "   Sessions will be invalidated on every restart.\n"
                    f"   Add to your .env:  JWT_SECRET={generated}\n"
                )
                return generated
        if len(v) < MIN_JWT_SECRET_LENGTH:
            logger.warning(
                f"⚠️  JWT_SECRET is too short ({len(v)} chars). "
                f"Minimum recommended length is {MIN_JWT_SECRET_LENGTH} characters."
            )
        if v in (
            "your-super-secret-jwt-key-min-32-chars-please-change",
            "secret",
            "changeme",
            "password",
        ):
            if True:  # always warn on known-bad values
                msg = (
                    "🚨 CRITICAL: JWT_SECRET is set to a known insecure default value. "
                    "Change it immediately before deploying to production."
                )
                if v == "your-super-secret-jwt-key-min-32-chars-please-change":
                    logger.error(msg)
        return v

    @field_validator("allowed_origins", mode="before")
    @classmethod
    def parse_origins(cls, v: str) -> str:
        return v

    def get_allowed_origins(self) -> List[str]:
        return [o.strip() for o in self.allowed_origins.split(",") if o.strip()]

    def is_production(self) -> bool:
        return self.environment.lower() == "production"

    class Config:
        env_file = ".env"
        case_sensitive = False


settings = Settings()
