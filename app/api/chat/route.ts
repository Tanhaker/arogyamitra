import { auth } from "@/auth";
import { devUser } from "@/lib/devUser";
import { generateStream, type InputPart, type Turn } from "@/lib/gemma";
import { chatPrompt } from "@/lib/prompt";
import { scrub, type SafetyLog } from "@/lib/safety";
import type { ChatMessage, Explanation, Lang } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 60;

const LANGS: Lang[] = ["en", "hi", "gu"];
const MAX_TURNS = 12;
const MAX_CHARS = 2000;
const MAX_REPORTS = 3;
const MIMES = ["image/jpeg", "image/png", "image/webp"];

/* Simple per-user rate limit (per server instance): 12 messages a minute. */
const WINDOW_MS = 60_000;
const LIMIT = 12;
const hits = new Map<string, number[]>();
function limited(userId: string): boolean {
  const now = Date.now();
  const recent = (hits.get(userId) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(userId, recent);
  return recent.length > LIMIT;
}

/** Keeps only what the model needs from a saved report (never the photo). */
function brief(r: Explanation) {
  return {
    type: r.document_type,
    title: r.title,
    date: r.report_date,
    summary: r.summary,
    medicines: r.medicines.map((m) => ({ name: m.name, generic: m.generic_name, purpose: m.purpose, dose: m.dose, timing: m.timing, food: m.food, duration: m.duration })),
    results: r.lab_results.map((l) => ({ test: l.test, value: l.value ?? l.value_text, unit: l.unit, range: l.range_text, status: l.status })),
    flags: r.red_flags.map((f) => f.text),
  };
}

export async function POST(req: Request) {
  const session = await auth();
  const userId = session?.user?.id ?? devUser()?.id;
  if (!userId) return Response.json({ error: "unauthorized" }, { status: 401 });
  if (limited(userId)) return Response.json({ error: "busy" }, { status: 429 });

  let body: { messages?: ChatMessage[]; reports?: Explanation[]; image?: string; lang?: string };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "bad_request" }, { status: 400 });
  }
  const lang = LANGS.includes(body.lang as Lang) ? (body.lang as Lang) : "en";
  const messages = (Array.isArray(body.messages) ? body.messages : [])
    .filter((m) => (m.role === "user" || m.role === "model") && typeof m.text === "string" && m.text.trim())
    .slice(-MAX_TURNS)
    .map((m) => ({ role: m.role, text: m.text.slice(0, MAX_CHARS) }));
  if (!messages.length || messages[messages.length - 1].role !== "user") {
    return Response.json({ error: "bad_request" }, { status: 400 });
  }
  const reports = (Array.isArray(body.reports) ? body.reports : []).slice(0, MAX_REPORTS).map(brief);
  const reportJson = reports.length ? JSON.stringify(reports).slice(0, 30_000) : "";

  const contents: Turn[] = messages.map((m) => ({ role: m.role, parts: [{ text: m.text }] as InputPart[] }));
  const img = typeof body.image === "string" ? /^data:(image\/[a-z]+);base64,(.+)$/.exec(body.image) : null;
  if (img && MIMES.includes(img[1]) && img[2].length < 4_000_000) {
    contents[contents.length - 1].parts.push({ inline_data: { mime_type: img[1], data: img[2] } });
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      // Safety layer on streamed text: hold back the unfinished sentence and release each finished one
      // only after scrub() has checked it (no diagnosis, no "stop/start/change your medicine").
      const log: SafetyLog = { removed: 0 };
      let pending = "";
      const release = (final: boolean) => {
        const cut = final ? pending.length : Math.max(...[".", "!", "?", "।", "\n"].map((c) => pending.lastIndexOf(c))) + 1;
        if (cut <= 0) return;
        const done = pending.slice(0, cut);
        pending = pending.slice(cut);
        const safe = scrub(done, lang, log);
        if (safe) controller.enqueue(encoder.encode(safe === done ? done : `${safe} `));
      };
      try {
        for await (const chunk of generateStream(chatPrompt(lang, reportJson), contents, req.signal)) {
          // First event names the model, as a control line the client strips out.
          if (chunk.model) controller.enqueue(encoder.encode(`\u0000model:${chunk.model}\n`));
          if (chunk.text) {
            pending += chunk.text;
            release(false);
          }
        }
        release(true);
        if (log.removed) console.warn(`[safety] removed ${log.removed} unsafe sentence(s) from chat`);
      } catch {
        controller.enqueue(encoder.encode("\u0000error\n"));
      } finally {
        controller.close();
      }
    },
  });
  return new Response(stream, { headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" } });
}
