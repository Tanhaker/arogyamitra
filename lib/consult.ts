/** "Questions to Ask Your Doctor": types, Gemma prompt and response normalisation. */
import { SAFETY_RULES } from "./safety";
import type { Explanation, Lang } from "./types";

export const CATEGORY_KEYS = ["symptoms", "tests", "treatment", "medication", "followup"] as const;
export type CategoryKey = (typeof CATEGORY_KEYS)[number];

export interface ConsultInput {
  concern: string;
  age: string;
  medicines: string;
  allergies: string;
  extra: string[]; // details added later via "Update questions"
}

export interface Understood {
  symptoms: string[];
  duration: string;
  severity: string;
  frequency: string;
  associated: string[];
  age: string;
  medications: string[];
  allergies: string[];
  history: string[];
}

export interface ConsultResult {
  urgent: boolean;
  urgent_message: string;
  understood: Understood;
  missing_info: string[];
  categories: { key: CategoryKey; questions: string[] }[];
}

const LANG_NAME: Record<Lang, string> = {
  en: "simple English",
  hi: "simple Hindi (Devanagari script)",
  gu: "simple Gujarati (Gujarati script)",
};

export function consultPrompt(lang: Lang): string {
  return `You are ArogyaMitra. You help a person PREPARE QUESTIONS for their doctor. You never diagnose or treat.

${SAFETY_RULES}

Extra rules for this task:
- Generate QUESTIONS for the doctor, not answers. Never name a disease the person "has" or "might have". Do not assume an illness from symptoms.
- Questions about treatment or medicines are allowed only as open questions to the doctor (e.g. "What treatment options are appropriate for me?"), never as suggestions.
- Questions must be personal: refer to the person's own symptoms, duration, medicines, reports and details. Avoid generic filler.
- Calm, non-frightening wording.
- "understood" must contain ONLY what the person actually said (or what is in their report). Never invent or assume. Use "" or [] when not given.
- If important details are missing (duration, severity, frequency, age, current medicines, allergies), list short follow-up questions TO THE PERSON in "missing_info".
- URGENT: if they describe possible emergency signs (e.g. chest pain or pressure, trouble breathing, fainting, sudden weakness or numbness on one side, slurred speech, severe bleeding, very high fever with stiff neck or confusion, thoughts of self-harm, severe allergic reaction, seizures, severe sudden headache), set "urgent": true and write "urgent_message" telling them to call 112 or go to the nearest hospital now. Still add a few questions.

Reply with ONLY this JSON:
{
  "urgent": boolean,
  "urgent_message": string,
  "understood": {
    "symptoms": [string], "duration": string, "severity": string, "frequency": string,
    "associated": [string], "age": string, "medications": [string], "allergies": [string], "history": [string]
  },
  "missing_info": [string],
  "categories": [
    { "key": "symptoms",   "questions": [string] },   // understanding my symptoms (2-4)
    { "key": "tests",      "questions": [string] },   // tests and medical reports (1-3)
    { "key": "treatment",  "questions": [string] },   // treatment and care (1-3)
    { "key": "medication", "questions": [string] },   // medicines (1-3; about their own medicines if they listed any)
    { "key": "followup",   "questions": [string] }    // follow-up, recovery, warning signs (1-3)
  ]
}
Write all human-readable text in ${LANG_NAME[lang]}. Keep JSON keys and "key" values in English.`;
}

export function consultUserText(input: ConsultInput, report: Explanation | null): string {
  const lines = [
    `My health concern (in my words): ${input.concern || "(not given)"}`,
    input.age && `My age: ${input.age}`,
    input.medicines && `Medicines I take: ${input.medicines}`,
    input.allergies && `My allergies: ${input.allergies}`,
    ...input.extra.map((e) => `More details I added: ${e}`),
  ].filter(Boolean);
  if (report) {
    const brief = {
      type: report.document_type,
      date: report.report_date,
      medicines: report.medicines.map((m) => `${m.name} ${m.dose} ${m.timing.join("/")}`),
      results: report.lab_results.map((l) => `${l.test}: ${l.value ?? l.value_text ?? ""} ${l.unit} (range ${l.range_text || "not printed"}, ${l.status})`),
    };
    lines.push(`My recent medical paper (already read by the app): ${JSON.stringify(brief)}`);
  }
  return lines.join("\n");
}

const str = (v: unknown) => (typeof v === "string" ? v.trim() : typeof v === "number" ? String(v) : "");
const strs = (v: unknown) => (Array.isArray(v) ? v.map(str).filter(Boolean) : []);

export function normalizeConsult(raw: unknown): ConsultResult {
  const o = (raw ?? {}) as Record<string, unknown>;
  const u = (o.understood ?? {}) as Record<string, unknown>;
  const cats = Array.isArray(o.categories) ? (o.categories as Record<string, unknown>[]) : [];
  return {
    urgent: o.urgent === true,
    urgent_message: str(o.urgent_message),
    understood: {
      symptoms: strs(u.symptoms),
      duration: str(u.duration),
      severity: str(u.severity),
      frequency: str(u.frequency),
      associated: strs(u.associated),
      age: str(u.age),
      medications: strs(u.medications),
      allergies: strs(u.allergies),
      history: strs(u.history),
    },
    missing_info: strs(o.missing_info).slice(0, 5),
    categories: CATEGORY_KEYS.map((key) => ({
      key,
      questions: strs(cats.find((c) => c?.key === key)?.questions).slice(0, 5),
    })).filter((c) => c.questions.length > 0),
  };
}
