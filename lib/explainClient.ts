"use client";

import { fitBudget, processImage, type Page } from "./image";
import type { DocType, Explanation, ExplainResponse, Lang } from "./types";

export type ExplainError = "busy" | "too_large" | "bad_image" | "generic";

/** Sends all pages in one request (Gemma 4 reads them together) and returns the checked result. */
export async function explainPages(pages: Page[], docType: DocType, lang: Lang): Promise<{ result: Explanation; model: string }> {
  const fitted = await fitBudget(pages);
  let res: Response;
  try {
    res = await fetch("/api/explain", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ images: fitted.map((p) => p.dataUrl), docType, lang }),
    });
  } catch {
    throw new Error("generic");
  }
  const data: ExplainResponse = await res.json().catch(() => ({ error: "generic" }));
  if (!res.ok || !data.result) {
    const e = data.error;
    throw new Error(e === "busy" || e === "too_large" || e === "bad_image" ? e : "generic");
  }
  return { result: data.result, model: data.model ?? "" };
}

/** Runs a bundled sample image through the exact same pipeline as a real photo. */
export async function samplePage(path: string): Promise<Page> {
  const blob = await (await fetch(path)).blob();
  return processImage(blob);
}
