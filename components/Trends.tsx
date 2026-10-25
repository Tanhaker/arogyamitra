import type { Strings } from "@/lib/i18n";
import { formatDate, reportDate } from "@/lib/storage";
import type { Lang, SavedReport } from "@/lib/types";

interface Point {
  date: string;
  value: number;
  status: string;
}

interface Series {
  key: string;
  label: string;
  unit: string;
  low: number | null;
  high: number | null;
  points: Point[];
}

/** Groups the same test across saved lab reports (matched on test_key) into one series per test. */
function buildSeries(reports: SavedReport[]): Series[] {
  const map = new Map<string, Series>();
  const sorted = [...reports].sort((a, b) => reportDate(a).localeCompare(reportDate(b)));
  for (const r of sorted) {
    for (const lab of r.result.lab_results) {
      if (lab.value_num === null) continue;
      const key = lab.test_key.trim().toLowerCase();
      const s = map.get(key) ?? { key, label: lab.test, unit: lab.unit, low: null, high: null, points: [] };
      s.label = lab.test;
      s.unit = lab.unit || s.unit;
      s.low = lab.ref_low ?? s.low;
      s.high = lab.ref_high ?? s.high;
      s.points.push({ date: reportDate(r), value: lab.value_num, status: lab.status });
      map.set(key, s);
    }
  }
  // Only tests measured more than once can show a trend; abnormal-latest first.
  return [...map.values()]
    .filter((s) => s.points.length >= 2)
    .sort((a, b) => Number(b.points.at(-1)!.status !== "normal") - Number(a.points.at(-1)!.status !== "normal"));
}

function Chart({ s, lang }: { s: Series; lang: Lang }) {
  const W = 320;
  const H = 150;
  const pad = { l: 44, r: 44, t: 20, b: 30 };
  const values = s.points.map((p) => p.value);
  // Keep the lab's limits on screen too, so the normal band is visible even when every value is far outside it.
  const limits = [s.low, s.high].filter((v): v is number => v !== null);
  const lo = Math.min(...values, ...limits);
  const hi = Math.max(...values, ...limits);
  const span = hi - lo || 1;
  const yMin = lo - span * 0.15;
  const yMax = hi + span * 0.15;
  const x = (i: number) => pad.l + (i * (W - pad.l - pad.r)) / Math.max(1, s.points.length - 1);
  const y = (v: number) => pad.t + ((yMax - v) * (H - pad.t - pad.b)) / (yMax - yMin);
  const bandTop = y(s.high ?? yMax);
  const bandBottom = y(s.low ?? yMin);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="trend-chart" role="img"
      aria-label={`${s.label}: ${s.points.map((p) => `${formatDate(p.date, lang)} ${p.value}`).join(", ")}`}>
      {(s.low !== null || s.high !== null) && (
        <rect x={pad.l} y={bandTop} width={W - pad.l - pad.r} height={Math.max(0, bandBottom - bandTop)}
          className="trend-band" />
      )}
      <polyline className="trend-line" fill="none"
        points={s.points.map((p, i) => `${x(i)},${y(p.value)}`).join(" ")} />
      {s.points.map((p, i) => (
        <g key={i}>
          <circle cx={x(i)} cy={y(p.value)} r={5} className={p.status === "normal" ? "trend-dot" : "trend-dot-bad"} />
          <text x={x(i)} y={y(p.value) - 10} textAnchor="middle" className="trend-value">
            {p.value}
          </text>
          <text x={x(i)} y={H - 8} textAnchor="middle" className="trend-axis">
            {formatDate(p.date, lang)}
          </text>
        </g>
      ))}
    </svg>
  );
}

export default function Trends({ reports, lang, t }: { reports: SavedReport[]; lang: Lang; t: Strings }) {
  const series = buildSeries(reports.filter((r) => r.result.document_type === "lab_report"));

  if (!series.length) {
    return (
      <section className="card">
        <h2 className="section-title">📈 {t.trends.title}</h2>
        <p style={{ margin: 0 }}>{t.trends.needTwo}</p>
      </section>
    );
  }

  return (
    <section className="card">
      <h2 className="section-title">📈 {t.trends.title}</h2>
      <p className="muted" style={{ marginTop: -6 }}>
        {t.trends.hint}
      </p>
      {series.map((s) => {
        const first = s.points[0].value;
        const last = s.points.at(-1)!.value;
        const dir = last > first ? "▲" : last < first ? "▼" : "=";
        return (
          <div key={s.key} className="trend">
            <div className="lab-head">
              <strong>{s.label}</strong>
              <span className="muted">
                {first} → {last} {s.unit} {dir}
              </span>
            </div>
            <Chart s={s} lang={lang} />
          </div>
        );
      })}
    </section>
  );
}
