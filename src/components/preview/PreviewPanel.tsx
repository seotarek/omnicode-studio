import React, { useMemo } from "react";
import DOMPurify from "dompurify";
import { Download, Copy, Check } from "lucide-react";
import { ValidationResult } from "../../core/validator/scannability";
import { exportSVG, exportRaster, exportPDF, exportEPS } from "../../core/export";
import { ScannabilityBadge } from "./ScannabilityBadge";
import { Translations } from "../../i18n/translations";

interface PreviewPanelProps {
  activeTab: "qr" | "barcode" | "seal" | "batch" | "scanner";
  qrSvg: string;
  barcodeSvg: string;
  sealSvg?: string;
  batchPreviewSvg?: string;
  batchFirstItemName?: string;
  batchTotalCount?: number;
  onBatchDownload?: () => void;
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
  sealSvg,
  batchPreviewSvg,
  batchFirstItemName,
  batchTotalCount,
  onBatchDownload,
  barcodeFormat,
  isBarcodeValid,
  isTransparent,
  scannability,
  t,
  onCopySvg,
  copied
}) => {
  const sanitizedQrSvg = useMemo(() => {
    return DOMPurify.sanitize(qrSvg, { USE_PROFILES: { svg: true, svgFilters: true } });
  }, [qrSvg]);

  const sanitizedBarcodeSvg = useMemo(() => {
    return DOMPurify.sanitize(barcodeSvg, { USE_PROFILES: { svg: true, svgFilters: true } });
  }, [barcodeSvg]);

  const sanitizedSealSvg = useMemo(() => {
    return DOMPurify.sanitize(sealSvg || "", { USE_PROFILES: { svg: true, svgFilters: true } });
  }, [sealSvg]);

  const sanitizedBatchPreviewSvg = useMemo(() => {
    return DOMPurify.sanitize(batchPreviewSvg || "", { USE_PROFILES: { svg: true, svgFilters: true } });
  }, [batchPreviewSvg]);

  const targetSvg =
    activeTab === "barcode"
      ? barcodeSvg
      : activeTab === "seal"
      ? (sealSvg || "")
      : activeTab === "batch"
      ? (batchPreviewSvg || qrSvg)
      : qrSvg;

  return (
    <div className="p-6 rounded-2xl border border-slate-200/90 bg-white shadow-xl shadow-slate-200/50 flex flex-col items-center sticky top-24">
      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 w-full text-center">
        {t.livePreview}
      </h3>

      {/* Display Canvas */}
      <div className="p-4 rounded-xl bg-slate-50/80 shadow-inner border border-slate-100 max-w-full overflow-hidden flex items-center justify-center min-h-[300px]">
        {activeTab === "qr" && (
          <div
            dangerouslySetInnerHTML={{ __html: sanitizedQrSvg }}
            className="w-64 h-64 flex items-center justify-center [&_svg]:w-full [&_svg]:h-full [&_svg]:max-w-full [&_svg]:max-h-full"
          />
        )}
        {activeTab === "seal" && (
          <div
            dangerouslySetInnerHTML={{ __html: sanitizedSealSvg }}
            className="w-72 h-72 flex items-center justify-center p-2 [&_svg]:w-full [&_svg]:h-full [&_svg]:max-w-full [&_svg]:max-h-full"
          />
        )}
        {activeTab === "barcode" &&
          (isBarcodeValid ? (
            <div
              dangerouslySetInnerHTML={{ __html: sanitizedBarcodeSvg }}
              className="max-w-full overflow-x-auto flex items-center justify-center [&_svg]:max-w-full [&_svg]:h-auto"
            />
          ) : (
            <div className="text-red-500 text-xs font-bold text-center py-8">
              Invalid input for {barcodeFormat}
            </div>
          ))}
        {activeTab === "batch" && (
          <div className="w-full flex flex-col items-center justify-center py-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold mb-3">
              <span>{t.batchPreviewFirst}</span>
              {batchFirstItemName && (
                <span className="font-mono text-[11px] bg-white px-1.5 py-0.5 rounded border border-emerald-200 font-bold">
                  {batchFirstItemName}
                </span>
              )}
            </div>
            {sanitizedBatchPreviewSvg ? (
              <div
                dangerouslySetInnerHTML={{ __html: sanitizedBatchPreviewSvg }}
                className="w-56 h-56 flex items-center justify-center p-2 [&_svg]:w-full [&_svg]:h-full [&_svg]:max-w-full [&_svg]:max-h-full"
              />
            ) : (
              <div className="py-12 text-slate-400 text-xs text-center font-medium">
                {t.batchEmptyWarning}
              </div>
            )}
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
      {activeTab === "batch" ? (
        <div className="w-full mt-6 space-y-2.5">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center flex items-center justify-between px-4 text-xs font-medium text-slate-600">
            <span>{t.batchDetectedCount}:</span>
            <span className="font-mono font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
              {batchTotalCount || 0}
            </span>
          </div>
          {onBatchDownload && (
            <button
              onClick={onBatchDownload}
              disabled={!batchTotalCount || batchTotalCount === 0}
              className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 active:scale-[0.99] transition-all"
            >
              <Download className="w-4 h-4" />
              <span>{t.batchDownloadZip}</span>
            </button>
          )}
          <button
            onClick={onCopySvg}
            className="w-full py-2.5 px-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center justify-center gap-2 transition-colors"
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 text-emerald-600" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
            {copied ? t.copied : `${t.copySvg} (${batchFirstItemName || "item 1"})`}
          </button>
        </div>
      ) : (
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
            className="py-2.5 px-3 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center justify-center gap-2 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            SVG Vector
          </button>
          <button
            onClick={() => {
              exportPDF(targetSvg, "omnicode.pdf");
            }}
            className="py-2.5 px-3 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center justify-center gap-2 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            Print PDF
          </button>
          <button
            onClick={() => {
              exportEPS(targetSvg, "omnicode.eps");
            }}
            className="py-2.5 px-3 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center justify-center gap-2 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            EPS Vector
          </button>
          <button
            onClick={onCopySvg}
            className="col-span-2 py-2.5 px-3 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center justify-center gap-2 transition-colors"
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 text-emerald-600" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
            {copied ? t.copied : t.copySvg}
          </button>
        </div>
      )}
    </div>
  );
};
