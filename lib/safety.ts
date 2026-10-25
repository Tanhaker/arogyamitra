/**
 * MEDICAL SAFETY LAYER
 * 1. SAFETY_RULES go into every Gemma prompt (explain, chat, concern).
 * 2. scrub() runs on every free-text sentence Gemma writes before it reaches the user and drops
 *    sentences that diagnose, prescribe, recommend treatment, or tell someone to start/stop/change a medicine.
 * 3. normalize.ts adds the code-side rules: critical-value table, shorthand decoding, duplicate ingredients,
 *    "confirm with your doctor or pharmacist" on every flag, and no invented ranges.
 */
import type { Explanation, Lang } from "./types";

export const SAFETY_RULES = `MEDICAL SAFETY RULES (these override everything else):
1. Do NOT diagnose. Never say or imply the person has, may have, or is likely to have any disease or condition.
   Describe values only ("HbA1c is far above the range printed on your report"), never what illness they mean.
2. Do NOT prescribe. Never suggest any medicine, dose, dosage change, frequency or timing that is not printed on the paper.
3. Do NOT recommend treatment, diet plans, exercise plans, supplements or home remedies.
4. Never tell anyone to start, stop, skip, continue, increase, decrease or switch a medicine.
5. Never invent missing values, units or reference ranges. If something is not printed on the paper, say it is not on the report.
6. If a value is far outside the printed range or marked critical by the lab, say it needs prompt medical attention
   and that they should contact a doctor soon. Never say what treatment to take.
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

/** Ending every flag carries, so no flag reads as advice to act alone. */
export const CONFIRM: Record<Lang, string> = {
  en: "Confirm with your doctor or pharmacist.",
  hi: "अपने डॉक्टर या फार्मासिस्ट से पक्का करें।",
  gu: "તમારા ડૉક્ટર અથવા ફાર્માસિસ્ટ પાસે ખાતરી કરો.",
};

const CONFIRM_HINT = /doctor|pharmacist|chemist|डॉक्टर|फार्मासिस्ट|केमिस्ट|ડૉક્ટર|ફાર્માસિસ્ટ|કેમિસ્ટ/i;

export function withConfirm(text: string, lang: Lang): string {
  if (!text || CONFIRM_HINT.test(text)) return text;
  const sep = /[.!?।]$/.test(text.trim()) ? " " : ". ";
  return `${text.trim()}${sep}${CONFIRM[lang]}`;
}

export const FLAG_TEXT = {
  duplicate: {
    en: (a: string, b: string, ing: string) => `${a} and ${b} may both contain ${ing}. Ask your pharmacist before taking them together.`,
    hi: (a: string, b: string, ing: string) => `${a} और ${b} दोनों में ${ing} हो सकता है। साथ लेने से पहले अपने फार्मासिस्ट से पूछें।`,
    gu: (a: string, b: string, ing: string) => `${a} અને ${b} બંનેમાં ${ing} હોઈ શકે છે. સાથે લેતા પહેલાં તમારા ફાર્માસિસ્ટને પૂછો.`,
  },
  outOfRange: {
    en: (names: string) => `Outside the range printed by your lab: ${names}.`,
    hi: (names: string) => `लैब की दी गई सीमा से बाहर: ${names}।`,
    gu: (names: string) => `લેબે આપેલી મર્યાદાની બહાર: ${names}.`,
  },
  unreadable: {
    en: (n: number) => `${n} part(s) of this paper could not be read clearly.`,
    hi: (n: number) => `इस पर्ची के ${n} हिस्से साफ़ नहीं पढ़े जा सके।`,
    gu: (n: number) => `આ ચિઠ્ઠીના ${n} ભાગ સ્પષ્ટ વાંચી શકાયા નથી.`,
  },
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
    title: clean(r.title),
    summary: clean(r.summary),
    medicines: r.medicines.map((m) => ({ ...m, purpose: clean(m.purpose), notes: m.notes ? clean(m.notes) : m.notes })),
    lab_results: r.lab_results.map((l) => ({ ...l, explanation: clean(l.explanation) })),
    red_flags: r.red_flags.map((f) => ({ ...f, text: clean(f.text) })),
  };
  return { result, removed: log.removed };
}
