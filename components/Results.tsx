import type { Strings } from "@/lib/i18n";
import type { Explanation, TimeOfDay } from "@/lib/types";

const SLOTS: { key: TimeOfDay; icon: string }[] = [
  { key: "morning", icon: "☀️" },
  { key: "afternoon", icon: "🌤️" },
  { key: "night", icon: "🌙" },
];

export default function Results({ data, t }: { data: Explanation; t: Strings }) {
  if (data.document_type === "other") {
    return (
      <section className="card">
        <p className="summary">{data.summary || t.notMedical}</p>
      </section>
    );
  }

  const scheduled = data.medicines.filter((m) => m.when.length > 0);

  return (
    <>
      {data.warnings.some((w) => w.level === "urgent") && (
        <section className="card" aria-live="polite">
          {data.warnings
            .filter((w) => w.level === "urgent")
            .map((w, i) => (
              <div key={i} className="alert alert-urgent">
                <strong>⚠️ {w.text || t.urgentDefault}</strong>
              </div>
            ))}
        </section>
      )}

      <div className="safety-note" role="note">
        ℹ️ {t.safetyNotice}
      </div>

      {data.summary && (
        <section className="card">
          <h2 className="section-title">{t.summary}</h2>
          <p className="summary" style={{ margin: 0 }}>
            {data.summary}
          </p>
        </section>
      )}

      {scheduled.length > 0 && (
        <section className="card">
          <h2 className="section-title">{t.timetable}</h2>
          <div className="timetable">
            {SLOTS.map(({ key, icon }) => {
              const meds = scheduled.filter((m) => m.when.includes(key));
              if (!meds.length) return null;
              return (
                <div key={key} className="slot">
                  <div className="slot-head">
                    {icon} {t[key]}
                  </div>
                  <ul>
                    {meds.map((m, i) => (
                      <li key={i}>
                        {m.name}
                        {m.food && m.food !== "any" ? ` · ${t.food[m.food]}` : ""}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {data.medicines.length > 0 && (
        <section className="card">
          <h2 className="section-title">{t.medicines}</h2>
          {data.medicines.map((m, i) => (
            <div key={i} className="med">
              <div className="med-name">💊 {m.name}</div>
              {m.purpose && <div>{m.purpose}</div>}
              <div className="med-facts">
                {m.dose && (
                  <span className="chip">
                    {t.dose}: {m.dose}
                  </span>
                )}
                {m.food && <span className="chip">{t.food[m.food]}</span>}
                {m.duration && (
                  <span className="chip">
                    {t.duration}: {m.duration}
                  </span>
                )}
              </div>
              {m.notes && <div className="muted" style={{ marginTop: 6 }}>{m.notes}</div>}
              {m.unclear && (
                <div className="alert alert-check" style={{ marginTop: 8 }}>
                  {t.unclearMed}
                </div>
              )}
            </div>
          ))}
        </section>
      )}

      {data.lab_results.length > 0 && (
        <section className="card">
          <h2 className="section-title">{t.results}</h2>
          {data.lab_results.map((r, i) => (
            <div key={i} className="lab">
              <div className="lab-head">
                <strong>{r.test}</strong>
                <span className={`badge badge-${r.status}`}>{t.status[r.status]}</span>
              </div>
              <div>
                {r.value}
                {r.normal_range && (
                  <span className="muted">
                    {" "}
                    · {t.normalRange}: {r.normal_range}
                  </span>
                )}
              </div>
              {r.meaning && <div className="muted">{r.meaning}</div>}
            </div>
          ))}
        </section>
      )}

      {data.warnings.some((w) => w.level !== "urgent") && (
        <section className="card">
          <h2 className="section-title">{t.warnings}</h2>
          {data.warnings
            .filter((w) => w.level !== "urgent")
            .map((w, i) => (
              <div key={i} className={`alert alert-${w.level}`}>
                {w.text}
              </div>
            ))}
        </section>
      )}

      {data.doctor_questions.length > 0 && (
        <section className="card">
          <h2 className="section-title">{t.questions}</h2>
          <ul className="list">
            {data.doctor_questions.map((q, i) => (
              <li key={i}>{q}</li>
            ))}
          </ul>
        </section>
      )}

      {data.unclear.length > 0 && (
        <section className="card">
          <h2 className="section-title">{t.unclear}</h2>
          <ul className="list">
            {data.unclear.map((u, i) => (
              <li key={i}>{u}</li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}
