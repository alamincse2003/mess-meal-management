from pydantic import BaseModel


class MemberBalance(BaseModel):
    user_id: int
    name: str
    meals_eaten: int
    total_deposits: float
    cost_share: float
    balance: float


class BalanceResponse(BaseModel):
    month: str
    meal_rate: float
    members: list[MemberBalance]
