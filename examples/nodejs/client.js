/**
 * OmniCode Studio - Node.js SDK & API Example
 */

import { OmniCode } from "@omnicode/core";

// 1. Direct Headless In-Memory Generation (No network required)
console.log("=== 1. Direct Headless Generation via @omnicode/core ===");

const qr = OmniCode.generateQr({
  data: "https://omnicode.studio",
  width: 320,
  height: 320,
  errorCorrectionLevel: "H"
});
console.log(`QR Code generated. Module count: ${qr.moduleCount}. SVG length: ${qr.svgString.length}`);

const barcode = OmniCode.generateBarcode({
  format: "EAN13",
  data: "4006381333931",
  style: "thermal-label"
});
console.log(`Barcode generated. SVG length: ${barcode.length}`);

// 2. Batch Processing
console.log("\n=== 2. Batch Processing ===");
const batchResults = OmniCode.batch([
  { id: 1, type: "qr", options: { data: "https://item1.org" } },
  { id: 2, type: "barcode", options: { format: "CODE128", data: "PRODUCT-99" } }
]);
console.log(`Processed ${batchResults.length} items successfully:`, batchResults.map(r => ({ id: r.id, success: r.success })));

// 3. Remote HTTP REST Client Helper
export async function createRemoteClient(baseUrl = "http://localhost:8080", apiKey = null) {
  const headers = { "Content-Type": "application/json" };
  if (apiKey) headers["x-api-key"] = apiKey;

  return {
    async generateQr(data, options = {}) {
      const res = await fetch(`${baseUrl}/api/v1/generate/qr`, {
        method: "POST",
        headers,
        body: JSON.stringify({ data, ...options })
      });
      return res.json();
    },
    async generateBarcode(format, data, options = {}) {
      const res = await fetch(`${baseUrl}/api/v1/generate/barcode`, {
        method: "POST",
        headers,
        body: JSON.stringify({ format, data, ...options })
      });
      return res.json();
    }
  };
}
