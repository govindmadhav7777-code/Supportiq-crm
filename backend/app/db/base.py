"""
Imports every model so SQLAlchemy's Base.metadata knows about all
tables in one place. Without this, importing `Base` alone wouldn't
tell SQLAlchemy that `User` and `Contact` exist — Python only
registers a model with Base when its module actually gets imported.

Later, Alembic's migration config will import from *this* file
instead of guessing which models exist.
"""
from app.db.session import Base  # noqa: F401
from app.models.user import User  # noqa: F401
from app.models.contact import Contact  # noqa: F401
