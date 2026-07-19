"""
Contact CRUD routes.

Every route here requires a valid JWT (via `Depends(get_current_user)`)
and every query is filtered by `owner_id == current_user.id`. That
second part matters as much as the auth check itself — without it,
a logged-in user could read or edit *anyone's* contacts just by
guessing IDs. Scoping by owner is what makes this multi-tenant-safe.
"""
import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.contact import Contact
from app.models.user import User
from app.schemas.contact import ContactCreate, ContactUpdate, ContactOut

router = APIRouter(prefix="/contacts", tags=["contacts"])


@router.post("", response_model=ContactOut, status_code=status.HTTP_201_CREATED)
def create_contact(
    contact_in: ContactCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    contact = Contact(**contact_in.model_dump(), owner_id=current_user.id)
    db.add(contact)
    db.commit()
    db.refresh(contact)
    return contact


@router.get("", response_model=list[ContactOut])
def list_contacts(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return db.query(Contact).filter(Contact.owner_id == current_user.id).all()


def _get_owned_contact_or_404(contact_id: uuid.UUID, db: Session, current_user: User) -> Contact:
    contact = (
        db.query(Contact)
        .filter(Contact.id == contact_id, Contact.owner_id == current_user.id)
        .first()
    )
    if contact is None:
        # Deliberately the same 404 whether the contact doesn't exist
        # OR belongs to someone else — we never reveal that a given ID
        # exists but "isn't yours."
        raise HTTPException(status_code=404, detail="Contact not found")
    return contact


@router.get("/{contact_id}", response_model=ContactOut)
def get_contact(
    contact_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return _get_owned_contact_or_404(contact_id, db, current_user)


@router.patch("/{contact_id}", response_model=ContactOut)
def update_contact(
    contact_id: uuid.UUID,
    contact_in: ContactUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    contact = _get_owned_contact_or_404(contact_id, db, current_user)
    updates = contact_in.model_dump(exclude_unset=True)  # only fields the client actually sent
    for field, value in updates.items():
        setattr(contact, field, value)
    db.commit()
    db.refresh(contact)
    return contact


@router.delete("/{contact_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_contact(
    contact_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    contact = _get_owned_contact_or_404(contact_id, db, current_user)
    db.delete(contact)
    db.commit()
