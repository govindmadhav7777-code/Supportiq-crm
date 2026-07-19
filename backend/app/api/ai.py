"""
AI-powered routes, built on top of Gemini.

Same ownership-scoping pattern as the rest of the API: both endpoints
take a contact_id, verify it belongs to the logged-in user, then
pass its data to Gemini. This means you can't use these endpoints to
generate content about someone else's contacts just by guessing IDs.
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.gemini import summarize_notes, generate_followup_email
from app.db.session import get_db
from app.models.contact import Contact
from app.models.user import User
from app.schemas.ai import (
    SummarizeRequest,
    SummarizeResponse,
    GenerateEmailRequest,
    GenerateEmailResponse,
)

router = APIRouter(prefix="/ai", tags=["ai"])


def _get_owned_contact(contact_id, db: Session, current_user: User) -> Contact:
    contact = (
        db.query(Contact)
        .filter(Contact.id == contact_id, Contact.owner_id == current_user.id)
        .first()
    )
    if contact is None:
        raise HTTPException(status_code=404, detail="Contact not found")
    return contact


@router.post("/summarize-notes", response_model=SummarizeResponse)
def summarize_contact_notes(
    request: SummarizeRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    contact = _get_owned_contact(request.contact_id, db, current_user)

    if not contact.notes or not contact.notes.strip():
        raise HTTPException(status_code=400, detail="This contact has no notes to summarize")

    try:
        summary = summarize_notes(contact.notes)
    except RuntimeError as e:
        # Missing/invalid API key — a config problem, not the caller's fault,
        # but still a 400 since it's something the deployer needs to fix.
        raise HTTPException(status_code=400, detail=str(e))
    except Exception:
        raise HTTPException(status_code=502, detail="AI service is currently unavailable")

    return SummarizeResponse(summary=summary)


@router.post("/generate-email", response_model=GenerateEmailResponse)
def generate_email(
    request: GenerateEmailRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    contact = _get_owned_contact(request.contact_id, db, current_user)

    try:
        result = generate_followup_email(
            contact_name=contact.name,
            company=contact.company,
            notes=contact.notes,
            instructions=request.instructions,
        )
    except RuntimeError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception:
        raise HTTPException(status_code=502, detail="AI service is currently unavailable")

    return GenerateEmailResponse(**result)
