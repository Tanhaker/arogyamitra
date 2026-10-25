import type { TimeOfDay } from "@/lib/types";
import { IconMoon, IconSun, IconSunHigh, IconSunset } from "./Icons";

/** Line icons for the times of day, matching the rest of the icon set (no emoji). */
export default function TimeIcon({ time, size = 22 }: { time: TimeOfDay; size?: number }) {
  const Icon = time === "morning" ? IconSun : time === "afternoon" ? IconSunHigh : time === "evening" ? IconSunset : IconMoon;
  return <Icon size={size} className={`time-icon time-${time}`} />;
}
