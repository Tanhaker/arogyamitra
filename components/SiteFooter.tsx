import Link from "next/link";
import { HOME } from "@/lib/home-i18n";
import type { Lang } from "@/lib/types";
import Logo from "./Logo";

export default function SiteFooter({ lang = "en" }: { lang?: Lang }) {
  const h = HOME[lang];
  const q = lang === "en" ? "" : `?lang=${lang}`;
  return (
    <footer className="site-footer">
      <div className="home-wrap footer-grid">
        <div>
          <Logo />
          <p className="footer-about">{h.footer.about}</p>
        </div>
        <nav className="footer-links" aria-label="Footer">
          <Link href={`/${q}#home`}>{h.nav.home}</Link>
          <Link href={`/${q}#how-it-works`}>{h.nav.how}</Link>
          <Link href={`/${q}#features`}>{h.nav.features}</Link>
          <Link href={`/${q}#about`}>{h.nav.about}</Link>
          <Link href="/privacy">{h.footer.privacy}</Link>
          <Link href="/disclaimer">{h.footer.disclaimer}</Link>
        </nav>
      </div>
      <div className="home-wrap footer-bottom">
        <span>© {new Date().getFullYear()} ArogyaMitra · Team LemonRice</span>
        <span>{h.footer.note}</span>
      </div>
    </footer>
  );
}
