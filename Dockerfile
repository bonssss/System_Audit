# Multi-stage Dockerfile for AI Project Scanner
FROM node:20-alpine AS base
WORKDIR /app
RUN apk add --no-cache libc6-compat git

# Install dependencies
FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
COPY apps/web/package.json ./apps/web/
COPY packages/shared/package.json ./packages/shared/
COPY packages/parser/package.json ./packages/parser/
COPY packages/security/package.json ./packages/security/
COPY packages/scanner-core/package.json ./packages/scanner-core/
COPY packages/ai/package.json ./packages/ai/
COPY packages/reports/package.json ./packages/reports/

RUN npm install

# Build packages and Next.js app
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED 1
ENV NODE_ENV production

RUN npm run prisma:generate --workspace=@ai-scanner/web || true
RUN npm run build

# Production runner image
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1
ENV PORT 3000

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/apps/web/package.json ./apps/web/package.json
COPY --from=builder /app/apps/web/public ./apps/web/public
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next ./apps/web/.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages ./packages

USER nextjs

EXPOSE 3000

CMD ["npm", "run", "start"]
