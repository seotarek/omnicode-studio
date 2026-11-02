import React from "react";
import { Sparkles, Layers, Palette, Image as ImageIcon, Upload } from "lucide-react";
import { DotType, CornerSquareType, CornerDotType, ErrorCorrectionLevel } from "../../core/qr/types";
import { DESIGN_PRESETS } from "../../core/presets";
import { Translations } from "../../i18n/translations";

interface QRFormProps {
  qrText: string;
  setQrText: (v: string) => void;
  errorLevel: ErrorCorrectionLevel;
  setErrorLevel: (v: ErrorCorrectionLevel) => void;
  dotType: DotType;
  setDotType: (v: DotType) => void;
  cornerSquareType: CornerSquareType;
  setCornerSquareType: (v: CornerSquareType) => void;
  setCornerDotType: (v: CornerDotType) => void;
  fgColor: string;
  setFgColor: (v: string) => void;
  fgColor2: string;
  setFgColor2: (v: string) => void;
  isGradient: boolean;
  setIsGradient: (v: boolean) => void;
  isTransparent: boolean;
  setIsTransparent: (v: boolean) => void;
  logoUrl: string | undefined;
  setLogoUrl: (v: string | undefined) => void;
  onLogoUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  lang: "en" | "ar";
  t: Translations;
}

