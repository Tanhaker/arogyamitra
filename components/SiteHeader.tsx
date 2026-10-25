import Link from "next/link";
import GetStarted from "./GetStarted";
import Logo from "./Logo";
import ThemeToggle from "./ThemeToggle";

export default function SiteHeader() {
  return (
    <header className="site-header">
      <div className="home-wrap site-header-row">
        <Link href="/#home" className="logo-link" aria-label="ArogyaMitra home">
          <Logo />
        </Link>
        <nav className="site-nav" aria-label="Main">
          <Link href="/#home">Home</Link>
          <Link href="/#how-it-works">How It Works</Link>
          <Link href="/#features">Features</Link>
          <Link href="/#about">About</Link>
        </nav>
        <div className="site-header-actions">
          <ThemeToggle labels={{ light: "Switch to light mode", dark: "Switch to dark mode" }} />
          <GetStarted className="btn btn-accent btn-sm" />
        </div>
      </div>
    </header>
  );
}
