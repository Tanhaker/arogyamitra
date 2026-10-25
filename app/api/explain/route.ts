import { NextResponse } from "next/server";
import { GemmaError, generate } from "@/lib/gemma";
import { normalize, parseJson } from "@/lib/normalize";
import { USER_PROMPT, systemPrompt } from "@/lib/prompt";
import { applySafety } from "@/lib/safety";
import type { ExplainResponse, Lang } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 60;

const LANGS: Lang[] = ["en", "hi", "gu"];
const MIMES = ["image/jpeg", "image/png", "image/webp"];
const MAX_BYTES = 4 * 1024 * 1024;

function fail(error: string, status: number) {
  return NextResponse.json<ExplainResponse>({ error }, { status });
}

export async function POST(req: Request) {
  let body: { image?: string; lang?: string };
  try {
    body = await req.json();
  } catch {
    return fail("bad_request", 400);
  }

  const lang = LANGS.includes(body.lang as Lang) ? (body.lang as Lang) : "en";
  const match = /^data:(image\/[a-z]+);base64,(.+)$/.exec(body.image ?? "");
  if (!match || !MIMES.includes(match[1])) return fail("bad_image", 400);
  const [, mime, data] = match;
  if ((data.length * 3) / 4 > MAX_BYTES) return fail("too_large", 413);

  try {
    const { text, model } = await generate(
      systemPrompt(lang),
      [{ role: "user", parts: [{ text: USER_PROMPT }, { inline_data: { mime_type: mime, data } }] }],
      { json: true },
    );
    let raw: unknown;
    try {
      raw = parseJson(text);
    } catch {
      console.error("[explain] unparseable answer:", text.slice(0, 300));
      return fail("unreadable_answer", 502);
    }
    // Images are never stored: the photo only lives for the duration of this request.
    const { result, removed } = applySafety(normalize(raw), lang);
    if (removed) console.warn(`[safety] removed ${removed} unsafe sentence(s) from explanation`);
    return NextResponse.json<ExplainResponse>({ result, model, safety: { removed } });
  } catch (e) {
    const status = e instanceof GemmaError ? e.status : 502;
    return fail(status === 429 ? "busy" : "model_error", status === 429 ? 429 : 502);
  }
}
