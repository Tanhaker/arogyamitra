import type { Explanation, LabResult, Medicine, TimeOfDay, Warning } from "./types";

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

const str = (v: unknown): string => (typeof v === "string" ? v.trim() : typeof v === "number" ? String(v) : "");
const arr = (v: unknown): unknown[] => (Array.isArray(v) ? v : []);
const pick = <T extends string>(v: unknown, allowed: readonly T[], fallback: T): T =>
  allowed.includes(v as T) ? (v as T) : fallback;

const TIMES: readonly TimeOfDay[] = ["morning", "afternoon", "night"];

function medicine(v: unknown): Medicine | null {
  const m = (v ?? {}) as Record<string, unknown>;
  const name = str(m.name);
  if (!name) return null;
  const when = arr(m.when)
    .map((t) => str(t).toLowerCase())
    .map((t) => (t === "evening" ? "night" : t))
    .filter((t): t is TimeOfDay => TIMES.includes(t as TimeOfDay));
  return {
    name,
    purpose: str(m.purpose),
    dose: str(m.dose),
    when: TIMES.filter((t) => when.includes(t)),
    food: pick(m.food, ["before", "after", "with", "any", ""] as const, ""),
    duration: str(m.duration),
    notes: str(m.notes),
    unclear: m.unclear === true,
  };
}

function labResult(v: unknown): LabResult | null {
  const r = (v ?? {}) as Record<string, unknown>;
  const test = str(r.test);
  if (!test) return null;
  return {
    test,
    value: str(r.value),
    normal_range: str(r.normal_range),
    status: pick(r.status, ["normal", "high", "low", "critical"] as const, "normal"),
    meaning: str(r.meaning),
  };
}

function warning(v: unknown): Warning | null {
  const w = (v ?? {}) as Record<string, unknown>;
  const text = str(w.text);
  return text ? { level: pick(w.level, ["urgent", "check", "info"] as const, "check"), text } : null;
}

/** Turns whatever the model sent into a safe, complete Explanation the UI can always render. */
export function normalize(raw: unknown): Explanation {
  const o = (raw ?? {}) as Record<string, unknown>;
  const result: Explanation = {
    document_type: pick(o.document_type, ["prescription", "lab_report", "other"] as const, "other"),
    summary: str(o.summary),
    medicines: arr(o.medicines).map(medicine).filter((m): m is Medicine => m !== null),
    lab_results: arr(o.lab_results).map(labResult).filter((r): r is LabResult => r !== null),
    warnings: arr(o.warnings).map(warning).filter((w): w is Warning => w !== null),
    doctor_questions: arr(o.doctor_questions).map(str).filter(Boolean),
    unclear: arr(o.unclear).map(str).filter(Boolean),
  };
  // A critical lab value must always surface as an urgent warning, even if the model forgot one.
  // Empty text means "use the UI's default urgent message" (it is translated there).
  if (result.lab_results.some((r) => r.status === "critical") && !result.warnings.some((w) => w.level === "urgent")) {
    result.warnings.unshift({ level: "urgent", text: "" });
  }
  const order = { urgent: 0, check: 1, info: 2 };
  result.warnings.sort((a, b) => order[a.level] - order[b.level]);
  return result;
}
