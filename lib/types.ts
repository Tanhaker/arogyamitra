export type Lang = "en" | "hi" | "gu";

export type TimeOfDay = "morning" | "afternoon" | "night";

export interface Medicine {
  name: string;
  purpose: string;
  dose: string;
  when: TimeOfDay[];
  food: "before" | "after" | "with" | "any" | "";
  duration: string;
  notes: string;
  unclear: boolean;
}

export interface LabResult {
  test: string;
  value: string;
  normal_range: string;
  status: "normal" | "high" | "low" | "critical";
  meaning: string;
}

export interface Warning {
  level: "urgent" | "check" | "info";
  text: string;
}

export interface Explanation {
  document_type: "prescription" | "lab_report" | "other";
  summary: string;
  medicines: Medicine[];
  lab_results: LabResult[];
  warnings: Warning[];
  doctor_questions: string[];
  unclear: string[];
}

export interface ExplainResponse {
  result?: Explanation;
  model?: string;
  error?: string;
}
