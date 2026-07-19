"""
Pydantic schemas for the Contact resource — same pattern as user.py:
these define the API shape, separate from the SQLAlchemy DB model.
"""
import uuid
from datetime import datetime

from pydantic import BaseModel


class ContactCreate(BaseModel):
    name: str
    email: str | None = None
    phone: str | None = None
    company: str | None = None
    notes: str | None = None


class ContactUpdate(BaseModel):
    """
    All fields optional — this supports partial updates (PATCH-style),
    so the frontend can send just `{"company": "New Corp"}` without
    having to resend every field.
    """
    name: str | None = None
    email: str | None = None
    phone: str | None = None
    company: str | None = None
    notes: str | None = None


class ContactOut(BaseModel):
    id: uuid.UUID
    name: str
    email: str | None
    phone: str | None
    company: str | None
    notes: str | None
    created_at: datetime
    owner_id: uuid.UUID

    class Config:
        from_attributes = True
