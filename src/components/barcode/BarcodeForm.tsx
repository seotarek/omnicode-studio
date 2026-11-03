import React, { useMemo } from "react";
import { Barcode, Sparkles, Palette, ShieldAlert, CheckCircle } from "lucide-react";
import { BarcodeFormat, BarcodeStyle, calculateMod10CheckDigit } from "../../core/barcode/generator";
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
  const suggestedCheck = useMemo(() => {
    const clean = barcodeData.trim().replace(/\D/g, "");
    if (barcodeFormat === "EAN13" && (clean.length === 12 || clean.length === 13)) {
      const payload = clean.slice(0, 12);
      const expected = calculateMod10CheckDigit(payload);
      return { payload, expected, full: `${payload}${expected}` };
    }
    if (barcodeFormat === "EAN8" && (clean.length === 7 || clean.length === 8)) {
      const payload = clean.slice(0, 7);
      const expected = calculateMod10CheckDigit(payload);
      return { payload, expected, full: `${payload}${expected}` };
    }
    if (barcodeFormat === "UPC" && (clean.length === 11 || clean.length === 12)) {
      const payload = clean.slice(0, 11);
      const expected = calculateMod10CheckDigit(payload);
      return { payload, expected, full: `${payload}${expected}` };
    }
    if (barcodeFormat === "ITF14" && (clean.length === 13 || clean.length === 14)) {
      const payload = clean.slice(0, 13);
      const expected = calculateMod10CheckDigit(payload);
      return { payload, expected, full: `${payload}${expected}` };
    }
    return null;
  }, [barcodeFormat, barcodeData]);

  return (
    <div className="space-y-5">
      {/* Presets & Style Selection */}
      <div className="p-5 rounded-2xl border border-slate-200/90 bg-white shadow-sm space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          {t.barcodeStyle}
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
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
              className={`p-3 rounded-xl border text-start transition-all ${
                barcodeStyle === s.id
                  ? "border-emerald-500 bg-emerald-50/60 text-emerald-800 font-bold shadow-sm"
                  : "border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 bg-slate-50/50 text-xs"
              }`}
            >
              <div className="font-semibold text-xs leading-snug">{s.label}</div>
              <span className="text-[10px] text-slate-400 font-mono block mt-1">{s.badge}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Data & Symbology Standard */}
      <div className="p-5 rounded-2xl border border-slate-200/90 bg-white shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
          <Barcode className="w-4 h-4 text-emerald-600" />
          {t.content}
        </h3>
        <div className="space-y-3.5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="text-xs font-medium text-slate-500 block mb-1.5">{t.barcodeFormat}</label>
              <select
                value={barcodeFormat}
                onChange={(e) => setBarcodeFormat(e.target.value as BarcodeFormat)}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50/80 text-xs font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
              >
                <option value="CODE128">CODE128 (Universal Logistics)</option>
                <option value="EAN13">EAN-13 (Standard Retail Packaging)</option>
                <option value="EAN8">EAN-8 (Compact Grocery / Small Item)</option>
                <option value="UPC">UPC-A (North America Consumer Goods)</option>
                <option value="CODE39">CODE39 (Defense, Automotive, Asset ID)</option>
                <option value="ITF14">ITF-14 (Master Corrugated Cartons)</option>
                <option value="MSI">MSI / Plessey (Storage & Warehouse)</option>
                <option value="codabar">Codabar (Libraries, Blood Banks, Air Waybill)</option>
                <option value="pharmacode">Pharmacode (Pharmaceutical Verification)</option>
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-slate-500">{t.barcodeData}</label>
                {suggestedCheck && !barcodeValidation.isValid && (
                  <button
                    type="button"
                    onClick={() => setBarcodeData(suggestedCheck.full)}
                    className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-2 py-0.5 rounded flex items-center gap-1 transition-colors"
                  >
                    <CheckCircle className="w-3 h-3 text-emerald-600" />
                    {t.autoFixCheckDigit} ({suggestedCheck.expected})
                  </button>
                )}
              </div>
              <input
                type="text"
                value={barcodeData}
                onChange={(e) => setBarcodeData(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50/80 font-mono text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
              />
            </div>
          </div>

          {!barcodeValidation.isValid && (
            <div className="text-xs text-red-700 flex items-center justify-between gap-1.5 p-2.5 rounded-xl bg-red-50 border border-red-200">
              <div className="flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 shrink-0 text-red-600" />
                <span>{barcodeValidation.error}</span>
              </div>
              {suggestedCheck && (
                <button
                  type="button"
                  onClick={() => setBarcodeData(suggestedCheck.full)}
                  className="shrink-0 px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] rounded-lg shadow-sm transition-all flex items-center gap-1"
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  {t.autoFixCheckDigit} ({suggestedCheck.expected})
                </button>
              )}
            </div>
          )}

          {/* Header / Footer text for frames (Thermal, Price Tag, Badge) */}
          {(barcodeStyle === "thermal-label" || barcodeStyle === "price-tag" || barcodeStyle === "badge-frame") && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-3 border-t border-slate-100">
              <div>
                <label className="text-xs font-medium text-slate-500 block mb-1.5">{t.headerLabel}</label>
                <input
                  type="text"
                  value={barcodeHeader}
                  onChange={(e) => setBarcodeHeader(e.target.value)}
                  placeholder="e.g. PRIORITY AIR SHIPMENT #892"
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50/80 text-xs font-medium text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500 block mb-1.5">{t.footerLabel}</label>
                <input
                  type="text"
                  value={barcodeFooter}
                  onChange={(e) => setBarcodeFooter(e.target.value)}
                  placeholder="e.g. UNIT PRICE: $49.00 / CARRIER VERIFIED"
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50/80 text-xs font-medium text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Geometry & Color Engine */}
      <div className="p-5 rounded-2xl border border-slate-200/90 bg-white shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
          <Palette className="w-4 h-4 text-emerald-600" />
          {t.colors} & Dimensions
        </h3>
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-xs font-medium text-slate-600">Bar Color:</label>
            <input
              type="color"
              value={barcodeColor}
              onChange={(e) => setBarcodeColor(e.target.value)}
              className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border border-slate-300 shadow-sm"
            />
          </div>
          {barcodeStyle === "gradient" && (
            <div className="flex items-center gap-2">
              <label className="text-xs font-medium text-slate-600">Gradient Stop 2:</label>
              <input
                type="color"
                value={barcodeColor2}
                onChange={(e) => setBarcodeColor2(e.target.value)}
                className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border border-slate-300 shadow-sm"
              />
            </div>
          )}
          <div className="flex items-center gap-2">
            <label className="text-xs font-medium text-slate-600">Bar Density:</label>
            <select
              value={barcodeWidth}
              onChange={(e) => setBarcodeWidth(Number(e.target.value))}
              className="p-2 rounded-xl border border-slate-200 bg-slate-50/80 text-xs font-medium text-slate-800 focus:bg-white outline-none"
            >
              <option value="1">1px (Compact)</option>
              <option value="2">2px (Standard Print)</option>
              <option value="3">3px (Large Carton)</option>
              <option value="4">4px (Billboard / Shelf)</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs font-medium text-slate-600">Height:</label>
            <select
              value={barcodeHeight}
              onChange={(e) => setBarcodeHeight(Number(e.target.value))}
              className="p-2 rounded-xl border border-slate-200 bg-slate-50/80 text-xs font-medium text-slate-800 focus:bg-white outline-none"
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
