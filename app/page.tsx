import type { Metadata } from "next";
import { cookies } from "next/headers";
import { auth } from "@/auth";
import GetStarted from "@/components/GetStarted";
import {
  IconCheck,
  IconDownload,
  IconGlobe,
  IconListCheck,
  IconLock,
  IconQuestion,
  IconScan,
  IconShieldHeart,
  IconSpark,
  IconSpeech,
  IconStethoscope,
} from "@/components/Icons";
import LangSwitch from "@/components/LangSwitch";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import { HOME, type HomeStrings } from "@/lib/home-i18n";
import { LANG_COOKIE, pickLang } from "@/lib/lang";
import "./home.css";

export const metadata: Metadata = {
  title: "ArogyaMitra: a health guide, right by your side",
  description:
    "Understand your medical reports and prepare for doctor visits in Gujarati, Hindi or English. Powered by Gemma 4.",
};

const STEP_ICONS = [IconSpeech, IconSpark, IconListCheck];

/** Product preview built from the demo report, so the hero shows the real thing, not a stock photo. */
function HeroPreview({ h }: { h: HomeStrings }) {
  const p = h.preview;
  const rows = [
    { test: p.tests[0], value: "312 mg/dL", range: "70–100", status: p.status.high, tone: "check" },
    { test: p.tests[1], value: "10.2 g/dL", range: "13–17", status: p.status.low, tone: "check" },
    { test: p.tests[2], value: "1.1 mg/dL", range: "0.7–1.3", status: p.status.normal, tone: "ok" },
  ];
  return (
    <div className="preview-stage" aria-hidden="true">
      <div className="preview-card">
        <div className="preview-head">
          <span className="preview-kicker">{p.kicker}</span>
          <span className="preview-tag">{p.tag}</span>
        </div>
        <p className="preview-summary">{p.summary}</p>
        <ul className="preview-rows">
          {rows.map((r) => (
            <li key={r.test}>
              <div>
                <strong>{r.test}</strong>
                <span>
                  {r.value} · {p.range} {r.range}
                </span>
              </div>
              <em className={`preview-badge preview-${r.tone}`}>{r.status}</em>
            </li>
          ))}
        </ul>
      </div>
      <div className="preview-bubble">
        <span className="preview-bubble-label">{p.question}</span>
        HbA1c નો અર્થ શું છે?
      </div>
      <div className="preview-chip">
        <IconCheck size={18} /> {p.chip}
      </div>
    </div>
  );
}

export default async function HomePage({ searchParams }: { searchParams: Promise<{ error?: string; lang?: string }> }) {
  const { error, lang: langParam } = await searchParams;
  // ?lang= wins (the middleware also remembers it in a cookie); otherwise the remembered language.
  const lang = pickLang(langParam ?? (await cookies()).get(LANG_COOKIE)?.value);
  const signedIn = Boolean((await auth())?.user);
  const h = HOME[lang];
  const authMessage = error ? (h.auth[error as keyof typeof h.auth] ?? h.auth.default) : null;

  const features = [
    { Icon: IconScan, ...h.features.reports },
    { Icon: IconQuestion, ...h.features.questions },
    { Icon: IconDownload, ...h.features.pdf },
    { Icon: IconLock, ...h.features.privacy },
  ];

  return (
    <div className="home" lang={lang}>
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <SiteHeader lang={lang} signedIn={signedIn} />

      <main id="main">
        <section id="home" className="hero">
          <div className="home-wrap hero-grid">
            <div className="hero-copy">
              {authMessage && (
                <div className="auth-message" role="alert">
                  {authMessage}
                </div>
              )}
              <LangSwitch lang={lang} label={h.langLabel} className="lang-switch-hero" />
              <h1 className="hero-title">
                {h.heroTitle1} <span className="hero-accent">{h.heroTitle2}</span>
              </h1>
              <p className="hero-text">{h.heroText}</p>
              <div className="hero-actions">
                <GetStarted className="btn btn-accent btn-lg" label={h.getStarted} dashboardLabel={h.openDashboard} lang={lang} signedIn={signedIn} />
              </div>
              <p className="hero-note">
                <IconLock size={16} /> {h.heroNote}
              </p>
            </div>
            <HeroPreview h={h} />
          </div>
        </section>

        <section id="how-it-works" className="home-section">
          <div className="home-wrap how-grid">
            <div className="how-intro">
              <p className="section-kicker">{h.how.kicker}</p>
              <h2 className="section-heading">{h.how.heading}</h2>
              <p className="section-sub">{h.how.sub}</p>
            </div>
            <ol className="timeline">
              {h.how.steps.map((s, i) => {
                const Icon = STEP_ICONS[i];
                return (
                  <li key={s.title}>
                    <span className="timeline-num">{String(i + 1).padStart(2, "0")}</span>
                    <div className="timeline-body">
                      <h3>
                        <Icon size={22} className="timeline-icon" /> {s.title}
                      </h3>
                      <p>{s.text}</p>
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>
        </section>

        <section id="features" className="home-section features-section">
          <div className="home-wrap">
            <p className="section-kicker">{h.features.kicker}</p>
            <h2 className="section-heading">{h.features.heading}</h2>
            <ul className="feature-list">
              <li className="feature-lead">
                <IconGlobe className="feature-icon" />
                <div>
                  <h3>{h.features.lang.title}</h3>
                  <p>{h.features.lang.text}</p>
                  <div className="scripts">
                    <span lang="gu">ખાલી પેટ શુગર સામાન્ય કરતાં વધારે છે.</span>
                    <span lang="hi">खाली पेट शुगर सामान्य से ज़्यादा है।</span>
                    <span lang="en">Fasting sugar is above the normal range.</span>
                  </div>
                </div>
              </li>
              {features.map(({ Icon, title, text }) => (
                <li key={title}>
                  <Icon className="feature-icon" />
                  <div>
                    <h3>{title}</h3>
                    <p>{text}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section id="about" className="home-section">
          <div className="home-wrap">
            <div className="responsibility">
              <IconShieldHeart size={44} className="responsibility-icon" />
              <div>
                <h2>{h.safety.heading}</h2>
                <p>{h.safety.text}</p>
              </div>
            </div>
          </div>
        </section>

        <section className="home-section final-section">
          <div className="home-wrap">
            <div className="final-cta">
              <IconStethoscope size={40} className="final-icon" />
              <h2>{h.final.heading}</h2>
              <p>{h.final.text}</p>
              <GetStarted className="btn btn-accent btn-lg" label={h.getStarted} dashboardLabel={h.openDashboard} lang={lang} signedIn={signedIn} />
            </div>
          </div>
        </section>
      </main>

      <SiteFooter lang={lang} />
    </div>
  );
}
