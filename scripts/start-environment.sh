#!/bin/bash

# Fix PATH
export PATH="/usr/local/bin:/opt/homebrew/bin:/usr/bin:/bin:/usr/sbin:/sbin:$PATH"

echo "🧹 Cleaning up active environment..."

# 1. Stop ALL running containers globally to prevent resource/port conflicts
RUNNING_CONTAINERS=$(docker ps -q)
if [ -n "$RUNNING_CONTAINERS" ]; then
    docker stop $RUNNING_CONTAINERS >/dev/null 2>&1
    echo "✅ Stopped all running containers"
else
    echo "ℹ️ No containers were active"
fi

echo "🚀 Starting estudeloterias profile..."
echo ""
echo ""
echo "▛▀▖      ▌         ▗        ▐        ▐  ▗             ";
echo "▌ ▌▞▀▖▞▀▖▌▗▘▞▀▖▙▀▖ ▄ ▞▀▘ ▞▀▘▜▀ ▝▀▖▙▀▖▜▀ ▄ ▛▀▖▞▀▌      ";
echo "▌ ▌▌ ▌▌ ▖▛▚ ▛▀ ▌   ▐ ▝▀▖ ▝▀▖▐ ▖▞▀▌▌  ▐ ▖▐ ▌ ▌▚▄▌▗▖▗▖▗▖";
echo "▀▀ ▝▀ ▝▀ ▘ ▘▝▀▘▘   ▀▘▀▀  ▀▀  ▀ ▝▀▘▘   ▀ ▀▘▘ ▘▗▄▘▝▘▝▘▝▘";
echo ""
echo ""

# 2. Start postgres safely
docker start estude-postgres 2>/dev/null || echo "❌ estude-postgres could not be started (does it exist?)"

echo "🎉 Environment ready!"
docker ps --format "table {{.Names}}\t{{.Status}}"
