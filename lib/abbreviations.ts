import type { Medicine, TimeOfDay } from "./types";

/** Indian prescription shorthand. Shared by the prompt (so Gemma decodes it) and by code (as a backstop). */
export const ABBREVIATIONS: Record<string, string> = {
  "1-0-1": "morning and night",
  "1-1-1": "morning, afternoon and night",
  "1-0-0": "morning only",
  "0-0-1": "night only",
  "0-1-0": "afternoon only",
  OD: "once a day",
  BD: "twice a day (morning and night)",
  BID: "twice a day (morning and night)",
  TDS: "three times a day (morning, afternoon, night)",
  TID: "three times a day (morning, afternoon, night)",
  QID: "four times a day",
  HS: "at bedtime (night)",
  SOS: "only when needed",
  PRN: "only when needed",
  AC: "before food",
  PC: "after food",
  "A/F": "after food",
  "B/F": "before food",
};

export function abbreviationGuide(): string {
  return Object.entries(ABBREVIATIONS)
    .map(([k, v]) => `${k} = ${v}`)
    .join("; ");
}

const DIGIT = "(?:1|0|½|1/2)";

/** Fills in timing / food from shorthand when the model left them empty. Never invents anything else. */
export function applyShorthand(m: Medicine): Medicine {
  const text = ` ${m.dose} ${m.notes ?? ""} ${m.duration} ${m.name} `;
  let timing: TimeOfDay[] = m.timing;
  if (!timing.length) {
    const four = new RegExp(`\\b(${DIGIT})\\s*-\\s*(${DIGIT})\\s*-\\s*(${DIGIT})\\s*-\\s*(${DIGIT})\\b`).exec(text);
    const three = new RegExp(`\\b(${DIGIT})\\s*-\\s*(${DIGIT})\\s*-\\s*(${DIGIT})\\b`).exec(text);
    const on = (d: string) => d !== "0";
    if (four) {
      timing = (["morning", "afternoon", "evening", "night"] as TimeOfDay[]).filter((_, i) => on(four[i + 1]));
    } else if (three) {
      timing = (["morning", "afternoon", "night"] as TimeOfDay[]).filter((_, i) => on(three[i + 1]));
    } else if (/\bQID\b/i.test(text)) timing = ["morning", "afternoon", "evening", "night"];
    else if (/\b(TDS|TID)\b/i.test(text)) timing = ["morning", "afternoon", "night"];
    else if (/\b(BD|BID)\b|twice/i.test(text)) timing = ["morning", "night"];
    else if (/\bHS\b|bed\s*time/i.test(text)) timing = ["night"];
    else if (/\bOD\b|once a day|once daily/i.test(text)) timing = ["morning"];
  }
  let food = m.food;
  if (food === "unclear") {
    if (/\bAC\b|\bB\/F\b|before food|before meal/i.test(text)) food = "before";
    else if (/\bPC\b|\bA\/F\b|after food|after meal/i.test(text)) food = "after";
  }
  return { ...m, timing, food };
}
