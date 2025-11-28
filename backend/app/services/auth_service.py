from app.database import users_collection
from app.utils.auth_utils import (
    hash_password,
    verify_password,
    create_access_token
)
from app.utils.id_generator import generate_user_id
from app.models.user import user_document


# REGISTER USER
async def register_user(name: str, email: str, password: str, company: str):
    existing = await users_collection.find_one({"email": email})
    if existing:
        return None

    new_user_id = generate_user_id()
    hashed = hash_password(password)

    new_user = user_document(
        userId=new_user_id,
        name=name,
        email=email,
        hashed_password=hashed,
        company=company                  # passed here
    )

    await users_collection.insert_one(new_user)
    return new_user

# LOGIN USER
async def authenticate_user(email: str, password: str):
    user = await users_collection.find_one({"email": email})
    if not user:
        return None

    if not verify_password(password, user["password"]):
        return None

    return user


# CREATE JWT TOKEN
def generate_user_token(user):
    token = create_access_token({
        "userId": user["userId"],
        "email": user["email"],
        "role": user["role"]
    })
    return token
