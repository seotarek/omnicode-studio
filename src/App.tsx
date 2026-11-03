import React, { useState, useMemo } from "react";
import { QrCode, Barcode, Award, FileSpreadsheet, ScanLine } from "lucide-react";
import { QRCodeOptions, DotType, CornerSquareType, CornerDotType, ErrorCorrectionLevel } from "./core/qr/types";
import { QRCodeRenderer } from "./core/qr/renderer";
import { validateScannability } from "./core/validator/scannability";
import { BarcodeFormat, BarcodeStyle, validateBarcodeData, generateBarcodeSVG } from "./core/barcode/generator";
import { SealType, BorderStyle } from "./core/seal/types";
import { generateSealSVG } from "./core/seal/generator";
import { translations } from "./i18n/translations";
import JSZip from "jszip";

import { Header } from "./components/layout/Header";
import { QRForm } from "./components/qr/QRForm";
import { BarcodeForm } from "./components/barcode/BarcodeForm";
import { SealForm } from "./components/seal/SealForm";
import { BatchPanel, BatchKind, BatchAssetFormat } from "./components/batch/BatchPanel";
import { parseBatchInput } from "./core/batch/parser";
import { svgToCanvas } from "./core/export";
import { PreviewPanel } from "./components/preview/PreviewPanel";
import { ScannerPanel } from "./components/scanner/ScannerPanel";

