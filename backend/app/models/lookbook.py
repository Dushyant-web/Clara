from sqlalchemy import Column, Integer, String, Text,ForeignKey
from app.database.db import Base

class Lookbook(Base):
    __tablename__ = "lookbooks"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    image = Column(String, nullable=True)
    season = Column(String, nullable=True)

class LookbookImage(Base):
    __tablename__ = "lookbook_images"

    id = Column(Integer, primary_key=True)
    lookbook_id = Column(Integer, ForeignKey("lookbooks.id"))
    image_url = Column(String)