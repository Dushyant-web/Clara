from sqlalchemy import Column, Integer, ForeignKey, UniqueConstraint, DateTime
from sqlalchemy.sql import func
from app.database.db import Base


class ReviewVote(Base):
    __tablename__ = "review_votes"
    __table_args__ = (
        UniqueConstraint("review_id", "user_id", name="unique_vote_per_review"),
    )

    id = Column(Integer, primary_key=True, index=True)
    review_id = Column(Integer, ForeignKey("reviews.id", ondelete="CASCADE"))
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
