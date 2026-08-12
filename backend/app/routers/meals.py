from fastapi import APIRouter

from app.schemas.meal import MealCreate

router = APIRouter()

meals: list[dict] = []
next_meal_id = 1


@router.post("")
def create_meal(meal: MealCreate):
    global next_meal_id

    created_meal = {"id": next_meal_id, **meal.model_dump()}
    meals.append(created_meal)
    next_meal_id += 1

    return created_meal


@router.get("")
def list_meals():
    return meals
