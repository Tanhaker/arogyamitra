import { NextResponse } from "next/server";
import { GemmaError, generate, type Turn } from "@/lib/gemma";
import { askPrompt } from "@/lib/prompt";
import type { ChatMessage, Lang } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 60;

const LANGS: Lang[] = ["en", "hi", "gu"];
const MAX_TURNS = 8;

export async function POST(req: Request) {
  let body: { report?: unknown; messages?: ChatMessage[]; lang?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  const lang = LANGS.includes(body.lang as Lang) ? (body.lang as Lang) : "en";
  const report = JSON.stringify(body.report ?? {});
  const messages = (Array.isArray(body.messages) ? body.messages : [])
    .filter((m) => (m.role === "user" || m.role === "model") && typeof m.text === "string" && m.text.trim())
    .slice(-MAX_TURNS)
    .map((m) => ({ role: m.role, text: m.text.slice(0, 1000) }));
  if (!messages.length || messages[messages.length - 1].role !== "user" || report.length > 30_000) {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  const contents: Turn[] = messages.map((m) => ({ role: m.role, parts: [{ text: m.text }] }));
  try {
    const { text, model } = await generate(askPrompt(lang, report), contents);
    return NextResponse.json({ answer: text.trim(), model });
  } catch (e) {
    const busy = e instanceof GemmaError && e.status === 429;
    return NextResponse.json({ error: busy ? "busy" : "model_error" }, { status: busy ? 429 : 502 });
  }
}
