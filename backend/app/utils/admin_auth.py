from fastapi import Header, HTTPException, Depends
import os

def admin_required(x_admin_password: str = Header(None)):
    if x_admin_password != os.getenv("ADMIN_PASSWORD"):
        raise HTTPException(status_code=401, detail="Invalid admin password")
