#!/usr/bin/env bash
# OmniCode Studio - cURL Integration Examples

API_BASE="${OMNICODE_API_URL:-http://localhost:8080}"
API_KEY="${OMNICODE_API_KEY:-}"

AUTH_HEADER=""
if [ -n "$API_KEY" ]; then
  AUTH_HEADER="x-api-key: $API_KEY"
fi

echo "=== 1. Health & Status ==="
curl -s "$API_BASE/health" | jq .

echo -e "\n=== 2. List Supported Symbologies ==="
curl -s "$API_BASE/api/v1/symbologies" | jq .

echo -e "\n=== 3. Generate QR Code ==="
curl -s -X POST "$API_BASE/api/v1/generate/qr" \
  -H "Content-Type: application/json" \
  ${AUTH_HEADER:+-H "$AUTH_HEADER"} \
  -d '{
    "data": "https://omnicode.studio",
    "ecLevel": "H",
    "size": 360,
    "dotType": "rounded",
    "fgColor": "#059669",
    "bgColor": "#ffffff"
  }' | jq '{success, format, moduleCount}'

echo -e "\n=== 4. Generate EAN-13 Barcode ==="
curl -s -X POST "$API_BASE/api/v1/generate/barcode" \
  -H "Content-Type: application/json" \
  ${AUTH_HEADER:+-H "$AUTH_HEADER"} \
  -d '{
    "format": "EAN13",
    "data": "4006381333931",
    "style": "thermal-label",
    "headerText": "STORE #104",
    "footerText": "DEPARTMENT A"
  }' | jq '{success, symbology, data}'

echo -e "\n=== 5. Validate Barcode Check Digit & Scannability ==="
curl -s -X POST "$API_BASE/api/v1/validate" \
  -H "Content-Type: application/json" \
  ${AUTH_HEADER:+-H "$AUTH_HEADER"} \
  -d '{
    "type": "barcode",
    "format": "EAN13",
    "data": "4006381333931",
    "fgColor": "#000000",
    "bgColor": "#ffffff"
  }' | jq .

echo -e "\n=== 6. Batch Process Mixed Queue ==="
curl -s -X POST "$API_BASE/api/v1/generate/batch" \
  -H "Content-Type: application/json" \
  ${AUTH_HEADER:+-H "$AUTH_HEADER"} \
  -d '{
    "items": [
      { "id": "qr-1", "type": "qr", "options": { "data": "https://company.org/1" } },
      { "id": "bc-1", "type": "barcode", "options": { "format": "CODE128", "data": "SKU-9901" } },
      { "id": "bc-2", "type": "barcode", "options": { "format": "MSI", "data": "890123" } }
    ]
  }' | jq '{success, count, results: [.results[] | {id, type, success, format}]}'

echo -e "\n=== 7. Direct Base64 Export ==="
curl -s -X POST "$API_BASE/api/v1/export" \
  -H "Content-Type: application/json" \
  ${AUTH_HEADER:+-H "$AUTH_HEADER"} \
  -d '{
    "type": "qr",
    "outputFormat": "base64",
    "options": { "data": "https://export.omnicode.studio" }
  }' | jq '{success, outputFormat, sample: .data[0:30]}'