export const QRForm: React.FC<QRFormProps> = ({
  qrText,
  setQrText,
  errorLevel,
  setErrorLevel,
  dotType,
  setDotType,
  cornerSquareType,
  setCornerSquareType,
  setCornerDotType,
  fgColor,
  setFgColor,
  fgColor2,
  setFgColor2,
  isGradient,
  setIsGradient,
  isTransparent,
  setIsTransparent,
  logoUrl,
  setLogoUrl,
  onLogoUpload,
  lang,
  t
}) => {
  return (
    <>
      {/* Presets Gallery */}
      <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
          {t.presets}
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {DESIGN_PRESETS.map((preset) => (
            <button
              key={preset.id}
              onClick={() => {
                if (preset.options.dotsOptions) {
                  setDotType(preset.options.dotsOptions.type);
                  if (preset.options.dotsOptions.colorOrGradient.gradient) {
                    setIsGradient(true);
                    setFgColor(preset.options.dotsOptions.colorOrGradient.gradient.colorStops[0].color);
                    setFgColor2(preset.options.dotsOptions.colorOrGradient.gradient.colorStops[1].color);
                  } else if (preset.options.dotsOptions.colorOrGradient.color) {
                    setIsGradient(false);
                    setFgColor(preset.options.dotsOptions.colorOrGradient.color);
                  }
                }
                if (preset.options.cornersSquareOptions) {
                  setCornerSquareType(preset.options.cornersSquareOptions.type);
                }
                if (preset.options.cornersDotOptions) {
                  setCornerDotType(preset.options.cornersDotOptions.type);
                }
              }}
              className="p-3 text-start rounded-lg border border-slate-200 dark:border-slate-800 hover:border-emerald-500 text-xs transition-all bg-slate-50 dark:bg-slate-800/40"
            >
              <div className="font-bold">{lang === "ar" ? preset.nameAr : preset.name}</div>
              <div className="text-[10px] text-slate-500 truncate mt-1">{preset.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Data Input */}
      <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 space-y-3">
        <label className="text-sm font-bold block">{t.content}</label>
        <textarea
          value={qrText}
          onChange={(e) => setQrText(e.target.value)}
          placeholder="https://example.com or plain text payload..."
          className="w-full h-24 p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 font-mono text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
        />
      </div>

      {/* Design Controls */}
      <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 space-y-4">
        <h3 className="text-sm font-bold flex items-center gap-2">
          <Layers className="w-4 h-4 text-emerald-500" />
          {t.design}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="text-xs text-slate-500 block mb-1.5">{t.dotStyle}</label>
            <select
              value={dotType}
              onChange={(e) => setDotType(e.target.value as DotType)}
              className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs"
            >
              <option value="square">Square</option>
              <option value="rounded">Rounded</option>
              <option value="dots">Dots</option>
              <option value="classy">Classy</option>
              <option value="classy-rounded">Classy Rounded</option>
              <option value="extra-rounded">Extra Rounded</option>
              <option value="diamond">Diamond (جوهرة)</option>
              <option value="star">Star (نجمة)</option>
              <option value="horizontal-bars">Horizontal Bars (خطوط أفقية)</option>
              <option value="vertical-bars">Vertical Bars (خطوط عمودية)</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-slate-500 block mb-1.5">{t.cornerStyle}</label>
            <select
              value={cornerSquareType}
              onChange={(e) => setCornerSquareType(e.target.value as CornerSquareType)}
              className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs"
            >
              <option value="square">Square</option>
              <option value="rounded">Rounded</option>
              <option value="extra-rounded">Extra Rounded</option>
              <option value="dot">Circular Dot</option>
              <option value="leaf">Leaf (ورقة شجر)</option>
              <option value="diamond">Diamond (ماسة)</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-slate-500 block mb-1.5">{t.errorCorrection}</label>
            <select
              value={errorLevel}
              onChange={(e) => setErrorLevel(e.target.value as ErrorCorrectionLevel)}
              className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs"
            >
              <option value="L">L — 7% Restoration</option>
              <option value="M">M — 15% Standard</option>
              <option value="Q">Q — 25% High</option>
              <option value="H">H — 30% Maximum (Recommended for Logos)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Color Customization */}
      <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 space-y-4">
        <h3 className="text-sm font-bold flex items-center gap-2">
          <Palette className="w-4 h-4 text-emerald-500" />
          {t.colors}
        </h3>
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-xs text-slate-500">Color 1:</label>
            <input
              type="color"
              value={fgColor}
              onChange={(e) => setFgColor(e.target.value)}
              className="w-8 h-8 rounded cursor-pointer bg-transparent border-0"
            />
          </div>
          {isGradient && (
            <div className="flex items-center gap-2">
              <label className="text-xs text-slate-500">Color 2:</label>
              <input
                type="color"
                value={fgColor2}
                onChange={(e) => setFgColor2(e.target.value)}
                className="w-8 h-8 rounded cursor-pointer bg-transparent border-0"
              />
            </div>
          )}
          <label className="flex items-center gap-2 text-xs cursor-pointer">
            <input
              type="checkbox"
              checked={isGradient}
              onChange={(e) => setIsGradient(e.target.checked)}
              className="rounded text-emerald-600 focus:ring-emerald-500"
            />
            Linear Gradient
          </label>
          <label className="flex items-center gap-2 text-xs cursor-pointer">
            <input
              type="checkbox"
              checked={isTransparent}
              onChange={(e) => setIsTransparent(e.target.checked)}
              className="rounded text-emerald-600 focus:ring-emerald-500"
            />
            Transparent BG
          </label>
        </div>
      </div>

      {/* Logo Embedding */}
      <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 space-y-4">
        <h3 className="text-sm font-bold flex items-center gap-2">
          <ImageIcon className="w-4 h-4 text-emerald-500" />
          {t.logo}
        </h3>
        <div className="flex items-center gap-4">
          <label className="px-4 py-2 rounded-lg border border-dashed border-emerald-500 hover:bg-emerald-500/10 text-emerald-500 font-semibold text-xs flex items-center gap-2 cursor-pointer">
            <Upload className="w-4 h-4" />
            {t.uploadLogo}
            <input type="file" accept="image/*" onChange={onLogoUpload} className="hidden" />
          </label>
          {logoUrl && (
            <button
              onClick={() => setLogoUrl(undefined)}
              className="px-3 py-2 rounded-lg border border-red-500/30 text-red-500 text-xs font-semibold hover:bg-red-500/10"
            >
              {t.removeLogo}
            </button>
          )}
        </div>
      </div>
    </>
  );
};
