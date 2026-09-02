# The build context is the repository root, because npm workspaces share package-lock.json.

# ---------- Stage 1: build ----------
FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
COPY frontend/package.json ./frontend/package.json
RUN npm ci --include-workspace-root --workspace frontend

COPY frontend ./frontend
WORKDIR /app/frontend
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# ---------- Stage 2: runtime ----------
FROM node:20-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

COPY package.json package-lock.json ./
COPY frontend/package.json ./frontend/package.json
RUN npm ci --include-workspace-root --workspace frontend --omit=dev

COPY --from=builder /app/frontend/.next ./frontend/.next
COPY --from=builder /app/frontend/next.config.mjs ./frontend/next.config.mjs
COPY --from=builder /app/frontend/public ./frontend/public

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["npm", "run", "start", "--workspace", "frontend"]
