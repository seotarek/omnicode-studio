import { QRCodeOptions } from "./qr/types";

export interface DesignPreset {
  id: string;
  name: string;
  nameAr: string;
  description: string;
  options: Partial<QRCodeOptions>;
}

export const DESIGN_PRESETS: DesignPreset[] = [
  {
    id: "emerald-tech",
    name: "Emerald Modern",
    nameAr: "الزمرد التقني",
    description: "Sleek rounded dots with emerald gradient and high contrast.",
    options: {
      dotsOptions: {
        type: "rounded",
        colorOrGradient: {
          gradient: {
            type: "linear",
            rotation: 45,
            colorStops: [
              { offset: 0, color: "#10b981" },
              { offset: 1, color: "#047857" }
            ]
          }
        }
      },
      cornersSquareOptions: {
        type: "extra-rounded",
        colorOrGradient: { color: "#047857" }
      },
      cornersDotOptions: {
        type: "dot",
        colorOrGradient: { color: "#10b981" }
      },
      backgroundOptions: { color: "#ffffff" }
    }
  },
  {
    id: "cyber-dark",
    name: "Cyber Violet",
    nameAr: "السايبر البنفسجي",
    description: "Futuristic dark tech aesthetic with violet gradients.",
    options: {
      dotsOptions: {
        type: "classy",
        colorOrGradient: {
          gradient: {
            type: "linear",
            rotation: 135,
            colorStops: [
              { offset: 0, color: "#8b5cf6" },
              { offset: 1, color: "#ec4899" }
            ]
          }
        }
      },
      cornersSquareOptions: {
        type: "rounded",
        colorOrGradient: { color: "#7c3aed" }
      },
      cornersDotOptions: {
        type: "rounded",
        colorOrGradient: { color: "#ec4899" }
      },
      backgroundOptions: { color: "#ffffff" }
    }
  },
  {
    id: "minimal-dots",
    name: "Pure Monochrome",
    nameAr: "الأحادي البسيط",
    description: "Ultra-clean circular dots with solid pitch black precision.",
    options: {
      dotsOptions: {
        type: "dots",
        colorOrGradient: { color: "#0f172a" }
      },
      cornersSquareOptions: {
        type: "rounded",
        colorOrGradient: { color: "#0f172a" }
      },
      cornersDotOptions: {
        type: "dot",
        colorOrGradient: { color: "#0f172a" }
      },
      backgroundOptions: { color: "#ffffff" }
    }
  },
  {
    id: "luxury-gold",
    name: "Executive Gold",
    nameAr: "الذهبي الفاخر",
    description: "Refined radial warmth designed for luxury brands and VIP passes.",
    options: {
      dotsOptions: {
        type: "classy-rounded",
        colorOrGradient: {
          gradient: {
            type: "linear",
            rotation: 90,
            colorStops: [
              { offset: 0, color: "#d97706" },
              { offset: 1, color: "#92400e" }
            ]
          }
        }
      },
      cornersSquareOptions: {
        type: "extra-rounded",
        colorOrGradient: { color: "#b45309" }
      },
      cornersDotOptions: {
        type: "dot",
        colorOrGradient: { color: "#d97706" }
      },
      backgroundOptions: { color: "#ffffff" }
    }
  }
];
