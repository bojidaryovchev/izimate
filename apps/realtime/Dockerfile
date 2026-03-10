FROM node:22-slim AS base
RUN corepack enable && corepack prepare pnpm@10.28.0 --activate
WORKDIR /app

FROM base AS deps
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/realtime/package.json ./apps/realtime/
RUN pnpm install --frozen-lockfile --filter @izimate/realtime

FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/realtime/node_modules ./apps/realtime/node_modules
COPY tsconfig.json ./
COPY apps/realtime/ ./apps/realtime/
RUN cd apps/realtime && npx tsc

FROM node:22-slim AS runtime
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/realtime/node_modules ./apps/realtime/node_modules
COPY --from=build /app/apps/realtime/dist ./apps/realtime/dist
COPY apps/realtime/package.json ./apps/realtime/

EXPOSE 3001
CMD ["node", "apps/realtime/dist/index.js"]
