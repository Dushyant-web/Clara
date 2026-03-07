from fastapi import FastAPI
from app.routes import auth

from fastapi.middleware.cors import CORSMiddleware

origins = [
    "http://localhost:5173",
    "https://clara-test-v1.netlify.app"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app = FastAPI(title="CLARA API")

app.include_router(auth.router, prefix="/auth")

@app.get("/")
def root():
    return {"message": "CLARA backend running"}



