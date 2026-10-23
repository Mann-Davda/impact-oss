#!/usr/bin/env bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "=========================================================="
echo " ImpactOS: Crisis Decision Support System (v1.0)"
echo " Tagline: From Chaos To Action"
echo "=========================================================="
echo ""

# Ensure ports 8000 and 3000 are free before starting
if lsof -ti :8000 >/dev/null 2>&1; then
    echo "Freeing occupied port 8000..."
    lsof -ti :8000 | xargs kill -9 2>/dev/null || true
fi
if lsof -ti :3000 >/dev/null 2>&1; then
    echo "Freeing occupied port 3000..."
    lsof -ti :3000 | xargs kill -9 2>/dev/null || true
fi

echo "Starting Backend API on http://localhost:8000 ..."
(cd "$SCRIPT_DIR/apps/api" && ./run.sh) &
API_PID=$!

echo "Waiting for API to initialize..."
sleep 3

echo "Starting Next.js Command Center on http://localhost:3000 ..."
(cd "$SCRIPT_DIR/apps/web" && ./run.sh) &
WEB_PID=$!

cleanup() {
    echo "Shutting down ImpactOS..."
    kill $API_PID $WEB_PID 2>/dev/null || true
}

trap cleanup EXIT INT TERM
wait
