#!/bin/sh
set -e

# Default PORT to 80 if not set by host/Render
PORT="${PORT:-80}"
BACKEND_URL="${BACKEND_URL:-http://127.0.0.1:8000}"

echo "[LearnGraph] Initializing Nginx container..."
echo "[LearnGraph] Listening port: ${PORT}"
echo "[LearnGraph] Backend target: ${BACKEND_URL}"

# Replace placeholder tokens in nginx configuration
sed -i "s/__PORT__/${PORT}/g" /etc/nginx/conf.d/default.conf
sed -i "s|__BACKEND_URL__|${BACKEND_URL}|g" /etc/nginx/conf.d/default.conf

# Execute passed command (defaults to nginx -g "daemon off;")
exec "$@"
