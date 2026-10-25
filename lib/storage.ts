import type { Explanation, SavedReport } from "./types";

/**
 * Reports are kept only in this browser (never on our server), so the user stays in control.
 * Each Google account gets its own key, so people sharing a phone never see each other's reports.
 */
const MAX = 30;
const keyFor = (userId: string) => `am_reports:${userId}`;

export function loadReports(userId: string): SavedReport[] {
  try {
    const raw = localStorage.getItem(keyFor(userId));
    const list = raw ? (JSON.parse(raw) as SavedReport[]) : [];
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

function write(userId: string, list: SavedReport[]) {
  try {
    localStorage.setItem(keyFor(userId), JSON.stringify(list.slice(0, MAX)));
  } catch {}
}

export function saveReport(userId: string, result: Explanation): SavedReport {
  const report: SavedReport = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    savedAt: new Date().toISOString(),
    result,
  };
  write(userId, [report, ...loadReports(userId)]);
  return report;
}

export function deleteReport(userId: string, id: string) {
  write(userId, loadReports(userId).filter((r) => r.id !== id));
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
