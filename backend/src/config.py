from pydantic_settings import BaseSettings
from pydantic import field_validator
from typing import List
import secrets
import logging
import sys

logger = logging.getLogger(__name__)

MIN_JWT_SECRET_LENGTH = 32


class Settings(BaseSettings):
    database_url: str = "postgresql+asyncpg://campaign_user:dev_password_123@localhost:5432/campaign_intelligence"
    jwt_secret: str = ""
    jwt_algorithm: str = "HS256"
    jwt_expiration: int = 604800  # 7 days
    allowed_origins: str = "http://localhost:3000"
    environment: str = "development"

    # Email (Gmail SMTP)
    smtp_host: str = "smtp.gmail.com"
    smtp_port: int = 587
    smtp_user: str = ""
    smtp_password: str = ""
    email_from: str = ""

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
                    # In production, refuse to start
                    # Uncomment for strict mode:
                    # if os.getenv("ENVIRONMENT", "development") == "production":
                    #     sys.exit(1)
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
