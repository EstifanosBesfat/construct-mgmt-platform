# The build context is the repository root, not `backend/`, because the npm
# workspace lockfile lives at the root and `npm ci` needs it.

# ---------- Stage 1: build ----------
FROM node:20-alpine AS builder

# Prisma's query engine is dynamically linked against OpenSSL on Alpine.
RUN apk add --no-cache openssl

WORKDIR /app

COPY package.json package-lock.json ./
COPY backend/package.json ./backend/package.json
RUN npm ci --include-workspace-root --workspace backend

COPY backend ./backend
# Prisma 7 reads DATABASE_URL from prisma.config.ts even during generate.
ENV DATABASE_URL="postgresql://cms_user:cms_password@postgres:5432/cms_db?schema=public"
RUN npm run db:generate --workspace backend
RUN npx tsc backend/prisma/seed.ts --outDir backend/dist/prisma --module CommonJS --target ES2020 --moduleResolution node --esModuleInterop --skipLibCheck
RUN npm run build --workspace backend

# ---------- Stage 2: runtime ----------
FROM node:20-alpine AS runner

RUN apk add --no-cache openssl

WORKDIR /app
ENV NODE_ENV=production

COPY package.json package-lock.json ./
COPY backend/package.json ./backend/package.json
RUN npm ci --include-workspace-root --workspace backend --omit=dev

# Generated Prisma Client and CLI (needed for migrate deploy on container start).
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/prisma ./node_modules/prisma
COPY --from=builder /app/node_modules/.bin/prisma ./node_modules/.bin/prisma

COPY --from=builder /app/backend/dist ./backend/dist
COPY --from=builder /app/backend/prisma ./backend/prisma
COPY --from=builder /app/backend/prisma.config.ts ./backend/prisma.config.ts
COPY --from=builder /app/backend/docker-entrypoint.sh /app/docker-entrypoint.sh

RUN chmod +x /app/docker-entrypoint.sh

EXPOSE 4000

ENTRYPOINT ["/app/docker-entrypoint.sh"]
