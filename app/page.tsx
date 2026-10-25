"use client";

import { useEffect, useRef, useState } from "react";
import Logo from "@/components/Logo";
import Results from "@/components/Results";
import ThemeToggle from "@/components/ThemeToggle";
import { LANGS, STRINGS } from "@/lib/i18n";
import { fileToDataUrl } from "@/lib/image";
import type { Explanation, ExplainResponse, Lang } from "@/lib/types";

type Stage = "start" | "loading" | "done";

export default function Home() {
  const [lang, setLang] = useState<Lang>("en");
  const [image, setImage] = useState<string | null>(null);
  const [stage, setStage] = useState<Stage>("start");
  const [result, setResult] = useState<Explanation | null>(null);
  const [model, setModel] = useState("");
  const [error, setError] = useState<string | null>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);
  const t = STRINGS[lang];

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setError(null);
    try {
      setImage(await fileToDataUrl(file));
    } catch {
      setError(t.errors.bad_image);
    }
  }

  async function explain() {
    if (!image) return;
    setStage("loading");
    setError(null);
    try {
      const res = await fetch("/api/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image, lang }),
      });
      const data: ExplainResponse = await res.json().catch(() => ({ error: "generic" }));
      if (!res.ok || !data.result) {
        const key = (data.error ?? "generic") as keyof typeof t.errors;
        setError(t.errors[key] ?? t.errors.generic);
        setStage("start");
        return;
      }
      setResult(data.result);
      setModel(data.model ?? "");
      setStage("done");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      setError(t.errors.generic);
      setStage("start");
    }
  }

  function startOver() {
    setImage(null);
    setResult(null);
    setError(null);
    setStage("start");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <main className="page">
      <header className="header">
        <Logo />
        <ThemeToggle labels={{ light: t.themeLight, dark: t.themeDark }} />
      </header>

      {stage === "start" && (
        <>
          <p className="tagline">{t.tagline}</p>

          {error && (
            <div className="error" role="alert">
              {error}
            </div>
          )}

          <section className="card">
            <h2 className="step-title">
              <span className="step-num">1</span>
              {t.step1}
            </h2>
            <div className="lang-row" role="group" aria-label={t.step1}>
              {LANGS.map((l) => (
                <button key={l} className="lang-btn" aria-pressed={lang === l} onClick={() => setLang(l)}>
                  {STRINGS[l].langName}
                </button>
              ))}
            </div>
          </section>

          <section className="card">
            <h2 className="step-title">
              <span className="step-num">2</span>
              {t.step2}
            </h2>

            <input ref={cameraRef} type="file" accept="image/*" capture="environment" hidden onChange={onFile} />
            <input ref={galleryRef} type="file" accept="image/*" hidden onChange={onFile} />

            {image ? (
              <div className="stack">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={image} alt="" className="preview" />
                <button className="btn btn-primary" onClick={explain}>
                  {t.explain}
                </button>
                <button className="btn btn-secondary" onClick={() => galleryRef.current?.click()}>
                  {t.changePhoto}
                </button>
              </div>
            ) : (
              <div className="btn-row">
                <button className="btn btn-primary" onClick={() => cameraRef.current?.click()}>
                  📷 {t.takePhoto}
                </button>
                <button className="btn btn-secondary" onClick={() => galleryRef.current?.click()}>
                  🖼️ {t.choosePhoto}
                </button>
              </div>
            )}
            <p className="muted center" style={{ marginBottom: 0 }}>
              🔒 {t.privacy}
            </p>
          </section>
        </>
      )}

      {stage === "loading" && (
        <section className="card center" aria-live="polite" aria-busy="true">
          <div className="spinner" />
          <h2 className="section-title">{t.loadingTitle}</h2>
          <p className="muted" style={{ margin: 0 }}>
            {t.loadingHint}
          </p>
        </section>
      )}

      {stage === "done" && result && (
        <>
          <Results data={result} t={t} />
          <button className="btn btn-primary" onClick={startOver}>
            {t.startOver}
          </button>
        </>
      )}

      <footer className="footer">
        <p>{t.disclaimer}</p>
        <p>
          {t.poweredBy}
          {model ? ` · ${model}` : ""}
        </p>
      </footer>
    </main>
  );
}
