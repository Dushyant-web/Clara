from sqlalchemy import Column, Integer, String, Text
from app.database.db import Base

class Collection(Base):
    __tablename__ = "collections"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    slug = Column(String, unique=True, index=True)
    description = Column(Text, nullable=True)
    image = Column(String, nullable=True)