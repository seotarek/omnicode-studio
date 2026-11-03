import { describe, it, expect } from "vitest";
import {
  polarToCartesian,
  describeArc,
  generateScallopedRosettePath,
  generateCogwheelPath,
  generateRadialSpokes,
  generateConcentricRings
} from "../../src/core/seal/geometry";

describe("Seal Geometry Engine", () => {
  it("polarToCartesian computes coordinates accurately", () => {
    // Center at (250, 250), radius 100
    // Angle 0° (top) -> (250, 150)
    const top = polarToCartesian(250, 250, 100, 0);
    expect(top.x).toBeCloseTo(250, 1);
    expect(top.y).toBeCloseTo(150, 1);

    // Angle 90° (right) -> (350, 250)
    const right = polarToCartesian(250, 250, 100, 90);
    expect(right.x).toBeCloseTo(350, 1);
    expect(right.y).toBeCloseTo(250, 1);

    // Angle 180° (bottom) -> (250, 350)
    const bottom = polarToCartesian(250, 250, 100, 180);
    expect(bottom.x).toBeCloseTo(250, 1);
    expect(bottom.y).toBeCloseTo(350, 1);

    // Angle 270° (left) -> (150, 250)
    const left = polarToCartesian(250, 250, 100, 270);
    expect(left.x).toBeCloseTo(150, 1);
    expect(left.y).toBeCloseTo(250, 1);
  });

  it("describeArc generates valid SVG arc paths", () => {
    const arcPath = describeArc(250, 250, 200, 270, 90);
    expect(arcPath).toContain("M ");
    expect(arcPath).toContain("A 200 200");
  });

  it("generateScallopedRosettePath generates closed loop with correct petal count", () => {
    const rosette = generateScallopedRosettePath(250, 250, 210, 230, 36);
    expect(rosette.startsWith("M")).toBe(true);
    expect(rosette.endsWith("Z")).toBe(true);
    // Should have 36 curve segments
    const curveMatches = rosette.match(/Q|C|A/g);
    expect(curveMatches?.length).toBeGreaterThanOrEqual(36);
  });

  it("generateCogwheelPath generates closed cog loop", () => {
    const cogwheel = generateCogwheelPath(250, 250, 200, 220, 24);
    expect(cogwheel.startsWith("M")).toBe(true);
    expect(cogwheel.endsWith("Z")).toBe(true);
  });

  it("generateRadialSpokes converts binary string to spokes array", () => {
    const bits = "1011001";
    const spokes = generateRadialSpokes(250, 250, 80, 160, bits);
    expect(spokes.length).toBe(7);
    expect(spokes[0].isBar).toBe(true);
    expect(spokes[1].isBar).toBe(false);
    expect(spokes[2].isBar).toBe(true);
    expect(spokes[0].path).toContain("M ");
    expect(spokes[0].path).toContain("Z");
  });

  it("generateConcentricRings creates rings with correct spacing", () => {
    const bits = "10101";
    const rings = generateConcentricRings(250, 250, 50, 150, bits);
    expect(rings.length).toBe(3); // 3 ones in '10101'
    rings.forEach((r) => {
      expect(r.r).toBeGreaterThanOrEqual(50);
      expect(r.r).toBeLessThanOrEqual(150);
      expect(r.strokeWidth).toBeGreaterThan(0);
    });
  });
});
