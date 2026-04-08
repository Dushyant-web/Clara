from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.sql import func
from app.database.db import Base


class ReviewReply(Base):
    __tablename__ = "review_replies"

    id = Column(Integer, primary_key=True, index=True)
    review_id = Column(Integer, ForeignKey("reviews.id", ondelete="CASCADE"))
    admin_id = Column(Integer, nullable=True)
    reply = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
