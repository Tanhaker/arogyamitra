import { z } from "zod";

/**
 * Zod schema for Gemma's JSON. It is deliberately forgiving about shape (models drift), and strict about
 * enums and types after coercion, so the UI always gets a complete, typed Explanation.
 */
const str = z.preprocess((v) => (typeof v === "number" ? String(v) : v), z.string()).catch("").transform((s) => s.trim());
const strs = z.array(z.unknown()).catch([]).transform((a) => a.map((v) => (typeof v === "string" ? v.trim() : typeof v === "number" ? String(v) : "")).filter(Boolean));
const num = z
  .unknown()
  .transform((v) => {
    if (typeof v === "number" && Number.isFinite(v)) return v;
    if (typeof v === "string") {
      const n = parseFloat(v.replace(/,/g, ""));
      return Number.isFinite(n) ? n : null;
    }
    return null;
  });

const TIMES = ["morning", "afternoon", "evening", "night"] as const;

export const MedicineSchema = z.object({
  name: str,
  generic_name: str.optional(),
  purpose: str,
  dose: str,
  timing: z
    .array(z.unknown())
    .catch([])
    .transform((a) => {
      const set = new Set(a.map((t) => String(t).toLowerCase().trim()));
      return TIMES.filter((t) => set.has(t));
    }),
  food: z.enum(["before", "after", "with", "any", "unclear"]).catch("unclear"),
  duration: str,
  notes: str.optional(),
  confidence: z.enum(["high", "medium", "low"]).catch("medium"),
});

export const LabResultSchema = z.object({
  test: str,
  test_key: str.optional(),
  value: num,
  value_text: str.optional(),
  unit: str,
  range_text: str,
  ref_low: num.optional(),
  ref_high: num.optional(),
  lab_flag: z.boolean().catch(false).optional(),
  status: z.enum(["normal", "check", "urgent"]).catch("normal"),
  explanation: str,
});

export const ExplanationSchema = z.object({
  document_type: z.enum(["prescription", "lab_report", "other"]),
  title: str,
  summary: str,
  report_date: str.optional(),
  medicines: z.array(MedicineSchema).catch([]),
  schedule: z
    .object({ morning: strs, afternoon: strs, evening: strs, night: strs })
    .partial()
    .catch({}),
  lab_results: z.array(LabResultSchema).catch([]),
  red_flags: z
    .array(z.object({ level: z.enum(["urgent", "check", "info"]).catch("check"), text: str }))
    .catch([]),
  doctor_questions: strs,
  unclear_items: strs,
});

export type ParsedExplanation = z.infer<typeof ExplanationSchema>;
