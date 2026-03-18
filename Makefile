.PHONY: up down build logs ps shell-backend shell-frontend migrate seed

up:
	docker-compose up -d

down:
	docker-compose down

build:
	docker-compose build

logs:
	docker-compose logs -f

ps:
	docker-compose ps

shell-backend:
	docker-compose exec backend bash

shell-frontend:
	docker-compose exec frontend sh

migrate:
	docker-compose exec backend python -m src.db.run_migrations

seed:
	docker-compose exec backend python -m src.db.seed

restart-backend:
	docker-compose restart backend

restart-frontend:
	docker-compose restart frontend

dev-backend:
	cd backend && uvicorn src.main:app --host 0.0.0.0 --port 8000 --reload

dev-frontend:
	cd frontend && npm run dev
