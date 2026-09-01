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
RUN npm run db:generate --workspace backend
RUN npx tsc backend/prisma/seed.ts --outDir backend/dist/prisma --module CommonJS --target ES2020 --moduleResolution node --skipLibCheck
RUN npm run build --workspace backend

# ---------- Stage 2: runtime ----------
FROM node:20-alpine AS runner

RUN apk add --no-cache openssl

WORKDIR /app
ENV NODE_ENV=production

COPY package.json package-lock.json ./
COPY backend/package.json ./backend/package.json
RUN npm ci --include-workspace-root --workspace backend --omit=dev

# The Prisma CLI is a devDependency and is absent from the runtime image, so
# the client generated during the build stage is copied in instead of
# regenerated here.
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/backend/dist ./backend/dist
COPY --from=builder /app/backend/prisma ./backend/prisma

EXPOSE 4000

CMD ["node", "backend/dist/main.js"]
