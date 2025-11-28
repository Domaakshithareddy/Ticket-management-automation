from motor.motor_asyncio import AsyncIOMotorClient
from app.config import settings

client = AsyncIOMotorClient(settings.MONGO_URI)

# FIX: correct database name
db = client["Ticket_management"]

users_collection = db["Users"]
tickets_collection = db["tickets"]
logs_collection = db["logs"]
