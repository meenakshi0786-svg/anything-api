FROM node:20-bookworm AS base
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate
WORKDIR /app

# Install Playwright system dependencies
RUN npx playwright install-deps chromium

# Install dependencies
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml .npmrc ./
COPY apps/worker/package.json apps/worker/
COPY packages/db/package.json packages/db/
COPY packages/types/package.json packages/types/
RUN pnpm install --frozen-lockfile 2>/dev/null || pnpm install

# Install Playwright browsers
RUN cd apps/worker && npx playwright install chromium

# Copy source
COPY packages/ packages/
COPY apps/worker/ apps/worker/
COPY tsconfig.base.json ./

RUN npm i -g tsx

CMD ["tsx", "apps/worker/src/worker.ts"]
