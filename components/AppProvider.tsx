"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { STRINGS, type Strings } from "@/lib/i18n";
import { rememberLang } from "@/lib/lang";
import type { Lang } from "@/lib/types";

export interface AppUser {
  id: string;
  name: string;
  email: string;
}

interface AppContextValue {
  user: AppUser;
  lang: Lang;
  t: Strings;
  setLang: (l: Lang) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ user, initialLang, children }: { user: AppUser; initialLang: Lang; children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>(initialLang);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = useCallback((l: Lang) => {
    rememberLang(l);
    setLangState(l);
  }, []);

  return <AppContext.Provider value={{ user, lang, t: STRINGS[lang], setLang }}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used inside <AppProvider>");
  return ctx;
}
