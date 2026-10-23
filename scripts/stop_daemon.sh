#!/usr/bin/env bash

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$SCRIPT_DIR"

echo "Shutting down ImpactOS daemon processes..."

if [ -f "$SCRIPT_DIR/.pids/api.pid" ]; then
    API_PID=$(cat "$SCRIPT_DIR/.pids/api.pid")
    echo "Stopping API (PID: $API_PID)..."
    kill "$API_PID" 2>/dev/null || true
    rm -f "$SCRIPT_DIR/.pids/api.pid"
fi

if [ -f "$SCRIPT_DIR/.pids/web.pid" ]; then
    WEB_PID=$(cat "$SCRIPT_DIR/.pids/web.pid")
    echo "Stopping Web (PID: $WEB_PID)..."
    kill "$WEB_PID" 2>/dev/null || true
    rm -f "$SCRIPT_DIR/.pids/web.pid"
fi

# Ensure ports are released
lsof -ti :8000 | xargs kill -9 2>/dev/null || true
lsof -ti :3000 | xargs kill -9 2>/dev/null || true

echo "ImpactOS stopped cleanly."
