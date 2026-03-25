from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.db import get_db
from app.models.newsletter import NewsletterSubscriber, Newsletter

from app.utils.admin_auth import admin_required

router = APIRouter()


@router.post("/newsletter/subscribe")
def subscribe(email: str, db: Session = Depends(get_db)):

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

    subscribers = db.query(NewsletterSubscriber).all()

    emails = [s.email for s in subscribers]

    return {
        "newsletter": newsletter.title,
        "sent_to": emails
    }