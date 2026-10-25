import { applyShorthand } from "./abbreviations";
import { isCritical } from "./critical";
import { FLAG_TEXT, withConfirm } from "./safety";
import type { ParsedExplanation } from "./schema";
import type { Explanation, LabResult, Lang, Medicine, RedFlag, Schedule, Severity, TimeOfDay } from "./types";

/** Pulls the first JSON object out of model text (tolerates code fences or stray words). */
export function parseJson(text: string): unknown {
  const cleaned = text.replace(/```(?:json)?/gi, "").trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");
    if (start >= 0 && end > start) return JSON.parse(cleaned.slice(start, end + 1));
    throw new Error("Answer was not JSON");
  }
}

const RANK: Record<Severity, number> = { normal: 0, check: 1, urgent: 2 };
export const worse = (a: Severity, b: Severity): Severity => (RANK[a] >= RANK[b] ? a : b);

/** Common Indian brands -> active ingredients, to catch duplicates the model might miss. */
const BRANDS: Record<string, string[]> = {
  dolo: ["paracetamol"],
  crocin: ["paracetamol"],
  calpol: ["paracetamol"],
  pacimol: ["paracetamol"],
  paracip: ["paracetamol"],
  sumo: ["paracetamol", "nimesulide"],
  combiflam: ["ibuprofen", "paracetamol"],
  brufen: ["ibuprofen"],
  pan: ["pantoprazole"],
  pantocid: ["pantoprazole"],
  pantop: ["pantoprazole"],
  augmentin: ["amoxicillin", "clavulanate"],
  mox: ["amoxicillin"],
  azee: ["azithromycin"],
  azithral: ["azithromycin"],
  glycomet: ["metformin"],
  telma: ["telmisartan"],
  ecosprin: ["aspirin"],
};

function ingredients(m: Medicine): string[] {
  const out = new Set<string>();
  for (const part of (m.generic_name ?? "").toLowerCase().split(/[+,/&]| and /)) {
    const w = part.replace(/[\d.]+\s*(mg|ml|mcg|g|iu)?/g, "").trim();
    if (w.length > 2) out.add(w);
  }
  const brand = m.name.toLowerCase().replace(/^(tab|cap|syp|syr|inj)\.?\s*/i, "").split(/\s+/)[0];
  for (const ing of BRANDS[brand] ?? []) out.add(ing);
  const plain = m.name.toLowerCase();
  for (const ing of ["paracetamol", "ibuprofen", "pantoprazole", "amoxicillin", "metformin", "azithromycin", "aspirin"]) {
    if (plain.includes(ing)) out.add(ing);
  }
  return [...out];
}

function labSeverity(l: LabResult): Severity {
  let code: Severity = "normal";
  if (l.value !== null) {
    const low = l.ref_low ?? null;
    const high = l.ref_high ?? null;
    if ((high !== null && l.value > high) || (low !== null && l.value < low)) code = "check";
  }
  if (l.lab_flag || isCritical(`${l.test_key ?? ""} ${l.test}`, l.value, l.unit)) code = "urgent";
  // The more severe of the model's view and the code's view wins.
  return worse(l.status, code);
}

export function buildSchedule(meds: Medicine[]): Schedule {
  const s: Schedule = { morning: [], afternoon: [], evening: [], night: [] };
  for (const m of meds) for (const t of m.timing) s[t as TimeOfDay].push(m.name);
  return s;
}

function shortTitle(r: { document_type: string; medicines: Medicine[]; lab_results: LabResult[] }): string {
  if (r.document_type === "lab_report") {
    const bad = r.lab_results.filter((l) => l.status !== "normal").map((l) => l.test);
    return bad.slice(0, 3).join(", ") || r.lab_results.slice(0, 2).map((l) => l.test).join(", ");
  }
  return r.medicines.slice(0, 3).map((m) => m.name).join(", ");
}

/** Turns validated model output into the final Explanation, applying every code-side safety rule. */
export function finalize(p: ParsedExplanation, lang: Lang): Explanation {
  const medicines: Medicine[] = p.medicines
    .filter((m) => m.name)
    .map((m) => applyShorthand({ ...m, generic_name: m.generic_name || undefined, notes: m.notes || undefined }));

  const lab_results: LabResult[] = p.lab_results
    .filter((l) => l.test)
    .map((l) => {
      const range_text = l.range_text;
      const base: LabResult = {
        test: l.test,
        test_key: l.test_key || undefined,
        value: l.value,
        value_text: l.value_text || undefined,
        unit: l.unit,
        range_text,
        // Never use a range the report does not print.
        ref_low: range_text ? (l.ref_low ?? null) : null,
        ref_high: range_text ? (l.ref_high ?? null) : null,
        lab_flag: l.lab_flag ?? false,
        status: l.status,
        explanation: l.explanation,
      };
      return { ...base, status: labSeverity(base) };
    })
    .sort((a, b) => RANK[b.status] - RANK[a.status]);

  const anyUrgentLab = lab_results.some((l) => l.status === "urgent");
  let red_flags: RedFlag[] = p.red_flags
    .filter((f) => f.text)
    // "urgent" is reserved for results the code or lab considers urgent.
    .map((f) => (f.level === "urgent" && !anyUrgentLab ? { ...f, level: "check" as const } : f));

  // Duplicate ingredients across medicines.
  const seen = new Map<string, string>();
  for (const m of medicines) {
    for (const ing of ingredients(m)) {
      const other = seen.get(ing);
      if (other && other !== m.name) {
        const already = red_flags.some((f) => f.text.includes(other) && f.text.includes(m.name));
        if (!already) red_flags.push({ level: "check", text: FLAG_TEXT.duplicate[lang](other, m.name, ing) });
      } else if (!other) seen.set(ing, m.name);
    }
  }

  // Out-of-range values, unless the model already flagged them.
  const abnormal = lab_results.filter((l) => l.status !== "normal");
  if (abnormal.length && !red_flags.some((f) => abnormal.some((l) => f.text.includes(l.test)))) {
    red_flags.unshift({ level: anyUrgentLab ? "urgent" : "check", text: FLAG_TEXT.outOfRange[lang](abnormal.map((l) => l.test).join(", ")) });
  }

  // Unreadable parts.
  const unclear_items = p.unclear_items;
  const lowConfidence = medicines.filter((m) => m.confidence === "low").length;
  if ((unclear_items.length || lowConfidence) && !red_flags.some((f) => /unclear|read|पढ़|વાંચ/i.test(f.text))) {
    red_flags.push({ level: "check", text: FLAG_TEXT.unreadable[lang](unclear_items.length || lowConfidence) });
  }

  const order = { urgent: 0, check: 1, info: 2 } as const;
  red_flags = red_flags.map((f) => ({ ...f, text: withConfirm(f.text, lang) })).sort((a, b) => order[a.level] - order[b.level]);

  const date = p.report_date && /^\d{4}-\d{2}-\d{2}$/.test(p.report_date) ? p.report_date : undefined;
  const out: Explanation = {
    document_type: p.document_type,
    title: "",
    summary: p.summary,
    report_date: date,
    medicines,
    schedule: medicines.length ? buildSchedule(medicines) : { morning: [], afternoon: [], evening: [], night: [] },
    lab_results,
    red_flags,
    doctor_questions: p.doctor_questions.slice(0, 5),
    unclear_items,
  };
  out.title = p.title || shortTitle(out);
  return out;
}

export function worstSeverity(r: Explanation): Severity {
  let s: Severity = "normal";
  for (const l of r.lab_results) s = worse(s, l.status);
  for (const f of r.red_flags) s = worse(s, f.level === "urgent" ? "urgent" : f.level === "check" ? "check" : "normal");
  return s;
}
