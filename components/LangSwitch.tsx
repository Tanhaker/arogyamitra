"use client";

import { useRouter } from "next/navigation";
import { LANG_LABEL, LANG_ORDER, rememberLang } from "@/lib/lang";
import type { Lang } from "@/lib/types";

/**
 * The one language switcher (same order everywhere: English · हिंदी · ગુજરાતી).
 * In the app it calls onChange; on public pages it remembers the choice and reloads that page's language.
 */
export default function LangSwitch({ lang, label, onChange, className = "" }: {
  lang: Lang;
  label: string;
  onChange?: (l: Lang) => void;
  className?: string;
}) {
  const router = useRouter();
  function pick(l: Lang) {
    if (l === lang) return;
    if (onChange) {
      onChange(l);
      return;
    }
    rememberLang(l);
    router.replace(l === "en" ? "/?lang=en" : `/?lang=${l}`, { scroll: false });
  }
  return (
    <div className={`lang-switch ${className}`} role="group" aria-label={label}>
      {LANG_ORDER.map((l) => (
        <button key={l} type="button" lang={l} aria-pressed={l === lang} onClick={() => pick(l)}>
          {LANG_LABEL[l]}
        </button>
      ))}
    </div>
  );
}
