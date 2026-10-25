/** Gemma 4 through the Gemini API (plain REST, no SDK). */

const BASE = "https://generativelanguage.googleapis.com/v1beta";
const DEFAULT_MODELS = "gemma-4-26b-a4b-it,gemma-4-31b-it";

export class GemmaError extends Error {
  constructor(message: string, public status = 502) {
    super(message);
  }
}

export type InputPart = { text: string } | { inline_data: { mime_type: string; data: string } };
export type Turn = { role: "user" | "model"; parts: InputPart[] };

interface OutputPart {
  text?: string;
  thought?: boolean;
}

async function callModel(model: string, system: string, contents: Turn[], json: boolean,
  signal: AbortSignal): Promise<string> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new GemmaError("Server is missing GEMINI_API_KEY", 500);

  const res = await fetch(`${BASE}/models/${model}:generateContent`, {
    method: "POST",
    // Key in a header, not the URL, so it never lands in logs.
    headers: { "Content-Type": "application/json", "x-goog-api-key": key },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: system }] },
      contents,
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 8192,
        ...(json ? { responseMimeType: "application/json" } : {}),
        thinkingConfig: { thinkingLevel: "minimal" },
      },
    }),
    signal,
  });

  if (!res.ok) {
    const detail = (await res.text()).slice(0, 300);
    throw new GemmaError(`${model} ${res.status}: ${detail}`, res.status);
  }
  const data = await res.json();
  const parts: OutputPart[] = data?.candidates?.[0]?.content?.parts ?? [];
  // Gemma 4 returns its reasoning as separate `thought` parts; keep only the answer.
  const text = parts.filter((p) => !p.thought && p.text).map((p) => p.text).join("");
  if (!text.trim()) throw new GemmaError(`${model} returned an empty answer`);
  return text;
}

/** Tries each configured model in order; returns the answer text and which model produced it. */
export async function generate(system: string, contents: Turn[], { json = false } = {}) {
  const models = (process.env.GEMMA_MODELS || DEFAULT_MODELS).split(",").map((m) => m.trim()).filter(Boolean);
  let lastError: unknown;
  for (const model of models) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 55_000);
    try {
      const text = await callModel(model, system, contents, json, controller.signal);
      return { text, model };
    } catch (e) {
      lastError = e;
      console.error("[gemma]", e instanceof Error ? e.message : e);
    } finally {
      clearTimeout(timer);
    }
  }
  throw lastError instanceof GemmaError ? lastError : new GemmaError("Gemma 4 is not reachable right now");
}
