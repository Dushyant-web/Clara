from fastapi import APIRouter
from fastapi.responses import FileResponse

router = APIRouter()

@router.get("/invoice/{order_id}")
def download_invoice(order_id: int):

    path = f"invoices/invoice_{order_id}.pdf"

    return FileResponse(
        path,
        media_type="application/pdf",
        filename=f"invoice_{order_id}.pdf"
    )