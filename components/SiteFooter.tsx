import Link from "next/link";
import Logo from "./Logo";

export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="home-wrap footer-grid">
        <div>
          <Logo />
          <p className="footer-about">
            ArogyaMitra helps you understand and organise your health information in Gujarati, Hindi or English, and
            prepare clear summaries for your doctor. Powered by Gemma 4.
          </p>
        </div>
        <nav className="footer-links" aria-label="Footer">
          <Link href="/#home">Home</Link>
          <Link href="/#how-it-works">How It Works</Link>
          <Link href="/#features">Features</Link>
          <Link href="/#about">About</Link>
          <Link href="/privacy">Privacy Policy</Link>
          <Link href="/disclaimer">Medical Disclaimer</Link>
        </nav>
      </div>
      <div className="home-wrap footer-bottom">
        <span>© {new Date().getFullYear()} ArogyaMitra · Team LemonRice</span>
        <span>Not a substitute for professional medical advice.</span>
      </div>
    </footer>
  );
}
