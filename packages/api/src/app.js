import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Load core engine from @omnicode/core dist
import {
  QRCodeRenderer,
  generateBarcodeSVG,
  validateBarcodeData,
  calculateMod10CheckDigit,
  validateScannability,
  calculateContrast
} from "../../core/dist/index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const app = express();

app.use(cors());
app.use(express.json({ limit: "5mb" }));

// Health Check
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    service: "OmniCode Studio REST API",
    version: "1.0.0",
    timestamp: new Date().toISOString()
  });
});

// OpenAPI Spec endpoint
app.get("/api/v1/spec", (req, res) => {
  try {
    const specPath = path.resolve(__dirname, "../openapi.json");
    const spec = JSON.parse(fs.readFileSync(specPath, "utf-8"));
    res.json(spec);
  } catch (err) {
    res.status(500).json({ error: "Failed to load OpenAPI specification" });
  }
});

// Generate QR Code Endpoint
app.post("/api/v1/qr/generate", (req, res) => {
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
});

// Generate Barcode Endpoint
app.post("/api/v1/barcode/generate", (req, res) => {
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
});

// Scannability & Validation Endpoint
app.post("/api/v1/verify", (req, res) => {
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
});
