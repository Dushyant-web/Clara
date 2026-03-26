from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.db import get_db
from app.models.newsletter import NewsletterSubscriber, Newsletter
from app.schemas.newsletter_schema import NewsletterSubscribeRequest
from app.utils.admin_auth import admin_required
from app.services.email_service import send_email

router = APIRouter()

@router.post("/newsletter/subscribe")
def subscribe(data: NewsletterSubscribeRequest, db: Session = Depends(get_db)):
    email = data.email
    existing = db.query(NewsletterSubscriber).filter(
        NewsletterSubscriber.email == email
    ).first()

    if existing:
        return {"message": "Already subscribed"}

    sub = NewsletterSubscriber(email=email)
    db.add(sub)
    db.commit()

    return {"message": "Subscribed successfully"}

@router.post("/admin/newsletter", dependencies=[Depends(admin_required)])
def create_newsletter(title: str, content: str, db: Session = Depends(get_db)):
    news = Newsletter(
        title=title,
        content=content
    )
    db.add(news)
    db.commit()
    db.refresh(news)
    return news

@router.post("/admin/newsletter/send", dependencies=[Depends(admin_required)])
def send_newsletter(newsletter_id: int, db: Session = Depends(get_db)):
    newsletter = db.query(Newsletter).filter(
        Newsletter.id == newsletter_id
    ).first()

    if not newsletter:
        return {"error": "Newsletter not found"}

    subscribers = db.query(NewsletterSubscriber).all()
    emails = [s.email for s in subscribers]

    for email in emails:
        try:
            send_email(
                to_email=email, 
                subject=newsletter.title, 
                body=newsletter.content
            )
        except Exception as e:
            print(f"Failed to send to {email}: {e}")

    return {
        "newsletter": newsletter.title,
        "sent_to": emails,
        "status": "broadcasting_complete"
    }