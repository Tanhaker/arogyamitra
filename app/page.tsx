import type { Metadata } from "next";
import GetStarted from "@/components/GetStarted";
import {
  IconArrowRight,
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
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import "./home.css";

export const metadata: Metadata = {
  title: "ArogyaMitra: a health guide, right by your side",
  description:
    "Understand your health information in Gujarati, Hindi or English and prepare clear summaries for your doctor. Powered by Gemma 4.",
};

const AUTH_MESSAGES: Record<string, string> = {
  SessionRequired: "Please sign in with Google to continue.",
  AccessDenied: "Sign-in was cancelled. You can try again whenever you're ready.",
  OAuthCallbackError: "Sign-in was cancelled or did not finish. Please try again.",
  Configuration: "Google sign-in is not set up yet on this server. Please try again later.",
};

const STEPS = [
  {
    Icon: IconSpeech,
    title: "Share Your Health Concerns",
    text: "Describe your symptoms or health concerns in your preferred language: Gujarati, Hindi or English.",
  },
  {
    Icon: IconSpark,
    title: "AI Understands Your Information",
    text: "Powered by Gemma, ArogyaMitra organises details such as symptoms, duration, age, medicines and allergies, and asks follow-up questions if something important is missing.",
  },
  {
    Icon: IconListCheck,
    title: "Get a Structured Health Summary",
    text: "Receive a clear, organised summary of your health concerns that you can review and share with a qualified healthcare professional.",
  },
];

/** Product preview built from the demo report, so the hero shows the real thing, not a stock photo. */
function HeroPreview() {
  const rows = [
    { test: "Fasting sugar", value: "312 mg/dL", range: "70–100", status: "High", tone: "check" },
    { test: "Haemoglobin", value: "10.2 g/dL", range: "13–17", status: "Low", tone: "check" },
    { test: "Creatinine", value: "1.1 mg/dL", range: "0.7–1.3", status: "Normal", tone: "ok" },
  ];
  return (
    <div className="preview-stage" aria-hidden="true">
      <div className="preview-card">
        <div className="preview-head">
          <span className="preview-kicker">Lab report · 24 Oct</span>
          <span className="preview-tag">Sample</span>
        </div>
        <p className="preview-summary">Three results are outside the range printed by your lab.</p>
        <ul className="preview-rows">
          {rows.map((r) => (
            <li key={r.test}>
              <div>
                <strong>{r.test}</strong>
                <span>
                  {r.value} · range {r.range}
                </span>
              </div>
              <em className={`preview-badge preview-${r.tone}`}>{r.status}</em>
            </li>
          ))}
        </ul>
      </div>
      <div className="preview-bubble">
        <span className="preview-bubble-label">પ્રશ્ન</span>
        HbA1c નો અર્થ શું છે?
      </div>
      <div className="preview-chip">
        <IconCheck size={18} /> 6 questions ready for your doctor
      </div>
    </div>
  );
}

export default async function HomePage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  const authMessage = error ? (AUTH_MESSAGES[error] ?? "Sign-in did not complete. Please try again.") : null;

  return (
    <div className="home">
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <SiteHeader />

      <main id="main">
        <section id="home" className="hero">
          <div className="home-wrap hero-grid">
            <div className="hero-copy">
              {authMessage && (
                <div className="auth-message" role="alert">
                  {authMessage}
                </div>
              )}
              <p className="eyebrow">
                <span className="eyebrow-dot" /> ગુજરાતી · हिंदी · English
              </p>
              <h1 className="hero-title">
                A Health Guide, <span className="hero-accent">Right by Your Side!</span>
              </h1>
              <p className="hero-text">
                Health information made easier to understand. ArogyaMitra helps you organize your health concerns,
                understand important medical information and prepare meaningful summaries for healthcare professionals
                in a language you&apos;re comfortable with.
              </p>
              <div className="hero-actions">
                <GetStarted className="btn btn-accent btn-lg" />
                <a href="#how-it-works" className="text-link">
                  How It Works <IconArrowRight size={18} />
                </a>
              </div>
              <p className="hero-note">
                <IconLock size={16} /> Free · Sign in with Google · Your photos are never stored
              </p>
            </div>
            <HeroPreview />
          </div>
        </section>

        <section id="how-it-works" className="home-section">
          <div className="home-wrap how-grid">
            <div className="how-intro">
              <p className="section-kicker">How it works</p>
              <h2 className="section-heading">How ArogyaMitra Works</h2>
              <p className="section-sub">Three simple steps to make your healthcare journey easier.</p>
            </div>
            <ol className="timeline">
              {STEPS.map(({ Icon, title, text }, i) => (
                <li key={title}>
                  <span className="timeline-num">{String(i + 1).padStart(2, "0")}</span>
                  <div className="timeline-body">
                    <h3>
                      <Icon size={22} className="timeline-icon" /> {title}
                    </h3>
                    <p>{text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section id="features" className="home-section features-section">
          <div className="home-wrap">
            <p className="section-kicker">Features</p>
            <h2 className="section-heading">What Makes ArogyaMitra Helpful?</h2>
            <div className="bento">
              <article className="bento-item bento-wide">
                <IconGlobe className="bento-icon" />
                <h3>Multilingual Understanding</h3>
                <p>Communicate naturally in Gujarati, Hindi and English.</p>
                <div className="scripts">
                  <span lang="gu">ખાલી પેટ શુગર સામાન્ય કરતાં વધારે છે.</span>
                  <span lang="hi">खाली पेट शुगर सामान्य से ज़्यादा है।</span>
                  <span lang="en">Fasting sugar is above the normal range.</span>
                </div>
              </article>
              <article className="bento-item bento-tall bento-teal">
                <IconDownload className="bento-icon" />
                <h3>Doctor-Ready Reports</h3>
                <p>Generate downloadable summaries to share with healthcare professionals.</p>
                <div className="mini-doc">
                  <span className="mini-doc-title">Summary for doctor visit</span>
                  <span className="mini-line w80" />
                  <span className="mini-line w60" />
                  <span className="mini-line w90" />
                  <span className="mini-line w40" />
                </div>
              </article>
              <article className="bento-item">
                <IconScan className="bento-icon" />
                <h3>Smart Information Extraction</h3>
                <p>Identify and organise symptoms, duration and relevant health details.</p>
              </article>
              <article className="bento-item">
                <IconSpark className="bento-icon" />
                <h3>AI-Powered Summaries</h3>
                <p>Convert unstructured descriptions into clear, structured summaries.</p>
              </article>
              <article className="bento-item bento-coral">
                <IconQuestion className="bento-icon" />
                <h3>Missing Information Detection</h3>
                <p>Ask follow-up questions when important information is missing.</p>
                <p className="followup">“How long have you had this headache?”</p>
              </article>
              <article className="bento-item bento-band">
                <IconLock className="bento-icon" />
                <div>
                  <h3>Personal Health Information</h3>
                  <p>
                    Help you organise the information you provide during your interaction. Everything stays private to
                    your own Google account.
                  </p>
                </div>
              </article>
            </div>
          </div>
        </section>

        <section id="about" className="home-section">
          <div className="home-wrap">
            <div className="responsibility">
              <IconShieldHeart size={44} className="responsibility-icon" />
              <div>
                <h2>Your Health Matters. Professional Care Comes First.</h2>
                <p>
                  ArogyaMitra is designed to help people organize and understand their health information. It does not
                  diagnose medical conditions, prescribe medicines or recommend treatments. Medical decisions should
                  always be made by qualified healthcare professionals.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="home-section final-section">
          <div className="home-wrap">
            <div className="final-cta">
              <IconStethoscope size={40} className="final-icon" />
              <h2>Take the First Step Towards Better Health Understanding.</h2>
              <p>
                Share your concerns, organize your information and prepare for a more informed conversation with your
                healthcare professional.
              </p>
              <GetStarted className="btn btn-accent btn-lg" />
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
