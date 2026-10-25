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

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
/** Google's Gemma endpoint returns sporadic 500s; those are worth one retry on the same model. */
const retryable = (e: unknown) => e instanceof GemmaError && e.status >= 500;

/**
 * Tries each configured model in order, retrying a server error once on the same model before moving on.
 * Stays inside one serverless invocation (Vercel max 60 s).
 */
export async function generate(system: string, contents: Turn[], { json = false } = {}) {
  const models = (process.env.GEMMA_MODELS || DEFAULT_MODELS).split(",").map((m) => m.trim()).filter(Boolean);
  const deadline = Date.now() + 55_000;
  let lastError: unknown;
  for (const model of models) {
    for (let attempt = 0; attempt < 2; attempt++) {
      const remaining = deadline - Date.now();
      if (remaining < 5_000) break;
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), Math.min(45_000, remaining));
      try {
        const text = await callModel(model, system, contents, json, controller.signal);
        return { text, model };
      } catch (e) {
        lastError = e;
        console.error("[gemma]", model, e instanceof GemmaError ? e.status : "network");
        if (!retryable(e)) break;
        await sleep(1200);
      } finally {
        clearTimeout(timer);
      }
    }
  }
  throw lastError instanceof GemmaError ? lastError : new GemmaError("Gemma 4 is not reachable right now");
}

/**
 * Streams answer text. Falls back to the next model only if a model fails before sending any text
 * (once text has reached the user, switching models mid-answer would garble it).
 */
export async function* generateStream(system: string, contents: Turn[], signal?: AbortSignal):
  AsyncGenerator<{ text?: string; model?: string }> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new GemmaError("Server is missing GEMINI_API_KEY", 500);
  const models = (process.env.GEMMA_MODELS || DEFAULT_MODELS).split(",").map((m) => m.trim()).filter(Boolean);
  let lastError: unknown;
  const attempts = models.flatMap((m) => [m, m]);
  for (const [i, model] of attempts.entries()) {
    if (i % 2 === 1 && !(lastError instanceof GemmaError && lastError.status >= 500)) continue;
    if (i % 2 === 1) await sleep(1000);
    let res: Response;
    try {
      res = await fetch(`${BASE}/models/${model}:streamGenerateContent?alt=sse`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-goog-api-key": key },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: system }] },
          contents,
          generationConfig: { temperature: 0.3, maxOutputTokens: 2048, thinkingConfig: { thinkingLevel: "minimal" } },
        }),
        signal,
      });
    } catch (e) {
      lastError = e;
      continue;
    }
    if (!res.ok || !res.body) {
      lastError = new GemmaError(`${model} ${res.status}`, res.status);
      console.error("[gemma stream]", model, res.status);
      continue;
    }
    yield { model };
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      let nl: number;
      while ((nl = buffer.indexOf("\n")) >= 0) {
        const line = buffer.slice(0, nl).trim();
        buffer = buffer.slice(nl + 1);
        if (!line.startsWith("data:")) continue;
        try {
          const data = JSON.parse(line.slice(5));
          const parts: OutputPart[] = data?.candidates?.[0]?.content?.parts ?? [];
          const text = parts.filter((p) => !p.thought && p.text).map((p) => p.text).join("");
          if (text) yield { text };
        } catch {
          // partial or keep-alive line
        }
      }
    }
    return;
  }
  throw lastError instanceof GemmaError ? lastError : new GemmaError("Gemma 4 is not reachable right now");
}
