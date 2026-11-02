import { describe, it, expect } from "vitest";
import { QRCodeReader, BinaryBitmap, HybridBinarizer, RGBLuminanceSource } from "@zxing/library";
import { QRCodeRenderer } from "../../src/core/qr/renderer";
import { encodeWifi, encodeVCard } from "../../src/core/payloads/encoders";

function decodeMatrixWithZXing(matrix: boolean[][], scale: number = 4, quiet: number = 4): string {
  const count = matrix.length;
  const totalModules = count + quiet * 2;
  const width = totalModules * scale;
  const height = totalModules * scale;
  const buffer = new Uint8ClampedArray(width * height);

  for (let y = 0; y < height; y++) {
    const modY = Math.floor(y / scale) - quiet;
    for (let x = 0; x < width; x++) {
      const modX = Math.floor(x / scale) - quiet;
      let isDark = false;
      if (modY >= 0 && modY < count && modX >= 0 && modX < count) {
        isDark = matrix[modY][modX];
      }
      const idx = y * width + x;
      buffer[idx] = isDark ? 0 : 255;
    }
  }

  const lumSource = new RGBLuminanceSource(buffer, width, height);
  const binarizer = new HybridBinarizer(lumSource);
  const bitmap = new BinaryBitmap(binarizer);
  const reader = new QRCodeReader();
  const result = reader.decode(bitmap);
  return result.getText();
}

describe("Independent Decoder Verification (ZXing)", () => {
  it("decodes a standard URL payload accurately", () => {
    const url = "https://omnicode.studio/enterprise/verify?token=9942a";
    const renderer = new QRCodeRenderer({
      width: 300,
      height: 300,
      margin: 10,
      data: url,
      errorCorrectionLevel: "M",
      dotsOptions: { type: "square", colorOrGradient: { color: "#000000" } },
      cornersSquareOptions: { type: "square", colorOrGradient: { color: "#000000" } },
      cornersDotOptions: { type: "square", colorOrGradient: { color: "#000000" } },
      backgroundOptions: { color: "#ffffff" }
    });

    const { matrix } = renderer.generateMatrix();
    const decoded = decodeMatrixWithZXing(matrix);
    expect(decoded).toBe(url);
  });

  it("decodes complex WiFi configuration payload accurately", () => {
    const wifiPayload = encodeWifi({
      ssid: "SecureCorp_Guest",
      password: "Complex#Password_2026",
      encryption: "WPA"
    });

    const renderer = new QRCodeRenderer({
      width: 350,
      height: 350,
      margin: 10,
      data: wifiPayload,
      errorCorrectionLevel: "H",
      dotsOptions: { type: "square", colorOrGradient: { color: "#000000" } },
      cornersSquareOptions: { type: "square", colorOrGradient: { color: "#000000" } },
      cornersDotOptions: { type: "square", colorOrGradient: { color: "#000000" } },
      backgroundOptions: { color: "#ffffff" }
    });

    const { matrix } = renderer.generateMatrix();
    const decoded = decodeMatrixWithZXing(matrix);
    expect(decoded).toBe(wifiPayload);
    expect(decoded).toContain("WIFI:T:WPA;S:SecureCorp_Guest;");
  });

  it("decodes vCard contacts accurately across different error correction levels", () => {
    const vcard = encodeVCard({
      firstName: "Tarek",
      lastName: "Mohamed",
      phone: "+201000000000",
      email: "engineer@omnicode.studio",
      organization: "OmniCode Core",
      title: "Lead Architect"
    });

    for (const ecLevel of ["L", "M", "Q", "H"] as const) {
      const renderer = new QRCodeRenderer({
        width: 400,
        height: 400,
        margin: 10,
        data: vcard,
        errorCorrectionLevel: ecLevel,
        dotsOptions: { type: "square", colorOrGradient: { color: "#000000" } },
        cornersSquareOptions: { type: "square", colorOrGradient: { color: "#000000" } },
        cornersDotOptions: { type: "square", colorOrGradient: { color: "#000000" } },
        backgroundOptions: { color: "#ffffff" }
      });

      const { matrix } = renderer.generateMatrix();
      const decoded = decodeMatrixWithZXing(matrix);
      expect(decoded).toBe(vcard);
      expect(decoded).toContain("FN:Tarek Mohamed");
      expect(decoded).toContain("ORG:OmniCode Core");
    }
  });

  it("decodes pure PHP QrCodeGenerator matrix using ZXing", () => {
    const { execSync } = require("child_process");
    const path = require("path");
    const fs = require("fs");
    const phpDir = path.resolve(__dirname, "../../packages/php");
    const sanitizerPath = path.join(phpDir, "src/Security/ColorSanitizer.php");
    const generatorPath = path.join(phpDir, "src/Qr/QrCodeGenerator.php");

    if (!fs.existsSync(sanitizerPath) || !fs.existsSync(generatorPath)) {
      return;
    }

    try {
      execSync("php -v", { stdio: "ignore" });
    } catch {
      // PHP CLI not present in this test environment
      return;
    }

    const payload = "https://omnicode.studio/cross-engine-verified";
    const cmd = `php -r 'require_once "${sanitizerPath}"; require_once "${generatorPath}"; echo json_encode(Omnicode\\Qr\\QrCodeGenerator::generateMatrix("${payload}", "M"));'`;
    const output = execSync(cmd, { encoding: "utf8" });
    const matrix: boolean[][] = JSON.parse(output);

    const decoded = decodeMatrixWithZXing(matrix);
    expect(decoded).toBe(payload);
  });
});
