# OmniCode REST API Microservice Guide

High-performance, containerized code generation microservice built with Node.js and Express, implementing defense-in-depth security.

## Endpoints Summary

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/health` | Liveness health check with OWASP headers |
| `GET` | `/metrics` | Telemetry, uptime, and memory statistics |
| `GET` | `/api/v1/spec` | OpenAPI 3.0 specification |
| `GET` | `/api/v1/symbologies` | Detailed list of supported 1D & 2D symbologies |
| `POST` | `/api/v1/generate/qr` | Vector SVG QR Code generation |
| `POST` | `/api/v1/generate/barcode` | Vector SVG Barcode generation |
| `POST` | `/api/v1/generate/batch` | Batch process up to 100 codes |
| `POST` | `/api/v1/validate` | Check digit and optical contrast verification |
| `POST` | `/api/v1/export` | Export directly as SVG, Base64, or Data URL |

## Environment Configuration

| Variable | Default | Purpose |
| :--- | :--- | :--- |
| `PORT` | `8080` | Server listening port |
| `API_KEY` | *(empty)* | Optional secret key enforcing authentication |
| `CORS_ORIGIN` | `*` | Allowed CORS origins (comma-separated list or `*`) |
| `RATE_LIMIT_MAX` | `100` | Requests allowed per window |
| `RATE_LIMIT_WINDOW_MS`| `900000` | Rate limiting sliding window in ms (15 min) |

## Running with Docker

```bash
docker run -d \
  -p 8080:8080 \
  -e API_KEY=my-secret-key \
  --name omnicode-api \
  omnicode-api
```
