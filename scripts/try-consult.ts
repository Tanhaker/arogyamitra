/** Dev check for "Questions to Ask Your Doctor": runs the same prompt + normaliser as /api/consult. */
import { readFileSync } from "node:fs";
import { consultPrompt, consultUserText, normalizeConsult } from "../lib/consult";
import { generate } from "../lib/gemma";
import { parseJson } from "../lib/normalize";
import type { Lang } from "../lib/types";

for (const line of readFileSync(".env.local", "utf8").split(/\r?\n/)) {
  const m = /^([A-Z_]+)=(.*)$/.exec(line);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
}

const cases: { lang: Lang; concern: string; age?: string; medicines?: string }[] = [
  { lang: "en", concern: "I get headaches most evenings for the last 2 weeks, sometimes with blurry vision.", age: "45", medicines: "Amlodipine 5 mg" },
  { lang: "gu", concern: "છેલ્લા એક મહિનાથી જમ્યા પછી પેટમાં દુખાવો અને ગેસ થાય છે." },
  { lang: "hi", concern: "अचानक सीने में तेज़ दर्द हो रहा है और बाएँ हाथ में भी दर्द है, पसीना आ रहा है।", age: "58" },
];

async function main() {
for (const c of cases) {
  const t0 = Date.now();
  const input = { concern: c.concern, age: c.age ?? "", medicines: c.medicines ?? "", allergies: "", extra: [] };
  const { text, model } = await generate(consultPrompt(c.lang), [{ role: "user", parts: [{ text: consultUserText(input, null) }] }], { json: true });
  const r = normalizeConsult(parseJson(text));
  console.log(`\n=== ${c.lang} (${model}, ${Math.round((Date.now() - t0) / 1000)}s) urgent=${r.urgent}`);
  if (r.urgent) console.log("URGENT:", r.urgent_message);
  console.log("understood:", JSON.stringify(r.understood));
  console.log("missing:", r.missing_info);
  for (const cat of r.categories) console.log(`[${cat.key}]`, cat.questions);
}
}
main().catch((e) => { console.error(e); process.exit(1); });
