"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logOut } from "@/app/actions";
import { useApp } from "./AppProvider";
import { IconChat, IconHome, IconLogout, IconScan, IconStethoscope } from "./Icons";
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
            <ThemeToggle labels={{ light: t.themeLight, dark: t.themeDark }} />
            <form action={logOut}>
              <button className="logout-btn" type="submit" aria-label={t.logout}>
                <IconLogout size={20} />
                <span className="logout-text">{t.logout}</span>
              </button>
            </form>
          </div>
        </div>
        <div className="app-header-lang">
          <LangSwitch lang={lang} label={t.app.langLabel} onChange={setLang} />
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
