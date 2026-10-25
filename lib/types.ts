export type Lang = "en" | "hi" | "gu";

export type TimeOfDay = "morning" | "afternoon" | "evening" | "night";
export type Severity = "normal" | "check" | "urgent";
export type DocType = "prescription" | "lab_report" | "auto";

export interface Medicine {
  name: string;
  generic_name?: string;
  purpose: string;
  dose: string;
  timing: TimeOfDay[];
  food: "before" | "after" | "with" | "any" | "unclear";
  duration: string;
  notes?: string; // other instructions written on the paper (e.g. "SOS for fever")
  confidence: "high" | "medium" | "low";
}

export interface LabResult {
  test: string;
  test_key?: string; // standard English short name, used to match the same test across reports
  value: number | null;
  value_text?: string; // value exactly as printed, when it isn't a plain number
  unit: string;
  range_text: string; // as printed by the lab; "" if none
  ref_low?: number | null;
  ref_high?: number | null;
  lab_flag?: boolean; // the lab itself marked it critical / panic
  status: Severity;
  explanation: string;
}

export interface RedFlag {
  level: "urgent" | "check" | "info";
  text: string;
}

export interface Schedule {
  morning: string[];
  afternoon: string[];
  evening: string[];
  night: string[];
}

export interface Explanation {
  document_type: "prescription" | "lab_report" | "other";
  title: string;
  summary: string;
  report_date?: string; // YYYY-MM-DD printed on the paper, if any
  medicines: Medicine[];
  schedule: Schedule;
  lab_results: LabResult[];
  red_flags: RedFlag[];
  doctor_questions: string[];
  unclear_items: string[];
}

export interface ExplainResponse {
  result?: Explanation;
  model?: string;
  safety?: { removed: number };
  error?: string;
}

export interface SavedReport {
  id: string;
  savedAt: string; // ISO time it was explained
  model?: string;
  lang?: Lang;
  version?: number;
  result: Explanation;
}

export interface ChatMessage {
  role: "user" | "model";
  text: string;
  emergency?: boolean; // the fixed (non-model) emergency card, kept so it reappears with the history
}
