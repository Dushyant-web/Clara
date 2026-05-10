import os
import resend

resend.api_key = os.getenv("RESEND_API_KEY")

FROM_EMAIL = os.getenv("FROM_EMAIL", "GAURK <orders@gaurk.shop>")


def _send(to: str, subject: str, html: str):
    """Base sender. Silently logs errors — email failure should never crash an order."""
    if not to or "@" not in to:
        return
    try:
        resend.Emails.send({
            "from": FROM_EMAIL,
            "to": [to],
            "subject": subject,
            "html": html,
        })
    except Exception as e:
        print(f"[Email] Failed to send '{subject}' to {to}: {e}")


# ============================================================================
# Shared HTML base
# ============================================================================

def _wrap(content: str) -> str:
    return f"""
    <div style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;max-width:600px;margin:0 auto;background:#fff;color:#000;">
      <div style="border-bottom:1px solid #eee;padding:32px 40px 24px;">
        <p style="font-size:22px;font-weight:700;letter-spacing:0.15em;margin:0;">GAURK</p>
      </div>
      <div style="padding:40px;">
        {content}
      </div>
      <div style="border-top:1px solid #eee;padding:24px 40px;font-size:11px;color:#999;letter-spacing:0.05em;">
        <p style="margin:0;">GAURK — Luxury Streetwear | gaurk.shop</p>
        <p style="margin:4px 0 0;">Questions? Email <a href="mailto:gaurkclothing@gmail.com" style="color:#000;">gaurkclothing@gmail.com</a> or WhatsApp <a href="https://wa.me/919217960147" style="color:#000;">+91 92179 60147</a></p>
      </div>
    </div>
    """


# ============================================================================
# Transactional emails
# ============================================================================

def send_order_confirmed(to: str, customer_name: str, order_id: int,
                          total: float, payment_method: str, items: list[dict]):
    """Sent immediately after COD confirmation or Razorpay payment success."""
    items_html = "".join([
        f"<tr><td style='padding:8px 0;border-bottom:1px solid #f0f0f0;'>{i.get('name','Item')} x{i.get('qty',1)}</td>"
        f"<td style='padding:8px 0;border-bottom:1px solid #f0f0f0;text-align:right;'>₹{i.get('price',0)}</td></tr>"
        for i in items
    ])
    payment_label = "Cash on Delivery" if payment_method == "cod" else "Prepaid (Online)"

    html = _wrap(f"""
        <p style="font-size:14px;color:#666;letter-spacing:0.1em;text-transform:uppercase;margin:0 0 8px;">Order Confirmed</p>
        <h1 style="font-size:28px;margin:0 0 24px;">Thank you, {customer_name.split()[0] if customer_name else 'there'}.</h1>
        <p style="color:#444;line-height:1.6;">Your order <strong>#{order_id}</strong> has been placed successfully. We'll notify you when it ships.</p>

        <table style="width:100%;border-collapse:collapse;margin:24px 0;">
          <thead><tr>
            <th style="text-align:left;font-size:11px;letter-spacing:0.1em;text-transform:uppercase;padding-bottom:8px;border-bottom:2px solid #000;">Item</th>
            <th style="text-align:right;font-size:11px;letter-spacing:0.1em;text-transform:uppercase;padding-bottom:8px;border-bottom:2px solid #000;">Price</th>
          </tr></thead>
          <tbody>{items_html}</tbody>
          <tfoot><tr>
            <td style="padding-top:12px;font-weight:700;">Total</td>
            <td style="padding-top:12px;font-weight:700;text-align:right;">₹{total:.0f}</td>
          </tr></tfoot>
        </table>

        <p style="font-size:12px;color:#666;"><strong>Payment:</strong> {payment_label}</p>
        <p style="font-size:12px;color:#666;"><strong>Delivery:</strong> 3–5 business days</p>

        <a href="https://gaurk.shop/account" style="display:inline-block;margin-top:24px;padding:14px 32px;background:#000;color:#fff;text-decoration:none;font-size:11px;letter-spacing:0.15em;text-transform:uppercase;">Track Your Order</a>
    """)
    _send(to, f"Order Confirmed — #{order_id} | GAURK", html)


def send_order_shipped(to: str, customer_name: str, order_id: int,
                        awb_code: str, courier: str):
    """Sent when admin marks order as shipped or Shiprocket webhook fires."""
    html = _wrap(f"""
        <p style="font-size:14px;color:#666;letter-spacing:0.1em;text-transform:uppercase;margin:0 0 8px;">Your Order is on its Way</p>
        <h1 style="font-size:28px;margin:0 0 24px;">Shipped, {customer_name.split()[0] if customer_name else 'there'}.</h1>
        <p style="color:#444;line-height:1.6;">Your order <strong>#{order_id}</strong> has been picked up by <strong>{courier or 'our courier partner'}</strong>.</p>

        {"<p style='margin:16px 0;'><strong>AWB / Tracking:</strong> " + awb_code + "</p>" if awb_code else ""}

        <a href="https://gaurk.shop/order/{order_id}" style="display:inline-block;margin-top:24px;padding:14px 32px;background:#000;color:#fff;text-decoration:none;font-size:11px;letter-spacing:0.15em;text-transform:uppercase;">Track Live</a>

        <p style="margin-top:24px;color:#666;font-size:12px;">Estimated delivery: 3–5 business days from shipment.</p>
    """)
    _send(to, f"Your Order #{order_id} is Shipped — GAURK", html)


def send_order_delivered(to: str, customer_name: str, order_id: int):
    """Sent when order status updated to delivered."""
    html = _wrap(f"""
        <p style="font-size:14px;color:#666;letter-spacing:0.1em;text-transform:uppercase;margin:0 0 8px;">Delivered</p>
        <h1 style="font-size:28px;margin:0 0 24px;">Your order arrived, {customer_name.split()[0] if customer_name else 'there'}.</h1>
        <p style="color:#444;line-height:1.6;">Order <strong>#{order_id}</strong> has been delivered. We hope you love your piece.</p>
        <p style="color:#444;line-height:1.6;">If anything is off, reach us within <strong>3 days</strong> for returns/exchanges.</p>

        <a href="https://gaurk.shop/products" style="display:inline-block;margin-top:24px;padding:14px 32px;background:#000;color:#fff;text-decoration:none;font-size:11px;letter-spacing:0.15em;text-transform:uppercase;">Shop Again</a>

        <p style="margin-top:24px;font-size:12px;color:#666;">Leave a review — it helps us grow.</p>
        <a href="https://gaurk.shop/account" style="font-size:11px;color:#000;">Write a Review →</a>
    """)
    _send(to, f"Delivered — Order #{order_id} | GAURK", html)


def send_newsletter_welcome(to: str):
    """Sent when someone subscribes to newsletter."""
    html = _wrap(f"""
        <h1 style="font-size:28px;margin:0 0 24px;">Welcome to GAURK.</h1>
        <p style="color:#444;line-height:1.6;">You're on the list. First to know about new drops, limited editions, and exclusive access.</p>
        <p style="color:#444;line-height:1.6;">We don't spam. Only what matters.</p>

        <a href="https://gaurk.shop/shop" style="display:inline-block;margin-top:32px;padding:14px 32px;background:#000;color:#fff;text-decoration:none;font-size:11px;letter-spacing:0.15em;text-transform:uppercase;">Explore Collection</a>
    """)
    _send(to, "Welcome to GAURK", html)
