"""
User model — represents a person who logs into the CRM (e.g. a sales
rep). Every Contact is "owned" by a User, which is how we'll scope
data per-account once auth is wired up in Step 3.
"""
import uuid
from datetime import datetime, timezone

from sqlalchemy import Column, String, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.db.session import Base


class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    # One user owns many contacts. `back_populates` keeps both sides
    # of the relationship in sync (contact.owner <-> user.contacts).
    contacts = relationship("Contact", back_populates="owner", cascade="all, delete-orphan")
