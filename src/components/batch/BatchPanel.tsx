import React, { useMemo, useRef } from "react";
import {
  FileSpreadsheet,
  Download,
  Upload,
  Sparkles,
  QrCode,
  Barcode,
  Award,
  CheckCircle,
  FileText
} from "lucide-react";
import { Translations } from "../../i18n/translations";
import { parseBatchInput } from "../../core/batch/parser";

export type BatchKind = "qr" | "barcode" | "seal";
export type BatchAssetFormat = "svg" | "png";

interface BatchPanelProps {
  batchText: string;
  setBatchText: (v: string) => void;
  batchStatus: string | null;
  batchKind: BatchKind;
  setBatchKind: (v: BatchKind) => void;
  batchAssetFormat: BatchAssetFormat;
  setBatchAssetFormat: (v: BatchAssetFormat) => void;
  onBatchDownload: () => void;
  isProcessing?: boolean;
  t: Translations;
  lang: "en" | "ar";
}

export const BatchPanel: React.FC<BatchPanelProps> = ({
  batchText,
  setBatchText,
  batchStatus,
  batchKind,
  setBatchKind,
  batchAssetFormat,
  setBatchAssetFormat,
  onBatchDownload,
  isProcessing = false,
  t,
  lang
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Parse items reactively
  const parsedItems = useMemo(() => {
    return parseBatchInput(batchText);
  }, [batchText]);

  // File upload handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result;
      if (typeof content === "string") {
        setBatchText(content);
      }
    };
    reader.readAsText(file);
    // Reset input so same file can be selected again
    e.target.value = "";
  };

  // Sample data loader
  const loadSampleData = () => {
    if (batchKind === "barcode") {
      setBatchText(
        `SKU-101, 628100123456\nSKU-102, 628100654321\nSKU-103, 628100987654`
      );
    } else if (batchKind === "seal") {
      setBatchText(
        `Doc_Apostille_1, CERT-2026-X01\nDoc_Apostille_2, CERT-2026-X02\nDoc_Apostille_3, CERT-2026-X03`
      );
    } else {
      setBatchText(
        `Item 1, https://site.com/1\nItem 2, https://site.com/2\nItem 3, https://site.com/3`
      );
    }
  };

  return (
    <div className="p-6 rounded-2xl border border-slate-200/90 bg-white shadow-sm space-y-5">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
          <div>
            <h2 className="text-sm font-bold text-slate-900 tracking-tight">
              {t.batchCsvTitle}
            </h2>
            <p className="text-xs text-slate-500">
              Format: <code className="bg-slate-100 px-1.5 py-0.5 rounded font-mono text-[11px] text-slate-800">FileName, Payload</code>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <Upload className="w-3.5 h-3.5 text-slate-500" />
            <span>{t.batchUploadBtn}</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.txt"
            onChange={handleFileUpload}
            className="hidden"
          />

          <button
            type="button"
            onClick={loadSampleData}
            className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-emerald-50 hover:border-emerald-300 text-slate-700 hover:text-emerald-800 font-semibold text-xs flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>{t.batchSampleBtn}</span>
          </button>
        </div>
      </div>

      <hr className="border-slate-100" />

      {/* Target Symbology & Output Format Selection */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-slate-800 mb-2">
            {t.batchModeLabel}
          </label>
          <div className="grid grid-cols-3 gap-1.5">
            {[
              { id: "qr", label: "QR Code", icon: QrCode },
              { id: "barcode", label: "Barcode", icon: Barcode },
              { id: "seal", label: lang === "ar" ? "ختم دائري" : "Seal", icon: Award }
            ].map((m) => {
              const Icon = m.icon;
              const isSelected = batchKind === m.id;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setBatchKind(m.id as BatchKind)}
                  className={`py-2 px-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                    isSelected
                      ? "border-emerald-600 bg-emerald-50 text-emerald-900 shadow-sm"
                      : "border-slate-200 text-slate-600 hover:border-slate-300 bg-white"
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isSelected ? "text-emerald-600" : "text-slate-400"}`} />
                  <span>{m.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-800 mb-2">
            {t.batchOutputFormat}
          </label>
          <div className="grid grid-cols-2 gap-1.5">
            {[
              { id: "svg", label: "SVG Vector (.svg)" },
              { id: "png", label: "PNG 1200px (.png)" }
            ].map((fmt) => {
              const isSelected = batchAssetFormat === fmt.id;
              return (
                <button
                  key={fmt.id}
                  type="button"
                  onClick={() => setBatchAssetFormat(fmt.id as BatchAssetFormat)}
                  className={`py-2 px-2.5 rounded-xl border text-xs font-bold text-center transition-all ${
                    isSelected
                      ? "border-emerald-600 bg-emerald-50 text-emerald-900 shadow-sm"
                      : "border-slate-200 text-slate-600 hover:border-slate-300 bg-white"
                  }`}
                >
                  {fmt.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* CSV / Plain Text Editor */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-slate-500" />
            <span>{lang === "ar" ? "قائمة العناصر والبيانات" : "Batch Items Input"}</span>
          </label>
          <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
            {parsedItems.length} {t.batchDetectedCount}
          </span>
        </div>
        <textarea
          value={batchText}
          onChange={(e) => setBatchText(e.target.value)}
          rows={6}
          dir="ltr"
          placeholder="FileName, Payload"
          className="w-full p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 font-mono text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all shadow-inner"
        />
      </div>

      {/* Detected Items Live Preview Table */}
      {parsedItems.length > 0 && (
        <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50/50">
          <div className="bg-slate-100/80 px-3 py-2 border-b border-slate-200 flex items-center justify-between text-xs font-bold text-slate-700">
            <span>{lang === "ar" ? "جدول العناصر المعالجة" : "Detected Items Queue"}</span>
            <span className="text-slate-500 font-normal text-[11px]">
              {lang === "ar" ? `عرض أول ${Math.min(parsedItems.length, 5)} عناصر` : `Showing first ${Math.min(parsedItems.length, 5)}`}
            </span>
          </div>
          <div className="max-h-40 overflow-y-auto divide-y divide-slate-100 text-xs font-mono">
            {parsedItems.slice(0, 5).map((item) => (
              <div key={item.id} className="px-3 py-2 flex items-center justify-between gap-3 bg-white hover:bg-slate-50">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-bold">
                    #{item.id}
                  </span>
                  <span className="font-bold text-slate-800 truncate" title={item.name}>
                    {item.name}.{batchAssetFormat}
                  </span>
                </div>
                <span className="text-slate-500 truncate max-w-[200px]" title={item.data}>
                  {item.data}
                </span>
              </div>
            ))}
            {parsedItems.length > 5 && (
              <div className="px-3 py-1.5 text-center text-[11px] text-slate-500 font-sans italic bg-slate-50">
                +{parsedItems.length - 5} {lang === "ar" ? "عناصر إضافية سيتم تضمينها في الحزمة" : "more items will be bundled"}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Download Button */}
      <button
        onClick={onBatchDownload}
        disabled={isProcessing || parsedItems.length === 0}
        className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-xs shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
      >
        <Download className="w-4 h-4" />
        <span>
          {isProcessing
            ? (lang === "ar" ? "جاري إنشاء الحزمة وتحميل الملفات..." : "Processing & Zipping...")
            : `${t.batchDownloadZip} (${parsedItems.length})`}
        </span>
      </button>

      {/* Status Message */}
      {batchStatus && (
        <div className="text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 p-3 rounded-xl flex items-center justify-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          <span>{batchStatus}</span>
        </div>
      )}
    </div>
  );
};
