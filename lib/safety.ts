/**
 * MEDICAL SAFETY LAYER
 * 1. SAFETY_RULES go into every Gemma prompt (explain + ask).
 * 2. scrub() runs on every free-text sentence Gemma writes before it reaches the user and drops
 *    sentences that diagnose, prescribe, recommend treatment, or tell someone to start/stop a medicine.
 * 3. normalize.ts enforces the data rules (no invented ranges; "critical" only when the lab says so).
 */
import type { Explanation, Lang } from "./types";

export const SAFETY_RULES = `MEDICAL SAFETY RULES (these override everything else):
1. Do NOT diagnose. Never say or imply the person has, may have, or is likely to have any disease or condition.
   Describe values only ("HbA1c is above the range printed on your report"), never what illness they mean.
2. Do NOT prescribe. Never suggest any medicine, dose, dosage change, frequency or timing that is not printed on the paper.
3. Do NOT recommend treatment, diet plans, exercise plans, supplements or home remedies.
4. Never tell anyone to start, stop, skip, continue, increase, decrease or switch a medicine.
5. Never invent missing values, units or reference ranges. If something is not printed on the paper, say it is not on the report.
6. Only call a result "critical" when the LAB itself marks it as critical / panic / alert value on the report.
   For those, tell the person to contact a doctor or seek medical care promptly.
7. Remind them that understanding a report properly needs a qualified doctor who knows their health history.`;

// Sentences that cross the line. Negations like "do not stop" are also removed on purpose: the app
// shows its own fixed "never change a medicine without your doctor" notice instead.
const BLOCKED: RegExp[] = [
  // Diagnosis
  /\byou\s+(?:have|has|may\s+have|might\s+have|probably\s+have|likely\s+have|are\s+suffering\s+from|are\s+diabetic|are\s+anaemic|are\s+anemic)\b/i,
  /\b(?:this|these|it)\s+(?:means|indicates|confirms|suggests|shows)\s+(?:that\s+)?you\s+(?:have|are)\b/i,
  /\b(?:diagnos(?:is|ed|e)|you\s+are\s+(?:pre-?)?diabetic)\b/i,
  // Start / stop / change medication
  /\b(?:stop|discontinue|quit|skip|start|begin|resume|continue|increase|decrease|reduce|raise|lower|double|halve|switch|change|adjust)\w*\b[^.!?\n]{0,50}\b(?:medicine|medication|tablet|capsule|dose|dosage|insulin|drug|pill|syrup|injection|treatment)s?\b/i,
  // Prescribing / treatment advice
  /\b(?:you\s+should|you\s+must|you\s+need\s+to|try|consider)\s+(?:not\s+)?(?:take|taking|start|stop|skip|continue|increase|decrease|reduce|switch|use|using|eat|avoid|follow)\b/i,
  /\b(?:stop|discontinue|quit|start|begin|resume)\s+(?:taking|using)\b/i,
  /\btake\s+\d+(?:\.\d+)?\s*(?:mg|ml|g|mcg|units?|tablets?)\b/i,
  // Hindi
  /(?:दवा|दवाई|खुराक|डोज़|इंसुलिन)[^।.!?\n]{0,30}(?:बंद\s*कर|शुरू\s*कर|बढ़ा|घटा|कम\s*कर|बदल)/,
  /आपको\s+[^।.!?\n]{0,30}(?:बीमारी|रोग|डायबिटीज|मधुमेह|एनीमिया)\s+है/,
  // Gujarati
  /(?:દવા|ડોઝ|ઇન્સ્યુલિન)[^।.!?\n]{0,30}(?:બંધ\s*કર|શરૂ\s*કર|વધાર|ઘટાડ|બદલ)/,
  /તમને\s+[^।.!?\n]{0,30}(?:રોગ|બીમારી|ડાયાબિટીસ|મધુમેહ|એનિમિયા)\s+છે/,
];

const FALLBACK: Record<Lang, string> = {
  en: "Please discuss this with your doctor.",
  hi: "कृपया इसके बारे में अपने डॉक्टर से बात करें।",
  gu: "કૃપા કરીને આ વિશે તમારા ડૉક્ટર સાથે વાત કરો.",
};

export interface SafetyLog {
  removed: number;
}

/** Drops unsafe sentences from a piece of model text; falls back to "ask your doctor" if nothing is left. */
export function scrub(text: string, lang: Lang, log: SafetyLog): string {
  if (!text) return text;
  const sentences = text.match(/[^.!?।\n]+[.!?।]*\s*/g) ?? [text];
  const kept = sentences.filter((s) => {
    const bad = BLOCKED.some((re) => re.test(s));
    if (bad) log.removed++;
    return !bad;
  });
  if (kept.length === sentences.length) return text;
  const out = kept.join("").trim();
  return out || FALLBACK[lang];
}

/** Runs scrub() over every free-text field Gemma wrote. Values read off the paper are left as printed. */
export function applySafety(r: Explanation, lang: Lang): { result: Explanation; removed: number } {
  const log: SafetyLog = { removed: 0 };
  const clean = (t: string) => scrub(t, lang, log);
  const result: Explanation = {
    ...r,
    summary: clean(r.summary),
    medicines: r.medicines.map((m) => ({ ...m, purpose: clean(m.purpose), notes: clean(m.notes) })),
    lab_results: r.lab_results.map((l) => ({ ...l, meaning: clean(l.meaning) })),
    warnings: r.warnings.map((w) => ({ ...w, text: clean(w.text) })),
  };
  return { result, removed: log.removed };
}
