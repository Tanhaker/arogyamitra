"use client";

import { useEffect, useRef, useState } from "react";
import { IconCamera, IconChart, IconChat, IconDownload, IconFolder, IconImage, IconScan, IconStethoscope } from "@/components/Icons";
import { logOut } from "@/app/actions";
import AskReport from "@/components/AskReport";
import Consult from "@/components/Consult";
import DoctorSummary from "@/components/DoctorSummary";
import Logo from "@/components/Logo";
import Results from "@/components/Results";
import ThemeToggle from "@/components/ThemeToggle";
import Trends from "@/components/Trends";
import { LANGS, STRINGS } from "@/lib/i18n";
import { fileToDataUrl } from "@/lib/image";
import { deleteReport, formatDate, loadReports, reportDate, saveReport } from "@/lib/storage";
import type { Explanation, ExplainResponse, Lang, SavedReport } from "@/lib/types";

type Stage = "start" | "loading" | "done" | "history" | "trends" | "consult";

export interface DashboardUser {
  id: string;
  name: string;
  email: string;
  image: string;
}

/** The ArogyaMitra app (behind Google sign-in). */
export default function Dashboard({ user, initialLang = "en" }: { user: DashboardUser; initialLang?: Lang }) {
  const [lang, setLang] = useState<Lang>(initialLang);
  const [image, setImage] = useState<string | null>(null);
  const [stage, setStage] = useState<Stage>("start");
  const [result, setResult] = useState<Explanation | null>(null);
  const [model, setModel] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState<SavedReport[]>([]);
  const [consultReport, setConsultReport] = useState<Explanation | null>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);
  const t = STRINGS[lang];

  const labReports = saved.filter((r) => r.result.document_type === "lab_report");

  useEffect(() => {
    setSaved(loadReports(user.id));
  }, [user.id]);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  function go(next: Stage) {
    setStage(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

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
      if (data.result.document_type !== "other") {
        saveReport(user.id, data.result);
        setSaved(loadReports(user.id));
      }
      go("done");
    } catch {
      setError(t.errors.generic);
      setStage("start");
    }
  }

  function startOver() {
    setImage(null);
    setResult(null);
    setError(null);
    go("start");
  }

  function openSaved(r: SavedReport) {
    setResult(r.result);
    setModel("");
    go("done");
  }

  function removeSaved(id: string) {
    deleteReport(user.id, id);
    setSaved(loadReports(user.id));
  }

  const typeLabel = (r: SavedReport) =>
    r.result.document_type === "lab_report"
      ? t.history.labReport
      : r.result.document_type === "prescription"
        ? t.history.prescription
        : t.history.other;

  return (
    <>
      <main className={stage === "consult" ? "page" : "page screen-only"}>
        <header className="header screen-only">
          <button className="logo-btn" onClick={startOver} aria-label="ArogyaMitra">
            <Logo />
          </button>
          <div className="header-actions">
            <ThemeToggle labels={{ light: t.themeLight, dark: t.themeDark }} />
            <form action={logOut}>
              <button className="logout-btn" type="submit" title={user.email}>
                {t.logout}
              </button>
            </form>
          </div>
        </header>
        {user.name && (
          <p className="muted screen-only" style={{ marginTop: -8 }}>
            {t.hello}, {user.name.split(" ")[0]} 👋
          </p>
        )}

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
                  <button className="btn btn-accent" onClick={explain}>
                    {t.explain}
                  </button>
                  <button className="btn btn-secondary" onClick={() => galleryRef.current?.click()}>
                    {t.changePhoto}
                  </button>
                </div>
              ) : (
                <div className="btn-row">
                  <button className="btn btn-accent" onClick={() => cameraRef.current?.click()}>
                    <IconCamera /> {t.takePhoto}
                  </button>
                  <button className="btn btn-secondary" onClick={() => galleryRef.current?.click()}>
                    <IconImage /> {t.choosePhoto}
                  </button>
                </div>
              )}
              <p className="muted center" style={{ marginBottom: 0 }}>
                🔒 {t.privacy}
              </p>
            </section>

            <section className="card">
              <h2 className="step-title"><span className="step-num"><IconChat size={18} /></span>{t.consult.cardTitle}</h2>
              <p className="muted" style={{ marginTop: -4 }}>
                {t.consult.cardHint}
              </p>
              <button
                className="btn btn-primary"
                onClick={() => {
                  setConsultReport(null);
                  go("consult");
                }}
              >
                <IconChat /> {t.consult.start}
              </button>
            </section>

            {saved.length > 0 && (
              <button className="btn btn-secondary" onClick={() => go("history")}>
                <IconFolder /> {t.history.open} ({saved.length})
              </button>
            )}
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
            {result.document_type !== "other" && (
              <>
                <AskReport key={JSON.stringify(result).length} report={result} lang={lang} t={t} />
                <div className="stack">
                  <button
                    className="btn btn-primary"
                    onClick={() => {
                      setConsultReport(result);
                      go("consult");
                    }}
                  >
                    <IconStethoscope /> {t.consult.fromReport}
                  </button>
                  <button className="btn btn-secondary" onClick={() => window.print()}>
                    <IconDownload /> {t.doctor.download}
                  </button>
                  {result.document_type === "lab_report" && labReports.length >= 2 && (
                    <button className="btn btn-secondary" onClick={() => go("trends")}>
                      <IconChart /> {t.trends.title}
                    </button>
                  )}
                  <button className="btn btn-primary" onClick={startOver}>
                    <IconScan /> {t.startOver}
                  </button>
                </div>
              </>
            )}
            {result.document_type === "other" && (
              <button className="btn btn-primary" onClick={startOver}>
                <IconScan /> {t.startOver}
              </button>
            )}
          </>
        )}

        {stage === "history" && (
          <>
            <h1 className="page-title">{t.history.title}</h1>
            <p className="muted">{t.history.savedNote}</p>
            {labReports.length >= 2 && (
              <button className="btn btn-primary" style={{ marginBottom: 16 }} onClick={() => go("trends")}>
                <IconChart /> {t.trends.title}
              </button>
            )}
            {saved.length === 0 && <p>{t.history.empty}</p>}
            {saved.map((r) => (
              <section key={r.id} className="card saved">
                <div className="lab-head">
                  <strong>{typeLabel(r)}</strong>
                  <span className="muted">{formatDate(reportDate(r), lang)}</span>
                </div>
                {r.result.summary && <p className="saved-summary">{r.result.summary}</p>}
                <div className="btn-row">
                  <button className="btn btn-primary" onClick={() => openSaved(r)}>
                    {t.history.view}
                  </button>
                  <button className="btn btn-secondary" onClick={() => removeSaved(r.id)}>
                    {t.history.remove}
                  </button>
                </div>
              </section>
            ))}
            <button className="btn btn-secondary" onClick={() => go("start")}>
              ← {t.history.back}
            </button>
          </>
        )}

        {stage === "consult" && (
          <Consult lang={lang} t={t} report={consultReport} onBack={() => go(consultReport ? "done" : "start")} />
        )}

        {stage === "trends" && (
          <>
            <Trends reports={saved} lang={lang} t={t} />
            <button className="btn btn-secondary" onClick={() => go("history")}>
              ← {t.history.back}
            </button>
          </>
        )}

        <footer className="footer screen-only">
          <p>{t.disclaimer}</p>
          <p>
            {t.poweredBy}
            {model ? ` · ${model}` : ""}
          </p>
        </footer>
      </main>

      {stage === "done" && result && result.document_type !== "other" && (
        <DoctorSummary data={result} lang={lang} t={t} />
      )}
    </>
  );
}
