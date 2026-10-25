import { finalize } from "./normalize";
import { ExplanationSchema } from "./schema";
import type { Explanation, Lang, SavedReport } from "./types";

export const REPORT_VERSION = 2;

type Loose = Record<string, unknown>;
const asArr = (v: unknown): Loose[] => (Array.isArray(v) ? (v as Loose[]) : []);

/** Converts a v1 saved report (before the schema change) into the v2 shape, then re-runs the safety rules. */
export function migrateReport(r: SavedReport): SavedReport | null {
  if (r.version === REPORT_VERSION) return r;
  const old = r.result as unknown as Loose;
  const isV1 = "warnings" in old || "unclear" in old || !("title" in old);
  const lang: Lang = r.lang ?? "en";
  const input: Loose = isV1
    ? {
        document_type: old.document_type,
        title: "",
        summary: old.summary,
        report_date: old.report_date,
        medicines: asArr(old.medicines).map((m) => ({
          name: m.name,
          purpose: m.purpose,
          dose: m.dose,
          timing: m.when,
          food: m.food === "" ? "unclear" : m.food,
          duration: m.duration,
          notes: m.notes,
          confidence: m.unclear === true ? "low" : "high",
        })),
        lab_results: asArr(old.lab_results).map((l) => ({
          test: l.test,
          test_key: l.test_key,
          value: l.value_num,
          value_text: l.value,
          unit: l.unit,
          range_text: l.normal_range,
          ref_low: l.ref_low,
          ref_high: l.ref_high,
          lab_flag: l.lab_critical === true,
          status: l.status === "critical" ? "urgent" : l.status === "high" || l.status === "low" ? "check" : "normal",
          explanation: l.meaning,
        })),
        red_flags: asArr(old.warnings),
        doctor_questions: old.doctor_questions,
        unclear_items: old.unclear,
      }
    : old;
  const parsed = ExplanationSchema.safeParse(input);
  if (!parsed.success) return null; // unreadable old entry: drop rather than crash the UI
  const result: Explanation = finalize(parsed.data, lang);
  return { ...r, version: REPORT_VERSION, result };
}
