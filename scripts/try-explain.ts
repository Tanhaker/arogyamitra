/** Dev check: runs the real explain prompt + Zod + finalize on a sample image (no server, no auth). */
import { readFileSync } from "node:fs";
import { generate } from "../lib/gemma";
import { finalize, parseJson } from "../lib/normalize";
import { systemPrompt, USER_PROMPT } from "../lib/prompt";
import { applySafety } from "../lib/safety";
import { ExplanationSchema } from "../lib/schema";
import type { DocType, Lang } from "../lib/types";

for (const line of readFileSync(".env.local", "utf8").split(/\r?\n/)) {
  const m = /^([A-Z_]+)=(.*)$/.exec(line);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
}

async function main() {
  const [file, docType = "auto", lang = "en"] = process.argv.slice(2);
  const data = readFileSync(file).toString("base64");
  const t0 = Date.now();
  const { text, model } = await generate(systemPrompt(lang as Lang, docType as DocType, 1),
    [{ role: "user", parts: [{ text: USER_PROMPT }, { inline_data: { mime_type: "image/jpeg", data } }] }], { json: true });
  const parsed = ExplanationSchema.safeParse(parseJson(text));
  if (!parsed.success) { console.log("ZOD FAIL", parsed.error.issues.slice(0, 5)); return; }
  const { result } = applySafety(finalize(parsed.data, lang as Lang), lang as Lang);
  console.log(`model=${model} secs=${Math.round((Date.now() - t0) / 1000)}`);
  console.log(JSON.stringify({ title: result.title, summary: result.summary,
    labs: result.lab_results.map((l) => `${l.test}=${l.value} ${l.unit} [${l.range_text}] ${l.status}`),
    meds: result.medicines.map((m) => `${m.name} | ${m.timing.join("/")} | ${m.food} | ${m.confidence}`),
    flags: result.red_flags.map((f) => `${f.level}: ${f.text}`), questions: result.doctor_questions }, null, 1));
}
main().catch((e) => { console.error(String(e).slice(0, 400)); process.exit(1); });
