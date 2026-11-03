import React, { useState, useRef, useEffect } from "react";
import {
  ScanLine,
  Copy,
  Check,
  Sparkles,
  AlertCircle,
  Globe,
  Receipt,
  CreditCard,
  Wifi,
  Contact,
  Barcode as BarcodeIcon,
  QrCode as QrIcon
} from "lucide-react";
import { BrowserMultiFormatReader } from "@zxing/library";
import { Translations } from "../../i18n/translations";
import {
  decodeZatcaInvoice
} from "../../core/payloads/encoders";
import {
  decodeGs1DigitalLink,
  decodeEpcSepa,
  decodeWifi,
  decodeVCard
} from "../../core/payloads/decoders";

interface ScannerPanelProps {
  t: Translations;
  lang: "en" | "ar";
  onLoadIntoQr: (text: string) => void;
  onLoadIntoBarcode: (data: string) => void;
}

export const ScannerPanel: React.FC<ScannerPanelProps> = ({
  t,
  lang,
  onLoadIntoQr,
  onLoadIntoBarcode
}) => {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [rawResult, setRawResult] = useState<string | null>(null);
  const [formatName, setFormatName] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Parsed structured states
  const [parsedZatca, setParsedZatca] = useState<Record<string | number, string> | null>(null);
  const [parsedGs1, setParsedGs1] = useState<any | null>(null);
  const [parsedEpc, setParsedEpc] = useState<any | null>(null);
  const [parsedWifi, setParsedWifi] = useState<any | null>(null);
  const [parsedVCard, setParsedVCard] = useState<any | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const analyzePayload = (text: string) => {
    setParsedZatca(null);
    setParsedGs1(null);
    setParsedEpc(null);
    setParsedWifi(null);
    setParsedVCard(null);

    // 1. Check GS1 Digital Link
    if (text.includes("/01/") || text.startsWith("https://id.gs1.org")) {
      try {
        const decoded = decodeGs1DigitalLink(text);
        if (decoded.gtin) {
          setParsedGs1(decoded);
          return;
        }
      } catch {}
    }

    // 2. Check EPC SEPA
    if (text.startsWith("BCD\n") || text.startsWith("BCD\r\n")) {
      try {
        const decoded = decodeEpcSepa(text);
        if (decoded.iban) {
          setParsedEpc(decoded);
          return;
        }
      } catch {}
    }

    // 3. Check WiFi
    if (text.startsWith("WIFI:")) {
      try {
        const decoded = decodeWifi(text);
        setParsedWifi(decoded);
        return;
      } catch {}
    }

    // 4. Check vCard
    if (text.includes("BEGIN:VCARD")) {
      try {
        const decoded = decodeVCard(text);
        setParsedVCard(decoded);
        return;
      } catch {}
    }

    // 5. Check ZATCA Base64 TLV
    if (/^[A-Za-z0-9+/=]{20,}$/.test(text.trim())) {
      try {
        const decoded = decodeZatcaInvoice(text.trim());
        if (decoded.sellerName || decoded[1]) {
          setParsedZatca(decoded);
          return;
        }
      } catch {}
    }
  };

  const processImage = async (fileOrBlob: Blob) => {
    setIsScanning(true);
    setErrorMessage(null);
    setRawResult(null);

    const objectUrl = URL.createObjectURL(fileOrBlob);
    setImagePreview(objectUrl);

    try {
      const reader = new BrowserMultiFormatReader();
      const img = new Image();
      img.src = objectUrl;

      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = () => reject(new Error("Failed to load image file"));
      });

      const result = await reader.decodeFromImageElement(img);
      const text = result.getText();
      const format = result.getBarcodeFormat().toString();

      setRawResult(text);
      setFormatName(format);
      analyzePayload(text);
    } catch (err: any) {
      setErrorMessage(
        lang === "ar"
          ? "لم يتم العثور على باركود أو QR صالح في الصورة. يرجى التأكد من وضوح الصورة وتجنب الانعكاسات."
          : "No valid Barcode or QR Code detected in image. Ensure good lighting and sharpness."
      );
    } finally {
      setIsScanning(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processImage(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processImage(file);
    }
  };

  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.startsWith("image/")) {
          const blob = items[i].getAsFile();
          if (blob) {
            processImage(blob);
            break;
          }
        }
      }
    };

    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, []);

  const handleCopy = () => {
    if (rawResult) {
      navigator.clipboard.writeText(rawResult);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const isNumericOnly = rawResult ? /^[0-9]+$/.test(rawResult.trim()) : false;

  return (
    <div className="space-y-6">
      {/* Upload & Dropzone Box */}
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className="p-8 rounded-2xl border-2 border-dashed border-slate-300 hover:border-emerald-500 bg-white shadow-sm hover:shadow-md transition-all text-center cursor-pointer group"
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />

        <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-emerald-50 group-hover:bg-emerald-100/80 text-emerald-600 flex items-center justify-center transition-all shadow-sm">
          <ScanLine className="w-7 h-7 group-hover:scale-110 transition-transform" />
        </div>

        <h3 className="text-sm font-bold text-slate-800 mb-1 group-hover:text-emerald-700 transition-colors">
          {t.scannerDropTitle}
        </h3>
        <p className="text-xs text-slate-500 max-w-md mx-auto mb-2">
          {t.scannerDropSubtitle}
        </p>
        <span className="inline-block px-3 py-1 bg-slate-100 text-slate-600 text-[11px] font-medium rounded-full">
          {t.scannerPasteHint}
        </span>
      </div>

      {/* Image Preview & Scanning Indicator */}
      {imagePreview && (
        <div className="p-4 rounded-2xl border border-slate-200 bg-white shadow-sm flex flex-col sm:flex-row items-center gap-4">
          <div className="w-24 h-24 rounded-xl border border-slate-200 overflow-hidden bg-slate-50 flex items-center justify-center shrink-0">
            <img src={imagePreview} alt="Uploaded code" className="w-full h-full object-contain" />
          </div>
          <div className="flex-1 text-center sm:text-start">
            <div className="text-xs font-bold text-slate-800">
              {isScanning ? (
                <span className="text-emerald-600 animate-pulse flex items-center justify-center sm:justify-start gap-1.5">
                  <ScanLine className="w-4 h-4 animate-spin" />
                  {lang === "ar" ? "جارٍ التحليل الضوئي وفك التشفير..." : "Decoding optical barcode..."}
                </span>
              ) : rawResult ? (
                <span className="text-emerald-700 flex items-center justify-center sm:justify-start gap-1.5">
                  <Check className="w-4 h-4 text-emerald-600" />
                  {lang === "ar" ? "تم فك الشفرة بنجاح!" : "Optical decoding succeeded!"}
                </span>
              ) : (
                <span className="text-rose-600 flex items-center justify-center sm:justify-start gap-1.5">
                  <AlertCircle className="w-4 h-4" />
                  {lang === "ar" ? "تعذر قراءة الكود" : "Decoding failed"}
                </span>
              )}
            </div>
            {formatName && (
              <div className="text-[11px] font-mono text-slate-500 mt-1">
                Format: <span className="font-semibold text-slate-700">{formatName}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Error Message */}
      {errorMessage && (
        <div className="p-4 rounded-xl border border-rose-200 bg-rose-50 text-rose-800 text-xs flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <div>{errorMessage}</div>
        </div>
      )}

      {/* Decoded Result & Inspection Card */}
      {rawResult && (
        <div className="p-6 rounded-2xl border border-slate-200 bg-white shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              {t.decodedResult}
            </h4>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopy}
                className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 flex items-center gap-1.5 transition-all"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? t.copied : t.copyDecodedText}
              </button>
            </div>
          </div>

          {/* Structured Inspection: GS1 Digital Link */}
          {parsedGs1 && (
            <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/50 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-blue-900">
                <Globe className="w-4 h-4 text-blue-600" />
                GS1 Digital Link 2027 Standard
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div className="p-2 bg-white rounded-lg border border-blue-100">
                  <span className="text-[10px] text-slate-500 block">GTIN (01)</span>
                  <span className="font-mono font-bold text-slate-800">{parsedGs1.gtin}</span>
                </div>
                {parsedGs1.lot && (
                  <div className="p-2 bg-white rounded-lg border border-blue-100">
                    <span className="text-[10px] text-slate-500 block">Batch / Lot (10)</span>
                    <span className="font-mono font-bold text-slate-800">{parsedGs1.lot}</span>
                  </div>
                )}
                {parsedGs1.serial && (
                  <div className="p-2 bg-white rounded-lg border border-blue-100">
                    <span className="text-[10px] text-slate-500 block">Serial (21)</span>
                    <span className="font-mono font-bold text-slate-800">{parsedGs1.serial}</span>
                  </div>
                )}
                {parsedGs1.expiryDate && (
                  <div className="p-2 bg-white rounded-lg border border-blue-100">
                    <span className="text-[10px] text-slate-500 block">Expiry (17)</span>
                    <span className="font-mono font-bold text-slate-800">{parsedGs1.expiryDate}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Structured Inspection: ZATCA */}
          {parsedZatca && (
            <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/50 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-900">
                <Receipt className="w-4 h-4 text-emerald-600" />
                Saudi ZATCA Phase 1 & 2 E-Invoice
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div className="p-2 bg-white rounded-lg border border-emerald-100">
                  <span className="text-[10px] text-slate-500 block">Seller Name / اسم البائع</span>
                  <span className="font-bold text-slate-800">{parsedZatca.sellerName || parsedZatca[1]}</span>
                </div>
                <div className="p-2 bg-white rounded-lg border border-emerald-100">
                  <span className="text-[10px] text-slate-500 block">VAT Number / الرقم الضريبي</span>
                  <span className="font-mono font-bold text-slate-800">{parsedZatca.vatNumber || parsedZatca[2]}</span>
                </div>
                <div className="p-2 bg-white rounded-lg border border-emerald-100">
                  <span className="text-[10px] text-slate-500 block">Timestamp / تاريخ الفاتورة</span>
                  <span className="font-mono font-bold text-slate-800">{parsedZatca.timestamp || parsedZatca[3]}</span>
                </div>
                <div className="p-2 bg-white rounded-lg border border-emerald-100">
                  <span className="text-[10px] text-slate-500 block">Total With VAT / الإجمالي شامل الضريبة</span>
                  <span className="font-mono font-bold text-emerald-700">{parsedZatca.totalWithVat || parsedZatca[4]} SAR</span>
                </div>
              </div>
            </div>
          )}

          {/* Structured Inspection: EPC SEPA */}
          {parsedEpc && (
            <div className="p-4 rounded-xl border border-indigo-200 bg-indigo-50/50 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-indigo-900">
                <CreditCard className="w-4 h-4 text-indigo-600" />
                SEPA Credit Transfer (EPC)
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div className="p-2 bg-white rounded-lg border border-indigo-100">
                  <span className="text-[10px] text-slate-500 block">Beneficiary Name</span>
                  <span className="font-bold text-slate-800">{parsedEpc.beneficiaryName}</span>
                </div>
                <div className="p-2 bg-white rounded-lg border border-indigo-100">
                  <span className="text-[10px] text-slate-500 block">IBAN</span>
                  <span className="font-mono font-bold text-slate-800">{parsedEpc.iban}</span>
                </div>
                {parsedEpc.amount !== undefined && (
                  <div className="p-2 bg-white rounded-lg border border-indigo-100">
                    <span className="text-[10px] text-slate-500 block">Amount</span>
                    <span className="font-mono font-bold text-indigo-700">{parsedEpc.amount} EUR</span>
                  </div>
                )}
                {parsedEpc.remittanceInformation && (
                  <div className="p-2 bg-white rounded-lg border border-indigo-100">
                    <span className="text-[10px] text-slate-500 block">Remittance Info</span>
                    <span className="font-mono font-bold text-slate-800">{parsedEpc.remittanceInformation}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Structured Inspection: WiFi */}
          {parsedWifi && (
            <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/50 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
                <Wifi className="w-4 h-4 text-amber-600" />
                WiFi Network Credentials
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div className="p-2 bg-white rounded-lg border border-amber-100">
                  <span className="text-[10px] text-slate-500 block">SSID</span>
                  <span className="font-bold text-slate-800">{parsedWifi.ssid}</span>
                </div>
                <div className="p-2 bg-white rounded-lg border border-amber-100">
                  <span className="text-[10px] text-slate-500 block">Password</span>
                  <span className="font-mono font-bold text-slate-800">{parsedWifi.password || "(None)"}</span>
                </div>
                <div className="p-2 bg-white rounded-lg border border-amber-100">
                  <span className="text-[10px] text-slate-500 block">Encryption</span>
                  <span className="font-bold text-slate-800">{parsedWifi.encryption}</span>
                </div>
              </div>
            </div>
          )}

          {/* Structured Inspection: vCard */}
          {parsedVCard && (
            <div className="p-4 rounded-xl border border-rose-200 bg-rose-50/50 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-rose-900">
                <Contact className="w-4 h-4 text-rose-600" />
                Contact Card (vCard)
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div className="p-2 bg-white rounded-lg border border-rose-100">
                  <span className="text-[10px] text-slate-500 block">Name</span>
                  <span className="font-bold text-slate-800">{parsedVCard.firstName} {parsedVCard.lastName}</span>
                </div>
                {parsedVCard.phone && (
                  <div className="p-2 bg-white rounded-lg border border-rose-100">
                    <span className="text-[10px] text-slate-500 block">Phone</span>
                    <span className="font-mono font-bold text-slate-800">{parsedVCard.phone}</span>
                  </div>
                )}
                {parsedVCard.email && (
                  <div className="p-2 bg-white rounded-lg border border-rose-100">
                    <span className="text-[10px] text-slate-500 block">Email</span>
                    <span className="font-mono font-bold text-slate-800">{parsedVCard.email}</span>
                  </div>
                )}
                {parsedVCard.organization && (
                  <div className="p-2 bg-white rounded-lg border border-rose-100">
                    <span className="text-[10px] text-slate-500 block">Organization</span>
                    <span className="font-bold text-slate-800">{parsedVCard.organization}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Raw Text Output */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 block">Raw Payload Data</label>
            <textarea
              readOnly
              value={rawResult}
              className="w-full h-24 p-3 rounded-xl border border-slate-200 bg-slate-50 font-mono text-xs text-slate-900 outline-none select-all"
            />
          </div>

          {/* Studio Transfer Actions */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => onLoadIntoQr(rawResult)}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-all flex items-center gap-2"
            >
              <QrIcon className="w-4 h-4" />
              {t.openInQrStudio}
            </button>

            {isNumericOnly || rawResult.length <= 80 ? (
              <button
                type="button"
                onClick={() => onLoadIntoBarcode(rawResult)}
                className="px-4 py-2.5 rounded-xl border border-slate-300 hover:border-slate-400 bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs shadow-sm transition-all flex items-center gap-2"
              >
                <BarcodeIcon className="w-4 h-4 text-slate-700" />
                {t.openInBarcodeStudio}
              </button>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
};
