FROM node:22-slim AS base
WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@9.15.4 --activate

# Copy workspace config
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY packages/shared/package.json ./packages/shared/
COPY packages/db/package.json ./packages/db/
COPY apps/realtime/package.json ./apps/realtime/

# Install dependencies
RUN pnpm install --frozen-lockfile --prod

# Copy source
COPY packages/shared/ ./packages/shared/
COPY packages/db/ ./packages/db/
COPY apps/realtime/ ./apps/realtime/

# Build
RUN pnpm --filter @izimate/shared build && \
    pnpm --filter @izimate/db build && \
    pnpm --filter @izimate/realtime build

EXPOSE 3001

CMD ["node", "apps/realtime/dist/index.mjs"]
