from typing import List, Optional
from datetime import datetime

from app.database import tickets_collection
from app.utils.id_generator import generate_ticket_id
from app.models.ticket import ticket_document
from app.schemas.ticket import TicketCreate, AdminTicketUpdate

async def create_ticket_for_user(user: dict, payload: TicketCreate):
    ticket_id = generate_ticket_id()

    category = payload.category or "General"  # later you can plug AI classifier here
    priority = "Medium"                       # simple default; can also depend on urgency

    doc = ticket_document(
        ticketId=ticket_id,
        userId=user["userId"],
        subject=payload.subject,
        description=payload.description,
        urgency=payload.urgency,
        company=user.get("company", "Unknown"),
        category=category,
        priority=priority,
        status="open",
        adminSuggestion=None,
    )

    await tickets_collection.insert_one(doc)
    return doc

async def get_tickets_for_user(userId: str):
    cursor = tickets_collection.find({"userId": userId}).sort("createdAt", -1)
    docs = await cursor.to_list(length=1000)
    return docs

async def get_all_tickets():
    cursor = tickets_collection.find({}).sort("createdAt", -1)
    docs = await cursor.to_list(length=1000)
    return docs

async def get_ticket_by_id(ticketId: str) -> Optional[dict]:
    return await tickets_collection.find_one({"ticketId": ticketId})

async def admin_update_ticket(ticketId: str, update_data: AdminTicketUpdate):
    update_fields = {}

    if update_data.priority is not None:
        update_fields["priority"] = update_data.priority
    if update_data.urgency is not None:
        # urgency stored as lowercase values
        update_fields["urgency"] = update_data.urgency
    if update_data.status is not None:
        # Accept 'pending' from frontend and map to internal 'in_progress'
        status_val = update_data.status
        if status_val == 'pending':
            status_val = 'in_progress'
        update_fields["status"] = status_val
    if update_data.adminSuggestion is not None:
        update_fields["adminSuggestion"] = update_data.adminSuggestion

    if not update_fields:
        return None

    update_fields["updatedAt"] = datetime.utcnow()

    result = await tickets_collection.update_one(
        {"ticketId": ticketId},
        {"$set": update_fields}
    )

    if result.matched_count == 0:
        return None

    updated = await get_ticket_by_id(ticketId)
    return updated
