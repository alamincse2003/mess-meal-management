from pydantic import BaseModel


class MealCreate(BaseModel):
    date: str
    breakfast: bool
    lunch: bool
    dinner: bool
