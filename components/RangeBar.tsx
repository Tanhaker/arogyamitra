import type { Severity } from "@/lib/types";

/**
 * Where a value sits against the lab's printed range: a green normal band and a marker.
 * Only drawn when the report printed a range; never invents one.
 */
export default function RangeBar({ value, low, high, status, label }: {
  value: number;
  low: number | null;
  high: number | null;
  status: Severity;
  label: string;
}) {
  if (low === null && high === null) return null;
  const bandLow = low ?? 0;
  const bandHigh = high ?? Math.max(bandLow * 2, value * 1.2);
  const min = Math.min(bandLow, value) * 0.85;
  const max = Math.max(bandHigh, value) * 1.1 || 1;
  const pct = (v: number) => Math.min(100, Math.max(0, ((v - min) / (max - min)) * 100));
  return (
    <div className="range-bar" role="img" aria-label={label}>
      <div className="range-track">
        <span className="range-band" style={{ left: `${pct(bandLow)}%`, width: `${pct(bandHigh) - pct(bandLow)}%` }} />
        <span className={`range-marker range-${status}`} style={{ left: `${pct(value)}%` }} />
      </div>
    </div>
  );
}
