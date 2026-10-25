import { NextResponse } from "next/server";
import { consultPrompt, consultUserText, normalizeConsult, type ConsultInput } from "@/lib/consult";
import { GemmaError, generate } from "@/lib/gemma";
import { parseJson } from "@/lib/normalize";
import { scrub, type SafetyLog } from "@/lib/safety";
import type { Explanation, Lang } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 60;

const LANGS: Lang[] = ["en", "hi", "gu"];
const clip = (v: unknown, n: number) => (typeof v === "string" ? v.trim().slice(0, n) : "");

export async function POST(req: Request) {
  let body: { input?: Partial<ConsultInput>; report?: Explanation | null; lang?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }
  const lang = LANGS.includes(body.lang as Lang) ? (body.lang as Lang) : "en";
  const i = body.input ?? {};
  const input: ConsultInput = {
    concern: clip(i.concern, 3000),
    age: clip(i.age, 20),
    medicines: clip(i.medicines, 500),
    allergies: clip(i.allergies, 300),
    extra: (Array.isArray(i.extra) ? i.extra : []).map((e) => clip(e, 1000)).filter(Boolean).slice(-5),
  };
  const report = body.report && typeof body.report === "object" ? body.report : null;
  if (!input.concern && !report) return NextResponse.json({ error: "bad_request" }, { status: 400 });

  try {
    const { text, model } = await generate(
      consultPrompt(lang),
      [{ role: "user", parts: [{ text: consultUserText(input, report) }] }],
      { json: true },
    );
    const result = normalizeConsult(parseJson(text));
    // Questions are open questions to the doctor; the urgent message is advice text, so it goes through the filter.
    const log: SafetyLog = { removed: 0 };
    result.urgent_message = scrub(result.urgent_message, lang, log);
    return NextResponse.json({ result, model });
  } catch (e) {
    const busy = e instanceof GemmaError && e.status === 429;
    return NextResponse.json({ error: busy ? "busy" : "model_error" }, { status: busy ? 429 : 502 });
  }
}
