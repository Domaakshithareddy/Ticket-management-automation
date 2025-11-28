from fastapi import APIRouter, HTTPException
from app.schemas.user import UserCreate, UserLogin
from app.services.auth_service import register_user, authenticate_user, generate_user_token

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register")
async def register(payload: UserCreate):
    user = await register_user(
        name=payload.name,
        email=payload.email,
        password=payload.password,
        company=payload.company,
    )

    if not user:
        raise HTTPException(status_code=400, detail="Email already registered")

    return {"message": "User registered successfully"}

@router.post("/login")
async def login(payload: UserLogin):
    user = await authenticate_user(payload.email, payload.password)

    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = generate_user_token(user)

    return {
        "message": "Login successful",
        "token": token,
        "user": {
            "userId": user["userId"],
            "name": user["name"],
            "email": user["email"],
            "role": user["role"]
        }
    }
