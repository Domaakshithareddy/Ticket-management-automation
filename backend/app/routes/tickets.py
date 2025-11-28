from fastapi import APIRouter, Depends, HTTPException, status
from typing import List

from app.utils.auth_utils import get_current_user, get_current_admin
from app.schemas.ticket import (
    TicketCreate,
    TicketResponse,
    TicketListItem,
    AdminTicketUpdate,
)
from app.services.ticket_service import (
    create_ticket_for_user,
    get_tickets_for_user,
    get_all_tickets,
    get_ticket_by_id,
    admin_update_ticket,
)

router = APIRouter(prefix="/tickets", tags=["Tickets"])

# Helper to convert Mongo doc -> TicketResponse
def ticket_doc_to_response(doc: dict) -> TicketResponse:
    return TicketResponse(
        ticketId=doc["ticketId"],
        subject=doc["subject"],
        description=doc["description"],
        urgency=doc["urgency"],
        category=doc["category"],
        priority=doc["priority"],
        status=doc["status"],
        adminSuggestion=doc.get("adminSuggestion"),
    )

def ticket_doc_to_list_item(doc: dict) -> TicketListItem:
    return TicketListItem(
        ticketId=doc["ticketId"],
        subject=doc["subject"],
        category=doc["category"],
        priority=doc["priority"],
        status=doc["status"],
    )

# User: Create ticket
@router.post("/", response_model=TicketResponse)
async def create_ticket(
    payload: TicketCreate,
    current_user=Depends(get_current_user)
):
    doc = await create_ticket_for_user(current_user, payload)
    return ticket_doc_to_response(doc)

# User: See all their own tickets
@router.get("/me", response_model=List[TicketListItem])
async def list_my_tickets(current_user=Depends(get_current_user)):
    docs = await get_tickets_for_user(current_user["userId"])
    return [ticket_doc_to_list_item(d) for d in docs]

# User: See details of one ticket (but only if it belongs to them or they are admin)
@router.get("/{ticketId}", response_model=TicketResponse)
async def get_ticket_details(ticketId: str, current_user=Depends(get_current_user)):
    doc = await get_ticket_by_id(ticketId)
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Ticket not found")

    if current_user["role"] != "admin" and doc["userId"] != current_user["userId"]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN,
                            detail="Not authorized to view this ticket")

    return ticket_doc_to_response(doc)

# Admin: See ALL tickets
@router.get("/", response_model=List[TicketListItem])
async def list_all_tickets(current_admin=Depends(get_current_admin)):
    docs = await get_all_tickets()
    return [ticket_doc_to_list_item(d) for d in docs]

# Admin: Update priority / status / suggestion
@router.patch("/{ticketId}/admin-update", response_model=TicketResponse)
async def admin_update_ticket_endpoint(
    ticketId: str,
    payload: AdminTicketUpdate,
    current_admin=Depends(get_current_admin)
):
    updated = await admin_update_ticket(ticketId, payload)
    if not updated:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Ticket not found")

    return ticket_doc_to_response(updated)
