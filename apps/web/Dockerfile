FROM node:20-alpine
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate
WORKDIR /app

# Install dependencies
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml .npmrc ./
COPY apps/web/package.json apps/web/
COPY packages/types/package.json packages/types/
RUN pnpm install --frozen-lockfile 2>/dev/null || pnpm install

# Copy source
COPY packages/ packages/
COPY apps/web/ apps/web/
COPY tsconfig.base.json ./

# Build args for public env vars
ARG NEXT_PUBLIC_API_URL=http://localhost:4001
ARG NEXT_PUBLIC_WS_URL=ws://localhost:4001
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_WS_URL=$NEXT_PUBLIC_WS_URL
ENV NODE_ENV=production

# Build
RUN cd apps/web && npx next build

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
  CMD wget -qO- http://localhost:3000 || exit 1

CMD ["npx", "--prefix", "apps/web", "next", "start", "--port", "3000"]
