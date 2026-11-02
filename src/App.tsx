import React, { useState, useMemo } from "react";
import {
  QrCode,
  Barcode,
  Layers,
  Sparkles,
  Download,
  Copy,
  Check,
  Palette,
  Image as ImageIcon,
  ShieldAlert,
  ShieldCheck,
  Globe,
  Sun,
  Moon,
  Upload,
  FileSpreadsheet
} from "lucide-react";
import { QRCodeOptions, DotType, CornerSquareType, CornerDotType, ErrorCorrectionLevel } from "./core/qr/types";
import { QRCodeRenderer } from "./core/qr/renderer";
import { validateScannability } from "./core/validator/scannability";
import { BarcodeFormat, BarcodeStyle, validateBarcodeData, generateBarcodeSVG } from "./core/barcode/generator";
import { exportSVG, exportRaster, exportPDF } from "./core/export";
import { DESIGN_PRESETS } from "./core/presets";
import { translations } from "./i18n/translations";
import JSZip from "jszip";

export function App() {
  const [lang, setLang] = useState<"en" | "ar">("ar");
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [activeTab, setActiveTab] = useState<"qr" | "barcode" | "batch">("qr");

  // Translation helper
  const t = translations[lang];

  // QR State
  const [qrText, setQrText] = useState("https://omnicode.studio");
  const [errorLevel, setErrorLevel] = useState<ErrorCorrectionLevel>("H");
  const [dotType, setDotType] = useState<DotType>("rounded");
  const [cornerSquareType, setCornerSquareType] = useState<CornerSquareType>("extra-rounded");
  const [cornerDotType, setCornerDotType] = useState<CornerDotType>("dot");
  const [fgColor, setFgColor] = useState("#10b981");
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

  // Batch State
  const [batchText, setBatchText] = useState("Item 1, https://site.com/1\nItem 2, https://site.com/2\nItem 3, https://site.com/3");
  const [batchStatus, setBatchStatus] = useState<string | null>(null);

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

  // Copy handler
  const handleCopySvg = () => {
    const activeSvg = activeTab === "qr" ? qrSvg : barcodeSvg;
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
    setBatchStatus("Processing bundle...");
    try {
      const zip = new JSZip();
      const lines = batchText.split("\n").map((l) => l.trim()).filter(Boolean);

      for (let i = 0; i < lines.length; i++) {
        const parts = lines[i].split(",");
        const name = (parts[0] || `code_${i + 1}`).trim();
        const data = (parts[1] || parts[0]).trim();

        const itemOpts: QRCodeOptions = {
          ...qrOptions,
          data
        };
        const renderer = new QRCodeRenderer(itemOpts);
        const svg = renderer.render().svgString;
        zip.file(`${name}.svg`, svg);
      }

      const content = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(content);
      const a = document.createElement("a");
      a.href = url;
      a.download = "omnicode-batch-bundle.zip";
      a.click();
      URL.revokeObjectURL(url);
      setBatchStatus(`Downloaded ${lines.length} codes in ZIP!`);
    } catch (e: any) {
      setBatchStatus(`Error: ${e.message}`);
    }
  };

  return (
    <div className={`min-h-screen ${theme === "dark" ? "dark bg-slate-950 text-slate-100" : "bg-slate-50 text-slate-900"} transition-colors duration-200`} dir={lang === "ar" ? "rtl" : "ltr"}>
      {/* Top Header */}
      <header className="border-b border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20 font-black text-xl">
              Ω
            </div>
            <div>
              <h1 className="font-bold text-lg leading-tight flex items-center gap-2">
                OmniCode Studio
                <span className="text-xs bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-2 py-0.5 rounded-full font-mono">v1.0.0</span>
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
                {t.subtitle}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setLang(lang === "en" ? "ar" : "en")}
              className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold flex items-center gap-1.5"
            >
              <Globe className="w-3.5 h-3.5" />
              {lang === "en" ? "العربية" : "English"}
            </button>
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
            >
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </header>

      {/* Main Tab Controls */}
      <div className="max-w-7xl mx-auto px-4 pt-6">
        <div className="flex gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
          <button
            onClick={() => setActiveTab("qr")}
            className={`px-4 py-2 rounded-lg font-semibold text-sm flex items-center gap-2 transition-all ${
              activeTab === "qr"
                ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <QrCode className="w-4 h-4" />
            {t.tabQr}
          </button>
          <button
            onClick={() => setActiveTab("barcode")}
            className={`px-4 py-2 rounded-lg font-semibold text-sm flex items-center gap-2 transition-all ${
              activeTab === "barcode"
                ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <Barcode className="w-4 h-4" />
            {t.tabBarcode}
          </button>
          <button
            onClick={() => setActiveTab("batch")}
            className={`px-4 py-2 rounded-lg font-semibold text-sm flex items-center gap-2 transition-all ${
              activeTab === "batch"
                ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            {t.tabBatch}
          </button>
        </div>
      </div>

      {/* Workspace */}
      <main className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Controls Column */}
        <div className="lg:col-span-7 space-y-6">
          {activeTab === "qr" && (
            <>
              {/* Presets Gallery */}
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                  {t.presets}
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {DESIGN_PRESETS.map((preset) => (
                    <button
                      key={preset.id}
                      onClick={() => {
                        if (preset.options.dotsOptions) {
                          setDotType(preset.options.dotsOptions.type);
                          if (preset.options.dotsOptions.colorOrGradient.gradient) {
                            setIsGradient(true);
                            setFgColor(preset.options.dotsOptions.colorOrGradient.gradient.colorStops[0].color);
                            setFgColor2(preset.options.dotsOptions.colorOrGradient.gradient.colorStops[1].color);
                          } else if (preset.options.dotsOptions.colorOrGradient.color) {
                            setIsGradient(false);
                            setFgColor(preset.options.dotsOptions.colorOrGradient.color);
                          }
                        }
                        if (preset.options.cornersSquareOptions) {
                          setCornerSquareType(preset.options.cornersSquareOptions.type);
                        }
                        if (preset.options.cornersDotOptions) {
                          setCornerDotType(preset.options.cornersDotOptions.type);
                        }
                      }}
                      className="p-3 text-start rounded-lg border border-slate-200 dark:border-slate-800 hover:border-emerald-500 text-xs transition-all bg-slate-50 dark:bg-slate-800/40"
                    >
                      <div className="font-bold">{lang === "ar" ? preset.nameAr : preset.name}</div>
                      <div className="text-[10px] text-slate-500 truncate mt-1">{preset.description}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Data Input */}
              <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 space-y-3">
                <label className="text-sm font-bold block">{t.content}</label>
                <textarea
                  value={qrText}
                  onChange={(e) => setQrText(e.target.value)}
                  placeholder="https://example.com or plain text payload..."
                  className="w-full h-24 p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 font-mono text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              {/* Design Controls */}
              <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 space-y-4">
                <h3 className="text-sm font-bold flex items-center gap-2">
                  <Layers className="w-4 h-4 text-emerald-500" />
                  {t.design}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs text-slate-500 block mb-1.5">{t.dotStyle}</label>
                    <select
                      value={dotType}
                      onChange={(e) => setDotType(e.target.value as DotType)}
                      className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs"
                    >
                      <option value="square">Square</option>
                      <option value="rounded">Rounded</option>
                      <option value="dots">Dots</option>
                      <option value="classy">Classy</option>
                      <option value="classy-rounded">Classy Rounded</option>
                      <option value="extra-rounded">Extra Rounded</option>
                      <option value="diamond">Diamond (جوهرة)</option>
                      <option value="star">Star (نجمة)</option>
                      <option value="horizontal-bars">Horizontal Bars (خطوط أفقية)</option>
                      <option value="vertical-bars">Vertical Bars (خطوط عمودية)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 block mb-1.5">{t.cornerStyle}</label>
                    <select
                      value={cornerSquareType}
                      onChange={(e) => setCornerSquareType(e.target.value as CornerSquareType)}
                      className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs"
                    >
                      <option value="square">Square</option>
                      <option value="rounded">Rounded</option>
                      <option value="extra-rounded">Extra Rounded</option>
                      <option value="dot">Circular Dot</option>
                      <option value="leaf">Leaf (ورقة شجر)</option>
                      <option value="diamond">Diamond (ماسة)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 block mb-1.5">{t.errorCorrection}</label>
                    <select
                      value={errorLevel}
                      onChange={(e) => setErrorLevel(e.target.value as ErrorCorrectionLevel)}
                      className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs"
                    >
                      <option value="L">L — 7% Restoration</option>
                      <option value="M">M — 15% Standard</option>
                      <option value="Q">Q — 25% High</option>
                      <option value="H">H — 30% Maximum (Recommended for Logos)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Color Customization */}
              <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 space-y-4">
                <h3 className="text-sm font-bold flex items-center gap-2">
                  <Palette className="w-4 h-4 text-emerald-500" />
                  {t.colors}
                </h3>
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-2">
                    <label className="text-xs text-slate-500">Color 1:</label>
                    <input
                      type="color"
                      value={fgColor}
                      onChange={(e) => setFgColor(e.target.value)}
                      className="w-8 h-8 rounded cursor-pointer bg-transparent border-0"
                    />
                  </div>
                  {isGradient && (
                    <div className="flex items-center gap-2">
                      <label className="text-xs text-slate-500">Color 2:</label>
                      <input
                        type="color"
                        value={fgColor2}
                        onChange={(e) => setFgColor2(e.target.value)}
                        className="w-8 h-8 rounded cursor-pointer bg-transparent border-0"
                      />
                    </div>
                  )}
                  <label className="flex items-center gap-2 text-xs cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isGradient}
                      onChange={(e) => setIsGradient(e.target.checked)}
                      className="rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    Linear Gradient
                  </label>
                  <label className="flex items-center gap-2 text-xs cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isTransparent}
                      onChange={(e) => setIsTransparent(e.target.checked)}
                      className="rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    Transparent BG
                  </label>
                </div>
              </div>

              {/* Logo Embedding */}
              <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 space-y-4">
                <h3 className="text-sm font-bold flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-emerald-500" />
                  {t.logo}
                </h3>
                <div className="flex items-center gap-4">
                  <label className="px-4 py-2 rounded-lg border border-dashed border-emerald-500 hover:bg-emerald-500/10 text-emerald-500 font-semibold text-xs flex items-center gap-2 cursor-pointer">
                    <Upload className="w-4 h-4" />
                    {t.uploadLogo}
                    <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                  </label>
                  {logoUrl && (
                    <button
                      onClick={() => setLogoUrl(undefined)}
                      className="px-3 py-2 rounded-lg border border-red-500/30 text-red-500 text-xs font-semibold hover:bg-red-500/10"
                    >
                      {t.removeLogo}
                    </button>
                  )}
                </div>
              </div>
            </>
          )}

          {activeTab === "barcode" && (
            <div className="space-y-4">
              {/* Presets & Style Selection */}
              <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 space-y-4">
                <h3 className="text-sm font-bold flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-500" />
                  {t.barcodeStyle}
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: "classic", label: t.barcodeStyleClassic, badge: "Print & POS" },
                    { id: "rounded", label: t.barcodeStyleRounded, badge: "Modern" },
                    { id: "pill", label: t.barcodeStylePill, badge: "Soft Capsule" },
                    { id: "gradient", label: t.barcodeStyleGradient, badge: "Vector Art" },
                    { id: "thermal-label", label: t.barcodeStyleThermal, badge: "Industrial Label" },
                    { id: "price-tag", label: t.barcodeStylePriceTag, badge: "Retail Shelf" },
                    { id: "badge-frame", label: t.barcodeStyleBadge, badge: "Ticket Pass" },
                    { id: "minimal", label: t.barcodeStyleMinimal, badge: "Clean Editorial" }
                  ].map((s) => (
                    <button
                      key={s.id}
                      onClick={() => setBarcodeStyle(s.id as BarcodeStyle)}
                      className={`p-2.5 rounded-lg border text-start transition-all ${
                        barcodeStyle === s.id
                          ? "border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold"
                          : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 text-xs"
                      }`}
                    >
                      <div className="font-semibold text-xs leading-snug">{s.label}</div>
                      <span className="text-[10px] text-slate-400 font-mono block mt-1">{s.badge}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Data & Symbology Standard */}
              <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 space-y-4">
                <h3 className="text-sm font-bold flex items-center gap-2">
                  <Barcode className="w-4 h-4 text-emerald-500" />
                  {t.content}
                </h3>
                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-slate-500 block mb-1">{t.barcodeFormat}</label>
                      <select
                        value={barcodeFormat}
                        onChange={(e) => setBarcodeFormat(e.target.value as BarcodeFormat)}
                        className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs font-bold"
                      >
                        <option value="CODE128">CODE128 (Universal Logistics)</option>
                        <option value="EAN13">EAN-13 (Standard Retail Packaging)</option>
                        <option value="EAN8">EAN-8 (Compact Grocery / Small Item)</option>
                        <option value="UPC">UPC-A (North America Consumer Goods)</option>
                        <option value="CODE39">CODE39 (Defense, Automotive, Asset ID)</option>
                        <option value="ITF14">ITF-14 (Master Corrugated Cartons)</option>
                        <option value="pharmacode">Pharmacode (Pharmaceutical Verification)</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs text-slate-500 block mb-1">{t.barcodeData}</label>
                      <input
                        type="text"
                        value={barcodeData}
                        onChange={(e) => setBarcodeData(e.target.value)}
                        className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 font-mono text-sm"
                      />
                    </div>
                  </div>

                  {!barcodeValidation.isValid && (
                    <div className="text-xs text-red-500 flex items-center gap-1.5 p-2 rounded-lg bg-red-500/10 border border-red-500/20">
                      <ShieldAlert className="w-4 h-4 shrink-0" />
                      <span>{barcodeValidation.error}</span>
                    </div>
                  )}

                  {/* Header / Footer text for frames (Thermal, Price Tag, Badge) */}
                  {(barcodeStyle === "thermal-label" || barcodeStyle === "price-tag" || barcodeStyle === "badge-frame") && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-200 dark:border-slate-800">
                      <div>
                        <label className="text-xs text-slate-500 block mb-1">{t.headerLabel}</label>
                        <input
                          type="text"
                          value={barcodeHeader}
                          onChange={(e) => setBarcodeHeader(e.target.value)}
                          placeholder="e.g. PRIORITY AIR SHIPMENT #892"
                          className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs font-medium"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-slate-500 block mb-1">{t.footerLabel}</label>
                        <input
                          type="text"
                          value={barcodeFooter}
                          onChange={(e) => setBarcodeFooter(e.target.value)}
                          placeholder="e.g. UNIT PRICE: $49.00 / CARRIER VERIFIED"
                          className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs font-medium"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Geometry & Color Engine */}
              <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 space-y-4">
                <h3 className="text-sm font-bold flex items-center gap-2">
                  <Palette className="w-4 h-4 text-emerald-500" />
                  {t.colors} & Dimensions
                </h3>
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-2">
                    <label className="text-xs text-slate-500">Bar Color:</label>
                    <input
                      type="color"
                      value={barcodeColor}
                      onChange={(e) => setBarcodeColor(e.target.value)}
                      className="w-8 h-8 rounded cursor-pointer bg-transparent border-0"
                    />
                  </div>
                  {barcodeStyle === "gradient" && (
                    <div className="flex items-center gap-2">
                      <label className="text-xs text-slate-500">Gradient Stop 2:</label>
                      <input
                        type="color"
                        value={barcodeColor2}
                        onChange={(e) => setBarcodeColor2(e.target.value)}
                        className="w-8 h-8 rounded cursor-pointer bg-transparent border-0"
                      />
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <label className="text-xs text-slate-500">Bar Density:</label>
                    <select
                      value={barcodeWidth}
                      onChange={(e) => setBarcodeWidth(Number(e.target.value))}
                      className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs font-medium"
                    >
                      <option value="1">1px (Compact)</option>
                      <option value="2">2px (Standard Print)</option>
                      <option value="3">3px (Large Carton)</option>
                      <option value="4">4px (Billboard / Shelf)</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-xs text-slate-500">Height:</label>
                    <select
                      value={barcodeHeight}
                      onChange={(e) => setBarcodeHeight(Number(e.target.value))}
                      className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs font-medium"
                    >
                      <option value="60">60px (Small)</option>
                      <option value="90">90px (Standard)</option>
                      <option value="120">120px (Tall)</option>
                      <option value="160">160px (Extra Tall)</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "batch" && (
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
                onClick={handleBatchDownload}
                className="w-full py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                {t.batchDownloadZip}
              </button>
              {batchStatus && (
                <div className="text-xs font-semibold text-emerald-500 text-center">{batchStatus}</div>
              )}
            </div>
          )}
        </div>

        {/* Live Preview & Export Column */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 shadow-xl flex flex-col items-center sticky top-24">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 w-full text-center">
              {t.livePreview}
            </h3>

            {/* Display Canvas */}
            <div className="p-4 rounded-xl bg-white shadow-inner border border-slate-100 max-w-full overflow-hidden flex items-center justify-center min-h-[300px]">
              {activeTab === "qr" && (
                <div dangerouslySetInnerHTML={{ __html: qrSvg }} className="w-64 h-64 flex items-center justify-center" />
              )}
              {activeTab === "barcode" && (
                barcodeValidation.isValid ? (
                  <div dangerouslySetInnerHTML={{ __html: barcodeSvg }} className="max-w-full overflow-x-auto" />
                ) : (
                  <div className="text-red-500 text-xs font-bold text-center py-8">
                    Invalid input for {barcodeFormat}
                  </div>
                )
              )}
              {activeTab === "batch" && (
                <div className="text-center py-12 text-slate-400 text-xs font-medium">
                  Batch mode active. Previewing first payload:
                  <div dangerouslySetInnerHTML={{ __html: qrSvg }} className="w-48 h-48 mx-auto mt-4" />
                </div>
              )}
            </div>

            {/* Scannability Health Bar (QR only) */}
            {activeTab === "qr" && (
              <div className="w-full mt-5 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-500 flex items-center gap-1.5">
                    {scannability.isScannable ? (
                      <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <ShieldAlert className="w-4 h-4 text-red-500" />
                    )}
                    {t.scannabilityScore}:
                  </span>
                  <span className={`font-mono font-bold ${scannability.isScannable ? "text-emerald-500" : "text-red-500"}`}>
                    {scannability.score}% ({scannability.contrastRatio}:1)
                  </span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${scannability.score > 70 ? "bg-emerald-500" : scannability.score > 40 ? "bg-amber-500" : "bg-red-500"}`}
                    style={{ width: `${scannability.score}%` }}
                  />
                </div>
                {scannability.warnings.map((w, idx) => (
                  <div key={idx} className="text-[11px] text-amber-500 dark:text-amber-400 flex items-start gap-1">
                    <span>⚠</span>
                    <span>{w}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Export Actions */}
            <div className="w-full mt-6 grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  const targetSvg = activeTab === "qr" ? qrSvg : barcodeSvg;
                  exportRaster(targetSvg, "png", { filename: "omnicode.png", transparent: isTransparent });
                }}
                className="py-2.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20"
              >
                <Download className="w-3.5 h-3.5" />
                PNG (1200px)
              </button>
              <button
                onClick={() => {
                  const targetSvg = activeTab === "qr" ? qrSvg : barcodeSvg;
                  exportSVG(targetSvg, "omnicode.svg");
                }}
                className="py-2.5 px-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold text-xs flex items-center justify-center gap-2"
              >
                <Download className="w-3.5 h-3.5" />
                SVG Vector
              </button>
              <button
                onClick={() => {
                  const targetSvg = activeTab === "qr" ? qrSvg : barcodeSvg;
                  exportPDF(targetSvg, "omnicode.pdf");
                }}
                className="py-2.5 px-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold text-xs flex items-center justify-center gap-2"
              >
                <Download className="w-3.5 h-3.5" />
                Print PDF
              </button>
              <button
                onClick={handleCopySvg}
                className="py-2.5 px-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold text-xs flex items-center justify-center gap-2"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? t.copied : t.copySvg}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
