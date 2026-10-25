import { NextResponse } from "next/server";
import { GemmaError, generate, type InputPart, type Turn } from "@/lib/gemma";
import { finalize, parseJson } from "@/lib/normalize";
import { REPAIR_PROMPT, USER_PROMPT, systemPrompt } from "@/lib/prompt";
import { applySafety } from "@/lib/safety";
import { ExplanationSchema } from "@/lib/schema";
import type { DocType, ExplainResponse, Lang } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 60;

const LANGS: Lang[] = ["en", "hi", "gu"];
const DOC_TYPES: DocType[] = ["prescription", "lab_report", "auto"];
const MIMES = ["image/jpeg", "image/png", "image/webp"];
const MAX_PAGES = 4;
const MAX_TOTAL_BYTES = 4 * 1024 * 1024; // Vercel's request body limit is ~4.5 MB

function fail(error: string, status: number) {
  return NextResponse.json<ExplainResponse>({ error }, { status });
}

export async function POST(req: Request) {
  let body: { images?: unknown; image?: unknown; lang?: string; docType?: string };
  try {
    body = await req.json();
  } catch {
    return fail("bad_request", 400);
  }

  const lang = LANGS.includes(body.lang as Lang) ? (body.lang as Lang) : "en";
  const docType = DOC_TYPES.includes(body.docType as DocType) ? (body.docType as DocType) : "auto";
  const raw = Array.isArray(body.images) ? body.images : body.image ? [body.image] : [];
  if (!raw.length || raw.length > MAX_PAGES) return fail("bad_image", 400);

  const pages: InputPart[] = [];
  let total = 0;
  for (const item of raw) {
    const match = typeof item === "string" ? /^data:(image\/[a-z]+);base64,(.+)$/.exec(item) : null;
    if (!match || !MIMES.includes(match[1])) return fail("bad_image", 400);
    total += (match[2].length * 3) / 4;
    pages.push({ inline_data: { mime_type: match[1], data: match[2] } });
  }
  if (total > MAX_TOTAL_BYTES) return fail("too_large", 413);

  const system = systemPrompt(lang, docType, pages.length);
  const contents: Turn[] = [{ role: "user", parts: [{ text: USER_PROMPT }, ...pages] }];

  try {
    let { text, model } = await generate(system, contents, { json: true });
    let parsed = tryParse(text);
    if (!parsed) {
      // One repair attempt: show the model its own answer and ask for valid JSON only.
      const repair = await generate(
        system,
        [...contents, { role: "model", parts: [{ text: text.slice(0, 20000) }] }, { role: "user", parts: [{ text: REPAIR_PROMPT }] }],
        { json: true },
      );
      text = repair.text;
      model = repair.model;
      parsed = tryParse(text);
    }
    if (!parsed) {
      console.error("[explain] model returned invalid JSON twice");
      return fail("unreadable_answer", 502);
    }
    // Images live only in memory for this request; nothing is stored or logged.
    const { result, removed } = applySafety(finalize(parsed, lang), lang);
    if (removed) console.warn(`[safety] removed ${removed} unsafe sentence(s)`);
    return NextResponse.json<ExplainResponse>({ result, model, safety: { removed } });
  } catch (e) {
    const status = e instanceof GemmaError ? e.status : 502;
    return fail(status === 429 ? "busy" : "model_error", status === 429 ? 429 : 502);
  }
}

function tryParse(text: string) {
  try {
    const r = ExplanationSchema.safeParse(parseJson(text));
    return r.success ? r.data : null;
  } catch {
    return null;
  }
}
