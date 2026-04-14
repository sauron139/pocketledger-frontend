.PHONY: up down build logs shell migrate seed test lint web-dev web-install

# --- Backend ---

up:
	docker-compose up

down:
	docker-compose down

build:
	docker-compose up --build

logs:
	docker-compose logs -f api

shell:
	docker-compose exec api bash

migrate:
	docker-compose exec api alembic upgrade head

seed:
	docker-compose exec api python -m app.seeds.default_categories

migration:
	docker-compose exec api alembic revision --autogenerate -m "$(msg)"

test:
	docker-compose exec api pytest tests/ -v

lint:
	docker-compose exec api ruff check app/

# --- Frontend ---

web-install:
	cd frontend/web && npm install

web-dev:
	cd frontend/web && npm run dev

web-build:
	cd frontend/web && npm run build

web-lint:
	cd frontend/web && npm run lint

# --- Full stack local dev (no Docker) ---

dev:
	make -j2 web-dev
