from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import auth, tickets   # make sure app/routes/__init__.py exists

app = FastAPI(title="Smart Ticketing Backend")

# Enable CORS so the frontend can make requests (including preflight OPTIONS)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(tickets.router)


@app.get("/")
def root():
    return {"message": "Smart Ticketing API running"}
