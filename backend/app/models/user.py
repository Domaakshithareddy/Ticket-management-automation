def user_document(userId, name, email, hashed_password, company):
    return {
        "userId": userId,
        "name": name,
        "email": email,
        "password": hashed_password,
        "company": company,          # <--- NEW FIELD
        "role": "user"
    }
