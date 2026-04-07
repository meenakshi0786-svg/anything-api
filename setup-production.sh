#!/bin/bash
# ═══════════════════════════════════════════════════════════
# QUICK SETUP — Generate .env.production with secure passwords
# Run this ONCE on your VPS before deploying
# ═══════════════════════════════════════════════════════════

set -e

echo "╔══════════════════════════════════════╗"
echo "║   API for Anything — Setup           ║"
echo "╚══════════════════════════════════════╝"
echo ""

# Generate secure random values
DB_PASS=$(openssl rand -hex 16)
REDIS_PASS=$(openssl rand -hex 16)
JWT_SEC=$(openssl rand -hex 32)

# Detect VPS IP
VPS_IP=$(curl -s ifconfig.me 2>/dev/null || hostname -I | awk '{print $1}')

echo "Detected VPS IP: $VPS_IP"
echo ""

# Ask for AI key
read -p "Enter your OpenAI API key (sk-proj-...): " AI_KEY
if [ -z "$AI_KEY" ]; then
  echo "WARNING: No AI key provided. The AI planner won't work."
  echo "You can add it later in .env.production"
fi

# Write .env.production
cat > .env.production << EOF
# ═══════════════════════════════════════════════════════════
# PRODUCTION ENV — Generated $(date +%Y-%m-%d)
# ═══════════════════════════════════════════════════════════

# ─── Database ──────────────────────────────────────────────
DB_USER=afa
DB_PASSWORD=$DB_PASS
DB_NAME=anythingapi

# ─── Redis ─────────────────────────────────────────────────
REDIS_PASSWORD=$REDIS_PASS

# ─── Auth ──────────────────────────────────────────────────
JWT_SECRET=$JWT_SEC

# ─── AI ────────────────────────────────────────────────────
OPENAI_API_KEY=$AI_KEY

# ─── Public URLs ──────────────────────────────────────────
PUBLIC_API_URL=http://$VPS_IP:4001
PUBLIC_WS_URL=ws://$VPS_IP:4001
CORS_ORIGIN=http://$VPS_IP:4000

# ─── Worker ────────────────────────────────────────────────
BROWSER_POOL_SIZE=3
WORKER_CONCURRENCY=3
PROXY_ENABLED=false
EOF

chmod 600 .env.production

echo ""
echo "✓ .env.production created with secure passwords"
echo ""
echo "Next steps:"
echo "  1. Run: bash deploy.sh"
echo "  2. Open: http://$VPS_IP:4000"
echo ""
