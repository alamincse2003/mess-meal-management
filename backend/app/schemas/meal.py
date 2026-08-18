from pydantic import BaseModel, ConfigDict


class MealCreate(BaseModel):
    date: str
    breakfast: bool
    lunch: bool
    dinner: bool


class MealResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    date: str
    breakfast: bool
    lunch: bool
    dinner: bool
