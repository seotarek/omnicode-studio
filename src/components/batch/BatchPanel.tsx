import React from "react";
import { FileSpreadsheet, Download } from "lucide-react";
import { Translations } from "../../i18n/translations";

interface BatchPanelProps {
  batchText: string;
  setBatchText: (v: string) => void;
  batchStatus: string | null;
  onBatchDownload: () => void;
  t: Translations;
}

export const BatchPanel: React.FC<BatchPanelProps> = ({
  batchText,
  setBatchText,
  batchStatus,
  onBatchDownload,
  t
}) => {
  return (
    <div className="p-5 rounded-2xl border border-slate-200/90 bg-white shadow-sm space-y-4">
      <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
        <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
        {t.batchCsvTitle}
      </h3>
      <p className="text-xs text-slate-500">
        Format: <code className="bg-slate-100 text-slate-800 px-1.5 py-0.5 rounded font-mono">FileName, URL_or_Payload</code> (one entry per line)
      </p>
      <textarea
        value={batchText}
        onChange={(e) => setBatchText(e.target.value)}
        rows={6}
        className="w-full p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 font-mono text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
      />
      <button
        onClick={onBatchDownload}
        className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
      >
        <Download className="w-4 h-4" />
        {t.batchDownloadZip}
      </button>
      {batchStatus && (
        <div className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 p-2.5 rounded-xl text-center">
          {batchStatus}
        </div>
      )}
    </div>
  );
};
