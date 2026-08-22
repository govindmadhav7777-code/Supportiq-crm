"""
App entrypoint.

Kept intentionally thin: this file just creates the FastAPI instance,
wires up middleware (CORS), and includes routers. Actual logic lives
in app/api/, app/models/, etc. This separation means the app stays
readable as it grows — you're never scrolling through 500 lines to
find one endpoint.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.db.session import engine
from app.db import base  # noqa: F401
from app.api import auth, contacts, deals

app = FastAPI(title=settings.PROJECT_NAME)

app.include_router(auth.router, prefix=settings.API_V1_PREFIX)
app.include_router(contacts.router, prefix=settings.API_V1_PREFIX)
app.include_router(deals.router, prefix=settings.API_V1_PREFIX)


@app.on_event("startup")
def create_tables():
    base.Base.metadata.create_all(bind=engine)


app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health_check():
    return {"status": "ok", "service": settings.PROJECT_NAME}