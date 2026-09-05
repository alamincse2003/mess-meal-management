from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship

from app.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String, nullable=False)
    email = Column(String, nullable=False, unique=True)
    password_hash = Column(String, nullable=True)

    meals = relationship("Meal", back_populates="user")
    bazar_entries = relationship("BazarEntry", back_populates="user")
    expenses = relationship("Expense", back_populates="user")
    deposits = relationship("Deposit", back_populates="user")
