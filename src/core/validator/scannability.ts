export interface ValidationResult {
  score: number; // 0 to 100
  isScannable: boolean;
  contrastRatio: number;
  warnings: string[];
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const clean = hex.replace("#", "");
  if (clean.length === 3) {
    return {
      r: parseInt(clean[0] + clean[0], 16),
      g: parseInt(clean[1] + clean[1], 16),
      b: parseInt(clean[2] + clean[2], 16)
    };
  }
  if (clean.length === 6) {
    return {
      r: parseInt(clean.substring(0, 2), 16),
      g: parseInt(clean.substring(2, 4), 16),
      b: parseInt(clean.substring(4, 6), 16)
    };
  }
  return null;
}

function getLuminance(r: number, g: number, b: number): number {
  const a = [r, g, b].map((v) => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}

export function calculateContrast(fgHex: string, bgHex: string): number {
  const fg = hexToRgb(fgHex) || { r: 0, g: 0, b: 0 };
  const bg = hexToRgb(bgHex) || { r: 255, g: 255, b: 255 };
  const lum1 = getLuminance(fg.r, fg.g, fg.b);
  const lum2 = getLuminance(bg.r, bg.g, bg.b);
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  return (brightest + 0.05) / (darkest + 0.05);
}

export function validateScannability(params: {
  fgColor: string;
  bgColor: string;
  errorCorrectionLevel: "L" | "M" | "Q" | "H";
  hasLogo: boolean;
  logoRatio?: number;
}): ValidationResult {
  const warnings: string[] = [];
  let score = 100;

  const contrast = calculateContrast(params.fgColor, params.bgColor);

  if (contrast < 2.0) {
    warnings.push("Extremely low color contrast (< 2.0:1). Scanners will fail completely.");
    score -= 60;
  } else if (contrast < 3.0) {
    warnings.push("Very low color contrast (< 3.0:1). Scanners will fail in low light.");
    score -= 40;
  } else if (contrast < 4.5) {
    warnings.push("Moderate color contrast (< 4.5:1). May be difficult for older cameras.");
    score -= 20;
  }

  if (params.hasLogo) {
    const ratio = params.logoRatio || 0.22;
    if (params.errorCorrectionLevel === "L") {
      warnings.push("Error Correction Level L is too fragile for logos. Switch to Q or H.");
      score -= 35;
    } else if (params.errorCorrectionLevel === "M" && ratio > 0.2) {
      warnings.push("Logo covers over 20% with Level M. Recommend upgrading to Level H.");
      score -= 15;
    }

    if (ratio > 0.32) {
      warnings.push("Logo size exceeds 32% of code area. Risk of unreadable damage.");
      score -= 30;
    }
  }

  score = Math.max(0, Math.min(100, score));
  return {
    score,
    isScannable: score >= 60 && contrast >= 2.5,
    contrastRatio: Number(contrast.toFixed(2)),
    warnings
  };
}
