from sqlalchemy import Column, Integer, String, Text
from app.database.db import Base

class Lookbook(Base):
    __tablename__ = "lookbooks"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    image = Column(String, nullable=True)
    season = Column(String, nullable=True)