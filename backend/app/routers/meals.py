from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.meal import Meal
from app.models.user import User
from app.schemas.meal import MealCreate, MealResponse, MealSummaryResponse
from app.security import get_current_user

router = APIRouter()


@router.post("", response_model=MealResponse)
def create_meal(
    meal: MealCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    new_meal = Meal(**meal.model_dump(), user_id=current_user.id)
    db.add(new_meal)

    try:
        db.commit()
    except SQLAlchemyError:
        db.rollback()
        raise HTTPException(status_code=500, detail="Failed to create meal")

    db.refresh(new_meal)
    return new_meal


@router.get("", response_model=list[MealResponse])
def list_meals(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return db.query(Meal).filter(Meal.user_id == current_user.id).all()


@router.get("/summary", response_model=MealSummaryResponse)
def get_meal_summary(
    month: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Aggregate across ALL users (the whole mess), not just current_user,
    # since meal-rate calculation needs the mess-wide total. Only a count is
    # returned — never individual users' meal rows — to keep the existing
    # per-user meal ownership/privacy model intact.
    all_meals = db.query(Meal).filter(Meal.date.startswith(month)).all()

    total_meal_slots = sum(
        int(meal.breakfast) + int(meal.lunch) + int(meal.dinner)
        for meal in all_meals
    )

    return MealSummaryResponse(total_meal_slots=total_meal_slots)


@router.put("/{meal_id}", response_model=MealResponse)
def update_meal(
    meal_id: int,
    meal: MealCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    existing_meal = db.query(Meal).filter(Meal.id == meal_id).first()

    if existing_meal is None:
        raise HTTPException(status_code=404, detail="Meal not found")

    if existing_meal.user_id != current_user.id:
        raise HTTPException(
            status_code=403, detail="Not authorized to update this meal"
        )

    for field, value in meal.model_dump().items():
        setattr(existing_meal, field, value)

    try:
        db.commit()
    except SQLAlchemyError:
        db.rollback()
        raise HTTPException(status_code=500, detail="Failed to update meal")

    db.refresh(existing_meal)
    return existing_meal


@router.delete("/{meal_id}", response_model=MealResponse)
def delete_meal(
    meal_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    existing_meal = db.query(Meal).filter(Meal.id == meal_id).first()

    if existing_meal is None:
        raise HTTPException(status_code=404, detail="Meal not found")

    if existing_meal.user_id != current_user.id:
        raise HTTPException(
            status_code=403, detail="Not authorized to delete this meal"
        )

    deleted_meal = MealResponse.model_validate(existing_meal)
    db.delete(existing_meal)

    try:
        db.commit()
    except SQLAlchemyError:
        db.rollback()
        raise HTTPException(status_code=500, detail="Failed to delete meal")

    return deleted_meal
