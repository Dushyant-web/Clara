from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
import os

def generate_invoice(order, items):

    filename = f"invoice_{order.id}.pdf"
    filepath = f"invoices/{filename}"

    os.makedirs("invoices", exist_ok=True)

    c = canvas.Canvas(filepath, pagesize=letter)

    c.drawString(50, 750, f"Invoice ID: {order.id}")
    c.drawString(50, 730, f"Order ID: {order.id}")
    c.drawString(50, 710, f"Customer ID: {order.user_id}")

    y = 670

    for item in items:
        c.drawString(50, y, f"Product Variant: {item.variant_id}")
        c.drawString(200, y, f"Qty: {item.quantity}")
        c.drawString(300, y, f"Price: {item.price}")
        y -= 20

    c.drawString(50, y-20, f"Total: {order.total_amount}")

    c.save()

    return filepath