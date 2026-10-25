import type { Lang } from "./types";

export const LANG_COOKIE = "am_lang";
export const LANG_ORDER: Lang[] = ["en", "hi", "gu"];
export const LANG_LABEL: Record<Lang, string> = { en: "English", hi: "हिंदी", gu: "ગુજરાતી" };

export function pickLang(v: unknown): Lang {
  return v === "hi" || v === "gu" ? v : "en";
}

/** Remembers the language in a cookie (read by the server) and localStorage, and updates <html lang>. */
export function rememberLang(lang: Lang) {
  document.cookie = `${LANG_COOKIE}=${lang}; path=/; max-age=31536000; samesite=lax`;
  try {
    localStorage.setItem(LANG_COOKIE, lang);
  } catch {}
  document.documentElement.lang = lang;
}
