# Finance Tracker

Personal income and expense tracker with multi-currency support, budget tracking, and pattern visibility reporting.

## Stack

- **Backend**: FastAPI, SQLAlchemy (async), PostgreSQL, Redis, Alembic
- **Frontend**: React (web), React Native (mobile) — in progress
- **Infrastructure**: Docker, Docker Compose

---

## Getting started

### 1. Clone and configure

```bash
git clone <repo-url>
cd finance-tracker
cp backend/.env.example backend/.env
```

Edit `backend/.env` and fill in:
- `JWT_SECRET` — any long random string
- `EXCHANGE_RATE_API_KEY` — get a free key from https://openexchangerates.org

### 2. Start services

```bash
make build
```

This starts the API (port 8000), PostgreSQL (port 5432), and Redis (port 6379).

### 3. Run migrations

```bash
make migrate
```

### 4. Seed default categories

```bash
make seed
```

This populates the `default_categories` table. Every new user gets a copy of these on registration.

### 5. Verify

Visit http://localhost:8000/docs for the interactive API docs.

---

## Common commands

| Command | What it does |
|---|---|
| `make up` | Start all services |
| `make down` | Stop all services |
| `make logs` | Tail API logs |
| `make shell` | Open a shell inside the API container |
| `make migrate` | Apply pending migrations |
| `make seed` | Populate default categories |
| `make migration msg="add indexes"` | Generate a new migration |
| `make test` | Run the test suite |

---

## API overview

All endpoints live under `/api/v1`. Every response uses the envelope:

```json
{ "status": "success", "data": { ... }, "message": null }
```

Protected endpoints require `Authorization: Bearer <access_token>`.

| Namespace | Base path |
|---|---|
| Auth | `/api/v1/auth` |
| Users | `/api/v1/users` |
| Categories | `/api/v1/categories` |
| Transactions | `/api/v1/transactions` |
| Budgets | `/api/v1/budgets` |
| Reports | `/api/v1/reports` |
| Exchange rates | `/api/v1/rates` |

Full docs at `/docs` when the server is running.

---

## Project structure

```
finance-tracker/
├── backend/
│   ├── app/
│   │   ├── api/v1/          # Controllers (thin — validate, call service, return)
│   │   ├── core/            # Config, security, dependencies, exceptions
│   │   ├── db/              # Engine, session, base model, migrations
│   │   ├── ingestion/       # Source-agnostic transaction pipeline
│   │   ├── models/          # SQLAlchemy ORM models
│   │   ├── repositories/    # Database queries (only layer that touches SQLAlchemy)
│   │   ├── schemas/         # Pydantic request/response models
│   │   ├── seeds/           # One-time data population scripts
│   │   └── services/        # Business logic
│   └── tests/
├── frontend/
│   ├── web/                 # React
│   └── mobile/              # React Native
├── docker-compose.yml       # Development
├── docker-compose.prod.yml  # Production
└── Makefile
```

---

## Adding a new transaction source (e.g. SMS)

1. Create `app/ingestion/sources/sms.py`
2. Write a function that parses an SMS string into a `TransactionPayload`
3. Pass the payload to `IngestionPipeline.run()` — nothing else changes

The pipeline, service, and controller are untouched.

---

## Multi-currency

Every transaction stores:
- `currency` — the currency it was logged in
- `exchange_rate_to_base` — rate at the time of creation (frozen)
- `amount_in_base` — pre-computed converted amount in the user's base currency

All reports aggregate on `amount_in_base`. The base currency is set per user on registration and can be changed — historical transactions are unaffected.
