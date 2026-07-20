#!/bin/sh
set -e

echo "[Metiora] Applying Prisma schema (db push)..."
# Production uses db push until formal migration history is introduced.
# Fail closed if schema cannot be applied.
./node_modules/.bin/prisma db push --schema=prisma/schema.prisma --skip-generate --accept-data-loss

echo "[Metiora] Starting API..."
exec node dist/index.js
