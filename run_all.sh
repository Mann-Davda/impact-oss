#!/usr/bin/env bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "=========================================================="
echo " ImpactOS: Crisis Decision Support System (v1.0)"
echo " Tagline: From Chaos To Action"
echo "=========================================================="
echo ""
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
