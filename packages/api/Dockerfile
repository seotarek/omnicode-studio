# Multi-stage production Dockerfile
FROM node:22-alpine AS builder

WORKDIR /app
COPY packages/core ./packages/core
COPY packages/api ./packages/api

# Build core package
WORKDIR /app/packages/core
RUN npm install && npm run build

# Install API dependencies
WORKDIR /app/packages/api
RUN npm install --omit=dev

FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8080
ENV HOST=0.0.0.0

COPY --from=builder /app/packages/core/dist ./packages/core/dist
COPY --from=builder /app/packages/core/package.json ./packages/core/package.json
COPY --from=builder /app/packages/api ./packages/api

WORKDIR /app/packages/api

EXPOSE 8080
CMD ["node", "src/server.js"]
