"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { explainPages, samplePage } from "@/lib/explainClient";
import { worstSeverity } from "@/lib/normalize";
import { speak, stopSpeaking, useVoice } from "@/lib/speech";
import { deleteReport, doseId, formatDate, loadReports, loadTaken, reportDate, saveReport, toggleTaken } from "@/lib/storage";
import type { DocType, SavedReport, TimeOfDay } from "@/lib/types";
import { useApp } from "./AppProvider";
import { IconChat, IconPrint, IconScan, IconShare, IconSpeaker, IconStethoscope, IconStop, IconTrash } from "./Icons";
import SeverityBadge from "./SeverityBadge";
import Sparkline from "./Sparkline";

const SLOTS: { key: TimeOfDay; icon: string }[] = [
  { key: "morning", icon: "☀️" },
  { key: "afternoon", icon: "🌤️" },
  { key: "evening", icon: "🌇" },
  { key: "night", icon: "🌙" },
];

const SAMPLES: Record<"prescription" | "lab_report", string> = {
  prescription: "/samples/demo-prescription.jpg",
  lab_report: "/samples/demo-lab-report.jpg",
};

export default function HomeDashboard() {
  const { t, lang, user } = useApp();
  const a = t.app;
  const router = useRouter();
  const voice = useVoice(lang);
  const [reports, setReports] = useState<SavedReport[]>([]);
  const [taken, setTaken] = useState<string[]>([]);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [sampleBusy, setSampleBusy] = useState<DocType | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [reading, setReading] = useState(false);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    setReports(loadReports(user.id));
    setTaken(loadTaken(user.id));
  }, [user.id]);

  // Today's medicines: every saved prescription merged into one timetable (the caregiver case).
  const prescriptions = reports.filter((r) => r.result.document_type === "prescription");
  const today = useMemo(
    () =>
      SLOTS.map(({ key, icon }) => ({
        key,
        icon,
        items: prescriptions.flatMap((r) =>
          r.result.medicines
            .filter((m) => m.timing.includes(key))
            .map((m) => ({ id: doseId(r.id, m.name, key), name: m.name, food: m.food, from: r.result.title || formatDate(reportDate(r), lang), reportId: r.id })),
        ),
      })).filter((s) => s.items.length),
    [prescriptions, lang],
  );

  const attention = useMemo(
    () =>
      reports
        .filter((r) => r.result.document_type === "lab_report")
        .flatMap((r) => r.result.lab_results.filter((l) => l.status !== "normal").map((l) => ({ r, l })))
        .sort((x, y) => (x.l.status === y.l.status ? 0 : x.l.status === "urgent" ? -1 : 1))
        .slice(0, 6),
    [reports],
  );

  const trends = useMemo(() => {
    const map = new Map<string, { label: string; unit: string; low: number | null; high: number | null; points: { date: string; value: number; bad: boolean }[] }>();
    const labs = reports.filter((r) => r.result.document_type === "lab_report").sort((x, y) => reportDate(x).localeCompare(reportDate(y)));
    for (const r of labs) {
      for (const l of r.result.lab_results) {
        if (l.value === null) continue;
        const key = (l.test_key || l.test).toLowerCase();
        const s = map.get(key) ?? { label: l.test, unit: l.unit, low: null, high: null, points: [] };
        s.low = l.ref_low ?? s.low;
        s.high = l.ref_high ?? s.high;
        s.points.push({ date: reportDate(r), value: l.value, bad: l.status !== "normal" });
        map.set(key, s);
      }
    }
    return [...map.values()].filter((s) => s.points.length >= 2).slice(0, 4);
  }, [reports]);

  async function trySample(kind: "prescription" | "lab_report") {
    setSampleBusy(kind);
    setError(null);
    try {
      const page = await samplePage(SAMPLES[kind]);
      const { result, model } = await explainPages([page], kind, lang);
      const saved = saveReport(user.id, result, { model, lang });
      router.push(`/report/${saved.id}`);
    } catch (e) {
      const key = e instanceof Error ? e.message : "generic";
      setError(t.errors[key as keyof typeof t.errors] ?? t.errors.generic);
      setSampleBusy(null);
    }
  }

  function scheduleText() {
    return today
      .map((s) => `${a.times[s.key]}: ${s.items.map((i) => (i.food !== "any" && i.food !== "unclear" ? `${i.name} (${a.food[i.food]})` : i.name)).join(", ")}`)
      .join("\n");
  }

  function readToday() {
    if (!voice) return;
    if (reading) {
      stopSpeaking();
      setReading(false);
      return;
    }
    setReading(true);
    speak(scheduleText().replace(/\n/g, ". "), voice, () => setReading(false));
  }

  function printToday() {
    document.body.classList.add("print-schedule");
    const done = () => {
      document.body.classList.remove("print-schedule");
      window.removeEventListener("afterprint", done);
    };
    window.addEventListener("afterprint", done);
    window.print();
  }

  const firstName = user.name.split(" ")[0];
  const recent = showAll ? reports : reports.slice(0, 4);

  return (
    <div className="home-dash">
      <h1 className="page-title">{t.hello}{firstName ? `, ${firstName}` : ""} 👋</h1>
      {error && <div className="error" role="alert">{error}</div>}

      <section aria-label={a.quick.title}>
        <h2 className="sr-only">{a.quick.title}</h2>
        <div className="quick">
          <Link href="/scan?type=prescription" className="quick-tile quick-accent"><IconScan size={28} /> {a.quick.scanRx}</Link>
          <Link href="/scan?type=lab_report" className="quick-tile"><IconScan size={28} /> {a.quick.scanLab}</Link>
          <Link href="/chat" className="quick-tile"><IconChat size={28} /> {a.quick.chat}</Link>
          <Link href="/concern" className="quick-tile"><IconStethoscope size={28} /> {a.quick.concern}</Link>
        </div>
      </section>

      <div className="dash-grid">
        <section className="card schedule-card print-target">
          <div className="card-head">
            <h2 className="section-title">{a.today.title}</h2>
            {today.length > 0 && voice && (
              <button className="icon-btn screen-only-inline" onClick={readToday} aria-label={reading ? t.app.report.stopReading : a.today.readAloud}>
                {reading ? <IconStop size={20} /> : <IconSpeaker size={20} />}
              </button>
            )}
          </div>
          {today.length === 0 ? (
            <p className="muted" style={{ margin: 0 }}>{a.today.empty}</p>
          ) : (
            <>
              {today.map((s) => (
                <div key={s.key} className="dose-slot">
                  <h3 className="slot-head">{s.icon} {a.times[s.key]}</h3>
                  <ul className="dose-list">
                    {s.items.map((i) => (
                      <li key={i.id}>
                        <label className="dose">
                          <input type="checkbox" checked={taken.includes(i.id)} onChange={() => setTaken(toggleTaken(user.id, i.id))}
                            aria-label={`${a.today.markTaken}: ${i.name}`} />
                          <span className={taken.includes(i.id) ? "dose-name taken" : "dose-name"}>
                            {i.name}
                            {i.food !== "any" && i.food !== "unclear" && <span className="muted"> · {a.food[i.food]}</span>}
                          </span>
                        </label>
                        <Link href={`/report/${i.reportId}`} className="dose-from">{a.today.from}: {i.from}</Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
              <div className="btn-row screen-only-flex">
                <a className="btn btn-secondary" href={`https://wa.me/?text=${encodeURIComponent(`${a.today.shareIntro}\n${scheduleText()}`)}`}
                  target="_blank" rel="noopener noreferrer">
                  <IconShare /> {a.today.share}
                </a>
                <button className="btn btn-secondary" onClick={printToday}><IconPrint /> {a.today.print}</button>
              </div>
            </>
          )}
        </section>

        <section className="card">
          <h2 className="section-title">{a.attention.title}</h2>
          {attention.length === 0 ? (
            <p className="muted" style={{ margin: 0 }}>{a.attention.empty}</p>
          ) : (
            <ul className="attention">
              {attention.map(({ r, l }, i) => (
                <li key={`${r.id}-${i}`}>
                  <Link href={`/report/${r.id}`}>
                    <span>
                      <strong>{l.test}</strong>
                      <span className="muted"> · {l.value !== null ? `${l.value} ${l.unit}` : l.value_text} · {formatDate(reportDate(r), lang)}</span>
                    </span>
                    <SeverityBadge level={l.status} t={t} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="card recent-card">
          <h2 className="section-title">{a.recent.title}</h2>
          {reports.length === 0 ? (
            <p className="muted">{a.recent.empty}</p>
          ) : (
            <ul className="recent">
              {recent.map((r) => (
                <li key={r.id}>
                  <div className="recent-main">
                    <Link href={`/report/${r.id}`} className="recent-title">{r.result.title || a.type[r.result.document_type]}</Link>
                    <span className="muted">{a.type[r.result.document_type]} · {formatDate(reportDate(r), lang)}</span>
                  </div>
                  <SeverityBadge level={worstSeverity(r.result)} t={t} />
                  {confirmId === r.id ? (
                    <div className="confirm" role="alertdialog" aria-label={a.recent.confirmDelete}>
                      <p>{a.recent.confirmDelete}</p>
                      <div className="btn-row">
                        <button className="btn btn-secondary" onClick={() => setConfirmId(null)}>{t.app.camera.cancel}</button>
                        <button className="btn btn-danger" onClick={() => { deleteReport(user.id, r.id); setReports(loadReports(user.id)); setConfirmId(null); }}>
                          {a.recent.remove}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="recent-actions">
                      <Link className="btn btn-secondary btn-inline" href={`/report/${r.id}`}>{a.recent.open}</Link>
                      <button className="icon-btn" onClick={() => setConfirmId(r.id)} aria-label={`${a.recent.remove}: ${r.result.title}`}>
                        <IconTrash size={20} />
                      </button>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
          {reports.length > 4 && !showAll && (
            <button className="btn btn-secondary" onClick={() => setShowAll(true)}>{a.recent.all} ({reports.length})</button>
          )}
        </section>

        {trends.length > 0 && (
          <section className="card">
            <h2 className="section-title">{a.trends.title}</h2>
            <p className="muted" style={{ marginTop: -6 }}>{a.trends.note}</p>
            <ul className="trend-list">
              {trends.map((s) => (
                <li key={s.label}>
                  <div className="lab-head">
                    <strong>{s.label}</strong>
                    <span className="muted">{s.points[0].value} → {s.points[s.points.length - 1].value} {s.unit}</span>
                  </div>
                  <Sparkline points={s.points} low={s.low} high={s.high} label={`${s.label}: ${s.points.map((p) => p.value).join(", ")}`} />
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="card samples-card">
          <h2 className="section-title">{a.samples.title}</h2>
          <p className="muted" style={{ marginTop: -6 }}>{a.samples.hint}</p>
          {sampleBusy ? (
            <div className="center" aria-live="polite" aria-busy="true">
              <div className="spinner" />
              <p className="muted">{a.scan.reading}</p>
            </div>
          ) : (
            <div className="btn-row">
              <button className="btn btn-secondary" onClick={() => trySample("prescription")}>{a.samples.rx}</button>
              <button className="btn btn-secondary" onClick={() => trySample("lab_report")}>{a.samples.lab}</button>
            </div>
          )}
        </section>
      </div>

      <p className="footer-note">{a.privacyLine}</p>
    </div>
  );
}
