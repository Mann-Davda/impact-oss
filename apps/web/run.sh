#!/usr/bin/env bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

if [ ! -d "node_modules" ]; then
    echo "Installing web dependencies..."
    npm install
fi

echo "Starting ImpactOS Web Command Center on http://localhost:3000 ..."
exec npm run dev -- -p 3000
