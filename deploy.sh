#!/bin/bash
set -e

# ═══════════════════════════════════════════════════════════
# DEPLOY SCRIPT — API for Anything on Hostinger VPS
#
# Usage:
#   1. Copy this project to your VPS
#   2. Edit .env.production with real passwords
#   3. Run: bash deploy.sh
#
# Ports used:
#   4000 — Web Dashboard
#   4001 — API Server
#   5433 — PostgreSQL (localhost only)
#   6380 — Redis (localhost only)
#
# Your existing Topranq project is NOT affected.
# ═══════════════════════════════════════════════════════════

echo "╔══════════════════════════════════════╗"
echo "║   API for Anything — Deploying...    ║"
echo "╚══════════════════════════════════════╝"

# ─── Check .env.production exists ──────────────────────────
if [ ! -f .env.production ]; then
  echo "ERROR: .env.production not found!"
  echo "Copy .env.production.example and fill in your values:"
  echo "  cp .env.production.example .env.production"
  exit 1
fi

# ─── Check for placeholder passwords ──────────────────────
if grep -q "CHANGE_ME" .env.production; then
  echo "ERROR: .env.production still contains placeholder passwords!"
  echo ""
  echo "Replace these values in .env.production:"
  echo "  DB_PASSWORD=<strong random password>"
  echo "  REDIS_PASSWORD=<strong random password>"
  echo "  JWT_SECRET=<run: openssl rand -hex 32>"
  echo ""
  echo "Quick generate:"
  echo "  DB_PASSWORD=$(openssl rand -hex 16)"
  echo "  REDIS_PASSWORD=$(openssl rand -hex 16)"
  echo "  JWT_SECRET=$(openssl rand -hex 32)"
  exit 1
fi

# ─── Load env ──────────────────────────────────────────────
export $(grep -v '^#' .env.production | grep -v '^$' | xargs)

# ─── Check port conflicts ─────────────────────────────────
for PORT in 4000 4001 5433 6380; do
  if lsof -i :$PORT -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo "WARNING: Port $PORT is already in use!"
    echo "Check with: lsof -i :$PORT"
    read -p "Continue anyway? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
      exit 1
    fi
  fi
done

echo ""
echo "→ Building Docker images..."
docker compose -f docker-compose.prod.yml --env-file .env.production build

echo ""
echo "→ Starting services..."
docker compose -f docker-compose.prod.yml --env-file .env.production up -d

echo ""
echo "→ Waiting for services to start..."
sleep 10

# ─── Run database migrations ──────────────────────────────
echo "→ Running database migrations..."
docker compose -f docker-compose.prod.yml --env-file .env.production exec api \
  sh -c "cd /app && npx drizzle-kit push --config packages/db/drizzle.config.ts" 2>/dev/null || \
  echo "  (migrations may need manual run — see below)"

# ─── Health check ──────────────────────────────────────────
echo ""
echo "→ Checking health..."
sleep 3

API_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:4001/v1/health 2>/dev/null || echo "000")
WEB_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:4000 2>/dev/null || echo "000")

echo ""
echo "╔══════════════════════════════════════════════════╗"
echo "║          DEPLOYMENT COMPLETE                     ║"
echo "╠══════════════════════════════════════════════════╣"
echo "║                                                  ║"
echo "║  Web Dashboard:  http://187.127.141.233:4000     ║"
echo "║  API Server:     http://187.127.141.233:4001     ║"
echo "║  API Health:     http://187.127.141.233:4001/v1/health"
echo "║                                                  ║"
echo "║  API Status: $API_STATUS                              ║"
echo "║  Web Status: $WEB_STATUS                              ║"
echo "║                                                  ║"
echo "║  Topranq: UNCHANGED (still on its ports)         ║"
echo "║                                                  ║"
echo "╠══════════════════════════════════════════════════╣"
echo "║  Commands:                                       ║"
echo "║  Logs:    docker compose -f docker-compose.prod.yml logs -f  ║"
echo "║  Stop:    docker compose -f docker-compose.prod.yml down     ║"
echo "║  Restart: docker compose -f docker-compose.prod.yml restart  ║"
echo "╚══════════════════════════════════════════════════╝"

if [ "$API_STATUS" != "200" ]; then
  echo ""
  echo "⚠ API not responding. Check logs:"
  echo "  docker compose -f docker-compose.prod.yml logs api"
fi
