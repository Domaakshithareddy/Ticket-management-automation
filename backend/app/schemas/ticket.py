from pydantic import BaseModel
from typing import Literal, Optional

UrgencyType = Literal["low", "medium", "high", "critical"]
PriorityType = Literal["Low", "Medium", "High", "Critical"]
# Accept both 'in_progress' and 'pending' (frontend uses 'pending')
StatusType = Literal["open", "in_progress", "pending", "resolved"]

class TicketCreate(BaseModel):
    subject: str
    description: str
    urgency: UrgencyType
    # optional user-facing category; can be None and set by AI later
    category: Optional[str] = None

class TicketResponse(BaseModel):
    ticketId: str
    subject: str
    description: str
    urgency: UrgencyType
    category: str
    priority: PriorityType
    status: StatusType
    adminSuggestion: Optional[str] = None

class TicketListItem(BaseModel):
    ticketId: str
    subject: str
    priority: PriorityType
    status: StatusType
    category: str

class AdminTicketUpdate(BaseModel):
    priority: Optional[PriorityType] = None
    status: Optional[StatusType] = None
    urgency: Optional[UrgencyType] = None
    adminSuggestion: Optional[str] = None
