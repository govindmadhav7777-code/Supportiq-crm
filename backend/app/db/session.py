"""
Database connection setup.

Why this file exists:
SQLAlchemy needs three things to talk to Postgres: an `engine` (the
actual connection pool), a `SessionLocal` factory (creates a new
DB session per request), and a `Base` class (that all our models
inherit from, so SQLAlchemy knows what tables to create).

Splitting this into its own module means every other file just does
`from app.db.session import get_db` without caring how the connection
is configured underneath.
"""
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

from app.core.config import settings

engine = create_engine(settings.DATABASE_URL)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    """
    FastAPI dependency that provides a DB session per request and
    guarantees it's closed afterward — even if the request raises
    an error. Used like: `db: Session = Depends(get_db)` in routes.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
