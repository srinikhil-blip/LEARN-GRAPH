# =============================================================
# LearnGraph Frontend — Multi-stage Production Dockerfile
# Node.js 20 Alpine + Vite + Nginx Alpine
# =============================================================

# ── Stage 1: Build Frontend Assets ───────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependency specifications
COPY package.json package-lock.json ./

# Install dependencies safely with peer dependency resolution
RUN npm install --legacy-peer-deps

# Copy project source code
COPY . .

# Build production bundle with Vite
RUN npm run build

# ── Stage 2: Serve with Nginx Alpine ─────────────────────────
FROM nginx:1.27-alpine AS runner

WORKDIR /usr/share/nginx/html

# Clean default nginx files
RUN rm -rf ./*

# Copy built artifacts from builder stage
COPY --from=builder /app/dist .

# Copy custom Nginx configuration and entrypoint
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

EXPOSE 80

# Nginx health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://127.0.0.1:${PORT:-80}/health || exit 1

ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]
