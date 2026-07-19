"""
Pydantic schemas for the Deal resource.
"""
import uuid
from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel

from app.models.deal import DealStage


class DealCreate(BaseModel):
    title: str
    value: Decimal | None = None
    stage: DealStage = DealStage.LEAD
    contact_id: uuid.UUID


class DealUpdate(BaseModel):
    """All fields optional — supports partial updates, including just
    dragging a card to a new stage (`{"stage": "proposal"}`)."""
    title: str | None = None
    value: Decimal | None = None
    stage: DealStage | None = None
    contact_id: uuid.UUID | None = None


class DealOut(BaseModel):
    id: uuid.UUID
    title: str
    value: Decimal | None
    stage: DealStage
    created_at: datetime
    owner_id: uuid.UUID
    contact_id: uuid.UUID

    class Config:
        from_attributes = True
