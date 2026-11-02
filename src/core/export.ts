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
  desiredWidth?: number,
  desiredHeight?: number,
  transparent = false
): Promise<HTMLCanvasElement> {
  return new Promise((resolve, reject) => {
    // Parse natural SVG dimensions or viewBox
    const parser = new DOMParser();
    const doc = parser.parseFromString(svgString, "image/svg+xml");
    const svgEl = doc.querySelector("svg");

    let naturalW = 400;
    let naturalH = 400;

    if (svgEl) {
      const wAttr = svgEl.getAttribute("width");
      const hAttr = svgEl.getAttribute("height");
      const viewBox = svgEl.getAttribute("viewBox");

      if (wAttr && hAttr) {
        naturalW = parseFloat(wAttr) || 400;
        naturalH = parseFloat(hAttr) || 400;
      } else if (viewBox) {
        const parts = viewBox.split(/[ ,]+/).map(Number);
        if (parts.length === 4 && parts[2] > 0 && parts[3] > 0) {
          naturalW = parts[2];
          naturalH = parts[3];
        }
      }
    }

    // Scale proportionally to high-res (e.g. 1200 max dimension)
    const targetMax = Math.max(desiredWidth || 1200, desiredHeight || 1200);
    const scale = naturalW >= naturalH ? targetMax / naturalW : targetMax / naturalH;
    const finalWidth = desiredWidth && desiredHeight ? desiredWidth : Math.round(naturalW * scale);
    const finalHeight = desiredWidth && desiredHeight ? desiredHeight : Math.round(naturalH * scale);

    const canvas = document.createElement("canvas");
    canvas.width = finalWidth;
    canvas.height = finalHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return reject(new Error("Cannot create canvas context"));

    if (!transparent) {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, finalWidth, finalHeight);
    }

    const img = new Image();
    const svgBlob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(svgBlob);

    img.onload = () => {
      ctx.drawImage(img, 0, 0, finalWidth, finalHeight);
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
  const filename = options.filename || `omnicode.${format}`;
  const canvas = await svgToCanvas(svgString, options.width, options.height, format === "png" && options.transparent);

  const mime = format === "jpeg" ? "image/jpeg" : format === "webp" ? "image/webp" : "image/png";
  canvas.toBlob((blob) => {
    if (blob) downloadBlob(blob, filename);
  }, mime, 0.95);
}

export async function exportPDF(svgString: string, filename = "omnicode.pdf") {
  const canvas = await svgToCanvas(svgString, undefined, undefined, false);
  const imgData = canvas.toDataURL("image/png");
  const aspect = canvas.width / canvas.height;

  const isWide = aspect > 1.2;
  const pageW = isWide ? 150 : 120;
  const pageH = isWide ? Math.round(150 / aspect) + 20 : 120;

  const pdf = new jsPDF({
    orientation: isWide ? "landscape" : "portrait",
    unit: "mm",
    format: [pageW, pageH]
  });

  const renderW = pageW - 20;
  const renderH = renderW / aspect;
  const topPad = (pageH - renderH) / 2;

  pdf.addImage(imgData, "PNG", 10, topPad, renderW, renderH);
  pdf.save(filename);
}
