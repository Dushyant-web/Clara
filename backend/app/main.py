from fastapi import FastAPI
from app.routes import auth

app = FastAPI(title="CLARA API")

app.include_router(auth.router, prefix="/auth")

@app.get("/")
def root():
    return {"message": "CLARA backend running"}



