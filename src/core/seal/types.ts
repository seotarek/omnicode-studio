export type SealType =
  | "radial-barcode"
  | "bullseye-barcode"
  | "official-seal"
  | "notary-stamp";

export type BorderStyle =
  | "scalloped"
  | "double-ring"
  | "cogwheel"
  | "guilloche"
  | "classic-solid";

export interface SealInkPreset {
  id: string;
  name: string;
  nameAr: string;
  primary: string;
  secondary: string;
  background: string;
}

export interface SealOptions {
  type: SealType;
  data: string;
  titleText: string;
  subtitleText: string;
  serialNumber?: string;
  dateText?: string;
  inkColor: string;
  secondaryColor?: string;
  backgroundColor?: string;
  borderStyle: BorderStyle;
  innerRadius?: number;
  outerRadius?: number;
  showCenterBadge?: boolean;
  centerIcon?: "shield" | "star" | "lock" | "check" | "none";
}

export const SEAL_COLOR_PRESETS: SealInkPreset[] = [
  {
    id: "navy",
    name: "Royal Navy Notary",
    nameAr: "كحلي ملكي رسمي",
    primary: "#1e3a8a",
    secondary: "#3b82f6",
    background: "#f8fafc"
  },
  {
    id: "crimson",
    name: "Official Red Stamp",
    nameAr: "أحمر أختام رسمي",
    primary: "#991b1b",
    secondary: "#dc2626",
    background: "#fef2f2"
  },
  {
    id: "emerald",
    name: "Security Emerald",
    nameAr: "أخضر أمان مصرفي",
    primary: "#065f46",
    secondary: "#059669",
    background: "#ecfdf5"
  },
  {
    id: "obsidian",
    name: "Carbon Notary",
    nameAr: "أسود كربوني معتمد",
    primary: "#0f172a",
    secondary: "#334155",
    background: "#f8fafc"
  },
  {
    id: "bronze",
    name: "Imperial Gold",
    nameAr: "ختم ذهبي إمبراطوري",
    primary: "#854d0e",
    secondary: "#d97706",
    background: "#fffbeb"
  }
];
