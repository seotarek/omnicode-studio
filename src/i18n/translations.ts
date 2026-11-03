export interface Translations {
  title: string;
  subtitle: string;
  tabQr: string;
  tabBarcode: string;
  tabBatch: string;
  content: string;
  design: string;
  colors: string;
  logo: string;
  presets: string;
  livePreview: string;
  scannabilityScore: string;
  download: string;
  exportPng: string;
  exportSvg: string;
  exportPdf: string;
  exportWebp: string;
  copySvg: string;
  copyImage: string;
  copied: string;
  dotStyle: string;
  cornerStyle: string;
  errorCorrection: string;
  highContrast: string;
  lowContrastWarning: string;
  uploadLogo: string;
  removeLogo: string;
  barcodeFormat: string;
  barcodeData: string;
  batchCsvTitle: string;
  batchUploadBtn: string;
  batchDownloadZip: string;
  historyTitle: string;
  clearHistory: string;
  barcodeStyle: string;
  barcodeStyleClassic: string;
  barcodeStyleRounded: string;
  barcodeStylePill: string;
  barcodeStyleGradient: string;
  barcodeStyleBadge: string;
  barcodeStyleMinimal: string;
  barcodeStyleThermal: string;
  barcodeStylePriceTag: string;
  headerLabel: string;
  footerLabel: string;
  enterpriseStandards: string;
  payloadModeText: string;
  payloadModeGs1: string;
  payloadModeZatca: string;
  payloadModeEpc: string;
  payloadModeWifi: string;
  payloadModeVcard: string;
  autoFixCheckDigit: string;
  scannerTab: string;
  scannerDropTitle: string;
  scannerDropSubtitle: string;
  scannerPasteHint: string;
  decodedResult: string;
  openInQrStudio: string;
  openInBarcodeStudio: string;
  copyDecodedText: string;
  tabSeal: string;
  sealType: string;
  sealTypeRadial: string;
  sealTypeBullseye: string;
  sealTypeOfficial: string;
  sealTypeNotary: string;
  borderStyleLabel: string;
  borderStyleScalloped: string;
  borderStyleDoubleRing: string;
  borderStyleCogwheel: string;
  borderStyleGuilloche: string;
  borderStyleSolid: string;
  titleTextLabel: string;
  subtitleTextLabel: string;
  serialNumberLabel: string;
  dateLabel: string;
  centerIconLabel: string;
  inkColorLabel: string;
  sealPresetsTitle: string;
}

