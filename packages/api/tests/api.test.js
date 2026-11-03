import { describe, it, expect, beforeEach, afterEach } from "vitest";
import request from "supertest";
import { app } from "../src/app.js";

describe("OmniCode REST API Integration Suite", () => {
  it("GET /health returns healthy status with OWASP security headers", async () => {
    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("ok");
    expect(res.body.service).toBe("OmniCode Studio REST API");
    expect(res.headers["x-content-type-options"]).toBe("nosniff");
    expect(res.headers["x-frame-options"]).toBe("DENY");
    expect(res.headers["referrer-policy"]).toBe("strict-origin-when-cross-origin");
  });

  it("GET /metrics returns live telemetry and runtime stats", async () => {
    const res = await request(app).get("/metrics");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("ok");
    expect(res.body.uptimeSeconds).toBeGreaterThanOrEqual(0);
    expect(res.body.memory.rssMb).toBeGreaterThan(0);
    expect(res.body.nodeVersion).toBeDefined();
  });

  it("GET /api/v1/spec returns valid OpenAPI spec", async () => {
    const res = await request(app).get("/api/v1/spec");
    expect(res.status).toBe(200);
    expect(res.body.openapi).toBe("3.0.3");
    expect(res.body.info.title).toContain("OmniCode");
  });

  it("POST /api/v1/qr/generate returns SVG payload", async () => {
    const res = await request(app)
      .post("/api/v1/qr/generate")
      .send({
        data: "https://omnicode.studio/enterprise",
        ecLevel: "H",
        dotType: "rounded"
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.svg).toContain("<svg");
    expect(res.body.svg).toContain("viewBox=\"0 0 360 360\"");
  });

  it("POST /api/v1/qr/generate supports direct image/svg+xml stream", async () => {
    const res = await request(app)
      .post("/api/v1/qr/generate")
      .set("Accept", "image/svg+xml")
      .send({
        data: "https://omnicode.studio/stream"
      });

    expect(res.status).toBe(200);
    expect(res.headers["content-type"]).toContain("image/svg+xml");
    const rawSvg = typeof res.text === "string" && res.text.length > 0 ? res.text : res.body.toString();
    expect(rawSvg).toContain("<svg");
  });

  it("POST /api/v1/barcode/generate creates valid EAN-13", async () => {
    const res = await request(app)
      .post("/api/v1/barcode/generate")
      .send({
        format: "EAN13",
        data: "4006381333931",
        style: "thermal-label",
        headerText: "DEPOT DISPATCH",
        footerText: "VERIFIED"
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.svg).toContain("<svg");
    expect(res.body.svg).toContain("DEPOT DISPATCH");
  });

  it("POST /api/v1/barcode/generate rejects invalid check digit with 422", async () => {
    const res = await request(app)
      .post("/api/v1/barcode/generate")
      .send({
        format: "EAN13",
        data: "4006381333939"
      });

    expect(res.status).toBe(422);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toContain("Invalid EAN-13 check digit");
  });

  it("POST /api/v1/barcode/generate creates valid MSI barcode", async () => {
    const res = await request(app)
      .post("/api/v1/barcode/generate")
      .send({
        format: "MSI",
        data: "1234567890",
        style: "minimal"
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.svg).toContain("<svg");
  });

  it("POST /api/v1/barcode/generate creates valid Codabar barcode", async () => {
    const res = await request(app)
      .post("/api/v1/barcode/generate")
      .send({
        format: "codabar",
        data: "A12345B",
        style: "classic"
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.svg).toContain("<svg");
  });

  it("POST /api/v1/verify checks barcode check digit and optical contrast", async () => {
    const res = await request(app)
      .post("/api/v1/verify")
      .send({
        type: "barcode",
        format: "EAN13",
        data: "4006381333931",
        fgColor: "#000000",
        bgColor: "#ffffff"
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.barcode.isValid).toBe(true);
    expect(res.body.barcode.calculatedCheckDigit).toBe(1);
    expect(res.body.scannability.contrastRatio).toBeGreaterThan(15);
    expect(res.body.scannability.isScannable).toBe(true);
    expect(res.body.scannability.disclaimer).toBeDefined();
  });

  describe("Security: SSRF Prevention", () => {
    it("blocks localhost logo URLs", async () => {
      const res = await request(app)
        .post("/api/v1/qr/generate")
        .send({
          data: "test",
          logoUrl: "http://localhost:8080/internal-logo.png"
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain("SSRF protection triggered");
    });

    it("blocks private 127.0.0.1 IP logo URLs", async () => {
      const res = await request(app)
        .post("/api/v1/qr/generate")
        .send({
          data: "test",
          logoUrl: "http://127.0.0.1/logo.png"
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toContain("SSRF protection triggered");
    });

    it("blocks AWS/cloud metadata 169.254.169.254", async () => {
      const res = await request(app)
        .post("/api/v1/qr/generate")
        .send({
          data: "test",
          logoUrl: "http://169.254.169.254/latest/meta-data/"
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toContain("SSRF protection triggered");
    });

    it("blocks private 10.x.x.x and 192.168.x.x addresses", async () => {
      const res = await request(app)
        .post("/api/v1/qr/generate")
        .send({
          data: "test",
          logoUrl: "http://10.0.0.5/logo.png"
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toContain("SSRF protection triggered");
    });

    it("blocks non-http protocols (javascript:)", async () => {
      const res = await request(app)
        .post("/api/v1/qr/generate")
        .send({
          data: "test",
          logoUrl: "javascript:alert(1)"
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toContain("SSRF protection triggered");
    });
  });

  describe("Security: Bounds Checking", () => {
    it("rejects QR data exceeding 4096 characters", async () => {
      const longData = "A".repeat(4097);
      const res = await request(app)
        .post("/api/v1/qr/generate")
        .send({ data: longData });

      expect(res.status).toBe(400);
      expect(res.body.error).toContain("exceeds maximum allowed length");
    });

    it("rejects invalid QR size outside [30, 2000]", async () => {
      const res = await request(app)
        .post("/api/v1/qr/generate")
        .send({ size: 10 });

      expect(res.status).toBe(400);
      expect(res.body.error).toContain("Size must be a number between 30 and 2000");
    });

    it("rejects invalid QR margin outside [0, 200]", async () => {
      const res = await request(app)
        .post("/api/v1/qr/generate")
        .send({ margin: 250 });

      expect(res.status).toBe(400);
      expect(res.body.error).toContain("Margin must be a number between 0 and 200");
    });

    it("rejects barcode width outside [1, 10]", async () => {
      const res = await request(app)
        .post("/api/v1/barcode/generate")
        .send({ data: "123456", width: 25 });

      expect(res.status).toBe(400);
      expect(res.body.error).toContain("Width must be a number between 1 and 10");
    });

    it("rejects barcode height outside [10, 1000]", async () => {
      const res = await request(app)
        .post("/api/v1/barcode/generate")
        .send({ data: "123456", height: 5 });

      expect(res.status).toBe(400);
      expect(res.body.error).toContain("Height must be a number between 10 and 1000");
    });
  });

  describe("Security: Rate Limiting & API Key Auth", () => {
    it("includes rate limit headers on response", async () => {
      const res = await request(app)
        .post("/api/v1/qr/generate")
        .send({ data: "https://omnicode.studio" });

      expect(res.status).toBe(200);
      expect(res.headers["x-ratelimit-limit"]).toBeDefined();
      expect(res.headers["x-ratelimit-remaining"]).toBeDefined();
    });

    describe("With API_KEY configured", () => {
      beforeEach(() => {
        process.env.API_KEY = "test-secret-key-123";
      });

      afterEach(() => {
        delete process.env.API_KEY;
      });

      it("permits unauthenticated access to /health and /api/v1/spec", async () => {
        const healthRes = await request(app).get("/health");
        expect(healthRes.status).toBe(200);

        const specRes = await request(app).get("/api/v1/spec");
        expect(specRes.status).toBe(200);
      });

      it("rejects protected endpoint when no API key is provided", async () => {
        const res = await request(app)
          .post("/api/v1/qr/generate")
          .send({ data: "test" });

        expect(res.status).toBe(401);
        expect(res.body.success).toBe(false);
        expect(res.body.error).toContain("Unauthorized: Invalid or missing API key");
      });

      it("accepts valid x-api-key header", async () => {
        const res = await request(app)
          .post("/api/v1/qr/generate")
          .set("x-api-key", "test-secret-key-123")
          .send({ data: "authenticated" });

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
      });

      it("accepts valid Authorization Bearer token", async () => {
        const res = await request(app)
          .post("/api/v1/qr/generate")
          .set("Authorization", "Bearer test-secret-key-123")
          .send({ data: "authenticated-bearer" });

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
      });
    });
  });

  describe("Global REST Endpoints (Prompt 2 Specification)", () => {
    it("GET /api/v1/symbologies returns full 1D and 2D specifications", async () => {
      const res = await request(app).get("/api/v1/symbologies");
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.symbologies.qr.standard).toBe("ISO/IEC 18004");
      expect(res.body.symbologies.barcodes.some((b) => b.format === "EAN13")).toBe(true);
      expect(res.body.symbologies.barcodes.some((b) => b.format === "MSI")).toBe(true);
      expect(res.body.symbologies.barcodes.some((b) => b.format === "codabar")).toBe(true);
    });

    it("POST /api/v1/generate/qr alias generates valid QR code", async () => {
      const res = await request(app)
        .post("/api/v1/generate/qr")
        .send({ data: "https://global.omnicode.studio" });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.svg).toContain("<svg");
    });

    it("POST /api/v1/generate/barcode alias generates valid barcode", async () => {
      const res = await request(app)
        .post("/api/v1/generate/barcode")
        .send({ format: "EAN13", data: "4006381333931" });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.svg).toContain("<svg");
    });

    it("POST /api/v1/validate alias verifies check digit and scannability", async () => {
      const res = await request(app)
        .post("/api/v1/validate")
        .send({
          type: "barcode",
          format: "EAN13",
          data: "4006381333931",
          fgColor: "#000000",
          bgColor: "#ffffff"
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.barcode.isValid).toBe(true);
      expect(res.body.scannability.isScannable).toBe(true);
    });

    it("POST /api/v1/generate/batch handles mixed batch requests", async () => {
      const res = await request(app)
        .post("/api/v1/generate/batch")
        .send({
          items: [
            { id: "q1", type: "qr", options: { data: "https://item1.test" } },
            { id: "b1", type: "barcode", options: { format: "EAN13", data: "4006381333931" } }
          ]
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.count).toBe(2);
      expect(res.body.results[0].success).toBe(true);
      expect(res.body.results[1].success).toBe(true);
    });

    it("POST /api/v1/export supports SVG, Base64, and Data URL exports", async () => {
      const b64Res = await request(app)
        .post("/api/v1/export")
        .send({
          type: "qr",
          outputFormat: "base64",
          options: { data: "https://export-b64.test" }
        });

      expect(b64Res.status).toBe(200);
      expect(b64Res.body.outputFormat).toBe("base64");
      expect(b64Res.body.data.length).toBeGreaterThan(50);

      const dataUrlRes = await request(app)
        .post("/api/v1/export")
        .send({
          type: "barcode",
          outputFormat: "data-url",
          options: { format: "CODE128", data: "EXPORT-DATA" }
        });

      expect(dataUrlRes.status).toBe(200);
      expect(dataUrlRes.body.outputFormat).toBe("data-url");
      expect(dataUrlRes.body.dataUrl.startsWith("data:image/svg+xml;base64,")).toBe(true);

      const epsRes = await request(app)
        .post("/api/v1/export")
        .send({
          type: "barcode",
          outputFormat: "eps",
          options: { format: "CODE128", data: "EXPORT-EPS" }
        });

      expect(epsRes.status).toBe(200);
      expect(epsRes.body.outputFormat).toBe("eps");
      expect(epsRes.body.eps).toContain("%!PS-Adobe-3.0 EPSF-3.0");
      expect(epsRes.body.eps).toContain("%%EOF");
    });

    it("POST /api/v1/payloads/encode encodes GS1, EPC SEPA, and ZATCA payloads", async () => {
      // 1. GS1 Digital Link
      const gs1Res = await request(app)
        .post("/api/v1/payloads/encode")
        .send({
          type: "gs1",
          payload: {
            domain: "https://id.gs1.org",
            gtin: "01234567890128",
            lot: "BATCH-A1",
            serial: "SER-99"
          }
        });
      expect(gs1Res.status).toBe(200);
      expect(gs1Res.body.encoded).toBe("https://id.gs1.org/01/01234567890128/10/BATCH-A1/21/SER-99");
      expect(gs1Res.body.recommendedEcLevel).toBe("M");

      // 2. EPC SEPA
      const epcRes = await request(app)
        .post("/api/v1/payloads/encode")
        .send({
          type: "epc-sepa",
          payload: {
            name: "OmniCode GmbH",
            iban: "DE89370400440532013000",
            amount: 49.99,
            remittanceText: "Invoice 1002"
          }
        });
      expect(epcRes.status).toBe(200);
      expect(epcRes.body.encoded).toContain("BCD\n002\n1\nSCT");
      expect(epcRes.body.encoded).toContain("OmniCode GmbH");

      // 3. ZATCA
      const zatcaRes = await request(app)
        .post("/api/v1/payloads/encode")
        .send({
          type: "zatca",
          payload: {
            sellerName: "شركة أومني كود المحدودة",
            vatNumber: "300000000000003",
            timestamp: "2026-11-02T18:00:00Z",
            totalWithVat: "115.00",
            vatTotal: "15.00"
          }
        });
      expect(zatcaRes.status).toBe(200);
      expect(zatcaRes.body.recommendedEcLevel).toBe("H");
      expect(zatcaRes.body.encoded.length).toBeGreaterThan(20);

      // 4. Decode ZATCA
      const decodeRes = await request(app)
        .post("/api/v1/payloads/decode")
        .send({
          type: "zatca",
          data: zatcaRes.body.encoded
        });
      expect(decodeRes.status).toBe(200);
      expect(decodeRes.body.decoded.sellerName).toBe("شركة أومني كود المحدودة");
      expect(decodeRes.body.decoded.vatNumber).toBe("300000000000003");
      expect(decodeRes.body.decoded.totalWithVat).toBe("115.00");

      // 5. Decode GS1 Digital Link
      const decodeGs1Res = await request(app)
        .post("/api/v1/payloads/decode")
        .send({
          type: "gs1",
          data: gs1Res.body.encoded
        });
      expect(decodeGs1Res.status).toBe(200);
      expect(decodeGs1Res.body.decoded.gtin).toBe("01234567890128");
      expect(decodeGs1Res.body.decoded.lot).toBe("BATCH-A1");

      // 6. Decode EPC SEPA
      const decodeEpcRes = await request(app)
        .post("/api/v1/payloads/decode")
        .send({
          type: "epc",
          data: epcRes.body.encoded
        });
      expect(decodeEpcRes.status).toBe(200);
      expect(decodeEpcRes.body.decoded.beneficiaryName).toBe("OmniCode GmbH");
      expect(decodeEpcRes.body.decoded.amount).toBe(49.99);

      // 7. Decode WiFi
      const decodeWifiRes = await request(app)
        .post("/api/v1/payloads/decode")
        .send({
          type: "wifi",
          data: "WIFI:T:WPA;S:MyOffice;P:SecretKey123;;;"
        });
      expect(decodeWifiRes.status).toBe(200);
      expect(decodeWifiRes.body.decoded.ssid).toBe("MyOffice");
      expect(decodeWifiRes.body.decoded.password).toBe("SecretKey123");
    });
  });
});

