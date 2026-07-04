#!/bin/bash

# Fix PATH
export PATH="/usr/local/bin:/opt/homebrew/bin:/usr/bin:/bin:/usr/sbin:/sbin:$PATH"

echo "🚀 Starting estudeloterias profile..."

# Start postgres
docker start estude-postgres 2>/dev/null || echo "estude-postgres already running or not found"

# Stop ambiente-emcf (correct way)
docker stop $(docker ps -q --filter "name=ambiente-emcf") 2>/dev/null && echo "✅ ambiente-emcf containers stopped" || echo "ambiente-emcf was already stopped or not found"

echo "✅ Environment ready!"
docker ps --format "table {{.Names}}\t{{.Status}}" | grep -E "(estude-postgres|ambiente-emcf)"