import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { isProhibitedUrl, createRateLimiter, apiKeyAuth, securityHeaders } from "./security.js";

// Load core engine from @omnicode/core dist
import {
  QRCodeRenderer,
  generateBarcodeSVG,
  validateBarcodeData,
  calculateMod10CheckDigit,
  validateScannability,
  calculateContrast,
  OmniCode,
  encodeGs1DigitalLink,
  encodeEpcSepa,
  encodeZatcaInvoice,
  decodeZatcaInvoice,
  encodeWifi,
  encodeVCard,
  encodeWhatsApp,
  encodeEmail,
  encodeCrypto,
  svgToEps
} from "../../core/dist/index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const startTime = Date.now();

export const app = express();

// Security Defense-in-depth headers
app.use(securityHeaders);

// Configurable CORS with strict origin validation
const corsOrigin = process.env.CORS_ORIGIN || "*";
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || corsOrigin === "*") {
        return callback(null, true);
      }
      const allowed = corsOrigin.split(",").map((s) => s.trim().toLowerCase());
      if (allowed.includes(origin.toLowerCase())) {
        return callback(null, true);
      }
      return callback(new Error("CORS policy violation: Origin not allowed"), false);
    },
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Accept", "x-api-key", "Authorization"]
  })
);

// Body parser
app.use(express.json({ limit: "5mb" }));

// Rate Limiting (100 req / 15 min default per IP, bypassed for /health, /metrics, and /api/v1/spec)
const rateLimiter = createRateLimiter({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: Number(process.env.RATE_LIMIT_MAX) || 100
});
app.use(rateLimiter);

// API Key Authentication (enforced when API_KEY is set or API_KEY_REQUIRED is true)
app.use(apiKeyAuth);

// Health Check
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    service: "OmniCode Studio REST API",
    version: "1.0.0",
    timestamp: new Date().toISOString()
  });
});

// Telemetry & Metrics endpoint
app.get("/metrics", (req, res) => {
  const memory = process.memoryUsage();
  res.json({
    status: "ok",
    uptimeSeconds: Math.floor((Date.now() - startTime) / 1000),
    memory: {
      rssMb: Number((memory.rss / 1024 / 1024).toFixed(2)),
      heapUsedMb: Number((memory.heapUsed / 1024 / 1024).toFixed(2)),
      heapTotalMb: Number((memory.heapTotal / 1024 / 1024).toFixed(2))
    },
    nodeVersion: process.version,
    pid: process.pid
  });
});

// OpenAPI Spec endpoint
app.get("/api/v1/spec", (req, res) => {
  try {
    const specPath = path.resolve(__dirname, "../openapi.json");
    const spec = JSON.parse(fs.readFileSync(specPath, "utf-8"));
    res.json(spec);
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to load OpenAPI specification" });
  }
});

// Symbologies Information Endpoint
app.get("/api/v1/symbologies", (req, res) => {
  res.json({
    success: true,
    symbologies: {
      qr: {
        type: "2d",
        name: "QR Code",
        standard: "ISO/IEC 18004",
        errorCorrectionLevels: ["L", "M", "Q", "H"],
        maxCapacityBytes: 2953,
        supportsGradients: true,
        supportsLogos: true
      },
      barcodes: [
        {
          format: "CODE128",
          name: "Code 128 (Auto A/B/C)",
          type: "1d",
          characterSet: "ASCII 0-127",
          checkDigit: "Modulo 103"
        },
        {
          format: "EAN13",
          name: "EAN-13",
          type: "1d",
          length: 13,
          characterSet: "Numeric (0-9)",
          checkDigit: "GS1 Modulo 10"
        },
        {
          format: "EAN8",
          name: "EAN-8",
          type: "1d",
          length: 8,
          characterSet: "Numeric (0-9)",
          checkDigit: "GS1 Modulo 10"
        },
        {
          format: "UPC",
          name: "UPC-A",
          type: "1d",
          length: 12,
          characterSet: "Numeric (0-9)",
          checkDigit: "GS1 Modulo 10"
        },
        {
          format: "ITF14",
          name: "ITF-14",
          type: "1d",
          length: 14,
          characterSet: "Numeric (0-9)",
          checkDigit: "GS1 Modulo 10"
        },
        {
          format: "MSI",
          name: "MSI Plessey",
          type: "1d",
          characterSet: "Numeric (0-9)",
          checkDigit: "Mod 10 / Luhn"
        },
        {
          format: "codabar",
          name: "Codabar (NW-7)",
          type: "1d",
          characterSet: "Numeric (0-9), symbols (-$:/.+), delimiters (A, B, C, D)"
        },
        {
          format: "pharmacode",
          name: "Pharmacode",
          type: "1d",
          range: "3 to 131070",
          characterSet: "Numeric integer"
        }
      ]
    }
  });
});

