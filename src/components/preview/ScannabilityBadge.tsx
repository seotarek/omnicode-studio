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
    <div className="w-full mt-5 space-y-2">
      <div className="flex justify-between items-center text-xs">
        <span className="font-semibold text-slate-500 flex items-center gap-1.5">
          {scannability.isScannable ? (
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
          ) : (
            <ShieldAlert className="w-4 h-4 text-red-500" />
          )}
          {label}:
        </span>
        <span
          className={`font-mono font-bold ${
            scannability.isScannable ? "text-emerald-500" : "text-red-500"
          }`}
        >
          {scannability.score}% ({scannability.contrastRatio}:1)
        </span>
      </div>
      <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
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
          className="text-[11px] text-amber-500 dark:text-amber-400 flex items-start gap-1"
        >
          <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
          <span>{w}</span>
        </div>
      ))}
      {scannability.disclaimer && (
        <p className="text-[10px] text-slate-400 dark:text-slate-500 italic mt-1">
          {scannability.disclaimer}
        </p>
      )}
    </div>
  );
};
