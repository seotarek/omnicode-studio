/**
 * OmniCode Enterprise Encapsulated PostScript (EPS) Vector Exporter
 * Conforms to Adobe PostScript Language Level 2/3 EPS Specifications.
 */

export interface EpsExportOptions {
  title?: string;
  creator?: string;
  barWidthReduction?: number; // BWR in points for flexographic print compensation
}

function hexToRgb(hex: string): [number, number, number] {
  let clean = hex.replace(/^#/, "").trim();
  if (clean.length === 3) {
    clean = clean.split("").map((c) => c + c).join("");
  }
  if (clean.length !== 6) {
    return [0, 0, 0];
  }
  const r = parseInt(clean.substring(0, 2), 16) / 255;
  const g = parseInt(clean.substring(2, 4), 16) / 255;
  const b = parseInt(clean.substring(4, 6), 16) / 255;
  return [
    Math.round(r * 1000) / 1000,
    Math.round(g * 1000) / 1000,
    Math.round(b * 1000) / 1000
  ];
}

function parseColor(colorStr: string | null | undefined): [number, number, number] | null {
  if (!colorStr || colorStr === "none" || colorStr === "transparent") {
    return null;
  }
  const str = colorStr.trim().toLowerCase();
  if (str === "black") return [0, 0, 0];
  if (str === "white") return [1, 1, 1];
  if (str.startsWith("#")) {
    return hexToRgb(str);
  }
  const rgbMatch = str.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (rgbMatch) {
    return [
      Math.round((parseInt(rgbMatch[1], 10) / 255) * 1000) / 1000,
      Math.round((parseInt(rgbMatch[2], 10) / 255) * 1000) / 1000,
      Math.round((parseInt(rgbMatch[3], 10) / 255) * 1000) / 1000
    ];
  }
  // Default fallback to black
  return [0, 0, 0];
}

function escapePsString(str: string): string {
  return str
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, "\"")
    .replace(/&#39;/g, "'");
}

/**
 * Converts an OmniCode SVG string (Barcode or QR Code) to Encapsulated PostScript (EPS).
 */
export function svgToEps(svgString: string, options: EpsExportOptions = {}): string {
  const title = options.title || "OmniCode Vector Barcode/QR";
  const creator = options.creator || "OmniCode Studio Engine v1.0";
  const bwr = options.barWidthReduction || 0;

  // Extract dimensions
  let width = 300;
  let height = 300;

  const viewBoxMatch = svgString.match(/viewBox=["']([^"']+)["']/i);
  if (viewBoxMatch) {
    const parts = viewBoxMatch[1].trim().split(/[\s,]+/).map(Number);
    if (parts.length === 4 && parts[2] > 0 && parts[3] > 0) {
      width = parts[2];
      height = parts[3];
    }
  } else {
    const wMatch = svgString.match(/width=["'](\d+(?:\.\d+)?)["']/i);
    const hMatch = svgString.match(/height=["'](\d+(?:\.\d+)?)["']/i);
    if (wMatch && hMatch) {
      width = parseFloat(wMatch[1]);
      height = parseFloat(hMatch[1]);
    }
  }

  const psCommands: string[] = [];
  let currentColor: [number, number, number] | null = null;

  const setColor = (rgb: [number, number, number]) => {
    if (
      !currentColor ||
      currentColor[0] !== rgb[0] ||
      currentColor[1] !== rgb[1] ||
      currentColor[2] !== rgb[2]
    ) {
      currentColor = rgb;
      psCommands.push(`${rgb[0]} ${rgb[1]} ${rgb[2]} setrgbcolor`);
    }
  };

  // 1. Process <rect> elements
  const rectRegex = /<rect\b([^>]*)\/?>/gi;
  let rectMatch: RegExpExecArray | null;
  while ((rectMatch = rectRegex.exec(svgString)) !== null) {
    const attrs = rectMatch[1];
    const x = parseFloat((attrs.match(/\bx=["']([^"']+)["']/) || [, "0"])[1]);
    const y = parseFloat((attrs.match(/\by=["']([^"']+)["']/) || [, "0"])[1]);
    const w = parseFloat((attrs.match(/\bwidth=["']([^"']+)["']/) || [, "0"])[1]);
    const h = parseFloat((attrs.match(/\bheight=["']([^"']+)["']/) || [, "0"])[1]);
    const fillStr = (attrs.match(/\bfill=["']([^"']+)["']/) || [, ""])[1];

    if (w <= 0 || h <= 0) continue;
    const rgb = parseColor(fillStr);
    if (!rgb) continue; // Skip transparent or none

    setColor(rgb);

    // Apply Bar Width Reduction (BWR) if set
    const effectiveW = Math.max(0.1, w - bwr);
    const effectiveX = x + bwr / 2;
    // In PostScript, y is from bottom: y_ps = height - (y + h)
    const y_ps = Math.round((height - (y + h)) * 1000) / 1000;
    psCommands.push(`${Math.round(effectiveX * 1000) / 1000} ${y_ps} ${Math.round(effectiveW * 1000) / 1000} ${Math.round(h * 1000) / 1000} rf`);
  }

  // 2. Process <circle> elements
  const circleRegex = /<circle\b([^>]*)\/?>/gi;
  let circleMatch: RegExpExecArray | null;
  while ((circleMatch = circleRegex.exec(svgString)) !== null) {
    const attrs = circleMatch[1];
    const cx = parseFloat((attrs.match(/\bcx=["']([^"']+)["']/) || [, "0"])[1]);
    const cy = parseFloat((attrs.match(/\bcy=["']([^"']+)["']/) || [, "0"])[1]);
    const r = parseFloat((attrs.match(/\br=["']([^"']+)["']/) || [, "0"])[1]);
    const fillStr = (attrs.match(/\bfill=["']([^"']+)["']/) || [, ""])[1];

    if (r <= 0) continue;
    const rgb = parseColor(fillStr);
    if (!rgb) continue;

    setColor(rgb);
    const cy_ps = Math.round((height - cy) * 1000) / 1000;
    psCommands.push(`${Math.round(cx * 1000) / 1000} ${cy_ps} ${Math.round(r * 1000) / 1000} cf`);
  }

  // 3. Process <line> elements
  const lineRegex = /<line\b([^>]*)\/?>/gi;
  let lineMatch: RegExpExecArray | null;
  while ((lineMatch = lineRegex.exec(svgString)) !== null) {
    const attrs = lineMatch[1];
    const x1 = parseFloat((attrs.match(/\bx1=["']([^"']+)["']/) || [, "0"])[1]);
    const y1 = parseFloat((attrs.match(/\by1=["']([^"']+)["']/) || [, "0"])[1]);
    const x2 = parseFloat((attrs.match(/\bx2=["']([^"']+)["']/) || [, "0"])[1]);
    const y2 = parseFloat((attrs.match(/\by2=["']([^"']+)["']/) || [, "0"])[1]);
    const strokeStr = (attrs.match(/\bstroke=["']([^"']+)["']/) || [, ""])[1];
    const strokeWidth = parseFloat((attrs.match(/\bstroke-width=["']([^"']+)["']/) || [, "1"])[1]);

    const rgb = parseColor(strokeStr);
    if (!rgb) continue;

    setColor(rgb);
    const y1_ps = Math.round((height - y1) * 1000) / 1000;
    const y2_ps = Math.round((height - y2) * 1000) / 1000;
    psCommands.push(`${Math.round(x1 * 1000) / 1000} ${y1_ps} ${Math.round(x2 * 1000) / 1000} ${y2_ps} ${strokeWidth} ln`);
  }

  // 4. Process <polygon> elements
  const polyRegex = /<polygon\b([^>]*)\/?>/gi;
  let polyMatch: RegExpExecArray | null;
  while ((polyMatch = polyRegex.exec(svgString)) !== null) {
    const attrs = polyMatch[1];
    const pointsStr = (attrs.match(/\bpoints=["']([^"']+)["']/) || [, ""])[1];
    const fillStr = (attrs.match(/\bfill=["']([^"']+)["']/) || [, ""])[1];

    if (!pointsStr) continue;
    const rgb = parseColor(fillStr);
    if (!rgb) continue;

    const coords = pointsStr.trim().split(/[\s,]+/).map(Number);
    if (coords.length < 4) continue;

    setColor(rgb);
    const firstX = coords[0];
    const firstY = Math.round((height - coords[1]) * 1000) / 1000;
    let polyPs = `newpath ${firstX} ${firstY} moveto`;
    for (let i = 2; i < coords.length; i += 2) {
      const px = coords[i];
      const py = Math.round((height - coords[i + 1]) * 1000) / 1000;
      polyPs += ` ${px} ${py} lineto`;
    }
    polyPs += " closepath fill";
    psCommands.push(polyPs);
  }

  // 5. Process <text> elements
  const textRegex = /<text\b([^>]*)>([\s\S]*?)<\/text>/gi;
  let textMatch: RegExpExecArray | null;
  while ((textMatch = textRegex.exec(svgString)) !== null) {
    const attrs = textMatch[1];
    const rawContent = textMatch[2].replace(/<[^>]+>/g, "").trim();
    if (!rawContent) continue;

    const x = parseFloat((attrs.match(/\bx=["']([^"']+)["']/) || [, "0"])[1]);
    const y = parseFloat((attrs.match(/\by=["']([^"']+)["']/) || [, "0"])[1]);
    const fontSize = parseFloat((attrs.match(/\bfont-size=["']([^"']+)["']/) || [, "12"])[1]);
    const fillStr = (attrs.match(/\bfill=["']([^"']+)["']/) || [, ""])[1];
    const anchor = (attrs.match(/\btext-anchor=["']([^"']+)["']/) || [, "start"])[1];

    const rgb = parseColor(fillStr) || [0, 0, 0];
    setColor(rgb);

    const escaped = escapePsString(rawContent);
    const y_ps = Math.round((height - y) * 1000) / 1000;

    if (anchor === "middle") {
      psCommands.push(`(${escaped}) ${Math.round(x * 1000) / 1000} ${y_ps} ${fontSize} tx_center`);
    } else if (anchor === "end") {
      psCommands.push(`(${escaped}) ${Math.round(x * 1000) / 1000} ${y_ps} ${fontSize} tx_right`);
    } else {
      psCommands.push(`(${escaped}) ${Math.round(x * 1000) / 1000} ${y_ps} ${fontSize} tx`);
    }
  }

  // Header and Macros
  const header = [
    "%!PS-Adobe-3.0 EPSF-3.0",
    `%%BoundingBox: 0 0 ${Math.ceil(width)} ${Math.ceil(height)}`,
    `%%HiResBoundingBox: 0.0000 0.0000 ${width.toFixed(4)} ${height.toFixed(4)}`,
    `%%Creator: ${creator}`,
    `%%Title: ${title}`,
    "%%Pages: 1",
    "%%DocumentData: Clean7Bit",
    "%%LanguageLevel: 2",
    "%%EndComments",
    "%%BeginProlog",
    "/rf { newpath 4 2 roll moveto dup 0 rlineto exch 0 exch rlineto neg 0 rlineto closepath fill } bind def",
    "/cf { newpath 0 360 arc fill } bind def",
    "/ln { setlinewidth newpath 4 2 roll moveto lineto stroke } bind def",
    "/tx { /Helvetica findfont exch scalefont setfont moveto show } bind def",
    "/tx_center { /Helvetica findfont exch scalefont setfont 3 1 roll 2 copy moveto pop dup stringwidth pop 2 div 4 -1 roll exch sub 3 -1 roll moveto show } bind def",
    "/tx_right { /Helvetica findfont exch scalefont setfont 3 1 roll 2 copy moveto pop dup stringwidth pop 4 -1 roll exch sub 3 -1 roll moveto show } bind def",
    "%%EndProlog",
    "%%Page: 1 1",
    "gsave"
  ].join("\n");

  const footer = [
    "grestore",
    "showpage",
    "%%EOF"
  ].join("\n");

  return `${header}\n${psCommands.join("\n")}\n${footer}\n`;
}
