import type { Explanation, SavedReport } from "./types";

/** Reports are kept only in this browser (never on our server), so the user stays in control. */
const KEY = "am_reports";
const MAX = 30;

export function loadReports(): SavedReport[] {
  try {
    const raw = localStorage.getItem(KEY);
    const list = raw ? (JSON.parse(raw) as SavedReport[]) : [];
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

function write(list: SavedReport[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(list.slice(0, MAX)));
  } catch {}
}

export function saveReport(result: Explanation): SavedReport {
  const report: SavedReport = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    savedAt: new Date().toISOString(),
    result,
  };
  write([report, ...loadReports()]);
  return report;
}

export function deleteReport(id: string) {
  write(loadReports().filter((r) => r.id !== id));
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
