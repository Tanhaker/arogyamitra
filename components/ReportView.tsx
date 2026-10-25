"use client";

import Link from "next/link";
import { useState } from "react";
import { modelLabelClient } from "@/lib/modelLabel";
import { speak, stopSpeaking, useVoice } from "@/lib/speech";
import { formatDate, reportDate } from "@/lib/storage";
import type { LabResult, SavedReport, TimeOfDay } from "@/lib/types";
import { useApp } from "./AppProvider";
import ChatPanel from "./ChatPanel";
import DoctorSummary from "./DoctorSummary";
import { IconAlert, IconDownload, IconHome, IconScan, IconSpeaker, IconStop } from "./Icons";
import RangeBar from "./RangeBar";
import SeverityBadge from "./SeverityBadge";
import TimeIcon from "./TimeIcon";

const SLOTS: { key: TimeOfDay }[] = [{ key: "morning" }, { key: "afternoon" }, { key: "evening" }, { key: "night" }];

export default function ReportView({ report }: { report: SavedReport }) {
  const { t, lang } = useApp();
  const r = t.app.report;
  const data = report.result;
  const voice = useVoice(lang);
  const [reading, setReading] = useState(false);

  const urgent = data.lab_results.some((l) => l.status === "urgent");
  const flagged = data.lab_results.filter((l) => l.status !== "normal");
  const normal = data.lab_results.filter((l) => l.status === "normal");

  function readSummary() {
    if (!voice) return;
    if (reading) {
      stopSpeaking();
      setReading(false);
      return;
    }
    const timetable = SLOTS.filter((s) => data.schedule[s.key].length)
      .map((s) => `${t.app.times[s.key]}: ${data.schedule[s.key].join(", ")}`)
      .join(". ");
    setReading(true);
    speak([data.title, data.summary, timetable].filter(Boolean).join(". "), voice, () => setReading(false));
  }

  return (
    <>
      <div className="screen-only report">
        {urgent && (
          <div className="urgent-banner" role="alert">
            <IconAlert size={28} />
            <strong>{t.app.urgentBanner}</strong>
          </div>
        )}

        <header className="report-head">
          <p className="report-meta">
            {t.app.type[data.document_type]} · {formatDate(reportDate(report), lang)}
          </p>
          <h1 className="page-title">{data.title || t.app.type[data.document_type]}</h1>
        </header>

        {data.document_type === "other" ? (
          <section className="card"><p className="summary" style={{ margin: 0 }}>{data.summary || r.notMedical}</p></section>
        ) : (
          <>
            <section className="card">
              <div className="card-head">
                <h2 className="section-title">{r.summary}</h2>
                {voice && (
                  <button className="icon-btn" onClick={readSummary} aria-label={reading ? r.stopReading : r.readAloud}>
                    {reading ? <IconStop size={20} /> : <IconSpeaker size={20} />}
                  </button>
                )}
              </div>
              <p className="summary" style={{ margin: 0 }}>{data.summary}</p>
            </section>

            {data.medicines.length > 0 && (
              <>
                <section className="card">
                  <h2 className="section-title">{r.schedule}</h2>
                  <div className="timetable">
                    {SLOTS.map(({ key }) => {
                      const meds = data.medicines.filter((m) => m.timing.includes(key));
                      if (!meds.length) return null;
                      return (
                        <div key={key} className="slot">
                          <div className="slot-head"><TimeIcon time={key} /> {t.app.times[key]}</div>
                          <ul>
                            {meds.map((m) => (
                              <li key={m.name}>
                                {m.name}
                                {m.food !== "any" && m.food !== "unclear" ? ` · ${t.app.food[m.food]}` : ""}
                              </li>
                            ))}
                          </ul>
                        </div>
                      );
                    })}
                  </div>
                </section>

                <section className="card">
                  <h2 className="section-title">{r.medicines}</h2>
                  {data.medicines.map((m) => (
                    <div key={m.name} className="med">
                      <div className="med-name">{m.name}</div>
                      {m.purpose && <div>{m.purpose}</div>}
                      <div className="med-facts">
                        {m.dose && <span className="chip">{r.dose}: {m.dose}</span>}
                        {m.timing.length > 0 && <span className="chip">{m.timing.map((x) => t.app.times[x]).join(", ")}</span>}
                        {m.food !== "unclear" && <span className="chip">{t.app.food[m.food]}</span>}
                        {m.duration && <span className="chip">{r.duration}: {m.duration}</span>}
                      </div>
                      {m.notes && <p className="muted" style={{ margin: "6px 0 0" }}>{m.notes}</p>}
                      {m.confidence === "low" && (
                        <div className="alert alert-check" style={{ marginTop: 8 }}>{r.unclearMed}</div>
                      )}
                    </div>
                  ))}
                </section>
              </>
            )}

            {data.lab_results.length > 0 && (
              <section className="card">
                <h2 className="section-title">{r.results}</h2>
                {flagged.map((l, i) => <LabRow key={`${l.test}-${i}`} l={l} />)}
                {normal.length > 0 && (
                  <details className="normal-results" open={!flagged.length}>
                    <summary>{r.normalResults} ({normal.length})</summary>
                    {normal.map((l, i) => <LabRow key={`${l.test}-${i}`} l={l} />)}
                  </details>
                )}
              </section>
            )}

            {data.red_flags.length > 0 && (
              <section className="card">
                <h2 className="section-title">{r.flags}</h2>
                {data.red_flags.map((f, i) => (
                  <div key={i} className={`alert alert-${f.level}`}>{f.text}</div>
                ))}
              </section>
            )}

            {data.doctor_questions.length > 0 && (
              <section className="card">
                <h2 className="section-title">{r.questions}</h2>
                <ul className="list">
                  {data.doctor_questions.map((q, i) => <li key={i}>{q}</li>)}
                </ul>
              </section>
            )}

            {data.unclear_items.length > 0 && (
              <section className="card">
                <h2 className="section-title">{r.unclear}</h2>
                <ul className="list">
                  {data.unclear_items.map((u, i) => <li key={i}>{u}</li>)}
                </ul>
              </section>
            )}

            <div className="safety-note" role="note">{t.safetyNotice}</div>

            <ChatPanel compact initialReportIds={[report.id]} />
          </>
        )}

        <div className="stack report-actions">
          {data.document_type !== "other" && (
            <button className="btn btn-primary" onClick={() => window.print()}>
              <IconDownload /> {r.download}
            </button>
          )}
          <Link className="btn btn-secondary" href="/scan">
            <IconScan /> {r.scanAnother}
          </Link>
          <Link className="btn btn-secondary" href="/dashboard">
            <IconHome /> {r.back}
          </Link>
        </div>

        <p className="footer-note">
          {r.explainedBy}
          {report.model ? ` · ${modelLabelClient(report.model)}` : ""}
        </p>
      </div>

      {data.document_type !== "other" && <DoctorSummary data={data} lang={lang} t={t} />}
    </>
  );

  function LabRow({ l }: { l: LabResult }) {
    const value = l.value !== null ? String(l.value) : l.value_text || "";
    return (
      <div className={`lab lab-${l.status}`}>
        <div className="lab-head">
          <span className="lab-name">{l.test}</span>
          <SeverityBadge level={l.status} t={t} noRange={!l.range_text} />
        </div>
        <div className="lab-reading">
          <span className="lab-num">{value}</span>
          {l.value !== null && <span className="lab-unit">{l.unit}</span>}
          {l.range_text && <span className="lab-range">{r.range}: {l.range_text}</span>}
        </div>
        {l.value !== null && (
          <RangeBar value={l.value} low={l.ref_low ?? null} high={l.ref_high ?? null} status={l.status}
            label={`${l.test}: ${l.value} ${l.unit}, ${r.range} ${l.range_text}`} />
        )}
        {l.explanation && <p className="lab-explain">{l.explanation}</p>}
      </div>
    );
  }
}
