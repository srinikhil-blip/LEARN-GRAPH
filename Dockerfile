# =============================================================
# LearnGraph Frontend — Multi-stage Production Dockerfile
# Node.js 20 Alpine + Vite + Nginx Alpine
# =============================================================

# ── Stage 1: Build Frontend Assets ───────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependency specifications
COPY package.json package-lock.json ./

# Install clean dependencies
RUN npm ci

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

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

# Nginx health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost/health || exit 1

CMD ["nginx", "-g", "daemon off;"]
