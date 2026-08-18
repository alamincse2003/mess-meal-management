from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.models.meal import Meal
from app.schemas.meal import MealCreate, MealResponse

router = APIRouter()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("", response_model=MealResponse)
def create_meal(meal: MealCreate, db: Session = Depends(get_db)):
    new_meal = Meal(**meal.model_dump())
    db.add(new_meal)
    db.commit()
    db.refresh(new_meal)
    return new_meal


@router.get("", response_model=list[MealResponse])
def list_meals(db: Session = Depends(get_db)):
    return db.query(Meal).all()


@router.put("/{meal_id}", response_model=MealResponse)
def update_meal(meal_id: int, meal: MealCreate, db: Session = Depends(get_db)):
    existing_meal = db.query(Meal).filter(Meal.id == meal_id).first()

    if existing_meal is None:
        raise HTTPException(status_code=404, detail="Meal not found")

    for field, value in meal.model_dump().items():
        setattr(existing_meal, field, value)

    db.commit()
    db.refresh(existing_meal)
    return existing_meal


@router.delete("/{meal_id}", response_model=MealResponse)
def delete_meal(meal_id: int, db: Session = Depends(get_db)):
    existing_meal = db.query(Meal).filter(Meal.id == meal_id).first()

    if existing_meal is None:
        raise HTTPException(status_code=404, detail="Meal not found")

    db.delete(existing_meal)
    db.commit()
    return existing_meal
