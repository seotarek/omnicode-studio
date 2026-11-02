import React from "react";
import { Download, Copy, Check } from "lucide-react";
import { ValidationResult } from "../../core/validator/scannability";
import { exportSVG, exportRaster, exportPDF } from "../../core/export";
import { ScannabilityBadge } from "./ScannabilityBadge";
import { Translations } from "../../i18n/translations";

interface PreviewPanelProps {
  activeTab: "qr" | "barcode" | "batch";
  qrSvg: string;
  barcodeSvg: string;
  barcodeFormat: string;
  isBarcodeValid: boolean;
  isTransparent: boolean;
  scannability: ValidationResult;
  t: Translations;
  onCopySvg: () => void;
  copied: boolean;
}

export const PreviewPanel: React.FC<PreviewPanelProps> = ({
  activeTab,
  qrSvg,
  barcodeSvg,
  barcodeFormat,
  isBarcodeValid,
  isTransparent,
  scannability,
  t,
  onCopySvg,
  copied
}) => {
  const targetSvg = activeTab === "qr" ? qrSvg : barcodeSvg;

  return (
    <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 shadow-xl flex flex-col items-center sticky top-24">
      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 w-full text-center">
        {t.livePreview}
      </h3>

      {/* Display Canvas */}
      <div className="p-4 rounded-xl bg-white shadow-inner border border-slate-100 max-w-full overflow-hidden flex items-center justify-center min-h-[300px]">
        {activeTab === "qr" && (
          <div
            dangerouslySetInnerHTML={{ __html: qrSvg }}
            className="w-64 h-64 flex items-center justify-center"
          />
        )}
        {activeTab === "barcode" &&
          (isBarcodeValid ? (
            <div
              dangerouslySetInnerHTML={{ __html: barcodeSvg }}
              className="max-w-full overflow-x-auto"
            />
          ) : (
            <div className="text-red-500 text-xs font-bold text-center py-8">
              Invalid input for {barcodeFormat}
            </div>
          ))}
        {activeTab === "batch" && (
          <div className="text-center py-12 text-slate-400 text-xs font-medium">
            Batch mode active. Previewing first payload:
            <div
              dangerouslySetInnerHTML={{ __html: qrSvg }}
              className="w-48 h-48 mx-auto mt-4"
            />
          </div>
        )}
      </div>

      {/* Scannability Health Bar (QR only) */}
      {activeTab === "qr" && (
        <ScannabilityBadge
          scannability={scannability}
          label={t.scannabilityScore}
        />
      )}

      {/* Export Actions */}
      <div className="w-full mt-6 grid grid-cols-2 gap-2">
        <button
          onClick={() => {
            exportRaster(targetSvg, "png", {
              filename: "omnicode.png",
              transparent: isTransparent
            });
          }}
          className="py-2.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20"
        >
          <Download className="w-3.5 h-3.5" />
          PNG (1200px)
        </button>
        <button
          onClick={() => {
            exportSVG(targetSvg, "omnicode.svg");
          }}
          className="py-2.5 px-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold text-xs flex items-center justify-center gap-2"
        >
          <Download className="w-3.5 h-3.5" />
          SVG Vector
        </button>
        <button
          onClick={() => {
            exportPDF(targetSvg, "omnicode.pdf");
          }}
          className="py-2.5 px-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold text-xs flex items-center justify-center gap-2"
        >
          <Download className="w-3.5 h-3.5" />
          Print PDF
        </button>
        <button
          onClick={onCopySvg}
          className="py-2.5 px-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold text-xs flex items-center justify-center gap-2"
        >
          {copied ? (
            <Check className="w-3.5 h-3.5 text-emerald-500" />
          ) : (
            <Copy className="w-3.5 h-3.5" />
          )}
          {copied ? t.copied : t.copySvg}
        </button>
      </div>
    </div>
  );
};
