import Link from "next/link";
import { HOME } from "@/lib/home-i18n";
import type { Lang } from "@/lib/types";
import GetStarted from "./GetStarted";
import LangSwitch from "./LangSwitch";
import Logo from "./Logo";
import ThemeToggle from "./ThemeToggle";

export default function SiteHeader({ lang = "en", signedIn = false }: { lang?: Lang; signedIn?: boolean }) {
  const h = HOME[lang];
  const q = lang === "en" ? "" : `?lang=${lang}`;
  return (
    <header className="site-header">
      <div className="home-wrap site-header-row">
        <Link href={`/${q}#home`} className="logo-link" aria-label="ArogyaMitra home">
          <Logo />
        </Link>
        <nav className="site-nav" aria-label="Main">
          <Link href={`/${q}#home`}>{h.nav.home}</Link>
          <Link href={`/${q}#how-it-works`}>{h.nav.how}</Link>
          <Link href={`/${q}#features`}>{h.nav.features}</Link>
          <Link href={`/${q}#about`}>{h.nav.about}</Link>
        </nav>
        <div className="site-header-actions">
          <LangSwitch lang={lang} label={h.langLabel} className="lang-switch-header" />
          <ThemeToggle labels={{ light: h.themeLight, dark: h.themeDark }} />
          <GetStarted className="btn btn-secondary btn-sm" label={h.getStarted} dashboardLabel={h.openDashboard} lang={lang} signedIn={signedIn} />
        </div>
      </div>
    </header>
  );
}
