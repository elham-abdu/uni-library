# 1. Install dependencies
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --legacy-peer-deps

# 2. Rebuild the source code
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1

# Dummy build-time environment variables for Next.js static collection
ENV DATABASE_URL="postgresql://postgres:postgres@localhost:5432/postgres"
ENV NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT="https://ik.imagekit.io/placeholder"
ENV IMAGEKIT_URL_ENDPOINT="https://ik.imagekit.io/placeholder"
ENV NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY="placeholder_public_key"
ENV IMAGEKIT_PUBLIC_KEY="placeholder_public_key"
ENV IMAGEKIT_PRIVATE_KEY="placeholder_private_key"
ENV RESEND_TOKEN="re_placeholder_123456789"

RUN npm run build
# 3. Production runner image
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy standalone build output and static files
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]