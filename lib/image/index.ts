/**
 * In-browser image pipeline. The original photo never leaves this function: we decode it (EXIF orientation
 * applied), re-encode a smaller JPEG for Gemma 4, run quick quality checks, and drop the original.
 */
export type QualityWarning = "blurry" | "dark" | "bright" | "small";

export interface Page {
  id: string;
  dataUrl: string; // JPEG data URL sent to Gemma
  bytes: number;
  width: number;
  height: number;
  warnings: QualityWarning[];
}

const LONG_EDGE = 1600;
const TARGET_BYTES = 1.5 * 1024 * 1024;
/** All pages together must fit in one request (Vercel's body limit is about 4.5 MB). */
export const TOTAL_BUDGET = 3.6 * 1024 * 1024;

async function decode(src: Blob): Promise<ImageBitmap | HTMLImageElement> {
  if (typeof createImageBitmap === "function") {
    try {
      return await createImageBitmap(src, { imageOrientation: "from-image" });
    } catch {
      // fall through to <img>, which also honours EXIF orientation in current browsers
    }
  }
  const url = URL.createObjectURL(src);
  try {
    return await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error("not_an_image"));
      img.src = url;
    });
  } finally {
    URL.revokeObjectURL(url);
  }
}

const dims = (img: ImageBitmap | HTMLImageElement) =>
  "naturalWidth" in img ? { w: img.naturalWidth, h: img.naturalHeight } : { w: img.width, h: img.height };

function draw(img: CanvasImageSource, w: number, h: number, longEdge: number): HTMLCanvasElement {
  const scale = Math.min(1, longEdge / Math.max(w, h));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(w * scale));
  canvas.height = Math.max(1, Math.round(h * scale));
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("not_an_image");
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  return canvas;
}

const bytesOf = (dataUrl: string) => Math.round(((dataUrl.length - dataUrl.indexOf(",") - 1) * 3) / 4);

function encode(canvas: HTMLCanvasElement, target = TARGET_BYTES): string {
  let quality = 0.85;
  let out = canvas.toDataURL("image/jpeg", quality);
  while (bytesOf(out) > target && quality > 0.5) {
    quality -= 0.1;
    out = canvas.toDataURL("image/jpeg", quality);
  }
  return out;
}

/** Blur (variance of a Laplacian) and brightness on a small greyscale copy. Heuristics, not verdicts. */
function checkQuality(img: CanvasImageSource, w: number, h: number): QualityWarning[] {
  const warnings: QualityWarning[] = [];
  if (Math.min(w, h) < 600) warnings.push("small");
  const small = draw(img, w, h, 320);
  const ctx = small.getContext("2d");
  if (!ctx) return warnings;
  const { data, width, height } = ctx.getImageData(0, 0, small.width, small.height);
  const grey = new Float32Array(width * height);
  let sum = 0;
  for (let i = 0; i < grey.length; i++) {
    const g = 0.299 * data[i * 4] + 0.587 * data[i * 4 + 1] + 0.114 * data[i * 4 + 2];
    grey[i] = g;
    sum += g;
  }
  const mean = sum / grey.length;
  if (mean < 70) warnings.push("dark");
  else if (mean > 235) warnings.push("bright");
  let lapSum = 0;
  let lapSq = 0;
  let n = 0;
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const i = y * width + x;
      const lap = grey[i - width] + grey[i + width] + grey[i - 1] + grey[i + 1] - 4 * grey[i];
      lapSum += lap;
      lapSq += lap * lap;
      n++;
    }
  }
  const variance = n ? lapSq / n - (lapSum / n) ** 2 : 0;
  if (variance < 60) warnings.push("blurry");
  return warnings;
}

export async function processImage(src: Blob): Promise<Page> {
  const img = await decode(src);
  const { w, h } = dims(img);
  const canvas = draw(img, w, h, LONG_EDGE);
  const warnings = checkQuality(img, w, h);
  const dataUrl = encode(canvas);
  if ("close" in img) img.close();
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    dataUrl,
    bytes: bytesOf(dataUrl),
    width: canvas.width,
    height: canvas.height,
    warnings,
  };
}

/** Re-encodes pages smaller until they fit in one request together. */
export async function fitBudget(pages: Page[]): Promise<Page[]> {
  const total = pages.reduce((s, p) => s + p.bytes, 0);
  if (total <= TOTAL_BUDGET) return pages;
  const each = TOTAL_BUDGET / pages.length;
  const out: Page[] = [];
  for (const p of pages) {
    if (p.bytes <= each) {
      out.push(p);
      continue;
    }
    const img = await decode(await (await fetch(p.dataUrl)).blob());
    const { w, h } = dims(img);
    const dataUrl = encode(draw(img, w, h, 1400), each);
    out.push({ ...p, dataUrl, bytes: bytesOf(dataUrl) });
  }
  return out;
}
