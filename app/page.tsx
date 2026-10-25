import type { Metadata } from "next";
import { LogoMark } from "@/components/Logo";
import GetStarted from "@/components/GetStarted";
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
    icon: "🗣️",
    title: "Share Your Health Concerns",
    text: "Describe your symptoms or health concerns in your preferred language: Gujarati, Hindi or English.",
  },
  {
    icon: "🧠",
    title: "AI Understands Your Information",
    text: "Powered by Gemma, ArogyaMitra organises details such as symptoms, duration, age, medicines and allergies, and asks follow-up questions if something important is missing.",
  },
  {
    icon: "📋",
    title: "Get a Structured Health Summary",
    text: "Receive a clear, organised summary of your health concerns that you can review and share with a qualified healthcare professional.",
  },
];

const FEATURES = [
  { icon: "🌐", title: "Multilingual Understanding", text: "Communicate naturally in Gujarati, Hindi and English." },
  { icon: "🔍", title: "Smart Information Extraction", text: "Identify and organise symptoms, duration and relevant health details." },
  { icon: "✨", title: "AI-Powered Summaries", text: "Convert unstructured descriptions into clear, structured summaries." },
  { icon: "❓", title: "Missing Information Detection", text: "Ask follow-up questions when important information is missing." },
  { icon: "📄", title: "Doctor-Ready Reports", text: "Generate downloadable summaries to share with healthcare professionals." },
  { icon: "🔒", title: "Personal Health Information", text: "Help you organise the information you provide during your interaction, privately to your account." },
];

export default async function HomePage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  const authMessage = error ? (AUTH_MESSAGES[error] ?? "Sign-in did not complete. Please try again.") : null;

  return (
    <div className="home">
      <SiteHeader />

      <main>
        <section id="home" className="hero">
          <div className="home-wrap hero-inner">
            {authMessage && (
              <div className="auth-message" role="alert">
                {authMessage}
              </div>
            )}
            <div className="hero-mark">
              <LogoMark size={84} />
            </div>
            <h1 className="hero-title">A Health Guide, Right by Your Side!</h1>
            <p className="hero-text">
              Health information made easier to understand. ArogyaMitra helps you organize your health concerns,
              understand important medical information and prepare meaningful summaries for healthcare professionals
              in a language you&apos;re comfortable with.
            </p>
            <div className="hero-actions">
              <GetStarted className="btn btn-accent btn-lg" />
              <a href="#how-it-works" className="btn btn-secondary btn-lg">
                How It Works
              </a>
            </div>
            <p className="hero-langs">ગુજરાતી · हिंदी · English</p>
          </div>
        </section>

        <section id="how-it-works" className="home-section">
          <div className="home-wrap">
            <h2 className="section-heading">How ArogyaMitra Works</h2>
            <p className="section-sub">Three simple steps to make your healthcare journey easier.</p>
            <ol className="steps">
              {STEPS.map((s, i) => (
                <li key={s.title} className="step-card">
                  <div className="step-top">
                    <span className="step-badge">{i + 1}</span>
                    <span className="step-icon" aria-hidden="true">
                      {s.icon}
                    </span>
                  </div>
                  <h3>{s.title}</h3>
                  <p>{s.text}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section id="features" className="home-section home-section-alt">
          <div className="home-wrap">
            <h2 className="section-heading">What Makes ArogyaMitra Helpful?</h2>
            <div className="features">
              {FEATURES.map((f) => (
                <div key={f.title} className="feature-card">
                  <span className="feature-icon" aria-hidden="true">
                    {f.icon}
                  </span>
                  <h3>{f.title}</h3>
                  <p>{f.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="about" className="home-section">
          <div className="home-wrap">
            <div className="responsibility">
              <span className="responsibility-icon" aria-hidden="true">
                🩺
              </span>
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

        <section className="home-section">
          <div className="home-wrap">
            <div className="final-cta">
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
