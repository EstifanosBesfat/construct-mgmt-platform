#!/bin/sh
set -e

cd /app/backend

if [ -x /app/node_modules/.bin/prisma ]; then
  /app/node_modules/.bin/prisma migrate deploy
fi

exec node /app/backend/dist/main.js
