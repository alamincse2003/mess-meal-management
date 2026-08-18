from sqlalchemy import Boolean, Column, Integer, String

from app.database import Base


class Meal(Base):
    __tablename__ = "meals"

    id = Column(Integer, primary_key=True, autoincrement=True)
    date = Column(String, nullable=False)
    breakfast = Column(Boolean, nullable=False, default=False)
    lunch = Column(Boolean, nullable=False, default=False)
    dinner = Column(Boolean, nullable=False, default=False)
