from fastapi import FastAPI
from app.routes import auth

from fastapi.middleware.cors import CORSMiddleware
from app.routes import products
from app.routes import categories
from app.routes import cart

app = FastAPI(title="CLARA API")

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

app.include_router(auth.router, prefix="/auth")
app.include_router(products.router)
app.include_router(categories.router)
app.include_router(cart.router)

@app.get("/")
def root():
    return {"message": "CLARA backend running"}
