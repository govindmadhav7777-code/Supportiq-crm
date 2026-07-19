"""
Schemas for AI-powered features. Both request types just need a
contact_id — the endpoints look up the actual notes/name/company
server-side, so the frontend never has to duplicate that data.
"""
import uuid

from pydantic import BaseModel


class SummarizeRequest(BaseModel):
    contact_id: uuid.UUID


class SummarizeResponse(BaseModel):
    summary: str


class GenerateEmailRequest(BaseModel):
    contact_id: uuid.UUID
    instructions: str | None = None  # e.g. "invite them to a demo next week"


class GenerateEmailResponse(BaseModel):
    subject: str
    body: str
