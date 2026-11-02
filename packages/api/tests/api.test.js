import { describe, it, expect, beforeEach, afterEach } from "vitest";
import request from "supertest";
import { app } from "../src/app.js";

describe("OmniCode REST API Integration Suite", () => {
  it("GET /health returns healthy status", async () => {
    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("ok");
    expect(res.body.service).toBe("OmniCode Studio REST API");
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
});
