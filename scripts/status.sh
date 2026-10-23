#!/usr/bin/env bash

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$SCRIPT_DIR"

echo "Checking ImpactOS daemon status..."
echo "---"

API_RUNNING=0
WEB_RUNNING=0

if curl -s http://127.0.0.1:8000/health >/dev/null 2>&1; then
    echo "• Backend API (http://localhost:8000): RUNNING (Healthy)"
    API_RUNNING=1
else
    echo "• Backend API (http://localhost:8000): STOPPED"
fi

if curl -s http://127.0.0.1:3000/ >/dev/null 2>&1; then
    echo "• Web App (http://localhost:3000):      RUNNING (Ready)"
    WEB_RUNNING=1
else
    echo "• Web App (http://localhost:3000):      STOPPED"
fi

echo "---"
if [ $API_RUNNING -eq 1 ] && [ $WEB_RUNNING -eq 1 ]; then
    echo "All ImpactOS services are ACTIVE."
else
    echo "Run ./scripts/start_daemon.sh to start all services."
fi
