# syntax=docker/dockerfile:1
FROM node:22-alpine AS base

# Install pnpm
RUN npm install -g pnpm@10

WORKDIR /app

# Dependencies stage
FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.base.json ./
COPY packages/shared/package.json ./packages/shared/
COPY apps/web/package.json ./apps/web/
COPY apps/extension/package.json ./apps/extension/

RUN pnpm install --frozen-lockfile=false

# Builder stage
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/packages/shared/node_modules ./packages/shared/node_modules
COPY --from=deps /app/apps/web/node_modules ./apps/web/node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

RUN pnpm --filter @pathixo/shared typecheck
RUN pnpm --filter @pathixo/web build

# Runner stage
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Install curl for health checking
RUN apk add --no-cache curl

# Security: non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/apps/web/public ./apps/web/public
COPY --from=builder /app/apps/web/.next ./apps/web/.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/web/node_modules ./apps/web/node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/apps/web/package.json ./apps/web/package.json

USER nextjs

EXPOSE 3000

# Integrated Docker Health Check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:3000/api/health?check=ping || exit 1

CMD ["node", "apps/web/node_modules/next/dist/bin/next", "start", "apps/web"]
