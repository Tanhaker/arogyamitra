import { migrateReport, REPORT_VERSION } from "./migrate";
import type { ChatMessage, Explanation, Lang, SavedReport, TimeOfDay } from "./types";

/**
 * Everything is kept only in this browser (never on our server), so the user stays in control.
 * Each Google account gets its own keys, so people sharing a phone never see each other's data.
 */
const MAX = 30;
const keyFor = (userId: string) => `am_reports:${userId}`;

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

/** Loads saved reports, migrating old entries to the current schema (and saving the migrated copy). */
export function loadReports(userId: string): SavedReport[] {
  const list = read<SavedReport[]>(keyFor(userId), []);
  if (!Array.isArray(list)) return [];
  let changed = false;
  const out: SavedReport[] = [];
  for (const r of list) {
    if (r.version === REPORT_VERSION) {
      out.push(r);
      continue;
    }
    changed = true;
    const m = migrateReport(r);
    if (m) out.push(m);
  }
  if (changed) write(keyFor(userId), out);
  return out;
}

export function getReport(userId: string, id: string): SavedReport | null {
  return loadReports(userId).find((r) => r.id === id) ?? null;
}

export function saveReport(userId: string, result: Explanation, meta: { model?: string; lang?: Lang } = {}): SavedReport {
  const report: SavedReport = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    savedAt: new Date().toISOString(),
    version: REPORT_VERSION,
    ...meta,
    result,
  };
  write(keyFor(userId), [report, ...loadReports(userId)].slice(0, MAX));
  return report;
}

export function deleteReport(userId: string, id: string) {
  write(keyFor(userId), loadReports(userId).filter((r) => r.id !== id));
}

/** The date a report is about: the date printed on it, else when it was explained. */
export function reportDate(r: SavedReport): string {
  return r.result.report_date || r.savedAt.slice(0, 10);
}

export function formatDate(iso: string, lang: string): string {
  const d = new Date(iso.length === 10 ? `${iso}T00:00:00` : iso);
  if (Number.isNaN(d.getTime())) return iso;
  const locale = lang === "hi" ? "hi-IN" : lang === "gu" ? "gu-IN" : "en-IN";
  return d.toLocaleDateString(locale, { day: "numeric", month: "short", year: "numeric" });
}

/* ---------- Doses ticked as taken, per day ---------- */
const today = () => new Date().toLocaleDateString("en-CA"); // YYYY-MM-DD in local time
const takenKey = (userId: string) => `am_taken:${userId}:${today()}`;

export function loadTaken(userId: string): string[] {
  return read<string[]>(takenKey(userId), []);
}

export function toggleTaken(userId: string, doseId: string): string[] {
  const set = new Set(loadTaken(userId));
  if (set.has(doseId)) set.delete(doseId);
  else set.add(doseId);
  const list = [...set];
  write(takenKey(userId), list);
  return list;
}

export const doseId = (reportId: string, medicine: string, time: TimeOfDay) => `${reportId}|${medicine}|${time}`;

/* ---------- Chat history ---------- */
const chatKey = (userId: string) => `am_chat:${userId}`;

export function loadChat(userId: string): ChatMessage[] {
  return read<ChatMessage[]>(chatKey(userId), []);
}

export function saveChat(userId: string, messages: ChatMessage[]) {
  write(chatKey(userId), messages.slice(-40));
}

export function clearChat(userId: string) {
  try {
    localStorage.removeItem(chatKey(userId));
  } catch {}
}
