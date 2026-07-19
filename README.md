# SupportIQ CRM

A full-stack CRM built to learn and demonstrate production-style backend + frontend engineering.

**Stack:** React + TypeScript + Tailwind CSS · FastAPI (Python) · PostgreSQL · JWT auth · Docker

> 🚧 Work in progress — built incrementally, step by step.

## Project structure

```
supportiq-crm/
├── backend/
│   ├── app/
│   │   ├── main.py          # FastAPI app entrypoint
│   │   ├── core/config.py   # Settings (env-driven)
│   │   ├── api/              # Route handlers
│   │   ├── models/           # SQLAlchemy DB models
│   │   ├── schemas/          # Pydantic request/response schemas
│   │   └── db/                # DB session/engine setup
│   ├── requirements.txt
│   └── .env.example
└── frontend/                  # (coming soon)
```

## Backend — local setup

```bash
cd backend
python -m venv .venv
source .venv/bin/activate      # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env           # then edit .env with your own values
uvicorn app.main:app --reload
```

Visit `http://localhost:8000/docs` for the interactive API docs, or `http://localhost:8000/health` for a liveness check.

## Roadmap

- [x] Project scaffolding + FastAPI skeleton
- [ ] PostgreSQL models (Users, Contacts)
- [ ] JWT authentication
- [ ] Core CRUD (Contacts, Deals)
- [ ] React + TypeScript + Tailwind frontend
- [ ] Frontend auth flow
- [ ] Frontend CRM views (contact list, deal pipeline)
- [ ] Docker Compose for one-command local dev
- [ ] Gemini API integration
