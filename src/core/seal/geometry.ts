export interface Point {
  x: number;
  y: number;
}

/**
 * Converts polar coordinates to 2D Cartesian coordinates.
 * In our system, 0 degrees represents the top (12 o'clock), 90 deg is 3 o'clock.
 */
export function polarToCartesian(
  centerX: number,
  centerY: number,
  radius: number,
  angleInDegrees: number
): Point {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians)
  };
}

/**
 * Generates an SVG path data string for a circular arc.
 */
export function describeArc(
  x: number,
  y: number,
  radius: number,
  startAngle: number,
  endAngle: number,
  sweepFlag: 0 | 1 = 1
): string {
  // Normalize angles
  let diff = endAngle - startAngle;
  while (diff < 0) diff += 360;
  while (diff > 360) diff -= 360;

  const start = polarToCartesian(x, y, radius, startAngle);
  const end = polarToCartesian(x, y, radius, endAngle);
  const largeArcFlag = diff <= 180 ? "0" : "1";

  return `M ${start.x.toFixed(3)} ${start.y.toFixed(3)} A ${radius} ${radius} 0 ${largeArcFlag} ${sweepFlag} ${end.x.toFixed(3)} ${end.y.toFixed(3)}`;
}

/**
 * Generates an embossed / scalloped rosette border path used in physical notary seals.
 * Uses smooth quadratic bezier curves connecting inner and outer radii.
 */
export function generateScallopedRosettePath(
  cx: number,
  cy: number,
  innerRadius: number,
  outerRadius: number,
  scallopsCount: number
): string {
  const step = 360 / scallopsCount;
  const parts: string[] = [];

  for (let i = 0; i < scallopsCount; i++) {
    const startAngle = i * step;
    const midAngle = (i + 0.5) * step;
    const endAngle = (i + 1) * step;

    const startPt = polarToCartesian(cx, cy, innerRadius, startAngle);
    const peakPt = polarToCartesian(cx, cy, outerRadius, midAngle);
    const endPt = polarToCartesian(cx, cy, innerRadius, endAngle);

    if (i === 0) {
      parts.push(`M ${startPt.x.toFixed(3)} ${startPt.y.toFixed(3)}`);
    }

    // Two smooth quadratic bezier curves for each scallop petal
    parts.push(`Q ${peakPt.x.toFixed(3)} ${peakPt.y.toFixed(3)} ${endPt.x.toFixed(3)} ${endPt.y.toFixed(3)}`);
  }

  parts.push("Z");
  return parts.join(" ");
}

/**
 * Generates a geometric cogwheel/notched border path.
 */
export function generateCogwheelPath(
  cx: number,
  cy: number,
  innerRadius: number,
  outerRadius: number,
  teethCount: number
): string {
  const step = 360 / teethCount;
  const quarterStep = step / 4;
  const parts: string[] = [];

  for (let i = 0; i < teethCount; i++) {
    const a0 = i * step;
    const a1 = a0 + quarterStep;
    const a2 = a1 + quarterStep * 2;
    const a3 = (i + 1) * step;

    const p0 = polarToCartesian(cx, cy, innerRadius, a0);
    const p1 = polarToCartesian(cx, cy, outerRadius, a1);
    const p2 = polarToCartesian(cx, cy, outerRadius, a2);
    const p3 = polarToCartesian(cx, cy, innerRadius, a3);

    if (i === 0) {
      parts.push(`M ${p0.x.toFixed(3)} ${p0.y.toFixed(3)}`);
    }

    parts.push(`L ${p1.x.toFixed(3)} ${p1.y.toFixed(3)}`);
    parts.push(`L ${p2.x.toFixed(3)} ${p2.y.toFixed(3)}`);
    parts.push(`L ${p3.x.toFixed(3)} ${p3.y.toFixed(3)}`);
  }

  parts.push("Z");
  return parts.join(" ");
}

/**
 * Converts a binary string into 360-degree radial spokes (Sunburst 1D barcode).
 */
export function generateRadialSpokes(
  cx: number,
  cy: number,
  rInner: number,
  rOuter: number,
  bits: string
): Array<{ path: string; isBar: boolean }> {
  const count = bits.length;
  if (count === 0) return [];

  const step = 360 / count;
  const spokes: Array<{ path: string; isBar: boolean }> = [];

  for (let i = 0; i < count; i++) {
    const isBar = bits[i] === "1";
    const startAngle = i * step;
    const endAngle = (i + 1) * step;

    const p0 = polarToCartesian(cx, cy, rInner, startAngle);
    const p1 = polarToCartesian(cx, cy, rOuter, startAngle);
    const p2 = polarToCartesian(cx, cy, rOuter, endAngle);
    const p3 = polarToCartesian(cx, cy, rInner, endAngle);

    const path = `M ${p0.x.toFixed(3)} ${p0.y.toFixed(3)} L ${p1.x.toFixed(3)} ${p1.y.toFixed(3)} A ${rOuter} ${rOuter} 0 0 1 ${p2.x.toFixed(3)} ${p2.y.toFixed(3)} L ${p3.x.toFixed(3)} ${p3.y.toFixed(3)} A ${rInner} ${rInner} 0 0 0 ${p0.x.toFixed(3)} ${p0.y.toFixed(3)} Z`;

    spokes.push({ path, isBar });
  }

  return spokes;
}

/**
 * Converts a binary string into concentric circular rings (Concentric Bullseye barcode).
 */
export function generateConcentricRings(
  cx: number,
  cy: number,
  rInner: number,
  rOuter: number,
  bits: string
): Array<{ cx: number; cy: number; r: number; strokeWidth: number }> {
  const count = bits.length;
  if (count === 0) return [];

  const trackWidth = (rOuter - rInner) / count;
  const rings: Array<{ cx: number; cy: number; r: number; strokeWidth: number }> = [];

  for (let i = 0; i < count; i++) {
    if (bits[i] === "1") {
      const r = rInner + (i + 0.5) * trackWidth;
      rings.push({
        cx,
        cy,
        r: parseFloat(r.toFixed(3)),
        strokeWidth: parseFloat((trackWidth * 0.95).toFixed(3))
      });
    }
  }

  return rings;
}
