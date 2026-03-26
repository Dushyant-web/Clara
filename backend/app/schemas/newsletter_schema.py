from pydantic import BaseModel, EmailStr

class NewsletterSubscribeRequest(BaseModel):
    email: EmailStr

class NewsletterCreateRequest(BaseModel):
    title: str
    content: str
