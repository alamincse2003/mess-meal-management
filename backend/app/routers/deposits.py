from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.deposit import Deposit
from app.models.user import User
from app.schemas.deposit import DepositCreate, DepositResponse
from app.security import get_current_user

router = APIRouter()


@router.post("", response_model=DepositResponse)
def create_deposit(
    deposit: DepositCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    new_deposit = Deposit(**deposit.model_dump(), user_id=current_user.id)
    db.add(new_deposit)

    try:
        db.commit()
    except SQLAlchemyError:
        db.rollback()
        raise HTTPException(status_code=500, detail="Failed to create deposit")

    db.refresh(new_deposit)
    return new_deposit


@router.get("", response_model=list[DepositResponse])
def list_deposits(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Deposits are shared across the whole mess, so every authenticated
    # user sees every entry, not just their own (unlike meals).
    return db.query(Deposit).all()


@router.put("/{deposit_id}", response_model=DepositResponse)
def update_deposit(
    deposit_id: int,
    deposit: DepositCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    existing_deposit = db.query(Deposit).filter(Deposit.id == deposit_id).first()

    if existing_deposit is None:
        raise HTTPException(status_code=404, detail="Deposit not found")

    if existing_deposit.user_id != current_user.id:
        raise HTTPException(
            status_code=403, detail="Not authorized to update this deposit"
        )

    for field, value in deposit.model_dump().items():
        setattr(existing_deposit, field, value)

    try:
        db.commit()
    except SQLAlchemyError:
        db.rollback()
        raise HTTPException(status_code=500, detail="Failed to update deposit")

    db.refresh(existing_deposit)
    return existing_deposit


@router.delete("/{deposit_id}", response_model=DepositResponse)
def delete_deposit(
    deposit_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    existing_deposit = db.query(Deposit).filter(Deposit.id == deposit_id).first()

    if existing_deposit is None:
        raise HTTPException(status_code=404, detail="Deposit not found")

    if existing_deposit.user_id != current_user.id:
        raise HTTPException(
            status_code=403, detail="Not authorized to delete this deposit"
        )

    deleted_deposit = DepositResponse.model_validate(existing_deposit)
    db.delete(existing_deposit)

    try:
        db.commit()
    except SQLAlchemyError:
        db.rollback()
        raise HTTPException(status_code=500, detail="Failed to delete deposit")

    return deleted_deposit
