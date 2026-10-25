import type { Strings } from "@/lib/i18n";
import { formatDate } from "@/lib/storage";
import type { Explanation, Lang } from "@/lib/types";

/**
 * A one-page summary to take to the doctor. It is hidden on screen and is the only thing
 * printed, so "Download summary" = the browser's print dialog -> "Save as PDF".
 */
export default function DoctorSummary({ data, lang, t }: { data: Explanation; lang: Lang; t: Strings }) {
  const abnormal = data.lab_results.filter((r) => r.status !== "normal");
  const today = formatDate(new Date().toISOString(), lang);

  return (
    <div className="print-only doc-summary">
      <h1>
        AarogyaMitra · {t.doctor.title}
      </h1>
      <p className="doc-meta">
        {t.doctor.prepared}: {today}
        {data.report_date ? ` · ${t.doctor.reportDate}: ${formatDate(data.report_date, lang)}` : ""}
      </p>

      {data.summary && (
        <>
          <h2>{t.summary}</h2>
          <p>{data.summary}</p>
        </>
      )}

      {data.medicines.length > 0 && (
        <>
          <h2>{t.medicines}</h2>
          <table>
            <thead>
              <tr>
                <th>{t.doctor.medicine}</th>
                <th>{t.dose}</th>
                <th>{t.doctor.when}</th>
                <th>{t.duration}</th>
              </tr>
            </thead>
            <tbody>
              {data.medicines.map((m, i) => (
                <tr key={i}>
                  <td>{m.name}</td>
                  <td>{m.dose}</td>
                  <td>
                    {m.when.map((w) => t[w]).join(", ")}
                    {m.food && m.food !== "any" ? ` (${t.food[m.food]})` : ""}
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
          <h2>{abnormal.length ? t.doctor.abnormal : t.results}</h2>
          <table>
            <thead>
              <tr>
                <th>{t.doctor.test}</th>
                <th>{t.doctor.result}</th>
                <th>{t.normalRange}</th>
                <th>{t.doctor.status}</th>
              </tr>
            </thead>
            <tbody>
              {(abnormal.length ? abnormal : data.lab_results).map((r, i) => (
                <tr key={i}>
                  <td>{r.test}</td>
                  <td>{r.value}</td>
                  <td>{r.normal_range}</td>
                  <td>{t.status[r.status]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      {data.warnings.length > 0 && (
        <>
          <h2>{t.warnings}</h2>
          <ul>
            {data.warnings.map((w, i) => (
              <li key={i}>{w.text || t.urgentDefault}</li>
            ))}
          </ul>
        </>
      )}

      {data.doctor_questions.length > 0 && (
        <>
          <h2>{t.questions}</h2>
          <ol>
            {data.doctor_questions.map((q, i) => (
              <li key={i}>{q}</li>
            ))}
          </ol>
        </>
      )}

      <h2>{t.doctor.notes}</h2>
      <div className="doc-notes" />

      <p className="doc-foot">{t.disclaimer}</p>
    </div>
  );
}
