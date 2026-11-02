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
    clearHistory: "Clear History"
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
    clearHistory: "مسح السجل"
  }
};
