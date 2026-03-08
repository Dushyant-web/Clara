from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.sql import func
from app.database.db import Base


class User(Base):

    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)

    phone = Column(String(20), unique=True, nullable=False)

    email = Column(String(255), nullable=True)

    name = Column(String(255), nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())