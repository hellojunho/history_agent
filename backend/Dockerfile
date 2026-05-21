FROM node:20-bookworm AS base

FROM base AS deps
WORKDIR /app
COPY backend/package.json backend/package-lock.json* ./
RUN npm install

FROM base AS builder
WORKDIR /app
# Copy source files first, then overlay correct linux native node_modules to avoid 'invalid ELF header' errors caused by host's mac OS node_modules
COPY backend/ ./
COPY --from=deps /app/node_modules ./node_modules
RUN npm run build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV production

# Install python3, pip, and make (essential for builds)
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    python3-venv \
    make \
    && rm -rf /var/lib/apt/lists/*

# Set up python venv in container
RUN python3 -m venv /app/venv
RUN /app/venv/bin/pip install --upgrade pip
RUN /app/venv/bin/pip install pymupdf playwright
RUN /app/venv/bin/playwright install chromium

# Let Playwright install its system browser dependencies automatically
RUN /app/venv/bin/playwright install-deps

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

RUN chown -R nextjs:nodejs /app

USER nextjs
EXPOSE 3000
ENV PORT 3000
CMD ["node", "server.js"]
