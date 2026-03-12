FROM node:22-slim AS base
RUN corepack enable && corepack prepare pnpm@10.28.0 --activate
WORKDIR /app

FROM base AS deps
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/realtime/package.json ./apps/realtime/
COPY packages/db/package.json ./packages/db/
COPY packages/shared/package.json ./packages/shared/
RUN pnpm install --frozen-lockfile --shamefully-hoist --filter @izimate/realtime...

FROM base AS build
# Copy entire node_modules tree (preserves pnpm virtual store + symlinks)
COPY --from=deps /app/ ./
COPY tsconfig.json ./
COPY apps/realtime/ ./apps/realtime/
COPY packages/db/ ./packages/db/
COPY packages/shared/ ./packages/shared/
RUN pnpm --filter @izimate/shared run build
RUN pnpm --filter @izimate/db run build
RUN pnpm --filter @izimate/realtime run build

FROM node:22-slim AS runtime
WORKDIR /app
# Copy only what we need for runtime
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/realtime/node_modules ./apps/realtime/node_modules
COPY --from=deps /app/packages/db/node_modules ./packages/db/node_modules
COPY --from=deps /app/packages/shared/node_modules ./packages/shared/node_modules
COPY --from=build /app/apps/realtime/dist ./apps/realtime/dist
COPY --from=build /app/packages/db/dist ./packages/db/dist
COPY --from=build /app/packages/shared/dist ./packages/shared/dist
COPY apps/realtime/package.json ./apps/realtime/
COPY packages/db/package.json ./packages/db/
COPY packages/shared/package.json ./packages/shared/
COPY package.json pnpm-workspace.yaml ./

EXPOSE 3001
CMD ["node", "apps/realtime/dist/index.js"]
