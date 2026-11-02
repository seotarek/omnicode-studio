import { jsPDF } from "jspdf";

export interface ExportOptions {
  filename?: string;
  width?: number;
  height?: number;
  transparent?: boolean;
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function exportSVG(svgString: string, filename = "omnicode.svg") {
  const blob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
  downloadBlob(blob, filename);
}

export async function svgToCanvas(
  svgString: string,
  width: number,
  height: number,
  transparent = false
): Promise<HTMLCanvasElement> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return reject(new Error("Cannot create canvas context"));

    if (!transparent) {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, width, height);
    }

    const img = new Image();
    const svgBlob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(svgBlob);

    img.onload = () => {
      ctx.drawImage(img, 0, 0, width, height);
      URL.revokeObjectURL(url);
      resolve(canvas);
    };

    img.onerror = (e) => {
      URL.revokeObjectURL(url);
      reject(e);
    };

    img.src = url;
  });
}

export async function exportRaster(
  svgString: string,
  format: "png" | "jpeg" | "webp",
  options: ExportOptions = {}
) {
  const width = options.width || 1200;
  const height = options.height || 1200;
  const filename = options.filename || `omnicode.${format}`;
  const canvas = await svgToCanvas(svgString, width, height, format === "png" && options.transparent);

  const mime = format === "jpeg" ? "image/jpeg" : format === "webp" ? "image/webp" : "image/png";
  canvas.toBlob((blob) => {
    if (blob) downloadBlob(blob, filename);
  }, mime, 0.95);
}

export async function exportPDF(svgString: string, filename = "omnicode.pdf", sizeMm = 100) {
  const canvas = await svgToCanvas(svgString, 1200, 1200, false);
  const imgData = canvas.toDataURL("image/png");

  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: [sizeMm + 20, sizeMm + 20]
  });

  pdf.addImage(imgData, "PNG", 10, 10, sizeMm, sizeMm);
  pdf.save(filename);
}