// QR Code Generation Handler
function handleQrGenerate(req, res) {
  try {
    const {
      data = "https://omnicode.studio",
      ecLevel = "H",
      size = 360,
      margin = 16,
      dotType = "rounded",
      cornerSquareType = "extra-rounded",
      cornerDotType = "dot",
      fgColor = "#059669",
      fgColor2 = "#047857",
      bgColor = "#ffffff",
      isGradient = false,
      logoUrl
    } = req.body;

    // Bounds checking
    if (data && typeof data === "string" && data.length > 4096) {
      return res.status(400).json({
        success: false,
        error: "Data payload exceeds maximum allowed length of 4096 characters"
      });
    }

    if (size !== undefined && (isNaN(Number(size)) || Number(size) < 30 || Number(size) > 2000)) {
      return res.status(400).json({
        success: false,
        error: "Size must be a number between 30 and 2000"
      });
    }

    if (margin !== undefined && (isNaN(Number(margin)) || Number(margin) < 0 || Number(margin) > 200)) {
      return res.status(400).json({
        success: false,
        error: "Margin must be a number between 0 and 200"
      });
    }

    // SSRF protection for logoUrl
    if (logoUrl) {
      if (isProhibitedUrl(logoUrl)) {
        return res.status(400).json({
          success: false,
          error: "Invalid or prohibited logo URL: SSRF protection triggered"
        });
      }
    }

    const renderer = new QRCodeRenderer({
      width: Number(size),
      height: Number(size),
      margin: Number(margin),
      data,
      errorCorrectionLevel: ecLevel,
      dotsOptions: {
        type: dotType,
        colorOrGradient: isGradient
          ? {
              gradient: {
                type: "linear",
                rotation: 45,
                colorStops: [
                  { offset: 0, color: fgColor },
                  { offset: 1, color: fgColor2 }
                ]
              }
            }
          : { color: fgColor }
      },
      cornersSquareOptions: {
        type: cornerSquareType,
        colorOrGradient: { color: fgColor2 }
      },
      cornersDotOptions: {
        type: cornerDotType,
        colorOrGradient: { color: fgColor }
      },
      backgroundOptions: {
        color: bgColor,
        transparent: bgColor === "transparent"
      },
      logoOptions: logoUrl
        ? {
            url: logoUrl,
            sizeRatio: 0.22,
            padding: 1.5,
            protectZone: true,
            backgroundColor: "#ffffff",
            borderRadius: 8
          }
        : undefined
    });

    const result = renderer.render();

    const acceptHeader = req.headers.accept || "";
    if (acceptHeader.includes("image/svg+xml")) {
      res.setHeader("Content-Type", "image/svg+xml");
      return res.send(result.svgString);
    }

    res.json({
      success: true,
      format: "svg",
      data,
      moduleCount: result.moduleCount,
      svg: result.svgString
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
}

// Barcode Generation Handler
function handleBarcodeGenerate(req, res) {
  try {
    const {
      format = "CODE128",
      data,
      style = "classic",
      width = 2,
      height = 90,
      lineColor = "#000000",
      lineColor2 = "#2563eb",
      background = "#ffffff",
      headerText,
      footerText,
      displayValue = true
    } = req.body;

    if (!data) {
      return res.status(400).json({ success: false, error: "Missing required 'data' field" });
    }

    if (typeof data === "string" && data.length > 4096) {
      return res.status(400).json({
        success: false,
        error: "Data payload exceeds maximum allowed length of 4096 characters"
      });
    }

    if (width !== undefined && (isNaN(Number(width)) || Number(width) < 1 || Number(width) > 10)) {
      return res.status(400).json({
        success: false,
        error: "Width must be a number between 1 and 10"
      });
    }

    if (height !== undefined && (isNaN(Number(height)) || Number(height) < 10 || Number(height) > 1000)) {
      return res.status(400).json({
        success: false,
        error: "Height must be a number between 10 and 1000"
      });
    }

    const validation = validateBarcodeData(format, data);
    if (!validation.isValid) {
      return res.status(422).json({ success: false, error: validation.error });
    }

    const svg = generateBarcodeSVG({
      format,
      data,
      style,
      width: Number(width),
      height: Number(height),
      lineColor,
      lineColor2,
      background,
      headerText,
      footerText,
      displayValue: Boolean(displayValue)
    });

    const acceptHeader = req.headers.accept || "";
    if (acceptHeader.includes("image/svg+xml")) {
      res.setHeader("Content-Type", "image/svg+xml");
      return res.send(svg);
    }

    res.json({
      success: true,
      format: "svg",
      symbology: format,
      data,
      svg
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
}

// Verification Handler
function handleVerify(req, res) {
  try {
    const {
      type = "qr",
      format,
      data,
      fgColor = "#000000",
      bgColor = "#ffffff",
      ecLevel = "M",
      hasLogo = false,
      logoRatio = 0.2
    } = req.body;

    if (data && typeof data === "string" && data.length > 4096) {
      return res.status(400).json({
        success: false,
        error: "Data payload exceeds maximum allowed length of 4096 characters"
      });
    }

    const response = {
      success: true,
      type
    };

    if (type === "barcode" && format && data) {
      const barcodeCheck = validateBarcodeData(format, data);
      response.barcode = {
        format,
        isValid: barcodeCheck.isValid,
        error: barcodeCheck.error || null
      };

      if (["EAN13", "EAN8", "UPC", "ITF14"].includes(format)) {
        const payloadDigits = data.slice(0, -1);
        response.barcode.calculatedCheckDigit = calculateMod10CheckDigit(payloadDigits);
      }
    }

    const contrast = calculateContrast(fgColor, bgColor);
    const scannability = validateScannability({
      fgColor,
      bgColor,
      errorCorrectionLevel: ecLevel,
      hasLogo: Boolean(hasLogo),
      logoRatio: Number(logoRatio)
    });

    response.scannability = {
      contrastRatio: Number(contrast.toFixed(2)),
      score: scannability.score,
      isScannable: scannability.isScannable,
      warnings: scannability.warnings,
      disclaimer: scannability.disclaimer
    };

    res.json(response);
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
}

// Register QR & Barcode generation routes (both legacy and new REST specs)
app.post("/api/v1/qr/generate", handleQrGenerate);
app.post("/api/v1/generate/qr", handleQrGenerate);

app.post("/api/v1/barcode/generate", handleBarcodeGenerate);
app.post("/api/v1/generate/barcode", handleBarcodeGenerate);

app.post("/api/v1/verify", handleVerify);
app.post("/api/v1/validate", handleVerify);

// Batch Generation Endpoint
app.post("/api/v1/generate/batch", (req, res) => {
  try {
    const { items } = req.body;
    if (!items || !Array.isArray(items)) {
      return res.status(400).json({
        success: false,
        error: "'items' array is required"
      });
    }

    if (items.length > 100) {
      return res.status(400).json({
        success: false,
        error: "Batch items limit exceeded (maximum 100 items per request)"
      });
    }

    const results = OmniCode.batch(items);
    res.json({
      success: true,
      count: results.length,
      results
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// Export Endpoint
app.post("/api/v1/export", (req, res) => {
  try {
    const { type = "qr", outputFormat = "svg", options = {} } = req.body;
    let svg = "";

    if (type === "qr") {
      const qrRes = OmniCode.generateQr(options);
      svg = qrRes.svgString;
    } else if (type === "barcode") {
      const validation = OmniCode.validateBarcode(options.format || "CODE128", options.data);
      if (!validation.isValid) {
        return res.status(422).json({ success: false, error: validation.error });
      }
      svg = OmniCode.generateBarcode(options);
    } else {
      return res.status(400).json({ success: false, error: `Invalid type '${type}'` });
    }

    if (outputFormat === "base64") {
      return res.json({
        success: true,
        type,
        outputFormat: "base64",
        data: OmniCode.toBase64(svg)
      });
    }

    if (outputFormat === "data-url") {
      return res.json({
        success: true,
        type,
        outputFormat: "data-url",
        dataUrl: OmniCode.toDataUrl(svg)
      });
    }

    if (outputFormat === "eps") {
      const eps = svgToEps(svg, {
        title: options.title || "OmniCode Vector Barcode/QR",
        barWidthReduction: options.barWidthReduction || 0
      });
      const acceptHeader = req.headers.accept || "";
      if (acceptHeader.includes("application/postscript")) {
        res.setHeader("Content-Type", "application/postscript");
        return res.send(eps);
      }
      return res.json({
        success: true,
        type,
        outputFormat: "eps",
        eps
      });
    }

    const acceptHeader = req.headers.accept || "";
    if (acceptHeader.includes("image/svg+xml")) {
      res.setHeader("Content-Type", "image/svg+xml");
      return res.send(svg);
    }

    res.json({
      success: true,
      type,
      outputFormat: "svg",
      svg
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// Enterprise Standards & Payloads Encoding Endpoint
app.post("/api/v1/payloads/encode", (req, res) => {
  try {
    const { type, payload } = req.body;
    if (!type || !payload) {
      return res.status(400).json({
        success: false,
        error: "'type' and 'payload' object are required"
      });
    }

    let encoded = "";
    let recommendedEcLevel = "M";

    switch (type.toLowerCase()) {
      case "gs1":
      case "gs1-digital-link":
        encoded = encodeGs1DigitalLink(payload);
        recommendedEcLevel = "M";
        break;
      case "epc":
      case "epc-sepa":
        encoded = encodeEpcSepa(payload);
        recommendedEcLevel = "M";
        break;
      case "zatca":
      case "zatca-invoice":
        encoded = encodeZatcaInvoice(payload);
        recommendedEcLevel = "H";
        break;
      case "wifi":
        encoded = encodeWifi(payload);
        break;
      case "vcard":
        encoded = encodeVCard(payload);
        break;
      case "whatsapp":
        encoded = encodeWhatsApp(payload);
        break;
      case "email":
        encoded = encodeEmail(payload);
        break;
      case "crypto":
        encoded = encodeCrypto(payload);
        break;
      default:
        return res.status(400).json({
          success: false,
          error: `Unsupported payload type: '${type}'. Supported types: gs1, epc-sepa, zatca, wifi, vcard, whatsapp, email, crypto`
        });
    }

    res.json({
      success: true,
      type,
      encoded,
      recommendedEcLevel
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// ZATCA TLV Invoice Decoding Endpoint
app.post("/api/v1/payloads/decode", (req, res) => {
  try {
    const { type, data } = req.body;
    if (!type || !data) {
      return res.status(400).json({
        success: false,
        error: "'type' and 'data' string are required"
      });
    }

    if (type.toLowerCase() === "zatca") {
      const decoded = decodeZatcaInvoice(data);
      return res.json({
        success: true,
        type: "zatca",
        decoded
      });
    }

    return res.status(400).json({
      success: false,
      error: `Unsupported decode type '${type}'. Supported: zatca`
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// Uniform Error Handler (prevents leaking stack traces)
app.use((err, req, res, _next) => {
  const status = err.status || err.statusCode || 500;
  res.status(status).json({
    success: false,
    error: err.message || "Internal server error"
  });
});
