from sqlalchemy import Column, Integer, String, ForeignKey
from app.database.db import Base

class ReviewMedia(Base):
    __tablename__ = "review_media"

    id = Column(Integer, primary_key=True)
    review_id = Column(Integer, ForeignKey("reviews.id"))
    media_url = Column(String)
    media_type = Column(String)