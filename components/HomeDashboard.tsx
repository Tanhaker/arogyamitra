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
import { IconCamera, IconChat, IconFlask, IconPill, IconPrint, IconShare, IconSpeaker, IconStethoscope, IconStop, IconTrash } from "./Icons";
import SeverityBadge from "./SeverityBadge";
import Sparkline from "./Sparkline";
import TimeIcon from "./TimeIcon";

const TIMES: TimeOfDay[] = ["morning", "afternoon", "evening", "night"];

const SAMPLES: Record<"prescription" | "lab_report", string> = {
  prescription: "/samples/demo-prescription.jpg",
  lab_report: "/samples/demo-lab-report.jpg",
};

/** Which part of the day it is now, to highlight the next doses. */
function currentSlot(): TimeOfDay {
  const h = new Date().getHours();
  return h < 12 ? "morning" : h < 17 ? "afternoon" : h < 20 ? "evening" : "night";
}

export default function HomeDashboard() {
  const { t, lang, user } = useApp();
  const a = t.app;
  const router = useRouter();
  const voice = useVoice(lang);
  const [reports, setReports] = useState<SavedReport[] | null>(null);
  const [taken, setTaken] = useState<string[]>([]);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [sampleBusy, setSampleBusy] = useState<DocType | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [reading, setReading] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [now, setNow] = useState<TimeOfDay>("morning");

  useEffect(() => {
    setReports(loadReports(user.id));
    setTaken(loadTaken(user.id));
    setNow(currentSlot());
  }, [user.id]);

  const list = useMemo(() => reports ?? [], [reports]);
  const prescriptions = useMemo(() => list.filter((r) => r.result.document_type === "prescription"), [list]);

  // Today's medicines: every saved prescription merged into one timetable (the caregiver case).
  const today = useMemo(
    () =>
      TIMES.map((time) => ({
        time,
        items: prescriptions.flatMap((r) =>
          r.result.medicines
            .filter((m) => m.timing.includes(time))
            .map((m) => ({ id: doseId(r.id, m.name, time), name: m.name, food: m.food })),
        ),
      })).filter((s) => s.items.length),
    [prescriptions],
  );
  const totalDoses = today.reduce((n, s) => n + s.items.length, 0);
  const doneDoses = today.reduce((n, s) => n + s.items.filter((i) => taken.includes(i.id)).length, 0);

  const attention = useMemo(
    () =>
      list
        .filter((r) => r.result.document_type === "lab_report")
        .flatMap((r) => r.result.lab_results.filter((l) => l.status !== "normal").map((l) => ({ r, l })))
        .sort((x, y) => (x.l.status === y.l.status ? 0 : x.l.status === "urgent" ? -1 : 1))
        .slice(0, 6),
    [list],
  );

  const trends = useMemo(() => {
    const map = new Map<string, { label: string; unit: string; low: number | null; high: number | null; points: { date: string; value: number; bad: boolean }[] }>();
    const labs = list.filter((r) => r.result.document_type === "lab_report").sort((x, y) => reportDate(x).localeCompare(reportDate(y)));
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
  }, [list]);

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
      .map((s) => `${a.times[s.time]}: ${s.items.map((i) => (i.food !== "any" && i.food !== "unclear" ? `${i.name} (${a.food[i.food]})` : i.name)).join(", ")}`)
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
  const empty = reports !== null && list.length === 0;
  const recent = showAll ? list : list.slice(0, 4);

  const samples = (compact: boolean) =>
    sampleBusy ? (
      <div className="sample-busy" aria-live="polite" aria-busy="true">
        <div className="spinner" />
        <p className="muted">{a.scan.reading}</p>
      </div>
    ) : (
      <div className={compact ? "sample-row compact" : "sample-row"}>
        {(["prescription", "lab_report"] as const).map((k) => (
          <button key={k} className="sample-btn" onClick={() => trySample(k)}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {!compact && <img src={SAMPLES[k]} alt="" />}
            <span>{k === "prescription" ? a.samples.rx : a.samples.lab}</span>
          </button>
        ))}
      </div>
    );

  return (
    <div className="home-dash">
      <h1 className="page-title">{t.hello}{firstName ? `, ${firstName}` : ""}</h1>
      {error && <div className="error" role="alert">{error}</div>}

      <nav className="quick" aria-label={a.quick.title}>
        <Link href="/scan?type=prescription" className={empty ? "quick-tile" : "quick-tile quick-accent"}><IconPill size={34} /> {a.quick.scanRx}</Link>
        <Link href="/scan?type=lab_report" className="quick-tile"><IconFlask size={34} /> {a.quick.scanLab}</Link>
        <Link href="/chat" className="quick-tile"><IconChat size={34} /> {a.quick.chat}</Link>
        <Link href="/concern" className="quick-tile"><IconStethoscope size={34} /> {a.quick.concern}</Link>
      </nav>

      {reports === null ? null : empty ? (
        /* ---------- First run: one clear panel, no empty cards ---------- */
        <section className="card first-run">
          <div className="first-run-main">
            <h2 className="first-run-title">{a.start.title}</h2>
            <ol className="first-run-steps">
              {a.start.steps.map((s, i) => (
                <li key={i}><span className="step-num">{i + 1}</span>{s}</li>
              ))}
            </ol>
            <Link href="/scan" className="btn btn-accent btn-inline first-run-cta"><IconCamera /> {a.start.cta}</Link>
          </div>
          <div className="first-run-side">
            <h3 className="side-title">{a.start.sampleTitle}</h3>
            <p className="muted" style={{ marginTop: 0 }}>{a.start.sampleHint}</p>
            {samples(false)}
          </div>
        </section>
      ) : (
        /* ---------- Returning user: two independent columns, no gaps ---------- */
        <div className="dash-cols">
          <div className="dash-col">
            {totalDoses > 0 ? (
              <section className="card schedule-card print-target">
                <div className="card-head">
                  <h2 className="section-title">{a.today.title}</h2>
                  {voice && (
                    <button className="icon-btn screen-only-inline" onClick={readToday} aria-label={reading ? t.app.report.stopReading : a.today.readAloud}>
                      {reading ? <IconStop size={20} /> : <IconSpeaker size={20} />}
                    </button>
                  )}
                </div>
                <div className="progress" aria-label={a.progress.replace("{done}", String(doneDoses)).replace("{total}", String(totalDoses))}>
                  <div className="progress-track"><span style={{ width: `${(doneDoses / totalDoses) * 100}%` }} /></div>
                  <span className="muted">{a.progress.replace("{done}", String(doneDoses)).replace("{total}", String(totalDoses))}</span>
                </div>
                {today.map((s) => (
                  <div key={s.time} className={s.time === now ? "dose-slot is-now" : "dose-slot"}>
                    <h3 className="slot-head">
                      <TimeIcon time={s.time} /> {a.times[s.time]}
                      {s.time === now && <span className="now-tag">{a.now}</span>}
                    </h3>
                    <ul className="dose-list">
                      {s.items.map((i) => (
                        <li key={i.id}>
                          <label className="dose">
                            <input type="checkbox" checked={taken.includes(i.id)} onChange={() => setTaken(toggleTaken(user.id, i.id))}
                              aria-label={`${a.today.markTaken}: ${i.name}`} />
                            <span className={taken.includes(i.id) ? "dose-name taken" : "dose-name"}>{i.name}</span>
                            {i.food !== "any" && i.food !== "unclear" && <span className="food-tag">{a.food[i.food]}</span>}
                          </label>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
                <p className="dose-sources">
                  {a.fromCount}:{" "}
                  {prescriptions.map((r, i) => (
                    <span key={r.id}>
                      {i > 0 && " · "}
                      <Link href={`/report/${r.id}`}>{r.result.title || formatDate(reportDate(r), lang)}</Link>
                    </span>
                  ))}
                </p>
                <div className="action-row screen-only-flex">
                  <a className="btn btn-secondary btn-inline" href={`https://wa.me/?text=${encodeURIComponent(`${a.today.shareIntro}\n${scheduleText()}`)}`}
                    target="_blank" rel="noopener noreferrer">
                    <IconShare /> {a.today.share}
                  </a>
                  <button className="btn btn-secondary btn-inline" onClick={printToday}><IconPrint /> {a.today.print}</button>
                </div>
              </section>
            ) : (
              <section className="card hint-card">
                <IconPill size={28} />
                <p style={{ margin: 0 }}>{a.today.empty}</p>
              </section>
            )}

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
          </div>

          <div className="dash-col">
            {attention.length > 0 && (
              <section className="card">
                <h2 className="section-title">{a.attention.title}</h2>
                <ul className="attention">
                  {attention.map(({ r, l }, i) => (
                    <li key={`${r.id}-${i}`}>
                      <Link href={`/report/${r.id}`}>
                        <span className="attention-main">
                          <strong>{l.test}</strong>
                          <span className="attention-value">{l.value !== null ? `${l.value} ${l.unit}` : l.value_text}</span>
                        </span>
                        <SeverityBadge level={l.status} t={t} />
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <section className="card recent-card">
              <h2 className="section-title">{a.recent.title}</h2>
              <ul className="recent">
                {recent.map((r) => (
                  <li key={r.id}>
                    <span className="recent-icon" aria-hidden="true">
                      {r.result.document_type === "lab_report" ? <IconFlask size={22} /> : <IconPill size={22} />}
                    </span>
                    <div className="recent-main">
                      <Link href={`/report/${r.id}`} className="recent-title">{r.result.title || a.type[r.result.document_type]}</Link>
                      <span className="muted">{a.type[r.result.document_type]} · {formatDate(reportDate(r), lang)}</span>
                    </div>
                    <SeverityBadge level={worstSeverity(r.result)} t={t} />
                    {confirmId === r.id ? (
                      <div className="confirm" role="alertdialog" aria-label={a.recent.confirmDelete}>
                        <p>{a.recent.confirmDelete}</p>
                        <div className="action-row">
                          <button className="btn btn-secondary btn-inline" onClick={() => setConfirmId(null)}>{t.app.camera.cancel}</button>
                          <button className="btn btn-danger btn-inline" onClick={() => { deleteReport(user.id, r.id); setReports(loadReports(user.id)); setConfirmId(null); }}>
                            {a.recent.remove}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button className="icon-btn recent-delete" onClick={() => setConfirmId(r.id)} aria-label={`${a.recent.remove}: ${r.result.title}`}>
                        <IconTrash size={20} />
                      </button>
                    )}
                  </li>
                ))}
              </ul>
              {list.length > 4 && !showAll && (
                <button className="btn btn-secondary btn-inline" onClick={() => setShowAll(true)}>{a.recent.all} ({list.length})</button>
              )}
            </section>

            <section className="card samples-card">
              <h2 className="side-title">{a.samples.title}</h2>
              {samples(true)}
            </section>
          </div>
        </div>
      )}

      <p className="footer-note">{a.privacyLine}</p>
    </div>
  );
}
