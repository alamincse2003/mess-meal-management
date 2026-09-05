from pydantic import BaseModel, ConfigDict, Field


class BazarEntryCreate(BaseModel):
    date: str
    amount: float = Field(gt=0)
    description: str | None = None


class BazarEntryResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    date: str
    amount: float
    description: str | None
    user_id: int
