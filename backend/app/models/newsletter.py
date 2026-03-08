from sqlalchemy import Column, Integer, String
from app.database.db import Base

class NewsletterSubscriber(Base):
    __tablename__ = "newsletter_subscribers"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)

class Newsletter(Base):
    __tablename__ = "newsletters"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String)
    content = Column(String)