export const translations: Record<"en" | "ar", Translations> = {
  en: {
    title: "OmniCode Studio",
    subtitle: "Enterprise QR Code & Barcode Generation Ecosystem — 100% Client-Side",
    tabQr: "QR Code Studio",
    tabBarcode: "Barcode Studio",
    tabBatch: "Batch Generator",
    content: "Content & Data",
    design: "Shape & Structure",
    colors: "Color & Gradients",
    logo: "Branding & Logo",
    presets: "Templates & Presets",
    livePreview: "Live Vector Preview",
    scannabilityScore: "Scannability Health Score",
    download: "Download Asset",
    exportPng: "Export High-Res PNG",
    exportSvg: "Export Scalable Vector (SVG)",
    exportPdf: "Export Print-Ready PDF",
    exportWebp: "Export WebP",
    copySvg: "Copy SVG Code",
    copyImage: "Copy Image to Clipboard",
    copied: "Copied!",
    dotStyle: "Body Dot Pattern",
    cornerStyle: "Corner Eyes Style",
    errorCorrection: "Error Correction Level",
    highContrast: "High Contrast Verified",
    lowContrastWarning: "Low contrast detected! May affect readability.",
    uploadLogo: "Upload Brand Logo (PNG/SVG)",
    removeLogo: "Remove Logo",
    barcodeFormat: "Barcode Symbology Standard",
    barcodeData: "Barcode Numeric/Alpha Value",
    batchCsvTitle: "Batch Generation from CSV / Plain Text",
    batchUploadBtn: "Select CSV File",
    batchDownloadZip: "Export All as ZIP Bundle",
    historyTitle: "Recent Generations (Local)",
    clearHistory: "Clear History",
    barcodeStyle: "Barcode Visual Presentation Style",
    barcodeStyleClassic: "Standard Rectangle (Industrial)",
    barcodeStyleRounded: "Modern Rounded Bars",
    barcodeStylePill: "Full Pill Capsule Bars",
    barcodeStyleGradient: "Two-Tone Gradient Bars",
    barcodeStyleBadge: "Verification Badge Frame",
    barcodeStyleMinimal: "Minimalist Typography",
    barcodeStyleThermal: "Thermal Warehouse Shipping Label",
    barcodeStylePriceTag: "Retail Shelf Price Tag",
    headerLabel: "Header Banner Text",
    footerLabel: "Footer Note / Subtext",
    enterpriseStandards: "Enterprise Payload Standards",
    payloadModeText: "URL / Plain Text",
    payloadModeGs1: "GS1 Digital Link 2027",
    payloadModeZatca: "Saudi ZATCA E-Invoice",
    payloadModeEpc: "SEPA Bank Transfer (EPC)",
    payloadModeWifi: "WiFi Network",
    payloadModeVcard: "Contact Card (vCard)",
    autoFixCheckDigit: "Auto-Fix Check Digit",
    scannerTab: "Optical Scanner & Verifier",
    scannerDropTitle: "Drag & Drop Image or Click to Scan",
    scannerDropSubtitle: "Instant decoding for QR Code, Data Matrix, Aztec, PDF417, EAN-13, Code 128 & UPC",
    scannerPasteHint: "Or paste an image directly from clipboard (Ctrl+V)",
    decodedResult: "Decoded Payload & Standards Analysis",
    openInQrStudio: "Open in QR Studio",
    openInBarcodeStudio: "Open in Barcode Studio",
    copyDecodedText: "Copy Decoded Payload",
    tabSeal: "Circular Seals & Barcodes",
    sealType: "Seal & Circular Barcode Geometry",
    sealTypeRadial: "Radial Spoke Barcode (360° Sunburst)",
    sealTypeBullseye: "Concentric Ring Barcode (Bullseye)",
    sealTypeOfficial: "Official Document Verification Seal",
    sealTypeNotary: "Security Notarization Stamp",
    borderStyleLabel: "Outer Perimeter Border Style",
    borderStyleScalloped: "Embossed Scalloped Rosette",
    borderStyleDoubleRing: "Royal Double-Ring Border",
    borderStyleCogwheel: "Geometric Notched Cogwheel",
    borderStyleGuilloche: "Guilloche Security Lattice",
    borderStyleSolid: "Classic Solid Ring",
    titleTextLabel: "Upper Perimeter Curved Text",
    subtitleTextLabel: "Lower Perimeter Curved Text",
    serialNumberLabel: "Verification / Document Serial No.",
    dateLabel: "Certification Date / Timestamp",
    centerIconLabel: "Center Security Emblem",
    inkColorLabel: "Traditional Seal Ink Palette",
    sealPresetsTitle: "Official Notary & Seal Presets"
  },
  ar: {
    title: "أومني كود ستوديو",
    subtitle: "المنظومة الهندسية المتكاملة لتصميم وتوليد أكواد الـ QR والباركود — محلياً 100%",
    tabQr: "استوديو QR Code",
    tabBarcode: "استوديو الباركود",
    tabBatch: "التوليد الجماعي",
    content: "المحتوى والبيانات",
    design: "الأشكال والهيكل",
    colors: "الألوان والتدرجات",
    logo: "الشعار والهوية",
    presets: "القوالب الجاهزة",
    livePreview: "المعاينة الحية الفورية",
    scannabilityScore: "مؤشر قابلية المسح والوضوح",
    download: "تنزيل الملف",
    exportPng: "تصدير PNG عالي الدقة",
    exportSvg: "تصدير فكتور أصيل (SVG)",
    exportPdf: "تصدير PDF جاهز للطباعة",
    exportWebp: "تصدير WebP",
    copySvg: "نسخ كود الـ SVG",
    copyImage: "نسخ الصورة للحافظة",
    copied: "تم النسخ!",
    dotStyle: "نمط نقاط الكود",
    cornerStyle: "نمط زوايا التحديد",
    errorCorrection: "مستوى تصحيح الأخطاء",
    highContrast: "تباين ألوان ممتاز ومعتمد",
    lowContrastWarning: "تباين الألوان ضعيف! قد يصعب قراءته.",
    uploadLogo: "رفع شعار المؤسسة (PNG/SVG)",
    removeLogo: "إزالة الشعار",
    barcodeFormat: "معيار الباركود (Symbology)",
    barcodeData: "قيمة الباركود",
    batchCsvTitle: "التوليد الجماعي من ملف CSV",
    batchUploadBtn: "اختيار ملف CSV",
    batchDownloadZip: "تحميل كافة الأكواد في ملف ZIP",
    historyTitle: "السجل المحلي الأخير",
    clearHistory: "مسح السجل",
    barcodeStyle: "شكل ونمط تصميم الباركود",
    barcodeStyleClassic: "مستطيل قياسي (صناعي وطباعة)",
    barcodeStyleRounded: "أعمدة دائرية الحواف (عصري)",
    barcodeStylePill: "أعمدة كبسولية ناعمة (Pill)",
    barcodeStyleGradient: "تدرج لوني انسيابي (Gradient)",
    barcodeStyleBadge: "إطار تذكرة واعتماد (Badge)",
    barcodeStyleMinimal: "تصميم أنيق بسيط (Minimal)",
    barcodeStyleThermal: "ملصق بوليصة شحن حرارية للمستودعات",
    barcodeStylePriceTag: "بطاقة سعر وتجزئة للمتاجر (Shelf Tag)",
    headerLabel: "نص الترويسة / العنوان العلوي",
    footerLabel: "نص التذييل / الملاحظة السفلية",
    enterpriseStandards: "معايير الترميز والفوترة المعتمدة",
    payloadModeText: "رابط أو نص حر",
    payloadModeGs1: "معيار التجزئة GS1 Digital Link",
    payloadModeZatca: "فاتورة الزكاة والضريبة (ZATCA)",
    payloadModeEpc: "تحويل بنكي مباشر (EPC SEPA)",
    payloadModeWifi: "شبكة واي فاي (WiFi)",
    payloadModeVcard: "بطاقة اتصال (vCard)",
    autoFixCheckDigit: "إصلاح Check Digit تلقائياً",
    scannerTab: "الماسح الضوئي وفاحص الأكواد",
    scannerDropTitle: "اسحب وأفلت صورة أو انقر للمسح",
    scannerDropSubtitle: "فحص فوري لأكواد QR، داتا ماتركس، Aztec، PDF417، EAN-13، Code 128 وUPC",
    scannerPasteHint: "أو الصق صورة مباشرة من الحافظة (Ctrl+V)",
    decodedResult: "نتيجة الكود وتحليل المعايير الفنية",
    openInQrStudio: "فتح في محرر QR",
    openInBarcodeStudio: "فتح في محرر الباركود",
    copyDecodedText: "نسخ النص المفحوص",
    tabSeal: "أختام التوثيق والباركود الدائري",
    sealType: "شكل الختم والباركود الدائري",
    sealTypeRadial: "باركود الأشعة الدائري (360° Sunburst)",
    sealTypeBullseye: "باركود الحلقات الدائرية (Bullseye)",
    sealTypeOfficial: "ختم الاعتماد والتوثيق الرسمي",
    sealTypeNotary: "ختم توثيق المستندات المعتمدة",
    borderStyleLabel: "شكل الإطار الخارجي للختم",
    borderStyleScalloped: "حواف مسننة كلاسيكية (Scalloped Rosette)",
    borderStyleDoubleRing: "إطار ملكي دائري مزدوج",
    borderStyleCogwheel: "إطار مسنن هندسي (Cogwheel)",
    borderStyleGuilloche: "شبكة أمان هندسية (Guilloche)",
    borderStyleSolid: "إطار دائري مصمت كلاسيكي",
    titleTextLabel: "النص الدائري العلوي (مسار مقوس)",
    subtitleTextLabel: "النص الدائري السفلي (مسار مقوس)",
    serialNumberLabel: "رقم التحقق أو القيد التسلسلي",
    dateLabel: "تاريخ الاعتماد / الصلاحية",
    centerIconLabel: "رمز الأمان والتوثيق المركزي",
    inkColorLabel: "لون حبر الختم المعتمد",
    sealPresetsTitle: "نماذج الأختام والتوثيق المعتمدة"
  }
};
