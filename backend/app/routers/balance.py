from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.bazar_entry import BazarEntry
from app.models.deposit import Deposit
from app.models.expense import Expense
from app.models.meal import Meal
from app.models.user import User
from app.schemas.balance import BalanceResponse, MemberBalance
from app.security import get_current_user

router = APIRouter()


@router.get("", response_model=BalanceResponse)
def get_balance(
    month: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    users = db.query(User).all()
    meals = db.query(Meal).filter(Meal.date.startswith(month)).all()
    bazar_entries = db.query(BazarEntry).filter(BazarEntry.date.startswith(month)).all()
    expenses = db.query(Expense).filter(Expense.date.startswith(month)).all()
    deposits = db.query(Deposit).filter(Deposit.date.startswith(month)).all()

    total_cost = sum(entry.amount for entry in bazar_entries) + sum(
        expense.amount for expense in expenses
    )

    total_meal_slots = sum(
        int(meal.breakfast) + int(meal.lunch) + int(meal.dinner) for meal in meals
    )

    meal_rate = total_cost / total_meal_slots if total_meal_slots > 0 else 0.0

    meals_by_user: dict[int, int] = {}
    for meal in meals:
        slots = int(meal.breakfast) + int(meal.lunch) + int(meal.dinner)
        meals_by_user[meal.user_id] = meals_by_user.get(meal.user_id, 0) + slots

    deposits_by_user: dict[int, float] = {}
    for deposit in deposits:
        deposits_by_user[deposit.user_id] = (
            deposits_by_user.get(deposit.user_id, 0.0) + deposit.amount
        )

    members = []
    for user in users:
        meals_eaten = meals_by_user.get(user.id, 0)
        total_deposits = deposits_by_user.get(user.id, 0.0)
        cost_share = meals_eaten * meal_rate

        members.append(
            MemberBalance(
                user_id=user.id,
                name=user.name,
                meals_eaten=meals_eaten,
                total_deposits=total_deposits,
                cost_share=cost_share,
                balance=total_deposits - cost_share,
            )
        )

    return BalanceResponse(month=month, meal_rate=meal_rate, members=members)
