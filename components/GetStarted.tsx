import Link from "next/link";
import { getStarted } from "@/app/actions";
import type { Lang } from "@/lib/types";

/**
 * Every "Get started" button shares this. Signed in: a plain link to the dashboard ("Open my dashboard").
 * Signed out: starts the real Google sign-in.
 */
export default function GetStarted({ className = "btn btn-accent", label, dashboardLabel, lang = "en", signedIn = false }: {
  className?: string;
  label: string;
  dashboardLabel: string;
  lang?: Lang;
  signedIn?: boolean;
}) {
  if (signedIn) {
    return (
      <Link href="/dashboard" className={className}>
        {dashboardLabel}
      </Link>
    );
  }
  return (
    <form action={getStarted} className="get-started">
      <input type="hidden" name="lang" value={lang} />
      <button type="submit" className={className}>
        {label}
      </button>
    </form>
  );
}
