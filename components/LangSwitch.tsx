import Link from "next/link";
import { LANG_NAMES } from "@/lib/home-i18n";
import type { Lang } from "@/lib/types";

const LANGS: Lang[] = ["gu", "hi", "en"];

/** Plain links (?lang=) so it works without JavaScript and each language has its own URL. */
export default function LangSwitch({ lang, label, className = "" }: { lang: Lang; label: string; className?: string }) {
  return (
    <nav className={`lang-switch ${className}`} aria-label={label}>
      {LANGS.map((l) => (
        <Link key={l} href={l === "en" ? "/" : `/?lang=${l}`} lang={l} aria-current={l === lang ? "true" : undefined}
          scroll={false}>
          {LANG_NAMES[l]}
        </Link>
      ))}
    </nav>
  );
}
