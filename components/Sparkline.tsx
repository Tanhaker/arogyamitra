/** Small trend line with the lab's printed range as a shaded band. */
export default function Sparkline({ points, low, high, label }: {
  points: { date: string; value: number; bad: boolean }[];
  low: number | null;
  high: number | null;
  label: string;
}) {
  const W = 220;
  const H = 64;
  const pad = 8;
  const values = points.map((p) => p.value);
  const limits = [low, high].filter((v): v is number => v !== null);
  const lo = Math.min(...values, ...limits);
  const hi = Math.max(...values, ...limits);
  const span = hi - lo || 1;
  const yMin = lo - span * 0.15;
  const yMax = hi + span * 0.15;
  const x = (i: number) => pad + (i * (W - 2 * pad)) / Math.max(1, points.length - 1);
  const y = (v: number) => pad + ((yMax - v) * (H - 2 * pad)) / (yMax - yMin);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="spark" role="img" aria-label={label}>
      {limits.length > 0 && (
        <rect x={pad} width={W - 2 * pad} y={y(high ?? yMax)} height={Math.max(0, y(low ?? yMin) - y(high ?? yMax))} className="spark-band" />
      )}
      <polyline fill="none" className="spark-line" points={points.map((p, i) => `${x(i)},${y(p.value)}`).join(" ")} />
      {points.map((p, i) => (
        <circle key={i} cx={x(i)} cy={y(p.value)} r={4} className={p.bad ? "spark-dot-bad" : "spark-dot"} />
      ))}
    </svg>
  );
}
