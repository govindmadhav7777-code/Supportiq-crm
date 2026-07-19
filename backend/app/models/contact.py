"""
Contact model — the core CRM entity: a person/lead a user is tracking.
Deals/pipeline will reference this later in Step 4.
"""
import uuid
from datetime import datetime, timezone

from sqlalchemy import Column, String, DateTime, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.db.session import Base


class Contact(Base):
    __tablename__ = "contacts"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)
    email = Column(String, nullable=True)
    phone = Column(String, nullable=True)
    company = Column(String, nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    # Every contact belongs to exactly one user (the rep tracking them).
    owner_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    owner = relationship("User", back_populates="contacts")

    # One contact can have many deals (e.g. repeat business, multiple
    # opportunities with the same company).
    deals = relationship("Deal", back_populates="contact", cascade="all, delete-orphan")
