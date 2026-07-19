"""
Security utilities: password hashing and JWT token creation/verification.

Why separate from the auth routes:
These are pure functions with no FastAPI/DB dependencies — easy to
unit test in isolation, and reusable anywhere in the app (e.g. a
future "change password" endpoint uses the same hashing functions).
"""
from datetime import datetime, timedelta, timezone

from jose import jwt, JWTError
from passlib.context import CryptContext

from app.core.config import settings

# bcrypt is the industry-standard choice for password hashing — it's
# deliberately slow, which makes brute-force attacks impractical.
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(plain_password: str) -> str:
    return pwd_context.hash(plain_password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def create_access_token(subject: str) -> str:
    """
    Creates a signed JWT containing `subject` (we'll use the user's
    id) and an expiry. The signature means the server can trust the
    token wasn't tampered with, without needing to hit the DB to
    check a session table — that's the main appeal of JWTs.
    """
    expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode = {"sub": subject, "exp": expire}
    return jwt.encode(to_encode, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)


def decode_access_token(token: str) -> str | None:
    """Returns the user id encoded in the token, or None if invalid/expired."""
    try:
        payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
        return payload.get("sub")
    except JWTError:
        return None
