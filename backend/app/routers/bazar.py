from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.bazar_entry import BazarEntry
from app.models.user import User
from app.schemas.bazar import BazarEntryCreate, BazarEntryResponse
from app.security import get_current_user

router = APIRouter()


@router.post("", response_model=BazarEntryResponse)
def create_bazar_entry(
    entry: BazarEntryCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    new_entry = BazarEntry(**entry.model_dump(), user_id=current_user.id)
    db.add(new_entry)

    try:
        db.commit()
    except SQLAlchemyError:
        db.rollback()
        raise HTTPException(status_code=500, detail="Failed to create bazar entry")

    db.refresh(new_entry)
    return new_entry


@router.get("", response_model=list[BazarEntryResponse])
def list_bazar_entries(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Bazar entries are shared across the whole mess, so every authenticated
    # user sees every entry, not just their own (unlike meals).
    return db.query(BazarEntry).all()


@router.put("/{entry_id}", response_model=BazarEntryResponse)
def update_bazar_entry(
    entry_id: int,
    entry: BazarEntryCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    existing_entry = db.query(BazarEntry).filter(BazarEntry.id == entry_id).first()

    if existing_entry is None:
        raise HTTPException(status_code=404, detail="Bazar entry not found")

    if existing_entry.user_id != current_user.id:
        raise HTTPException(
            status_code=403, detail="Not authorized to update this bazar entry"
        )

    for field, value in entry.model_dump().items():
        setattr(existing_entry, field, value)

    try:
        db.commit()
    except SQLAlchemyError:
        db.rollback()
        raise HTTPException(status_code=500, detail="Failed to update bazar entry")

    db.refresh(existing_entry)
    return existing_entry


@router.delete("/{entry_id}", response_model=BazarEntryResponse)
def delete_bazar_entry(
    entry_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    existing_entry = db.query(BazarEntry).filter(BazarEntry.id == entry_id).first()

    if existing_entry is None:
        raise HTTPException(status_code=404, detail="Bazar entry not found")

    if existing_entry.user_id != current_user.id:
        raise HTTPException(
            status_code=403, detail="Not authorized to delete this bazar entry"
        )

    deleted_entry = BazarEntryResponse.model_validate(existing_entry)
    db.delete(existing_entry)

    try:
        db.commit()
    except SQLAlchemyError:
        db.rollback()
        raise HTTPException(status_code=500, detail="Failed to delete bazar entry")

    return deleted_entry
