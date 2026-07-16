from cryptography.fernet import Fernet, InvalidToken

from src.config import settings


def _get_cipher() -> Fernet:
    return Fernet(settings.encryption_key.encode("utf-8"))


def encrypt_token(plaintext: str) -> str:
    return _get_cipher().encrypt(plaintext.encode("utf-8")).decode("utf-8")


def decrypt_token(ciphertext: str) -> str:
    try:
        return _get_cipher().decrypt(ciphertext.encode("utf-8")).decode("utf-8")
    except InvalidToken:
        raise ValueError(
            "Could not decrypt stored token — ENCRYPTION_KEY may have changed since it was saved. "
            "The connection will need to be reconnected."
        )
