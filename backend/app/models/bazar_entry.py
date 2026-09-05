from sqlalchemy import Column, Float, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from app.database import Base


class BazarEntry(Base):
    __tablename__ = "bazar_entries"

    id = Column(Integer, primary_key=True, autoincrement=True)
    date = Column(String, nullable=False)
    amount = Column(Float, nullable=False)
    description = Column(String, nullable=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    user = relationship("User", back_populates="bazar_entries")
