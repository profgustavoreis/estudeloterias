#!/bin/bash

# Fix PATH
export PATH="/usr/local/bin:/opt/homebrew/bin:/usr/bin:/bin:/usr/sbin:/sbin:$PATH"

echo "🛑 Stopping estudeloterias profile..."
echo ""
echo ""
echo "▛▀▖      ▌         ▗        ▐           ▗             ";
echo "▌ ▌▞▀▖▞▀▖▌▗▘▞▀▖▙▀▖ ▄ ▞▀▘ ▞▀▘▜▀ ▞▀▖▛▀▖▛▀▖▄ ▛▀▖▞▀▌      ";
echo "▌ ▌▌ ▌▌ ▖▛▚ ▛▀ ▌   ▐ ▝▀▖ ▝▀▖▐ ▖▌ ▌▙▄▘▙▄▘▐ ▌ ▌▚▄▌▗▖▗▖▗▖";
echo "▀▀ ▝▀ ▝▀ ▘ ▘▝▀▘▘   ▀▘▀▀  ▀▀  ▀ ▝▀ ▌  ▌  ▀▘▘ ▘▗▄▘▝▘▝▘▝▘";
echo ""
echo ""

# Stop the postgres container used by this profile
if docker ps -q --filter "name=estude-postgres" | grep -q .; then
    docker stop estude-postgres >/dev/null 2>&1
    echo "✅ Stopped estude-postgres"
else
    echo "ℹ️ estude-postgres was not running"
fi

echo "✅ Environment stopped!"
docker ps --format "table {{.Names}}\t{{.Status}}"
