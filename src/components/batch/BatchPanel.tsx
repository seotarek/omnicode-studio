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
    <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 space-y-4">
      <h3 className="text-sm font-bold flex items-center gap-2">
        <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
        {t.batchCsvTitle}
      </h3>
      <p className="text-xs text-slate-500">
        Format: <code>FileName, URL_or_Payload</code> (one entry per line)
      </p>
      <textarea
        value={batchText}
        onChange={(e) => setBatchText(e.target.value)}
        rows={6}
        className="w-full p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 font-mono text-xs"
      />
      <button
        onClick={onBatchDownload}
        className="w-full py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2"
      >
        <Download className="w-4 h-4" />
        {t.batchDownloadZip}
      </button>
      {batchStatus && (
        <div className="text-xs font-semibold text-emerald-500 text-center">
          {batchStatus}
        </div>
      )}
    </div>
  );
};
