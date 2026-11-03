import { SealOptions, BorderStyle } from "./types";
import {
  polarToCartesian,
  describeArc,
  generateScallopedRosettePath,
  generateCogwheelPath,
  generateRadialSpokes,
  generateConcentricRings
} from "./geometry";
import { sanitizeColor } from "../security/color";

function sanitizeText(text: string): string {
  if (!text) return "";
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * Encodes arbitrary string into a deterministic binary bit sequence (0s and 1s)
 * suitable for radial barcode spokes and concentric bullseye rings.
 */
export function encodeToBinaryPattern(data: string): string {
  const safeData = data || "OMNICODE";
  let bitStream = "10101"; // Start guard pattern

  for (let i = 0; i < safeData.length; i++) {
    const code = safeData.charCodeAt(i);
    // 8-bit binary representation
    const byte = code.toString(2).padStart(8, "0");
    bitStream += byte;
  }

  // Checksum calculation (modulo 103)
  let checksum = 0;
  for (let i = 0; i < safeData.length; i++) {
    checksum = (checksum + safeData.charCodeAt(i) * (i + 1)) % 103;
  }
  bitStream += checksum.toString(2).padStart(8, "0");
  bitStream += "101011"; // Stop guard pattern

  // Ensure minimum density (at least 64 bits, pad with alternating sync pattern if needed)
  if (bitStream.length < 64) {
    const padCount = 64 - bitStream.length;
    let pad = "";
    for (let p = 0; p < padCount; p++) {
      pad += p % 2 === 0 ? "1" : "0";
    }
    bitStream = bitStream.slice(0, 5) + pad + bitStream.slice(5);
  }

  return bitStream;
}

/**
 * Renders an inline vector center emblem (Shield, Star, Check, or Lock).
 */
function renderCenterIcon(icon: string, color: string): string {
  switch (icon) {
    case "star":
      return `
        <polygon points="250,225 257,242 275,242 260,253 266,270 250,259 234,270 240,253 225,242 243,242"
          fill="${color}" opacity="0.95" />
      `;
    case "check":
      return `
        <path d="M 235 250 L 245 260 L 268 235" fill="none" stroke="${color}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" />
      `;
    case "lock":
      return `
        <rect x="236" y="246" width="28" height="22" rx="3" fill="${color}" />
        <path d="M 241 246 V 239 A 9 9 0 0 1 259 239 V 246" fill="none" stroke="${color}" stroke-width="3" stroke-linecap="round" />
        <circle cx="250" cy="256" r="2.5" fill="#ffffff" />
      `;
    case "shield":
    default:
      return `
        <path d="M 250 228 L 268 236 V 252 C 268 263 250 272 250 272 C 250 272 232 263 232 252 V 236 Z"
          fill="none" stroke="${color}" stroke-width="3.5" stroke-linejoin="round" />
        <path d="M 244 250 L 248 254 L 257 244" fill="none" stroke="${color}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
      `;
  }
}

/**
 * Generates an SVG string for official circular seals, radial barcodes, and bullseye formats.
 */
export function generateSealSVG(options: SealOptions): string {
  const primaryColor = sanitizeColor(options.inkColor, "#1e3a8a");
  const secondaryColor = sanitizeColor(options.secondaryColor || primaryColor, primaryColor);
  const bgColor = options.backgroundColor === "transparent" ? "transparent" : sanitizeColor(options.backgroundColor, "#ffffff");
  const title = sanitizeText(options.titleText || "OFFICIAL VERIFICATION SEAL");
  const subtitle = sanitizeText(options.subtitleText || "AUTHENTICATED DOCUMENT");
  const serialNumber = sanitizeText(options.serialNumber || "");
  const dateText = sanitizeText(options.dateText || "");
  const centerIcon = options.centerIcon || "shield";

  const cx = 250;
  const cy = 250;
  const rOuter = options.outerRadius || 235;
  const borderStyle: BorderStyle = options.borderStyle || "scalloped";

  // Build Border
  let borderMarkup = "";
  if (borderStyle === "scalloped") {
    const rosettePath = generateScallopedRosettePath(cx, cy, rOuter - 14, rOuter, 48);
    borderMarkup = `
      <path d="${rosettePath}" fill="${secondaryColor}" fill-opacity="0.08" stroke="${primaryColor}" stroke-width="2.5" />
      <circle cx="${cx}" cy="${cy}" r="${rOuter - 16}" fill="none" stroke="${primaryColor}" stroke-width="2" />
    `;
  } else if (borderStyle === "cogwheel") {
    const cogPath = generateCogwheelPath(cx, cy, rOuter - 14, rOuter, 36);
    borderMarkup = `
      <path d="${cogPath}" fill="${secondaryColor}" fill-opacity="0.08" stroke="${primaryColor}" stroke-width="2" />
      <circle cx="${cx}" cy="${cy}" r="${rOuter - 16}" fill="none" stroke="${primaryColor}" stroke-width="2" />
    `;
  } else if (borderStyle === "guilloche") {
    let arcs = "";
    for (let g = 0; g < 36; g++) {
      const angle = (g * 10 * Math.PI) / 180;
      const x1 = cx + (rOuter - 10) * Math.cos(angle);
      const y1 = cy + (rOuter - 10) * Math.sin(angle);
      const x2 = cx + (rOuter - 10) * Math.cos(angle + 1.2);
      const y2 = cy + (rOuter - 10) * Math.sin(angle + 1.2);
      arcs += `<path d="M ${x1.toFixed(2)} ${y1.toFixed(2)} Q 250 250 ${x2.toFixed(2)} ${y2.toFixed(2)}" fill="none" stroke="${secondaryColor}" stroke-width="0.8" opacity="0.4" />`;
    }
    borderMarkup = `
      <circle cx="${cx}" cy="${cy}" r="${rOuter}" fill="none" stroke="${primaryColor}" stroke-width="3" />
      ${arcs}
      <circle cx="${cx}" cy="${cy}" r="${rOuter - 16}" fill="none" stroke="${primaryColor}" stroke-width="1.8" />
    `;
  } else {
    // double-ring / classic-solid
    borderMarkup = `
      <circle cx="${cx}" cy="${cy}" r="${rOuter}" fill="none" stroke="${primaryColor}" stroke-width="3.5" />
      <circle cx="${cx}" cy="${cy}" r="${rOuter - 6}" fill="none" stroke="${primaryColor}" stroke-width="1.2" stroke-dasharray="2 3" />
      <circle cx="${cx}" cy="${cy}" r="${rOuter - 16}" fill="none" stroke="${primaryColor}" stroke-width="2" />
    `;
  }

  // Inner containment rings
  const innerContainment = `
    <circle cx="${cx}" cy="${cy}" r="172" fill="none" stroke="${primaryColor}" stroke-width="1.5" />
    <circle cx="${cx}" cy="${cy}" r="166" fill="none" stroke="${primaryColor}" stroke-width="0.75" />
  `;

  // Text Paths
  const textRadius = 196;
  // Top arc (clockwise across top: from 290 deg to 70 deg)
  const topArcD = describeArc(cx, cy, textRadius, 290, 70, 1);
  // Bottom arc (counter-clockwise across bottom: from 250 deg to 110 deg so bottom text is upright)
  const bottomArcD = describeArc(cx, cy, textRadius, 250, 110, 0);

  // Security stars on left and right sides
  const starLeft = polarToCartesian(cx, cy, textRadius, 270);
  const starRight = polarToCartesian(cx, cy, textRadius, 90);
  const starsMarkup = `
    <g fill="${primaryColor}">
      <circle cx="${starLeft.x.toFixed(2)}" cy="${starLeft.y.toFixed(2)}" r="4.5" />
      <circle cx="${starRight.x.toFixed(2)}" cy="${starRight.y.toFixed(2)}" r="4.5" />
    </g>
  `;

  // Binary data encoding
  const binaryBits = encodeToBinaryPattern(options.data);

  // Center Content based on type
  let centerContent = "";
  if (options.type === "radial-barcode") {
    const spokes = generateRadialSpokes(cx, cy, 75, 160, binaryBits);
    let spokePaths = "";
    for (const spoke of spokes) {
      if (spoke.isBar) {
        spokePaths += `<path d="${spoke.path}" fill="${primaryColor}" />`;
      }
    }

    centerContent = `
      <g id="radial-spokes">${spokePaths}</g>
      <circle cx="${cx}" cy="${cy}" r="74" fill="${bgColor}" stroke="${primaryColor}" stroke-width="2" />
      <circle cx="${cx}" cy="${cy}" r="70" fill="none" stroke="${secondaryColor}" stroke-width="1" stroke-dasharray="2 2" />
      ${renderCenterIcon(centerIcon, primaryColor)}
      ${serialNumber ? `<text x="${cx}" y="295" font-family="monospace, sans-serif" font-size="10" font-weight="700" fill="${primaryColor}" text-anchor="middle">${serialNumber}</text>` : ""}
    `;
  } else if (options.type === "bullseye-barcode") {
    const rings = generateConcentricRings(cx, cy, 45, 160, binaryBits);
    let ringMarkup = "";
    for (const ring of rings) {
      ringMarkup += `<circle cx="${cx}" cy="${cy}" r="${ring.r}" fill="none" stroke="${primaryColor}" stroke-width="${ring.strokeWidth}" />`;
    }

    centerContent = `
      <g id="concentric-rings">${ringMarkup}</g>
      <circle cx="${cx}" cy="${cy}" r="44" fill="${bgColor}" stroke="${primaryColor}" stroke-width="2" />
      ${renderCenterIcon(centerIcon, primaryColor)}
      ${serialNumber ? `<text x="${cx}" y="295" font-family="monospace, sans-serif" font-size="10" font-weight="700" fill="${primaryColor}" text-anchor="middle">${serialNumber}</text>` : ""}
    `;
  } else {
    // official-seal / notary-stamp: combined security seal
    const spokes = generateRadialSpokes(cx, cy, 115, 160, binaryBits);
    let spokePaths = "";
    for (const spoke of spokes) {
      if (spoke.isBar) {
        spokePaths += `<path d="${spoke.path}" fill="${primaryColor}" opacity="0.85" />`;
      }
    }

    centerContent = `
      <g id="security-track">${spokePaths}</g>
      <circle cx="${cx}" cy="${cy}" r="114" fill="${bgColor}" stroke="${primaryColor}" stroke-width="2" />
      <circle cx="${cx}" cy="${cy}" r="108" fill="${secondaryColor}" fill-opacity="0.05" stroke="${secondaryColor}" stroke-width="1.2" stroke-dasharray="3 3" />
      
      <!-- Central Emblem & Crest -->
      ${renderCenterIcon(centerIcon, primaryColor)}
      
      <!-- Serial and Date Badges -->
      ${serialNumber ? `<text x="${cx}" y="292" font-family="monospace, sans-serif" font-size="11" font-weight="700" fill="${primaryColor}" text-anchor="middle" letter-spacing="1">${serialNumber}</text>` : ""}
      ${dateText ? `<text x="${cx}" y="306" font-family="sans-serif" font-size="9" font-weight="600" fill="${secondaryColor}" text-anchor="middle" opacity="0.9">${dateText}</text>` : ""}
      <text x="${cx}" y="208" font-family="sans-serif" font-size="9" font-weight="700" fill="${secondaryColor}" text-anchor="middle" letter-spacing="2">AUTHENTICATED</text>
    `;
  }

  return `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" width="100%" height="100%">
  <defs>
    <path id="seal-text-top" d="${topArcD}" fill="none" />
    <path id="seal-text-bottom" d="${bottomArcD}" fill="none" />
  </defs>

  <!-- Background Base -->
  <rect width="500" height="500" fill="${bgColor}" />

  <!-- Outer Border Geometry -->
  ${borderMarkup}

  <!-- Containment Ring -->
  ${innerContainment}

  <!-- Curved Perimeter Text -->
  <text font-family="sans-serif" font-size="14.5" font-weight="800" fill="${primaryColor}" letter-spacing="2">
    <textPath href="#seal-text-top" startOffset="50%" text-anchor="middle">
      ${title}
    </textPath>
  </text>
  <text font-family="sans-serif" font-size="13.5" font-weight="700" fill="${primaryColor}" letter-spacing="1.5">
    <textPath href="#seal-text-bottom" startOffset="50%" text-anchor="middle">
      ${subtitle}
    </textPath>
  </text>

  <!-- Star Accents -->
  ${starsMarkup}

  <!-- Center Core -->
  ${centerContent}
</svg>`.trim();
}
