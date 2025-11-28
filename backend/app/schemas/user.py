from pydantic import BaseModel, EmailStr
from typing import Literal

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    company: Literal["CompanyA", "CompanyB", "CompanyC"]   # user selects one

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    userId: str
    name: str
    email: str
    company: str
    role: str = "user"