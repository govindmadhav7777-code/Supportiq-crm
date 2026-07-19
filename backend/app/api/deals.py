"""
Deal CRUD routes.

Same ownership-scoping pattern as contacts.py: every query filters by
owner_id, and 404 is used uniformly whether a resource doesn't exist
or just isn't yours. One extra check here that contacts.py didn't
need: when creating/updating a deal's contact_id, we verify that
contact also belongs to the current user — otherwise you could link
a deal to someone else's contact by guessing their contact's UUID.
"""
import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.contact import Contact
from app.models.deal import Deal
from app.models.user import User
from app.schemas.deal import DealCreate, DealUpdate, DealOut

router = APIRouter(prefix="/deals", tags=["deals"])


def _verify_contact_ownership(contact_id: uuid.UUID, db: Session, current_user: User):
    contact = (
        db.query(Contact)
        .filter(Contact.id == contact_id, Contact.owner_id == current_user.id)
        .first()
    )
    if contact is None:
        raise HTTPException(status_code=400, detail="Invalid contact_id")


@router.post("", response_model=DealOut, status_code=status.HTTP_201_CREATED)
def create_deal(
    deal_in: DealCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    _verify_contact_ownership(deal_in.contact_id, db, current_user)

    deal = Deal(**deal_in.model_dump(), owner_id=current_user.id)
    db.add(deal)
    db.commit()
    db.refresh(deal)
    return deal


@router.get("", response_model=list[DealOut])
def list_deals(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return db.query(Deal).filter(Deal.owner_id == current_user.id).all()


def _get_owned_deal_or_404(deal_id: uuid.UUID, db: Session, current_user: User) -> Deal:
    deal = db.query(Deal).filter(Deal.id == deal_id, Deal.owner_id == current_user.id).first()
    if deal is None:
        raise HTTPException(status_code=404, detail="Deal not found")
    return deal


@router.get("/{deal_id}", response_model=DealOut)
def get_deal(
    deal_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return _get_owned_deal_or_404(deal_id, db, current_user)


@router.patch("/{deal_id}", response_model=DealOut)
def update_deal(
    deal_id: uuid.UUID,
    deal_in: DealUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    deal = _get_owned_deal_or_404(deal_id, db, current_user)
    updates = deal_in.model_dump(exclude_unset=True)

    if "contact_id" in updates:
        _verify_contact_ownership(updates["contact_id"], db, current_user)

    for field, value in updates.items():
        setattr(deal, field, value)
    db.commit()
    db.refresh(deal)
    return deal


@router.delete("/{deal_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_deal(
    deal_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    deal = _get_owned_deal_or_404(deal_id, db, current_user)
    db.delete(deal)
    db.commit()
