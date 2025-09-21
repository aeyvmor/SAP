from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter(prefix="/api/auth", tags=["Auth"])

class LoginRequest(BaseModel):
    username: str
    password: str

@router.post("/login")
def login(payload: LoginRequest):
    # Demo stub: accept any username/password
    if not payload.username:
        raise HTTPException(status_code=400, detail="username required")
    # Return a simple token (not secure) for demo
    return {"access_token": f"demo-token-for-{payload.username}", "token_type": "bearer"}

@router.get("/me")
def me(token: str = ""):
    # stub
    return {"username": "demo-user"}
