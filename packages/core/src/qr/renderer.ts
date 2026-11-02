
function sanitizeSvgText(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

import qrcode from "qrcode-generator";
import {
  QRCodeOptions,
  DotType,
  CornerSquareType,
  CornerDotType,
  ColorOrGradient
} from "./types.js";
import { sanitizeColor } from "../security/color.js";

export interface RenderResult {
  svgString: string;
  moduleCount: number;
  matrix: boolean[][];
}

export class QRCodeRenderer {
  private options: QRCodeOptions;

  constructor(options: QRCodeOptions) {
    this.options = options;
  }

  public generateMatrix(): { matrix: boolean[][]; count: number } {
    const qr = qrcode(0, this.options.errorCorrectionLevel);
    qr.addData(this.options.data || "https://omnicode.studio");
    qr.make();

    const count = qr.getModuleCount();
    const matrix: boolean[][] = [];
    for (let r = 0; r < count; r++) {
      const row: boolean[] = [];
      for (let c = 0; c < count; c++) {
        row.push(qr.isDark(r, c));
      }
      matrix.push(row);
    }
    return { matrix, count };
  }

  private isCornerSquare(row: number, col: number, count: number): boolean {
    // Top-Left (0..6, 0..6)
    if (row < 7 && col < 7) return true;
    // Top-Right (0..6, count-7..count-1)
    if (row < 7 && col >= count - 7) return true;
    // Bottom-Left (count-7..count-1, 0..6)
    if (row >= count - 7 && col < 7) return true;
    return false;
  }

  private isProtectedByLogo(row: number, col: number, count: number): boolean {
    if (!this.options.logoOptions?.url || !this.options.logoOptions.protectZone) {
      return false;
    }
    const ratio = this.options.logoOptions.sizeRatio || 0.22;
    const padding = this.options.logoOptions.padding || 1;
    const logoModules = Math.floor(count * ratio) + padding * 2;
    const start = Math.floor((count - logoModules) / 2);
    const end = start + logoModules;
    return row >= start && row < end && col >= start && col < end;
  }

  private renderDot(
    x: number,
    y: number,
    size: number,
    type: DotType
  ): string {
    const r = size / 2;
    const cx = x + r;
    const cy = y + r;

    switch (type) {
      case "dots":
        return `<circle cx="${cx}" cy="${cy}" r="${r * 0.88}" />`;
      case "rounded":
        return `<rect x="${x}" y="${y}" width="${size}" height="${size}" rx="${size * 0.35}" ry="${size * 0.35}" />`;
      case "extra-rounded":
        return `<rect x="${x}" y="${y}" width="${size}" height="${size}" rx="${size * 0.5}" ry="${size * 0.5}" />`;
      case "classy":
        return `<path d="M ${x + r} ${y} A ${r} ${r} 0 0 1 ${x + size} ${y + r} L ${x + size} ${y + size} L ${x + r} ${y + size} A ${r} ${r} 0 0 1 ${x} ${y + r} L ${x} ${y} Z" />`;
      case "classy-rounded":
        return `<path d="M ${x} ${y + r} A ${r} ${r} 0 0 1 ${x + r} ${y} L ${x + size} ${y} L ${x + size} ${y + r} A ${r} ${r} 0 0 1 ${x + r} ${y + size} L ${x} ${y + size} Z" />`;
      case "diamond":
        return `<polygon points="${cx},${y} ${x + size},${cy} ${cx},${y + size} ${x},${cy}" />`;
      case "star":
        const p1 = `${cx},${y + size * 0.05}`;
        const p2 = `${cx + size * 0.15},${cy - size * 0.1}`;
        const p3 = `${x + size * 0.95},${cy}`;
        const p4 = `${cx + size * 0.15},${cy + size * 0.1}`;
        const p5 = `${cx},${y + size * 0.95}`;
        const p6 = `${cx - size * 0.15},${cy + size * 0.1}`;
        const p7 = `${x + size * 0.05},${cy}`;
        const p8 = `${cx - size * 0.15},${cy - size * 0.1}`;
        return `<polygon points="${p1} ${p2} ${p3} ${p4} ${p5} ${p6} ${p7} ${p8}" />`;
      case "horizontal-bars":
        return `<rect x="${x}" y="${y + size * 0.2}" width="${size}" height="${size * 0.6}" rx="${size * 0.2}" ry="${size * 0.2}" />`;
      case "vertical-bars":
        return `<rect x="${x + size * 0.2}" y="${y}" width="${size * 0.6}" height="${size}" rx="${size * 0.2}" ry="${size * 0.2}" />`;
      case "square":
      default:
        return `<rect x="${x}" y="${y}" width="${size}" height="${size}" />`;
    }
  }

  private renderCornerSquare(
    x: number,
    y: number,
    size: number,
    type: CornerSquareType
  ): string {
    const thickness = size / 7;
    const outerRadius = type === "extra-rounded" ? size * 0.45 : type === "rounded" ? size * 0.25 : 0;
    const innerRadius = type === "extra-rounded" ? (size - thickness * 2) * 0.4 : type === "rounded" ? (size - thickness * 2) * 0.2 : 0;

    if (type === "diamond") {
      const cx = x + size / 2;
      const cy = y + size / 2;
      const r = size / 2;
      const ir = r - thickness;
      return `
        <g>
          <polygon points="${cx},${y} ${x + size},${cy} ${cx},${y + size} ${x},${cy}" />
          <polygon points="${cx},${cy - ir} ${cx + ir},${cy} ${cx},${cy + ir} ${cx - ir},${cy}" fill="white" />
        </g>
      `;
    }

    if (type === "leaf") {
      // One rounded corner diagonally, others sharp
      const rOuter = size * 0.4;
      const rInner = (size - thickness * 2) * 0.35;
      return `
        <g>
          <rect x="${x}" y="${y}" width="${size}" height="${size}" rx="${rOuter}" ry="${rOuter}" />
          <rect x="${x + thickness}" y="${y + thickness}" width="${size - thickness * 2}" height="${size - thickness * 2}" rx="${rInner}" ry="${rInner}" fill="white" />
        </g>
      `;
    }

    return `
      <g>
        <rect x="${x}" y="${y}" width="${size}" height="${size}" rx="${outerRadius}" ry="${outerRadius}" />
        <rect x="${x + thickness}" y="${y + thickness}" width="${size - thickness * 2}" height="${size - thickness * 2}" rx="${innerRadius}" ry="${innerRadius}" fill="white" />
      </g>
    `;
  }

  private renderCornerDot(
    x: number,
    y: number,
    size: number,
    type: CornerDotType
  ): string {
    if (type === "diamond") {
      const cx = x + size / 2;
      const cy = y + size / 2;
      return `<polygon points="${cx},${y} ${x + size},${cy} ${cx},${y + size} ${x},${cy}" />`;
    }
    if (type === "star") {
      const cx = x + size / 2;
      const cy = y + size / 2;
      return `<polygon points="${cx},${y} ${cx + size * 0.25},${cy - size * 0.25} ${x + size},${cy} ${cx + size * 0.25},${cy + size * 0.25} ${cx},${y + size} ${cx - size * 0.25},${cy + size * 0.25} ${x},${cy} ${cx - size * 0.25},${cy - size * 0.25}" />`;
    }
    const radius = type === "dot" ? size / 2 : type === "rounded" ? size * 0.25 : 0;
    return `<rect x="${x}" y="${y}" width="${size}" height="${size}" rx="${radius}" ry="${radius}" />`;
  }

  private createDef(id: string, colorOrGrad: ColorOrGradient): { id: string; defString: string } {
    if (colorOrGrad.gradient) {
      const g = colorOrGrad.gradient;
      const stops = g.colorStops
        .map((s) => `<stop offset="${s.offset * 100}%" stop-color="${sanitizeColor(s.color, "#000000")}" />`)
        .join("");

      if (g.type === "radial") {
        return {
          id: `url(#${id})`,
          defString: `<radialGradient id="${id}" cx="50%" cy="50%" r="50%">${stops}</radialGradient>`
        };
      } else {
        const rad = ((g.rotation || 0) * Math.PI) / 180;
        const x1 = Math.round(50 - Math.cos(rad) * 50);
        const y1 = Math.round(50 - Math.sin(rad) * 50);
        const x2 = Math.round(50 + Math.cos(rad) * 50);
        const y2 = Math.round(50 + Math.sin(rad) * 50);
        return {
          id: `url(#${id})`,
          defString: `<linearGradient id="${id}" x1="${x1}%" y1="${y1}%" x2="${x2}%" y2="${y2}%">${stops}</linearGradient>`
        };
      }
    }
    return {
      id: sanitizeColor(colorOrGrad.color, "#000000"),
      defString: ""
    };
  }

  public render(): RenderResult {
    const { matrix, count } = this.generateMatrix();
    const margin = this.options.margin;
    const rawSize = Math.min(this.options.width, this.options.height);
    const cellSize = (rawSize - margin * 2) / count;

    const dotsDef = this.createDef("qr-dots-fill", this.options.dotsOptions.colorOrGradient);
    const cornerSquareDef = this.createDef("qr-corner-sq-fill", this.options.cornersSquareOptions.colorOrGradient);
    const cornerDotDef = this.createDef("qr-corner-dot-fill", this.options.cornersDotOptions.colorOrGradient);

    const defs = [dotsDef.defString, cornerSquareDef.defString, cornerDotDef.defString]
      .filter(Boolean)
      .join("\n");

    const dotsPaths: string[] = [];

    // Render body dots
    for (let r = 0; r < count; r++) {
      for (let c = 0; c < count; c++) {
        if (!matrix[r][c]) continue;
        if (this.isCornerSquare(r, c, count)) continue;
        if (this.isProtectedByLogo(r, c, count)) continue;

        const x = margin + c * cellSize;
        const y = margin + r * cellSize;
        dotsPaths.push(this.renderDot(x, y, cellSize, this.options.dotsOptions.type));
      }
    }

    // Corner Finder coordinates
    const cornerSize = cellSize * 7;
    const cornerDotSize = cellSize * 3;
    const cornerDotOffset = cellSize * 2;

    const corners = [
      { x: margin, y: margin },
      { x: margin + (count - 7) * cellSize, y: margin },
      { x: margin, y: margin + (count - 7) * cellSize }
    ];

    const cornerSquareElements: string[] = [];
    const cornerDotElements: string[] = [];

    for (const c of corners) {
      cornerSquareElements.push(
        this.renderCornerSquare(c.x, c.y, cornerSize, this.options.cornersSquareOptions.type)
      );
      cornerDotElements.push(
        this.renderCornerDot(
          c.x + cornerDotOffset,
          c.y + cornerDotOffset,
          cornerDotSize,
          this.options.cornersDotOptions.type
        )
      );
    }

    // Logo rendering
    let logoElement = "";
    if (this.options.logoOptions?.url) {
      const ratio = this.options.logoOptions.sizeRatio || 0.22;
      const logoSize = rawSize * ratio;
      const logoX = (rawSize - logoSize) / 2;
      const logoY = (rawSize - logoSize) / 2;
      const bgPad = (this.options.logoOptions.padding || 1) * cellSize;
      const bgRadius = this.options.logoOptions.borderRadius || 8;
      const bgColor = sanitizeColor(this.options.logoOptions.backgroundColor, "#ffffff");

      // Validate safe image schema
      const safeUrl = this.options.logoOptions.url.trim();
      const isSafeProtocol = safeUrl.startsWith("data:image/") || safeUrl.startsWith("http://") || safeUrl.startsWith("https://") || safeUrl.startsWith("/");
      if (!isSafeProtocol) {
        throw new Error("Security Violation: Logo URL must use data:image/ or http(s) protocol");
      }
      logoElement = `
        <g id="qr-logo-container">
          <rect x="${logoX - bgPad}" y="${logoY - bgPad}" width="${logoSize + bgPad * 2}" height="${logoSize + bgPad * 2}" rx="${bgRadius}" ry="${bgRadius}" fill="${bgColor}" />
          <image href="${sanitizeSvgText(safeUrl)}" x="${logoX}" y="${logoY}" width="${logoSize}" height="${logoSize}" preserveAspectRatio="xMidYMid meet" />
        </g>
      `;
    }

    // Background rect
    const bgElement = this.options.backgroundOptions.transparent
      ? ""
      : `<rect width="${rawSize}" height="${rawSize}" fill="${sanitizeColor(this.options.backgroundOptions.color, "#ffffff")}" />`;

    const svgString = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${rawSize} ${rawSize}" width="${rawSize}" height="${rawSize}">
  <defs>
    ${defs}
  </defs>
  ${bgElement}
  <g fill="${dotsDef.id}">
    ${dotsPaths.join("\n")}
  </g>
  <g fill="${cornerSquareDef.id}">
    ${cornerSquareElements.join("\n")}
  </g>
  <g fill="${cornerDotDef.id}">
    ${cornerDotElements.join("\n")}
  </g>
  ${logoElement}
</svg>
`.trim();

    return {
      svgString,
      moduleCount: count,
      matrix
    };
  }
}
