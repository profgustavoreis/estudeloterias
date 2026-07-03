#!/bin/bash

# Fix PATH for Keyboard Maestro and other environments
export PATH="/usr/local/bin:/opt/homebrew/bin:/usr/bin:/bin:/usr/sbin:/sbin:$PATH"

echo "🚀 Starting estudeloterias profile..."

docker start estude-postgres 2>/dev/null || echo "estude-postgres already running or not found"

docker stop ambiente-emcf 2>/dev/null && echo "✅ ambiente-emcf stopped" || echo "ambiente-emcf was already stopped"

echo "✅ Environment ready!"
docker ps --format "table {{.Names}}\t{{.Status}}" | grep -E "(estude-postgres|ambiente-emcf)" || echo "No matching containers found"