export function App() {
  const [lang, setLang] = useState<"en" | "ar">("ar");
  const [activeTab, setActiveTab] = useState<"qr" | "barcode" | "seal" | "batch" | "scanner">("qr");

  // Translation helper
  const t = translations[lang];

  // QR State
  const [qrText, setQrText] = useState("https://omnicode.studio");
  const [errorLevel, setErrorLevel] = useState<ErrorCorrectionLevel>("H");
  const [dotType, setDotType] = useState<DotType>("rounded");
  const [cornerSquareType, setCornerSquareType] = useState<CornerSquareType>("extra-rounded");
  const [cornerDotType, setCornerDotType] = useState<CornerDotType>("dot");
  const [fgColor, setFgColor] = useState("#059669");
  const [fgColor2, setFgColor2] = useState("#047857");
  const [isGradient, setIsGradient] = useState(true);
  const [bgColor] = useState("#ffffff");
  const [isTransparent, setIsTransparent] = useState(false);
  const [logoUrl, setLogoUrl] = useState<string | undefined>(undefined);
  const [logoRatio] = useState(0.22);
  const [copied, setCopied] = useState(false);

  // Barcode State
  const [barcodeFormat, setBarcodeFormat] = useState<BarcodeFormat>("CODE128");
  const [barcodeData, setBarcodeData] = useState("OMNICODE-2026");
  const [barcodeColor, setBarcodeColor] = useState("#000000");
  const [barcodeColor2, setBarcodeColor2] = useState("#2563eb");
  const [barcodeStyle, setBarcodeStyle] = useState<BarcodeStyle>("classic");
  const [barcodeHeader, setBarcodeHeader] = useState("");
  const [barcodeFooter, setBarcodeFooter] = useState("");
  const [barcodeWidth, setBarcodeWidth] = useState(2);
  const [barcodeHeight, setBarcodeHeight] = useState(90);

  // Seal State
  const [sealType, setSealType] = useState<SealType>("official-seal");
  const [sealTitle, setSealTitle] = useState("OFFICIAL VERIFICATION SEAL");
  const [sealSubtitle, setSealSubtitle] = useState("AUTHENTICATED & SECURE");
  const [sealSerial, setSealSerial] = useState("CERT-2026-X99");
  const [sealDate, setSealDate] = useState("2026-11-03");
  const [sealData, setSealData] = useState("https://omnicode.studio/verify");
  const [sealInkColor, setSealInkColor] = useState("#1e3a8a");
  const [sealBorderStyle, setSealBorderStyle] = useState<BorderStyle>("scalloped");
  const [sealCenterIcon, setSealCenterIcon] = useState<"shield" | "star" | "lock" | "check">("shield");

  // Batch State
  const [batchText, setBatchText] = useState("Item 1, https://site.com/1\nItem 2, https://site.com/2\nItem 3, https://site.com/3");
  const [batchStatus, setBatchStatus] = useState<string | null>(null);
  const [batchKind, setBatchKind] = useState<BatchKind>("qr");
  const [batchAssetFormat, setBatchAssetFormat] = useState<BatchAssetFormat>("svg");
  const [isBatchProcessing, setIsBatchProcessing] = useState(false);

  // QR Options computation
  const qrOptions: QRCodeOptions = useMemo(() => {
    return {
      width: 480,
      height: 480,
      margin: 16,
      data: qrText || "https://omnicode.studio",
      errorCorrectionLevel: errorLevel,
      dotsOptions: {
        type: dotType,
        colorOrGradient: isGradient
          ? {
              gradient: {
                type: "linear",
                rotation: 45,
                colorStops: [
                  { offset: 0, color: fgColor },
                  { offset: 1, color: fgColor2 }
                ]
              }
            }
          : { color: fgColor }
      },
      cornersSquareOptions: {
        type: cornerSquareType,
        colorOrGradient: { color: fgColor2 }
      },
      cornersDotOptions: {
        type: cornerDotType,
        colorOrGradient: { color: fgColor }
      },
      backgroundOptions: {
        color: bgColor,
        transparent: isTransparent
      },
      logoOptions: logoUrl
        ? {
            url: logoUrl,
            sizeRatio: logoRatio,
            padding: 1.5,
            protectZone: true,
            backgroundColor: "#ffffff",
            borderRadius: 8
          }
        : undefined
    };
  }, [qrText, errorLevel, dotType, cornerSquareType, cornerDotType, fgColor, fgColor2, isGradient, bgColor, isTransparent, logoUrl, logoRatio]);

  // Render QR SVG
  const qrSvg = useMemo(() => {
    try {
      const renderer = new QRCodeRenderer(qrOptions);
      return renderer.render().svgString;
    } catch {
      return `<svg viewBox="0 0 100 100"><text x="10" y="50" fill="red">Render Error</text></svg>`;
    }
  }, [qrOptions]);

  // Validation
  const scannability = useMemo(() => {
    return validateScannability({
      fgColor,
      bgColor,
      errorCorrectionLevel: errorLevel,
      hasLogo: Boolean(logoUrl),
      logoRatio
    });
  }, [fgColor, bgColor, errorLevel, logoUrl, logoRatio]);

  // Barcode SVG computation
  const barcodeValidation = useMemo(() => {
    return validateBarcodeData(barcodeFormat, barcodeData);
  }, [barcodeFormat, barcodeData]);

  const barcodeSvg = useMemo(() => {
    if (!barcodeValidation.isValid) return "";
    try {
      return generateBarcodeSVG({
        format: barcodeFormat,
        data: barcodeData,
        lineColor: barcodeColor,
        lineColor2: barcodeColor2,
        style: barcodeStyle,
        headerText: barcodeHeader,
        footerText: barcodeFooter,
        background: isTransparent ? "transparent" : bgColor,
        width: barcodeWidth,
        height: barcodeHeight
      });
    } catch {
      return "";
    }
  }, [barcodeFormat, barcodeData, barcodeColor, barcodeColor2, barcodeStyle, barcodeHeader, barcodeFooter, isTransparent, bgColor, barcodeWidth, barcodeHeight, barcodeValidation]);

  // Seal SVG computation
  const sealSvg = useMemo(() => {
    try {
      return generateSealSVG({
        type: sealType,
        data: sealData,
        titleText: sealTitle,
        subtitleText: sealSubtitle,
        serialNumber: sealSerial,
        dateText: sealDate,
        inkColor: sealInkColor,
        borderStyle: sealBorderStyle,
        centerIcon: sealCenterIcon,
        backgroundColor: isTransparent ? "transparent" : bgColor
      });
    } catch {
      return "";
    }
  }, [sealType, sealData, sealTitle, sealSubtitle, sealSerial, sealDate, sealInkColor, sealBorderStyle, sealCenterIcon, isTransparent, bgColor]);

  // Batch Items & Live First Item Preview
  const parsedBatchItems = useMemo(() => {
    return parseBatchInput(batchText);
  }, [batchText]);

  const firstBatchItem = parsedBatchItems[0];

  const batchPreviewSvg = useMemo(() => {
    if (!firstBatchItem) return "";
    try {
      if (batchKind === "barcode") {
        return generateBarcodeSVG({
          format: barcodeFormat,
          data: firstBatchItem.data,
          lineColor: barcodeColor,
          lineColor2: barcodeColor2,
          style: barcodeStyle,
          headerText: barcodeHeader,
          footerText: barcodeFooter,
          background: isTransparent ? "transparent" : bgColor,
          width: barcodeWidth,
          height: barcodeHeight
        });
      }
      if (batchKind === "seal") {
        return generateSealSVG({
          type: sealType,
          data: firstBatchItem.data,
          titleText: sealTitle,
          subtitleText: sealSubtitle,
          serialNumber: firstBatchItem.name,
          dateText: sealDate,
          inkColor: sealInkColor,
          borderStyle: sealBorderStyle,
          centerIcon: sealCenterIcon,
          backgroundColor: isTransparent ? "transparent" : bgColor
        });
      }
      const renderer = new QRCodeRenderer({
        ...qrOptions,
        data: firstBatchItem.data
      });
      return renderer.render().svgString;
    } catch {
      return "";
    }
  }, [
    firstBatchItem,
    batchKind,
    barcodeFormat,
    barcodeColor,
    barcodeColor2,
    barcodeStyle,
    barcodeHeader,
    barcodeFooter,
    isTransparent,
    bgColor,
    barcodeWidth,
    barcodeHeight,
    sealType,
    sealTitle,
    sealSubtitle,
    sealDate,
    sealInkColor,
    sealBorderStyle,
    sealCenterIcon,
    qrOptions
  ]);

  // Copy handler
  const handleCopySvg = () => {
    const activeSvg =
      activeTab === "qr"
        ? qrSvg
        : activeTab === "seal"
        ? sealSvg
        : activeTab === "batch"
        ? (batchPreviewSvg || qrSvg)
        : barcodeSvg;
    navigator.clipboard.writeText(activeSvg);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Logo upload handler
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          setLogoUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Batch Export Handler
  const handleBatchDownload = async () => {
    const items = parseBatchInput(batchText);
    if (items.length === 0) {
      setBatchStatus(lang === "ar" ? "يرجى إدخال بيانات صالحة للتوليد" : "No valid items to export");
      return;
    }

    setIsBatchProcessing(true);
    setBatchStatus(
      lang === "ar"
        ? `جاري معالجة وتوليد ${items.length} عنصر...`
        : `Generating and bundling ${items.length} codes...`
    );

    try {
      const zip = new JSZip();

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        let svg = "";

        if (batchKind === "barcode") {
          svg = generateBarcodeSVG({
            format: barcodeFormat,
            data: item.data,
            lineColor: barcodeColor,
            lineColor2: barcodeColor2,
            style: barcodeStyle,
            headerText: barcodeHeader,
            footerText: barcodeFooter,
            background: isTransparent ? "transparent" : bgColor,
            width: barcodeWidth,
            height: barcodeHeight
          });
        } else if (batchKind === "seal") {
          svg = generateSealSVG({
            type: sealType,
            data: item.data,
            titleText: sealTitle,
            subtitleText: sealSubtitle,
            serialNumber: item.name,
            dateText: sealDate,
            inkColor: sealInkColor,
            borderStyle: sealBorderStyle,
            centerIcon: sealCenterIcon,
            backgroundColor: isTransparent ? "transparent" : bgColor
          });
        } else {
          const renderer = new QRCodeRenderer({
            ...qrOptions,
            data: item.data
          });
          svg = renderer.render().svgString;
        }

        if (batchAssetFormat === "png") {
          const canvas = await svgToCanvas(svg, 1200, 1200, isTransparent);
          const blob = await new Promise<Blob>((resolve, reject) => {
            canvas.toBlob((b) => {
              if (b) resolve(b);
              else reject(new Error("Canvas conversion error"));
            }, "image/png");
          });
          zip.file(`${item.name}.png`, blob);
        } else {
          zip.file(`${item.name}.svg`, svg);
        }
      }

      const content = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(content);
      const a = document.createElement("a");
      a.href = url;
      a.download = `omnicode-batch-${batchKind}-${items.length}.zip`;
      a.click();
      URL.revokeObjectURL(url);
      setBatchStatus(
        lang === "ar"
          ? `تم تحميل ${items.length} كود بنجاح في ملف ZIP!`
          : `Downloaded ${items.length} codes in ZIP!`
      );
    } catch (e: any) {
      setBatchStatus(`Error: ${e.message}`);
    } finally {
      setIsBatchProcessing(false);
    }
  };

  return (
    <div
      className="min-h-screen bg-slate-50 text-slate-900 selection:bg-emerald-100 selection:text-emerald-900"
      dir={lang === "ar" ? "rtl" : "ltr"}
    >
      <Header
        lang={lang}
        setLang={setLang}
        subtitle={t.subtitle}
      />

      {/* Main Tab Controls (Segmented Control) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6">
        <div className="inline-flex p-1 rounded-xl bg-slate-200/70 border border-slate-200 gap-1 shadow-inner">
          <button
            onClick={() => setActiveTab("qr")}
            className={`px-4 py-2 rounded-lg font-semibold text-xs sm:text-sm flex items-center gap-2 transition-all ${
              activeTab === "qr"
                ? "bg-white text-emerald-800 shadow-sm border border-slate-200/60 font-bold"
                : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
            }`}
          >
            <QrCode className="w-4 h-4 text-emerald-600" />
            {t.tabQr}
          </button>
          <button
            onClick={() => setActiveTab("barcode")}
            className={`px-4 py-2 rounded-lg font-semibold text-xs sm:text-sm flex items-center gap-2 transition-all ${
              activeTab === "barcode"
                ? "bg-white text-emerald-800 shadow-sm border border-slate-200/60 font-bold"
                : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
            }`}
          >
            <Barcode className="w-4 h-4 text-emerald-600" />
            {t.tabBarcode}
          </button>
          <button
            onClick={() => setActiveTab("seal")}
            className={`px-4 py-2 rounded-lg font-semibold text-xs sm:text-sm flex items-center gap-2 transition-all ${
              activeTab === "seal"
                ? "bg-white text-emerald-800 shadow-sm border border-slate-200/60 font-bold"
                : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
            }`}
          >
            <Award className="w-4 h-4 text-emerald-600" />
            {t.tabSeal}
          </button>
          <button
            onClick={() => setActiveTab("batch")}
            className={`px-4 py-2 rounded-lg font-semibold text-xs sm:text-sm flex items-center gap-2 transition-all ${
              activeTab === "batch"
                ? "bg-white text-emerald-800 shadow-sm border border-slate-200/60 font-bold"
                : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
            }`}
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            {t.tabBatch}
          </button>
          <button
            onClick={() => setActiveTab("scanner")}
            className={`px-4 py-2 rounded-lg font-semibold text-xs sm:text-sm flex items-center gap-2 transition-all ${
              activeTab === "scanner"
                ? "bg-white text-emerald-800 shadow-sm border border-slate-200/60 font-bold"
                : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
            }`}
          >
            <ScanLine className="w-4 h-4 text-emerald-600" />
            {t.scannerTab}
          </button>
        </div>
      </div>

      {/* Workspace */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Controls Column */}
        <div className="lg:col-span-7 space-y-6">
          {activeTab === "qr" && (
            <QRForm
              qrText={qrText}
              setQrText={setQrText}
              errorLevel={errorLevel}
              setErrorLevel={setErrorLevel}
              dotType={dotType}
              setDotType={setDotType}
              cornerSquareType={cornerSquareType}
              setCornerSquareType={setCornerSquareType}
              setCornerDotType={setCornerDotType}
              fgColor={fgColor}
              setFgColor={setFgColor}
              fgColor2={fgColor2}
              setFgColor2={setFgColor2}
              isGradient={isGradient}
              setIsGradient={setIsGradient}
              isTransparent={isTransparent}
              setIsTransparent={setIsTransparent}
              logoUrl={logoUrl}
              setLogoUrl={setLogoUrl}
              onLogoUpload={handleLogoUpload}
              lang={lang}
              t={t}
            />
          )}

          {activeTab === "barcode" && (
            <BarcodeForm
              barcodeFormat={barcodeFormat}
              setBarcodeFormat={setBarcodeFormat}
              barcodeData={barcodeData}
              setBarcodeData={setBarcodeData}
              barcodeColor={barcodeColor}
              setBarcodeColor={setBarcodeColor}
              barcodeColor2={barcodeColor2}
              setBarcodeColor2={setBarcodeColor2}
              barcodeStyle={barcodeStyle}
              setBarcodeStyle={setBarcodeStyle}
              barcodeHeader={barcodeHeader}
              setBarcodeHeader={setBarcodeHeader}
              barcodeFooter={barcodeFooter}
              setBarcodeFooter={setBarcodeFooter}
              barcodeWidth={barcodeWidth}
              setBarcodeWidth={setBarcodeWidth}
              barcodeHeight={barcodeHeight}
              setBarcodeHeight={setBarcodeHeight}
              barcodeValidation={barcodeValidation}
              t={t}
            />
          )}

          {activeTab === "seal" && (
            <SealForm
              sealType={sealType}
              setSealType={setSealType}
              titleText={sealTitle}
              setTitleText={setSealTitle}
              subtitleText={sealSubtitle}
              setSubtitleText={setSealSubtitle}
              serialNumber={sealSerial}
              setSerialNumber={setSealSerial}
              dateText={sealDate}
              setDateText={setSealDate}
              data={sealData}
              setData={setSealData}
              inkColor={sealInkColor}
              setInkColor={setSealInkColor}
              borderStyle={sealBorderStyle}
              setBorderStyle={setSealBorderStyle}
              centerIcon={sealCenterIcon}
              setCenterIcon={setSealCenterIcon}
              lang={lang}
              t={t}
            />
          )}

          {activeTab === "batch" && (
            <BatchPanel
              batchText={batchText}
              setBatchText={setBatchText}
              batchStatus={batchStatus}
              batchKind={batchKind}
              setBatchKind={setBatchKind}
              batchAssetFormat={batchAssetFormat}
              setBatchAssetFormat={setBatchAssetFormat}
              onBatchDownload={handleBatchDownload}
              isProcessing={isBatchProcessing}
              t={t}
              lang={lang}
            />
          )}

          {activeTab === "scanner" && (
            <ScannerPanel
              t={t}
              lang={lang}
              onLoadIntoQr={(text) => {
                setQrText(text);
                setActiveTab("qr");
              }}
              onLoadIntoBarcode={(data) => {
                setBarcodeData(data);
                setActiveTab("barcode");
              }}
            />
          )}
        </div>

        {/* Live Preview & Export Column */}
        <div className="lg:col-span-5 space-y-6">
          <PreviewPanel
            activeTab={activeTab}
            qrSvg={qrSvg}
            barcodeSvg={barcodeSvg}
            sealSvg={sealSvg}
            batchPreviewSvg={batchPreviewSvg}
            batchFirstItemName={firstBatchItem?.name}
            batchTotalCount={parsedBatchItems.length}
            onBatchDownload={handleBatchDownload}
            barcodeFormat={barcodeFormat}
            isBarcodeValid={barcodeValidation.isValid}
            isTransparent={isTransparent}
            scannability={scannability}
            t={t}
            onCopySvg={handleCopySvg}
            copied={copied}
          />
        </div>
      </main>
    </div>
  );
}
