# Multi-stage production Dockerfile
FROM node:22-alpine AS builder

WORKDIR /app
COPY packages/core ./packages/core
COPY packages/api ./packages/api

# Build core package
WORKDIR /app/packages/core
RUN npm install && npm run build && npm prune --omit=dev

# Install API dependencies
WORKDIR /app/packages/api
RUN npm install --omit=dev

FROM node:22-alpine AS runner
WORKDIR /app

LABEL org.opencontainers.image.source="https://github.com/seotarek/omnicode-studio"
LABEL org.opencontainers.image.description="Enterprise Barcode & QR REST API Microservice"
LABEL org.opencontainers.image.licenses="MIT"

ENV NODE_ENV=production
ENV PORT=8080
ENV HOST=0.0.0.0

COPY --from=builder /app/packages/core ./packages/core
COPY --from=builder /app/packages/api ./packages/api

WORKDIR /app/packages/api

EXPOSE 8080
CMD ["node", "src/server.js"]
