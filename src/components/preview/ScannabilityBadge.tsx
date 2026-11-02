import React from "react";
import { ShieldCheck, ShieldAlert, AlertTriangle } from "lucide-react";
import { ValidationResult } from "../../core/validator/scannability";

interface ScannabilityBadgeProps {
  scannability: ValidationResult;
  label: string;
}

export const ScannabilityBadge: React.FC<ScannabilityBadgeProps> = ({
  scannability,
  label
}) => {
  return (
    <div className="w-full mt-5 space-y-2.5">
      <div className="flex justify-between items-center text-xs">
        <span className="font-semibold text-slate-600 flex items-center gap-1.5">
          {scannability.isScannable ? (
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          ) : (
            <ShieldAlert className="w-4 h-4 text-amber-600" />
          )}
          {label}:
        </span>
        <span
          className={`font-mono font-bold px-2 py-0.5 rounded text-[11px] ${
            scannability.isScannable
              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
              : "bg-amber-50 text-amber-800 border border-amber-200"
          }`}
        >
          {scannability.score}% ({scannability.contrastRatio}:1)
        </span>
      </div>
      <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden border border-slate-200/60">
        <div
          className={`h-full transition-all duration-300 ${
            scannability.score > 70
              ? "bg-emerald-500"
              : scannability.score > 40
              ? "bg-amber-500"
              : "bg-red-500"
          }`}
          style={{ width: `${scannability.score}%` }}
        />
      </div>
      {scannability.warnings.map((w, idx) => (
        <div
          key={idx}
          className="text-[11px] text-amber-700 bg-amber-50/80 border border-amber-200/60 p-2 rounded-lg flex items-start gap-1.5"
        >
          <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-600" />
          <span>{w}</span>
        </div>
      ))}
      {scannability.disclaimer && (
        <p className="text-[11px] text-slate-500 italic mt-1 leading-relaxed bg-slate-50 p-2 rounded-lg border border-slate-200/60">
          ℹ️ {scannability.disclaimer}
        </p>
      )}
    </div>
  );
};
