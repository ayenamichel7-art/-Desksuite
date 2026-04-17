# 🚀 MakeFile for Desksuite — Sovereign Workspace Platform

# Variables
DC = docker compose
EXEC_APP = $(DC) exec laravel
EXEC_NODE = $(DC) exec react
EXEC_PY = $(DC) exec python-worker

.PHONY: install up down restart build db-migrate test-all lint security-audit setup-hooks

# --- Installation & Setup ---
install: setup-hooks
	@test -f .env || cp .env.example .env
	$(DC) build
	$(DC) up -d
	@echo "⏳ Waiting for DB to be ready..."
	@sleep 12
	$(EXEC_APP) composer install
	$(EXEC_APP) php artisan key:generate
	$(EXEC_APP) php artisan migrate --seed
	$(EXEC_NODE) npm install
	@echo "✅ Installation complete! Access http://desksuite.localhost:8081"

# --- Git Hooks (Anti-secret leak) ---
setup-hooks:
	@echo "🔐 Installing pre-commit hook..."
	@mkdir -p .git/hooks
	@cp scripts/pre-commit .git/hooks/pre-commit
	@chmod +x .git/hooks/pre-commit
	@echo "✅ Pre-commit hook installed."

# --- Lifecycle ---
up:
	$(DC) up -d

down:
	$(DC) down

restart:
	$(DC) restart

build:
	$(DC) build --no-cache

logs:
	$(DC) logs -f --tail=100

# --- Backend Commands ---
db-migrate:
	$(EXEC_APP) php artisan migrate

db-seed:
	$(EXEC_APP) php artisan db:seed

db-fresh:
	$(EXEC_APP) php artisan migrate:fresh --seed

shell-app:
	$(EXEC_APP) bash

shell-worker:
	$(EXEC_PY) bash

# --- Testing ---
test-backend:
	$(EXEC_APP) php artisan test

test-frontend:
	$(EXEC_NODE) npm run build

test-all: test-backend test-frontend

# --- Linting ---
lint:
	$(EXEC_APP) vendor/bin/pint
	$(EXEC_NODE) npm run lint

# --- Security ---
security-audit:
	@echo "🛡️ Running Desksuite Security Audit..."
	@bash scripts/security-audit.sh

# --- Production & Deployment ---
deploy:
	git pull origin main
	$(DC) up -d --build
	$(EXEC_APP) php artisan optimize
	$(EXEC_APP) php artisan migrate --force
	@echo "🚀 Deploy complete!"
