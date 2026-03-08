from sqlalchemy import Column, Integer, String, ForeignKey
from app.database.db import Base


class Address(Base):

    __tablename__ = "addresses"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(Integer, ForeignKey("users.id"))

    name = Column(String)
    phone = Column(String)

    address_line = Column(String)
    city = Column(String)
    state = Column(String)
    postal_code = Column(String)
    country = Column(String)