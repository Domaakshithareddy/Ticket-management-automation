from fastapi import FastAPI
from app.routes import auth, tickets   # make sure app/routes/__init__.py exists

app = FastAPI(title="Smart Ticketing Backend")

app.include_router(auth.router)
app.include_router(tickets.router)

@app.get("/")
def root():
    return {"message": "Smart Ticketing API running"}
