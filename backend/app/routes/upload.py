# backend/app/routes/upload.py
from fastapi import APIRouter, File, UploadFile
import cloudinary
import cloudinary.uploader
import os

router = APIRouter()

# Cloudinary config (set these in environment variables)
cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET")
)


@router.post("/upload/image")
async def upload_image(file: UploadFile = File(...)):
    result = cloudinary.uploader.upload(file.file, resource_type="image")

    return {
        "url": result["secure_url"],
        "type": "image"
    }


@router.post("/upload/video")
async def upload_video(file: UploadFile = File(...)):
    result = cloudinary.uploader.upload(file.file, resource_type="video")

    return {
        "url": result["secure_url"],
        "type": "video"
    }
