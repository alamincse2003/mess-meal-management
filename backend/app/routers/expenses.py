from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.expense import Expense
from app.models.user import User
from app.schemas.expense import ExpenseCreate, ExpenseResponse
from app.security import get_current_user

router = APIRouter()


@router.post("", response_model=ExpenseResponse)
def create_expense(
    expense: ExpenseCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    new_expense = Expense(**expense.model_dump(), user_id=current_user.id)
    db.add(new_expense)

    try:
        db.commit()
    except SQLAlchemyError:
        db.rollback()
        raise HTTPException(status_code=500, detail="Failed to create expense")

    db.refresh(new_expense)
    return new_expense


@router.get("", response_model=list[ExpenseResponse])
def list_expenses(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Expenses are shared across the whole mess, so every authenticated
    # user sees every entry, not just their own (unlike meals).
    return db.query(Expense).all()


@router.put("/{expense_id}", response_model=ExpenseResponse)
def update_expense(
    expense_id: int,
    expense: ExpenseCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    existing_expense = db.query(Expense).filter(Expense.id == expense_id).first()

    if existing_expense is None:
        raise HTTPException(status_code=404, detail="Expense not found")

    if existing_expense.user_id != current_user.id:
        raise HTTPException(
            status_code=403, detail="Not authorized to update this expense"
        )

    for field, value in expense.model_dump().items():
        setattr(existing_expense, field, value)

    try:
        db.commit()
    except SQLAlchemyError:
        db.rollback()
        raise HTTPException(status_code=500, detail="Failed to update expense")

    db.refresh(existing_expense)
    return existing_expense


@router.delete("/{expense_id}", response_model=ExpenseResponse)
def delete_expense(
    expense_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    existing_expense = db.query(Expense).filter(Expense.id == expense_id).first()

    if existing_expense is None:
        raise HTTPException(status_code=404, detail="Expense not found")

    if existing_expense.user_id != current_user.id:
        raise HTTPException(
            status_code=403, detail="Not authorized to delete this expense"
        )

    deleted_expense = ExpenseResponse.model_validate(existing_expense)
    db.delete(existing_expense)

    try:
        db.commit()
    except SQLAlchemyError:
        db.rollback()
        raise HTTPException(status_code=500, detail="Failed to delete expense")

    return deleted_expense
