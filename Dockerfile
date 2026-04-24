# ── Stage 1: install dependencies ──────────────────────────────────────────
FROM node:20-alpine AS deps

WORKDIR /app

COPY package.json ./
RUN npm install --omit=dev

# ── Stage 2: final image ─────────────────────────────────────────────────────
FROM node:20-alpine AS runner

# Non-root user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app

# Copy deps and source and assign ownership to the non-root user
COPY --chown=appuser:appgroup --from=deps /app/node_modules ./node_modules
COPY --chown=appuser:appgroup server.js ./
COPY --chown=appuser:appgroup public ./public
COPY --chown=appuser:appgroup package.json ./

USER appuser

ENV PORT=4045
ENV NODE_ENV=production

EXPOSE 4045

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget -qO- http://localhost:4045/health || exit 1

CMD ["node", "server.js"]
