import React from "react";
import { Barcode, Sparkles, Palette, ShieldAlert } from "lucide-react";
import { BarcodeFormat, BarcodeStyle } from "../../core/barcode/generator";
import { Translations } from "../../i18n/translations";

interface BarcodeFormProps {
  barcodeFormat: BarcodeFormat;
  setBarcodeFormat: (v: BarcodeFormat) => void;
  barcodeData: string;
  setBarcodeData: (v: string) => void;
  barcodeColor: string;
  setBarcodeColor: (v: string) => void;
  barcodeColor2: string;
  setBarcodeColor2: (v: string) => void;
  barcodeStyle: BarcodeStyle;
  setBarcodeStyle: (v: BarcodeStyle) => void;
  barcodeHeader: string;
  setBarcodeHeader: (v: string) => void;
  barcodeFooter: string;
  setBarcodeFooter: (v: string) => void;
  barcodeWidth: number;
  setBarcodeWidth: (v: number) => void;
  barcodeHeight: number;
  setBarcodeHeight: (v: number) => void;
  barcodeValidation: { isValid: boolean; error?: string };
  t: Translations;
}

export const BarcodeForm: React.FC<BarcodeFormProps> = ({
  barcodeFormat,
  setBarcodeFormat,
  barcodeData,
  setBarcodeData,
  barcodeColor,
  setBarcodeColor,
  barcodeColor2,
  setBarcodeColor2,
  barcodeStyle,
  setBarcodeStyle,
  barcodeHeader,
  setBarcodeHeader,
  barcodeFooter,
  setBarcodeFooter,
  barcodeWidth,
  setBarcodeWidth,
  barcodeHeight,
  setBarcodeHeight,
  barcodeValidation,
  t
}) => {
  return (
    <div className="space-y-4">
      {/* Presets & Style Selection */}
      <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 space-y-4">
        <h3 className="text-sm font-bold flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-emerald-500" />
          {t.barcodeStyle}
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {[
            { id: "classic", label: t.barcodeStyleClassic, badge: "Print & POS" },
            { id: "rounded", label: t.barcodeStyleRounded, badge: "Modern" },
            { id: "pill", label: t.barcodeStylePill, badge: "Soft Capsule" },
            { id: "gradient", label: t.barcodeStyleGradient, badge: "Vector Art" },
            { id: "thermal-label", label: t.barcodeStyleThermal, badge: "Industrial Label" },
            { id: "price-tag", label: t.barcodeStylePriceTag, badge: "Retail Shelf" },
            { id: "badge-frame", label: t.barcodeStyleBadge, badge: "Ticket Pass" },
            { id: "minimal", label: t.barcodeStyleMinimal, badge: "Clean Editorial" }
          ].map((s) => (
            <button
              key={s.id}
              onClick={() => setBarcodeStyle(s.id as BarcodeStyle)}
              className={`p-2.5 rounded-lg border text-start transition-all ${
                barcodeStyle === s.id
                  ? "border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold"
                  : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 text-xs"
              }`}
            >
              <div className="font-semibold text-xs leading-snug">{s.label}</div>
              <span className="text-[10px] text-slate-400 font-mono block mt-1">{s.badge}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Data & Symbology Standard */}
      <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 space-y-4">
        <h3 className="text-sm font-bold flex items-center gap-2">
          <Barcode className="w-4 h-4 text-emerald-500" />
          {t.content}
        </h3>
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-500 block mb-1">{t.barcodeFormat}</label>
              <select
                value={barcodeFormat}
                onChange={(e) => setBarcodeFormat(e.target.value as BarcodeFormat)}
                className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs font-bold"
              >
                <option value="CODE128">CODE128 (Universal Logistics)</option>
                <option value="EAN13">EAN-13 (Standard Retail Packaging)</option>
                <option value="EAN8">EAN-8 (Compact Grocery / Small Item)</option>
                <option value="UPC">UPC-A (North America Consumer Goods)</option>
                <option value="CODE39">CODE39 (Defense, Automotive, Asset ID)</option>
                <option value="ITF14">ITF-14 (Master Corrugated Cartons)</option>
                <option value="pharmacode">Pharmacode (Pharmaceutical Verification)</option>
              </select>
            </div>

            <div>
              <label className="text-xs text-slate-500 block mb-1">{t.barcodeData}</label>
              <input
                type="text"
                value={barcodeData}
                onChange={(e) => setBarcodeData(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 font-mono text-sm"
              />
            </div>
          </div>

          {!barcodeValidation.isValid && (
            <div className="text-xs text-red-500 flex items-center gap-1.5 p-2 rounded-lg bg-red-500/10 border border-red-500/20">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>{barcodeValidation.error}</span>
            </div>
          )}

          {/* Header / Footer text for frames (Thermal, Price Tag, Badge) */}
          {(barcodeStyle === "thermal-label" || barcodeStyle === "price-tag" || barcodeStyle === "badge-frame") && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-200 dark:border-slate-800">
              <div>
                <label className="text-xs text-slate-500 block mb-1">{t.headerLabel}</label>
                <input
                  type="text"
                  value={barcodeHeader}
                  onChange={(e) => setBarcodeHeader(e.target.value)}
                  placeholder="e.g. PRIORITY AIR SHIPMENT #892"
                  className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs font-medium"
                />
              </div>
              <div>
                <label className="text-xs text-slate-500 block mb-1">{t.footerLabel}</label>
                <input
                  type="text"
                  value={barcodeFooter}
                  onChange={(e) => setBarcodeFooter(e.target.value)}
                  placeholder="e.g. UNIT PRICE: $49.00 / CARRIER VERIFIED"
                  className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs font-medium"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Geometry & Color Engine */}
      <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 space-y-4">
        <h3 className="text-sm font-bold flex items-center gap-2">
          <Palette className="w-4 h-4 text-emerald-500" />
          {t.colors} & Dimensions
        </h3>
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-xs text-slate-500">Bar Color:</label>
            <input
              type="color"
              value={barcodeColor}
              onChange={(e) => setBarcodeColor(e.target.value)}
              className="w-8 h-8 rounded cursor-pointer bg-transparent border-0"
            />
          </div>
          {barcodeStyle === "gradient" && (
            <div className="flex items-center gap-2">
              <label className="text-xs text-slate-500">Gradient Stop 2:</label>
              <input
                type="color"
                value={barcodeColor2}
                onChange={(e) => setBarcodeColor2(e.target.value)}
                className="w-8 h-8 rounded cursor-pointer bg-transparent border-0"
              />
            </div>
          )}
          <div className="flex items-center gap-2">
            <label className="text-xs text-slate-500">Bar Density:</label>
            <select
              value={barcodeWidth}
              onChange={(e) => setBarcodeWidth(Number(e.target.value))}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs font-medium"
            >
              <option value="1">1px (Compact)</option>
              <option value="2">2px (Standard Print)</option>
              <option value="3">3px (Large Carton)</option>
              <option value="4">4px (Billboard / Shelf)</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs text-slate-500">Height:</label>
            <select
              value={barcodeHeight}
              onChange={(e) => setBarcodeHeight(Number(e.target.value))}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs font-medium"
            >
              <option value="60">60px (Small)</option>
              <option value="90">90px (Standard)</option>
              <option value="120">120px (Tall)</option>
              <option value="160">160px (Extra Tall)</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};
