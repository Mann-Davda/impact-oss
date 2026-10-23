#!/usr/bin/env bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$SCRIPT_DIR"

mkdir -p "$SCRIPT_DIR/.pids" "$SCRIPT_DIR/.logs"

echo "=========================================================="
echo " Starting ImpactOS in Background Daemon Mode"
echo " Tagline: From Chaos To Action"
echo "=========================================================="

# Check and stop existing if running
if [ -f "$SCRIPT_DIR/.pids/api.pid" ]; then
    OLD_API_PID=$(cat "$SCRIPT_DIR/.pids/api.pid")
    kill "$OLD_API_PID" 2>/dev/null || true
fi
if [ -f "$SCRIPT_DIR/.pids/web.pid" ]; then
    OLD_WEB_PID=$(cat "$SCRIPT_DIR/.pids/web.pid")
    kill "$OLD_WEB_PID" 2>/dev/null || true
fi

# Free ports if busy
lsof -ti :8000 | xargs kill -9 2>/dev/null || true
lsof -ti :3000 | xargs kill -9 2>/dev/null || true

# 1. Start Backend API
echo "Starting FastAPI Backend API on http://0.0.0.0:8000 ..."
cd "$SCRIPT_DIR/apps/api"
nohup .venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 8000 < /dev/null > "$SCRIPT_DIR/.logs/api.log" 2>&1 &
API_PID=$!
disown $API_PID 2>/dev/null || true
echo "$API_PID" > "$SCRIPT_DIR/.pids/api.pid"

# Wait for API health check
echo -n "Waiting for Backend API to become healthy"
for i in {1..15}; do
    if curl -s http://127.0.0.1:8000/health >/dev/null 2>&1; then
        echo " [OK]"
        break
    fi
    echo -n "."
    sleep 1
done

# 2. Start Next.js Frontend
echo "Starting Next.js Frontend on http://localhost:3000 ..."
cd "$SCRIPT_DIR/apps/web"
nohup ./node_modules/.bin/next start -p 3000 < /dev/null > "$SCRIPT_DIR/.logs/web.log" 2>&1 &
WEB_PID=$!
disown $WEB_PID 2>/dev/null || true
echo "$WEB_PID" > "$SCRIPT_DIR/.pids/web.pid"

# Wait for Web health check
echo -n "Waiting for Next.js to become ready"
for i in {1..15}; do
    if curl -s http://127.0.0.1:3000/ >/dev/null 2>&1; then
        echo " [OK]"
        break
    fi
    echo -n "."
    sleep 1
done

echo ""
echo "=========================================================="
echo " ImpactOS Services Are Live & Persistent:"
echo " - Command Center UI:  http://localhost:3000 (PID: $WEB_PID)"
echo " - Landing Narrative:   http://localhost:3000/landing"
echo " - Backend API Docs:    http://localhost:8000/docs (PID: $API_PID)"
echo " - Logs directory:      $SCRIPT_DIR/.logs/"
echo " To stop services run:  ./scripts/stop_daemon.sh"
echo "=========================================================="
