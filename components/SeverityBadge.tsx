import type { Strings } from "@/lib/i18n";
import type { Severity } from "@/lib/types";
import { IconAlert, IconCheck, IconInfo } from "./Icons";

/** Severity is always shown as icon + words, never colour alone. */
export default function SeverityBadge({ level, t, noRange = false }: { level: Severity; t: Strings; noRange?: boolean }) {
  const Icon = level === "urgent" ? IconAlert : level === "check" ? IconInfo : IconCheck;
  const label = level === "normal" && noRange ? t.app.severity.noRange : t.app.severity[level];
  return (
    <span className={`sev sev-${noRange && level === "normal" ? "none" : level}`}>
      <Icon size={16} />
      {label}
    </span>
  );
}
