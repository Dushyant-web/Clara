from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from io import BytesIO
from reportlab.pdfgen import canvas

from app.database.db import get_db
from app.models.order import Order
from app.models.order_item import OrderItem
from app.models.product_variant import ProductVariant
from app.models.product import Product
from app.models.user import User

router = APIRouter()


@router.get("/invoice/{order_id}")
def generate_invoice(order_id: int, db: Session = Depends(get_db)):

    order = db.query(Order).filter(Order.id == order_id).first()

    if not order:
        return {"error": "Order not found"}

    items = db.query(OrderItem).filter(OrderItem.order_id == order_id).all()

    user = db.query(User).filter(User.id == order.user_id).first()

    buffer = BytesIO()

    pdf = canvas.Canvas(buffer)

    # Header
    pdf.setFont("Helvetica-Bold", 18)
    pdf.drawString(50, 800, "CLARA")

    pdf.setFont("Helvetica", 12)
    pdf.drawString(50, 780, "Fashion & Lifestyle")

    pdf.line(50, 770, 550, 770)

    # Order information
    pdf.setFont("Helvetica-Bold", 12)
    pdf.drawString(50, 740, f"Invoice for Order #{order.id}")

    pdf.setFont("Helvetica", 11)
    pdf.drawString(50, 720, f"Total Amount: ₹{order.total_amount}")

    # Customer information
    if user:
        pdf.drawString(350, 740, f"Customer: {user.name}")
        pdf.drawString(350, 720, f"Email: {user.email}")
        pdf.drawString(350, 700, f"Phone: {user.phone}")

    pdf.line(50, 680, 550, 680)

    # Table headers
    pdf.setFont("Helvetica-Bold", 12)
    pdf.drawString(60, 650, "Product")
    pdf.drawString(300, 650, "Qty")
    pdf.drawString(360, 650, "Price")
    pdf.drawString(440, 650, "Total")

    pdf.line(50, 640, 550, 640)

    y = 620

    pdf.setFont("Helvetica", 11)

    for item in items:
        variant = db.query(ProductVariant).filter(ProductVariant.id == item.variant_id).first()
        product_name = "Unknown"
        price = 0

        if variant:
            price = variant.price
            product = db.query(Product).filter(Product.id == variant.product_id).first()
            if product:
                size = variant.size if variant.size else ""
                color = variant.color if variant.color else ""
                product_name = f"{product.name} {color} {size}".strip()

        line_total = price * item.quantity

        pdf.drawString(60, y, product_name)
        pdf.drawString(300, y, str(item.quantity))
        pdf.drawString(360, y, f"₹{price}")
        pdf.drawString(440, y, f"₹{line_total}")

        y -= 20

    pdf.line(50, y-10, 550, y-10)

    pdf.setFont("Helvetica-Bold", 12)
    pdf.drawString(400, y-40, f"Total: ₹{order.total_amount}")

    pdf.save()

    buffer.seek(0)

    return StreamingResponse(
        buffer,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f"attachment; filename=invoice_{order_id}.pdf"
        }
    )