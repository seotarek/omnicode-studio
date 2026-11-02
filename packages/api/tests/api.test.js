import { describe, it, expect } from "vitest";
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
  });
});
