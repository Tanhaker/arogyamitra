import type { Strings } from "@/lib/i18n";
import { formatDate } from "@/lib/storage";
import type { Explanation, Lang } from "@/lib/types";

/**
 * A one-page summary to take to the doctor. Hidden on screen and the only thing printed, so
 * "Download summary" = the browser's print dialog -> "Save as PDF".
 */
export default function DoctorSummary({ data, lang, t }: { data: Explanation; lang: Lang; t: Strings }) {
  const r = t.app.report;
  const flagged = data.lab_results.filter((l) => l.status !== "normal");
  return (
    <div className="print-only doc-summary">
      <h1>ArogyaMitra · {t.doctor.title}</h1>
      <p className="doc-meta">
        {t.doctor.prepared}: {formatDate(new Date().toISOString(), lang)}
        {data.report_date ? ` · ${t.doctor.reportDate}: ${formatDate(data.report_date, lang)}` : ""}
      </p>
      {data.title && <h2>{data.title}</h2>}
      {data.summary && <p>{data.summary}</p>}

      {data.medicines.length > 0 && (
        <>
          <h2>{r.medicines}</h2>
          <table>
            <thead>
              <tr><th>{t.doctor.medicine}</th><th>{r.dose}</th><th>{t.doctor.when}</th><th>{r.duration}</th></tr>
            </thead>
            <tbody>
              {data.medicines.map((m) => (
                <tr key={m.name}>
                  <td>{m.name}</td>
                  <td>{m.dose}</td>
                  <td>
                    {m.timing.map((x) => t.app.times[x]).join(", ")}
                    {m.food !== "any" && m.food !== "unclear" ? ` (${t.app.food[m.food]})` : ""}
                  </td>
                  <td>{m.duration}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      {data.lab_results.length > 0 && (
        <>
          <h2>{flagged.length ? t.doctor.abnormal : r.results}</h2>
          <table>
            <thead>
              <tr><th>{t.doctor.test}</th><th>{t.doctor.result}</th><th>{r.range}</th><th>{t.doctor.status}</th></tr>
            </thead>
            <tbody>
              {(flagged.length ? flagged : data.lab_results).map((l, i) => (
                <tr key={i}>
                  <td>{l.test}</td>
                  <td>{l.value !== null ? `${l.value} ${l.unit}` : l.value_text}</td>
                  <td>{l.range_text}</td>
                  <td>{t.app.severity[l.status]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      {data.red_flags.length > 0 && (
        <>
          <h2>{r.flags}</h2>
          <ul>{data.red_flags.map((f, i) => <li key={i}>{f.text}</li>)}</ul>
        </>
      )}

      {data.doctor_questions.length > 0 && (
        <>
          <h2>{r.questions}</h2>
          <ol>{data.doctor_questions.map((q, i) => <li key={i}>{q}</li>)}</ol>
        </>
      )}

      <h2>{t.doctor.notes}</h2>
      <div className="doc-notes" />
      <p className="doc-foot">{t.safetyNotice} {t.disclaimer}</p>
    </div>
  );
}
