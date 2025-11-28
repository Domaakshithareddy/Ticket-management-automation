from datetime import datetime

def ticket_document(ticketId: str,
                    userId: str,
                    subject: str,
                    description: str,
                    urgency: str,
                    company: str,
                    category: str = "General",
                    priority: str = "Medium",
                    status: str = "open",
                    adminSuggestion: str | None = None):
    return {
        "ticketId": ticketId,
        "userId": userId,
        "company": company,               # Useful for multi-company filtering later
        "subject": subject,
        "description": description,
        "urgency": urgency,               # low / medium / high / critical
        "category": category,             # can later be AI-classified
        "priority": priority,             # Low / Medium / High / Critical
        "status": status,                 # open / in_progress / resolved
        "adminSuggestion": adminSuggestion,
        "createdAt": datetime.utcnow(),
        "updatedAt": datetime.utcnow(),
    }
