"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { LANG_LABEL, LANG_SHORT } from "@/lib/lang";
import { logOut } from "@/app/actions";
import { useApp } from "./AppProvider";
import { IconChat, IconChevronDown, IconHome, IconLogout, IconScan, IconStethoscope } from "./Icons";
import LangSwitch from "./LangSwitch";
import Logo from "./Logo";
import ThemeToggle from "./ThemeToggle";

export default function AppHeader() {
  const { t, lang, setLang } = useApp();
  const path = usePathname();
  const items = [
    { href: "/dashboard", label: t.app.nav.home, Icon: IconHome },
    { href: "/scan", label: t.app.nav.scan, Icon: IconScan },
    { href: "/chat", label: t.app.nav.chat, Icon: IconChat },
    { href: "/concern", label: t.app.nav.concern, Icon: IconStethoscope },
  ];
  const active = (href: string) => path === href || (href === "/dashboard" && path.startsWith("/report"));
  const [langOpen, setLangOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!langOpen) return;
    const close = (e: MouseEvent | KeyboardEvent) => {
      if (e instanceof KeyboardEvent ? e.key === "Escape" : !menuRef.current?.contains(e.target as Node)) setLangOpen(false);
    };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", close);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", close);
    };
  }, [langOpen]);

  return (
    <>
      <header className="app-header screen-only">
        <div className="app-header-row">
          <Link href="/" className="logo-link" aria-label="ArogyaMitra">
            <Logo />
          </Link>
          <nav className="app-nav" aria-label="Main">
            {items.map(({ href, label }) => (
              <Link key={href} href={href} aria-current={active(href) ? "page" : undefined}>
                {label}
              </Link>
            ))}
            <Link href="/#about">{t.app.nav.about}</Link>
          </nav>
          <div className="app-header-actions">
            <LangSwitch lang={lang} label={t.app.langLabel} onChange={setLang} className="lang-switch-wide" />
            {/* Narrow screens: one small button instead of a full-width row */}
            <div className="lang-menu" ref={menuRef}>
              <button className="lang-menu-btn" onClick={() => setLangOpen((o) => !o)} aria-expanded={langOpen} aria-haspopup="true"
                aria-label={`${t.app.langLabel}: ${LANG_LABEL[lang]}`}>
                <span lang={lang} className="lang-long">{LANG_LABEL[lang]}</span>
                <span lang={lang} className="lang-short" aria-hidden="true">{LANG_SHORT[lang]}</span>
                <IconChevronDown size={18} />
              </button>
              {langOpen && (
                <div className="lang-menu-pop">
                  <LangSwitch lang={lang} label={t.app.langLabel} onChange={(l) => { setLang(l); setLangOpen(false); }} className="lang-switch-stack" />
                </div>
              )}
            </div>
            <ThemeToggle labels={{ light: t.themeLight, dark: t.themeDark }} />
            <form action={logOut}>
              <button className="logout-btn" type="submit" aria-label={t.logout}>
                <IconLogout size={20} />
                <span className="logout-text">{t.logout}</span>
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* Phones: big bottom tabs are easier to reach and read than a top menu */}
      <nav className="tabbar screen-only" aria-label="Main">
        {items.map(({ href, label, Icon }) => (
          <Link key={href} href={href} aria-current={active(href) ? "page" : undefined}>
            <Icon size={24} />
            <span>{label}</span>
          </Link>
        ))}
      </nav>
    </>
  );
}
