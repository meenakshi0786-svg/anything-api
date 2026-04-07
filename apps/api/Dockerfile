FROM node:20-alpine AS base
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate
WORKDIR /app

# Install dependencies
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml .npmrc ./
COPY apps/api/package.json apps/api/
COPY packages/db/package.json packages/db/
COPY packages/types/package.json packages/types/
RUN pnpm install --frozen-lockfile 2>/dev/null || pnpm install

# Copy source
COPY packages/ packages/
COPY apps/api/ apps/api/
COPY tsconfig.base.json ./

# Production: use tsx for ESM TypeScript
RUN npm i -g tsx

EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
  CMD wget -qO- http://localhost:3001/v1/health || exit 1

CMD ["tsx", "apps/api/src/server.ts"]
