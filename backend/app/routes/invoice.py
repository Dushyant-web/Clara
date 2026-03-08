from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from io import BytesIO
from reportlab.pdfgen import canvas

from app.database.db import get_db
from app.models.order import Order
from app.models.order_item import OrderItem

router = APIRouter()


@router.get("/invoice/{order_id}")
def generate_invoice(order_id: int, db: Session = Depends(get_db)):

    order = db.query(Order).filter(Order.id == order_id).first()

    if not order:
        return {"error": "Order not found"}

    items = db.query(OrderItem).filter(OrderItem.order_id == order_id).all()

    buffer = BytesIO()

    pdf = canvas.Canvas(buffer)

    pdf.drawString(100, 800, f"CLARA - Invoice")
    pdf.drawString(100, 770, f"Order ID: {order.id}")
    pdf.drawString(100, 750, f"Total: ₹{order.total_amount}")

    y = 700

    for item in items:
        pdf.drawString(100, y, f"Product ID: {item.product_id}  Qty: {item.quantity}")
        y -= 20

    pdf.save()

    buffer.seek(0)

    return StreamingResponse(
        buffer,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f"attachment; filename=invoice_{order_id}.pdf"
        }
    )