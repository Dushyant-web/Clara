from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from io import BytesIO
import os
from reportlab.pdfgen import canvas
from reportlab.lib.utils import ImageReader

from app.database.db import get_db
from app.models.order import Order
from app.models.order_item import OrderItem
from app.models.product_variant import ProductVariant
from app.models.product import Product
from app.models.user import User
from app.models.payment import Payment
from app.utils.jwt_handler import get_current_user_id
from app.services.shiprocket_service import get_shiprocket_invoice

router = APIRouter()


@router.get("/invoice/{order_id}")
def generate_invoice(order_id: int, db: Session = Depends(get_db), auth_user_id: int = Depends(get_current_user_id)):

    order = db.query(Order).filter(Order.id == order_id).first()

    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    if order.user_id != auth_user_id:
        raise HTTPException(status_code=403, detail="Cannot access another user's invoice")

    items = db.query(OrderItem).filter(OrderItem.order_id == order_id).all()

    user = db.query(User).filter(User.id == order.user_id).first()

    buffer = BytesIO()

    pdf = canvas.Canvas(buffer)

    # Header with logo
    try:
        logo = ImageReader("assets/clara_logo.png")
        pdf.drawImage(logo, 50, 780, width=60, height=60, mask='auto')
    except (FileNotFoundError, OSError):
        pass  # Logo image missing — skip, invoice still valid

    pdf.setFont("Helvetica-Bold", 20)
    pdf.drawString(120, 805, "CLARA")

    pdf.setFont("Helvetica", 12)
    pdf.drawString(120, 785, "Luxury Wear")

    pdf.line(50, 770, 550, 770)

    # Order information
    pdf.setFont("Helvetica-Bold", 12)
    pdf.drawString(50, 740, f"Invoice for Order #{order.id}")
    if hasattr(order, "created_at"):
        pdf.drawString(50, 725, f"Date: {order.created_at.strftime('%d %B %Y')}")

    pdf.setFont("Helvetica", 11)

    # Billing information
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

    # Table grid top line
    pdf.line(50, 660, 550, 660)
    pdf.line(50, 640, 550, 640)

    y = 620

    pdf.setFont("Helvetica", 11)

    subtotal = 0

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
        subtotal += line_total

        pdf.drawString(60, y, product_name)
        pdf.drawString(300, y, str(item.quantity))
        pdf.drawString(360, y, f"₹{price}")
        pdf.drawString(440, y, f"₹{line_total}")

        y -= 20
        pdf.line(50, y+10, 550, y+10)

    pdf.line(50, y-10, 550, y-10)
    subtotal = float(subtotal)
    gst = round(subtotal * 0.18, 2)
    grand_total = order.total_amount
    promo_discount = round((subtotal + gst) - grand_total, 2)

    pdf.setFont("Helvetica", 11)
    pdf.drawString(350, y-40, f"Subtotal: ₹{subtotal}")

    pdf.drawString(350, y-60, f"GST (18%): ₹{gst}")

    if promo_discount > 0:
        pdf.drawString(350, y-80, f"Promo Discount: -₹{promo_discount}")
        pdf.setFont("Helvetica-Bold", 12)
        pdf.drawString(350, y-110, f"Grand Total: ₹{grand_total}")
    else:
        pdf.setFont("Helvetica-Bold", 12)
        pdf.drawString(350, y-80, f"Grand Total: ₹{grand_total}")

    # QR placeholder for payment reference
    try:
        qr = ImageReader("assets/payment_qr.png")
        pdf.drawImage(qr, 50, 100, width=100, height=100, mask='auto')
        pdf.setFont("Helvetica", 9)
        pdf.drawString(50, 90, "Scan for payment reference")
    except (FileNotFoundError, OSError):
        pass  # QR image missing — skip silently

    pdf.save()

    buffer.seek(0)

    return StreamingResponse(
        buffer,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f"attachment; filename=invoice_{order_id}.pdf"
        }
    )


@router.get("/invoice/razorpay/{order_id}")
def get_razorpay_invoice(order_id: int, db: Session = Depends(get_db), auth_user_id: int = Depends(get_current_user_id)):
    """Return Razorpay-hosted tax invoice URL for prepaid orders."""
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    if order.user_id != auth_user_id:
        raise HTTPException(status_code=403, detail="Cannot access another user's invoice")

    payment = db.query(Payment).filter(Payment.order_id == order_id).first()
    if not payment or payment.provider == "cod":
        raise HTTPException(status_code=400, detail="Razorpay invoice is only available for prepaid orders")
    if payment.status != "paid":
        raise HTTPException(status_code=400, detail="Razorpay invoice available only after payment is captured")

    import razorpay
    key_id = (os.getenv("RAZORPAY_KEY_ID") or "").strip()
    key_secret = (os.getenv("RAZORPAY_KEY_SECRET") or "").strip()
    if not key_id or not key_secret:
        raise HTTPException(status_code=503, detail="Razorpay invoice service unavailable")
    client = razorpay.Client(auth=(key_id, key_secret))

    user = db.query(User).filter(User.id == order.user_id).first()
    items = db.query(OrderItem).filter(OrderItem.order_id == order_id).all()

    line_items = []
    for item in items:
        variant = db.query(ProductVariant).filter(ProductVariant.id == item.variant_id).first()
        product_name = "Item"
        unit_price = float(item.price) if item.price else 0
        if variant:
            unit_price = float(variant.price)
            product = db.query(Product).filter(Product.id == variant.product_id).first()
            if product:
                size = variant.size or ""
                color = variant.color or ""
                product_name = f"{product.name} {color} {size}".strip()
        line_items.append({
            "name": product_name[:255],
            "amount": int(round(unit_price * 100)),
            "currency": "INR",
            "quantity": item.quantity,
        })

    try:
        invoice = client.invoice.create({
            "type": "invoice",
            "description": f"GAURK Order #{order.id}",
            "customer": {
                "name": (user.name or "Customer")[:50] if user else "Customer",
                "email": (user.email or "")[:80] if user else "",
                "contact": (user.phone or "")[:15] if user else "",
            },
            "line_items": line_items,
            "sms_notify": 0,
            "email_notify": 0,
            "currency": "INR",
            "receipt": f"GAURK-{order.id}",
        })
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Razorpay invoice generation failed: {str(e)}")

    return {"invoice_url": invoice.get("short_url"), "invoice_id": invoice.get("id")}


@router.get("/invoice/shiprocket/{order_id}")
def get_shiprocket_invoice_url(order_id: int, db: Session = Depends(get_db), auth_user_id: int = Depends(get_current_user_id)):
    """Return Shiprocket-hosted shipping invoice URL — only available after shipment is created."""
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    if order.user_id != auth_user_id:
        raise HTTPException(status_code=403, detail="Cannot access another user's invoice")
    if not order.shiprocket_order_id:
        raise HTTPException(status_code=400, detail="Shipping invoice not yet available — shipment is being prepared")

    try:
        data = get_shiprocket_invoice(order.shiprocket_order_id)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Shiprocket invoice fetch failed: {str(e)}")

    invoice_url = data.get("invoice_url") if isinstance(data, dict) else None
    if not invoice_url:
        raise HTTPException(status_code=502, detail="Shiprocket did not return an invoice URL")

    return {"invoice_url": invoice_url}