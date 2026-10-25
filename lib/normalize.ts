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
const num = (v: unknown): number | null => {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string") {
    const n = parseFloat(v.replace(/,/g, ""));
    return Number.isFinite(n) ? n : null;
  }
  return null;
};
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
  const normal_range = str(r.normal_range);
  const value_num = num(r.value_num);
  // Safety: never use a reference range the report does not print.
  const ref_low = normal_range ? num(r.ref_low) : null;
  const ref_high = normal_range ? num(r.ref_high) : null;
  const lab_critical = r.lab_critical === true;
  let status = pick(r.status, ["normal", "high", "low", "critical", "unknown"] as const, "unknown");
  if (lab_critical) {
    status = "critical";
  } else if (status === "critical") {
    // Safety: "critical" is reserved for values the lab itself marks critical.
    status =
      value_num !== null && ref_high !== null && value_num > ref_high ? "high"
      : value_num !== null && ref_low !== null && value_num < ref_low ? "low"
      : "unknown";
  }
  return {
    test,
    test_key: str(r.test_key) || test,
    value: str(r.value),
    value_num,
    unit: str(r.unit),
    normal_range,
    ref_low,
    ref_high,
    lab_critical,
    status,
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
    report_date: /^\d{4}-\d{2}-\d{2}$/.test(str(o.report_date)) ? str(o.report_date) : "",
    summary: str(o.summary),
    medicines: arr(o.medicines).map(medicine).filter((m): m is Medicine => m !== null),
    lab_results: arr(o.lab_results).map(labResult).filter((r): r is LabResult => r !== null),
    warnings: arr(o.warnings).map(warning).filter((w): w is Warning => w !== null),
    doctor_questions: arr(o.doctor_questions).map(str).filter(Boolean),
    unclear: arr(o.unclear).map(str).filter(Boolean),
  };
  // Safety: "urgent" is only for lab-designated critical results, and those must always show one.
  // Empty text means "use the UI's default urgent message" (it is translated there).
  const hasCritical = result.lab_results.some((r) => r.status === "critical");
  if (!hasCritical) {
    result.warnings = result.warnings.map((w) => (w.level === "urgent" ? { ...w, level: "check" } : w));
  } else if (!result.warnings.some((w) => w.level === "urgent")) {
    result.warnings.unshift({ level: "urgent", text: "" });
  }
  const order = { urgent: 0, check: 1, info: 2 };
  result.warnings.sort((a, b) => order[a.level] - order[b.level]);
  return result;
}
