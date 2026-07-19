"""
Deal model — represents a sales opportunity tied to a Contact, moving
through pipeline stages (e.g. Lead -> Contacted -> Proposal -> Won/Lost).
This is the second core CRM entity alongside Contact.
"""
import enum
import uuid
from datetime import datetime, timezone

from sqlalchemy import Column, String, DateTime, ForeignKey, Numeric, Enum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.db.session import Base


class DealStage(str, enum.Enum):
    """
    A Python Enum instead of a free-text string — this way the DB
    (and Pydantic validation) rejects any stage name that isn't one
    of these five, instead of silently accepting typos like "Propsal".
    """
    LEAD = "lead"
    CONTACTED = "contacted"
    PROPOSAL = "proposal"
    WON = "won"
    LOST = "lost"


class Deal(Base):
    __tablename__ = "deals"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String, nullable=False)
    value = Column(Numeric(12, 2), nullable=True)  # e.g. deal worth $12,000.00
    stage = Column(Enum(DealStage, name="deal_stage"), nullable=False, default=DealStage.LEAD)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    owner_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    owner = relationship("User")

    # Every deal is tied to exactly one contact (the person/company
    # you're negotiating with). Contact.deals lets you look up all
    # deals for a given contact from the other side of the relationship.
    contact_id = Column(UUID(as_uuid=True), ForeignKey("contacts.id"), nullable=False)
    contact = relationship("Contact", back_populates="deals")
