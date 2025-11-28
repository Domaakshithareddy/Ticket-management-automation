import uuid

def generate_user_id():
    return "USR-" + uuid.uuid4().hex[:8].upper()

def generate_ticket_id():
    return "TKT-" + uuid.uuid4().hex[:8].upper()