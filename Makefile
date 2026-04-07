.PHONY: dev build test lint clean db-migrate db-studio docker-up docker-down docker-build help

# ── Default ─────────────────────────────────────────────────
help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | \
		awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-16s\033[0m %s\n", $$1, $$2}'

# ── Development ─────────────────────────────────────────────
dev: ## Start all services in development mode
	docker compose up postgres redis minio -d
	pnpm dev

build: ## Build all packages
	pnpm build

test: ## Run all tests
	pnpm test

lint: ## Typecheck all packages
	pnpm exec tsc --noEmit --project tsconfig.base.json
	pnpm exec turbo run lint

clean: ## Clean all build artifacts and node_modules
	pnpm exec turbo run clean
	rm -rf node_modules
	rm -rf apps/*/dist apps/web/.next
	rm -rf packages/*/dist
	rm -rf sdks/typescript/dist
	rm -rf sdks/python/dist sdks/python/*.egg-info

# ── Database ────────────────────────────────────────────────
db-migrate: ## Run database migrations (drizzle-kit push)
	pnpm db:migrate

db-studio: ## Open Drizzle Studio
	pnpm db:studio

# ── Docker ──────────────────────────────────────────────────
docker-up: ## Start all Docker infrastructure services
	docker compose up -d

docker-down: ## Stop all Docker infrastructure services
	docker compose down

docker-build: ## Build Docker images for all apps
	docker compose build api worker web

# ── Install ─────────────────────────────────────────────────
install: ## Install all dependencies
	pnpm install

setup: install docker-up db-migrate ## Full project setup: install deps, start infra, run migrations
