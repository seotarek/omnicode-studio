# @omnicode/api

Self-hosted, lightweight REST API microservice for the OmniCode barcode and QR generation engine.

Docker-ready with built-in OpenAPI 3.0 specification and interactive validation.

## Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Health check & system version status |
| `GET` | `/api/v1/spec` | Full OpenAPI 3.0.3 JSON schema |
| `POST` | `/api/v1/qr/generate` | Generate styled vector QR code (JSON or SVG stream) |
| `POST` | `/api/v1/barcode/generate` | Generate industrial barcode with GS1 check digit verification |
| `POST` | `/api/v1/verify` | Check barcode check digit and QR optical contrast ratio |

## Quick Start (Docker)

```bash
docker compose up -d --build
```

The service will be live on `http://localhost:8080`.

## Example Requests

### 1. Generate QR Code (JSON)

```bash
curl -X POST http://localhost:8080/api/v1/qr/generate \
  -H "Content-Type: application/json" \
  -d '{
    "data": "https://omnicode.studio",
    "ecLevel": "H",
    "dotType": "rounded",
    "fgColor": "#059669"
  }'
```

### 2. Stream SVG Directly

```bash
curl -X POST http://localhost:8080/api/v1/qr/generate \
  -H "Content-Type: application/json" \
  -H "Accept: image/svg+xml" \
  -d '{"data": "https://omnicode.studio"}' > qr.svg
```

### 3. Generate Thermal Warehouse Label Barcode

```bash
curl -X POST http://localhost:8080/api/v1/barcode/generate \
  -H "Content-Type: application/json" \
  -d '{
    "format": "EAN13",
    "data": "4006381333931",
    "style": "thermal-label",
    "headerText": "DEPOT DISPATCH",
    "footerText": "CARRIER VERIFIED"
  }'
```

### 4. Verify Optical Scannability

```bash
curl -X POST http://localhost:8080/api/v1/verify \
  -H "Content-Type: application/json" \
  -d '{
    "type": "barcode",
    "format": "EAN13",
    "data": "4006381333931",
    "fgColor": "#000000",
    "bgColor": "#ffffff"
  }'
```

## Running Tests

```bash
npm test
```

## License

MIT © OmniCode Studio Engineering Team
