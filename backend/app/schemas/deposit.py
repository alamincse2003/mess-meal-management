from pydantic import BaseModel, ConfigDict, Field


class DepositCreate(BaseModel):
    date: str
    amount: float = Field(gt=0)


class DepositResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    date: str
    amount: float
    user_id: int
