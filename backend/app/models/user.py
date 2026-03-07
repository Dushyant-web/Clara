from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.sql import func
from app.database.db import Base


class User(Base):

    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)

    phone_number = Column(String, unique=True, index=True, nullable=False)

    email = Column(String, nullable=True)

    name = Column(String, nullable=True)

    google_id = Column(String, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())