import os
import requests
from sqlalchemy.orm import Session

from app.models.order_item import OrderItem
from app.models.product_variant import ProductVariant
from app.models.product import Product
from app.models.address import Address

BASE_URL = "https://apiv2.shiprocket.in/v1/external"


def get_shiprocket_token():

    email = os.getenv("SHIPROCKET_EMAIL")
    password = os.getenv("SHIPROCKET_PASSWORD")

    url = f"{BASE_URL}/auth/login"

    response = requests.post(url, json={
        "email": email,
        "password": password
    })

    data = response.json()

    if "token" not in data:
        raise Exception(f"Shiprocket auth failed: {data}")

    return data["token"]


def create_shipment(order, db: Session):

    token = get_shiprocket_token()

    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }

    # Get order items
    items_db = db.query(OrderItem).filter(OrderItem.order_id == order.id).all()

    order_items = []

    for item in items_db:

        variant = db.query(ProductVariant).filter(
            ProductVariant.id == item.variant_id
        ).first()

        product = db.query(Product).filter(
            Product.id == variant.product_id
        ).first()

        order_items.append({
            "name": product.name,
            "sku": variant.sku or f"SKU-{variant.id}",
            "units": item.quantity,
            "selling_price": float(item.price)
        })

    # Get shipping address
    address = db.query(Address).filter(
        Address.id == order.shipping_address_id
    ).first()

    # Get User email
    from app.models.user import User
    user = db.query(User).filter(User.id == order.user_id).first()
    customer_email = user.email if user else "customer@email.com"

    # Split name into first and last (Shiprocket requires both)
    name_parts = (address.name or "Customer").strip().split(" ", 1)
    billing_first_name = name_parts[0]
    billing_last_name = name_parts[1] if len(name_parts) > 1 else "Customer"

    payload = {
        "order_id": f"GAURK_{order.id}",
        "order_date": str(order.created_at.date()),
        "pickup_location": "GANESH",

        "billing_customer_name": billing_first_name,
        "billing_last_name": billing_last_name,
        "billing_address": address.address_line,
        "billing_city": address.city,
        "billing_pincode": address.postal_code,
        "billing_state": address.state,
        "billing_country": address.country,
        "billing_email": customer_email,
        "billing_phone": address.phone,

        "shipping_is_billing": True,

        "order_items": order_items,

        "payment_method": "Prepaid",
        "sub_total": float(order.total_amount),

        "length": 10,
        "breadth": 10,
        "height": 5,
        "weight": 0.5
    }

    response = requests.post(
        f"{BASE_URL}/orders/create/adhoc",
        json=payload,
        headers=headers
    )

    data = response.json()

    print("Shiprocket response:", data)

    return data


def get_shiprocket_tracking(shipment_id: str):
    token = get_shiprocket_token()

    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }

    response = requests.get(
        f"{BASE_URL}/courier/track/shipment/{shipment_id}",
        headers=headers
    )

    data = response.json()
    return data