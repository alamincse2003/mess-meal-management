from pydantic import BaseModel, ConfigDict, Field


class ExpenseCreate(BaseModel):
    date: str
    amount: float = Field(gt=0)
    category: str
    description: str | None = None


class ExpenseResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    date: str
    amount: float
    category: str
    description: str | None
    user_id: int
