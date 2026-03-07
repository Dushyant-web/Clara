from fastapi import FastAPI

app = FastAPI(title="CLARA API")

@app.get("/")
def root():
    return {"message": "CLARA backend running"}