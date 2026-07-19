"""
Pydantic schemas for the User resource.

Why these are separate from app/models/user.py:
The SQLAlchemy model describes the DATABASE table (includes
hashed_password). These schemas describe the API's request/response
shape — e.g. UserOut deliberately excludes hashed_password so it
never accidentally leaks in an API response.
"""
import uuid
from datetime import datetime

from pydantic import BaseModel, EmailStr


class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: str | None = None


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    id: uuid.UUID
    email: EmailStr
    full_name: str | None
    created_at: datetime

    class Config:
        from_attributes = True  # lets this be built directly from a SQLAlchemy User object


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
