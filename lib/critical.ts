/**
 * Values that usually need prompt medical attention, for common tests. Used in code (not by the model) so
 * "urgent" never depends on model variance. Conservative, adult values; units handled where labs differ.
 * This only raises a flag to see a doctor soon. It never suggests a treatment.
 */
interface Rule {
  match: RegExp;
  /** Converts the printed value to the unit the limits use; return null if the unit can't be handled. */
  normalise?: (value: number, unit: string) => number | null;
  low?: number;
  high?: number;
}

const mmolToMgGlucose = (v: number, unit: string) => (/mmol/i.test(unit) ? v * 18 : v);

const THOUSANDS = /10\^?3|10³|thou|\bk\/|\/nl/i;

/** Platelets are printed per µL, in thousands, or in lakhs (Indian labs). */
const plateletsPerMicrolitre = (v: number, unit: string) => {
  if (/lakh/i.test(unit)) return v * 100_000;
  if (THOUSANDS.test(unit)) return v * 1000;
  if (v < 20) return v * 100_000; // e.g. "2.4" with no unit: lakhs
  if (v < 2000) return v * 1000; // e.g. "240": thousands
  return v;
};

/** White cells are printed per µL or in thousands. */
const wbcPerMicrolitre = (v: number, unit: string) => {
  if (THOUSANDS.test(unit) || v < 200) return v * 1000;
  return v;
};

const RULES: Rule[] = [
  { match: /hba1c|a1c|glycated|glycosylated/i, low: undefined, high: 10 },
  { match: /glucose|sugar|fbs|ppbs|rbs|fpg/i, normalise: mmolToMgGlucose, low: 54, high: 300 },
  { match: /ha?emoglobin|\bhb\b|\bhgb\b/i, normalise: (v, u) => (/g\/l\b/i.test(u) && v > 30 ? v / 10 : v), low: 8, high: 20 },
  { match: /potassium|\bk\+?\b/i, low: 3.0, high: 6.0 },
  { match: /sodium|\bna\+?\b/i, low: 125, high: 155 },
  { match: /creatinine/i, normalise: (v, u) => (/mol/i.test(u) ? v / 88.4 : v), high: 3.0 },
  { match: /platelet|\bplt\b/i, normalise: plateletsPerMicrolitre, low: 50_000, high: 1_000_000 },
  { match: /\bwbc\b|white blood|leu[ck]ocyte|\btlc\b/i, normalise: wbcPerMicrolitre, low: 2_000, high: 30_000 },
  { match: /calcium/i, normalise: (v, u) => (/mmol/i.test(u) ? v * 4 : v), low: 7, high: 12 },
];

/** True when this test's value is beyond the prompt-attention limits. */
export function isCritical(test: string, value: number | null, unit: string): boolean {
  if (value === null) return false;
  const rule = RULES.find((r) => r.match.test(test));
  if (!rule) return false;
  const v = rule.normalise ? rule.normalise(value, unit) : value;
  if (v === null) return false;
  return (rule.low !== undefined && v < rule.low) || (rule.high !== undefined && v >= rule.high);
}
