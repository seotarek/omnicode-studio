import React from "react";
import {
  Award,
  ShieldCheck,
  Palette,
  Sparkles,
  CircleDot,
  Sun,
  Shield,
  Star,
  Lock,
  Check,
  FileCheck
} from "lucide-react";
import { SealType, BorderStyle, SEAL_COLOR_PRESETS } from "../../core/seal/types";
import { Translations } from "../../i18n/translations";

interface SealFormProps {
  sealType: SealType;
  setSealType: (v: SealType) => void;
  titleText: string;
  setTitleText: (v: string) => void;
  subtitleText: string;
  setSubtitleText: (v: string) => void;
  serialNumber: string;
  setSerialNumber: (v: string) => void;
  dateText: string;
  setDateText: (v: string) => void;
  data: string;
  setData: (v: string) => void;
  inkColor: string;
  setInkColor: (v: string) => void;
  borderStyle: BorderStyle;
  setBorderStyle: (v: BorderStyle) => void;
  centerIcon: "shield" | "star" | "lock" | "check";
  setCenterIcon: (v: "shield" | "star" | "lock" | "check") => void;
  lang: "en" | "ar";
  t: Translations;
}

export const SealForm: React.FC<SealFormProps> = ({
  sealType,
  setSealType,
  titleText,
  setTitleText,
  subtitleText,
  setSubtitleText,
  serialNumber,
  setSerialNumber,
  dateText,
  setDateText,
  data,
  setData,
  inkColor,
  setInkColor,
  borderStyle,
  setBorderStyle,
  centerIcon,
  setCenterIcon,
  lang,
  t
}) => {
  // Preset handler
  const applyPreset = (preset: {
    type: SealType;
    title: string;
    subtitle: string;
    serial: string;
    border: BorderStyle;
    color: string;
    icon: "shield" | "star" | "lock" | "check";
  }) => {
    setSealType(preset.type);
    setTitleText(preset.title);
    setSubtitleText(preset.subtitle);
    setSerialNumber(preset.serial);
    setBorderStyle(preset.border);
    setInkColor(preset.color);
    setCenterIcon(preset.icon);
  };

  return (
    <div className="p-6 rounded-2xl border border-slate-200/90 bg-white shadow-sm space-y-6">
      {/* Header & Presets */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <h2 className="text-sm font-bold text-slate-900 tracking-tight">
              {t.sealPresetsTitle}
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <button
            type="button"
            onClick={() =>
              applyPreset({
                type: "official-seal",
                title: "OFFICIAL VERIFICATION SEAL",
                subtitle: "AUTHENTICATED & SECURE",
                serial: "CERT-2026-X99",
                border: "scalloped",
                color: "#1e3a8a",
                icon: "shield"
              })
            }
            className="p-2.5 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/40 text-left transition-all group"
          >
            <div className="flex items-center gap-1.5 mb-1 text-slate-800 group-hover:text-emerald-700 font-bold text-xs">
              <Award className="w-3.5 h-3.5 text-blue-700" />
              <span>{lang === "ar" ? "ختم رسمي معتمد" : "Official Notary"}</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-tight">
              {lang === "ar" ? "إطار مسنن ونصوص مقوسة" : "Scalloped rosette & arcs"}
            </p>
          </button>

          <button
            type="button"
            onClick={() =>
              applyPreset({
                type: "radial-barcode",
                title: "RADIAL SPOKE BARCODE 360",
                subtitle: "HIGH DENSITY POLAR CODE",
                serial: "RAD-99201",
                border: "double-ring",
                color: "#0f172a",
                icon: "lock"
              })
            }
            className="p-2.5 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/40 text-left transition-all group"
          >
            <div className="flex items-center gap-1.5 mb-1 text-slate-800 group-hover:text-emerald-700 font-bold text-xs">
              <Sun className="w-3.5 h-3.5 text-amber-600" />
              <span>{lang === "ar" ? "باركود شعاعي 360°" : "Radial 360°"}</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-tight">
              {lang === "ar" ? "أعمدة دائرية إشعاعية" : "Sunburst polar bars"}
            </p>
          </button>

          <button
            type="button"
            onClick={() =>
              applyPreset({
                type: "bullseye-barcode",
                title: "CONCENTRIC BULLSEYE CODE",
                subtitle: "WOODLAND & SILVER 1952",
                serial: "RING-7741",
                border: "classic-solid",
                color: "#065f46",
                icon: "check"
              })
            }
            className="p-2.5 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/40 text-left transition-all group"
          >
            <div className="flex items-center gap-1.5 mb-1 text-slate-800 group-hover:text-emerald-700 font-bold text-xs">
              <CircleDot className="w-3.5 h-3.5 text-emerald-600" />
              <span>{lang === "ar" ? "باركود الحلقات" : "Bullseye Rings"}</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-tight">
              {lang === "ar" ? "حلقات متحدة المركز" : "Concentric tracks"}
            </p>
          </button>

          <button
            type="button"
            onClick={() =>
              applyPreset({
                type: "notary-stamp",
                title: "LEGAL DOCUMENT NOTARIZATION",
                subtitle: "APOSTILLE & CERTIFIED",
                serial: "NOTARY-REG-550",
                border: "guilloche",
                color: "#991b1b",
                icon: "star"
              })
            }
            className="p-2.5 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/40 text-left transition-all group"
          >
            <div className="flex items-center gap-1.5 mb-1 text-slate-800 group-hover:text-emerald-700 font-bold text-xs">
              <FileCheck className="w-3.5 h-3.5 text-red-700" />
              <span>{lang === "ar" ? "ختم اعتماد وثائق" : "Apostille Stamp"}</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-tight">
              {lang === "ar" ? "شبكة أمان بنكية" : "Guilloche security"}
            </p>
          </button>
        </div>
      </div>

      <hr className="border-slate-100" />

      {/* Geometry / Seal Type Selector */}
      <div>
        <label className="block text-xs font-bold text-slate-800 mb-2.5 flex items-center gap-1.5">
          <Award className="w-4 h-4 text-emerald-600" />
          {t.sealType}
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {[
            { id: "official-seal", label: t.sealTypeOfficial, icon: Award },
            { id: "radial-barcode", label: t.sealTypeRadial, icon: Sun },
            { id: "bullseye-barcode", label: t.sealTypeBullseye, icon: CircleDot },
            { id: "notary-stamp", label: t.sealTypeNotary, icon: ShieldCheck }
          ].map((item) => {
            const Icon = item.icon;
            const isSelected = sealType === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setSealType(item.id as SealType)}
                className={`p-3 rounded-xl border text-center flex flex-col items-center justify-center gap-2 transition-all ${
                  isSelected
                    ? "border-emerald-600 bg-emerald-50/70 text-emerald-950 font-bold shadow-sm"
                    : "border-slate-200 hover:border-slate-300 text-slate-700 bg-slate-50/50"
                }`}
              >
                <Icon className={`w-5 h-5 ${isSelected ? "text-emerald-600" : "text-slate-500"}`} />
                <span className="text-xs leading-snug">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Data / Payload Input */}
      <div>
        <label className="block text-xs font-bold text-slate-800 mb-1.5">
          {t.barcodeData}
        </label>
        <input
          type="text"
          value={data}
          onChange={(e) => setData(e.target.value)}
          placeholder="https://omnicode.studio or DOC-SERIAL-12345"
          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 text-slate-900 text-sm font-mono tracking-wide"
        />
      </div>

      {/* Curved Text Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-slate-800 mb-1.5">
            {t.titleTextLabel}
          </label>
          <input
            type="text"
            value={titleText}
            onChange={(e) => setTitleText(e.target.value)}
            placeholder="OFFICIAL VERIFICATION SEAL"
            className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 text-slate-900 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-800 mb-1.5">
            {t.subtitleTextLabel}
          </label>
          <input
            type="text"
            value={subtitleText}
            onChange={(e) => setSubtitleText(e.target.value)}
            placeholder="AUTHENTICATED & SECURE"
            className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 text-slate-900 text-sm"
          />
        </div>
      </div>

      {/* Serial & Date */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-slate-800 mb-1.5">
            {t.serialNumberLabel}
          </label>
          <input
            type="text"
            value={serialNumber}
            onChange={(e) => setSerialNumber(e.target.value)}
            placeholder="REG-2026-X99"
            className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 text-slate-900 text-sm font-mono"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-800 mb-1.5">
            {t.dateLabel}
          </label>
          <input
            type="text"
            value={dateText}
            onChange={(e) => setDateText(e.target.value)}
            placeholder="2026-11-03"
            className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 text-slate-900 text-sm"
          />
        </div>
      </div>

      <hr className="border-slate-100" />

      {/* Border Style */}
      <div>
        <label className="block text-xs font-bold text-slate-800 mb-2">
          {t.borderStyleLabel}
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {[
            { id: "scalloped", label: t.borderStyleScalloped },
            { id: "double-ring", label: t.borderStyleDoubleRing },
            { id: "cogwheel", label: t.borderStyleCogwheel },
            { id: "guilloche", label: t.borderStyleGuilloche },
            { id: "classic-solid", label: t.borderStyleSolid }
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setBorderStyle(item.id as BorderStyle)}
              className={`px-2.5 py-2 rounded-lg border text-xs font-medium transition-all ${
                borderStyle === item.id
                  ? "border-emerald-600 bg-emerald-50 text-emerald-900 font-bold shadow-sm"
                  : "border-slate-200 hover:border-slate-300 text-slate-600 bg-white"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Center Icon & Ink Color */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <label className="block text-xs font-bold text-slate-800 mb-2 flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-emerald-600" />
            {t.centerIconLabel}
          </label>
          <div className="flex items-center gap-2">
            {[
              { id: "shield", icon: Shield, label: "Shield" },
              { id: "star", icon: Star, label: "Star" },
              { id: "lock", icon: Lock, label: "Lock" },
              { id: "check", icon: Check, label: "Check" }
            ].map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setCenterIcon(item.id as any)}
                  className={`flex-1 p-2.5 rounded-xl border flex items-center justify-center transition-all ${
                    centerIcon === item.id
                      ? "border-emerald-600 bg-emerald-50 text-emerald-800 font-bold"
                      : "border-slate-200 text-slate-500 hover:border-slate-300"
                  }`}
                  aria-label={item.label}
                >
                  <Icon className="w-4 h-4" />
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-800 mb-2 flex items-center gap-1.5">
            <Palette className="w-3.5 h-3.5 text-emerald-600" />
            {t.inkColorLabel}
          </label>
          <div className="flex items-center gap-2">
            {SEAL_COLOR_PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => setInkColor(preset.primary)}
                className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 flex items-center justify-center ${
                  inkColor === preset.primary ? "border-emerald-500 scale-105 shadow-md" : "border-white"
                }`}
                style={{ backgroundColor: preset.primary }}
                title={lang === "ar" ? preset.nameAr : preset.name}
              />
            ))}
            <input
              type="color"
              value={inkColor}
              onChange={(e) => setInkColor(e.target.value)}
              className="w-8 h-8 rounded-lg cursor-pointer border border-slate-200 p-0.5"
              title="Custom color"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
