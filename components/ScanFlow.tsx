"use client";

import { useRouter } from "next/navigation";
import { useCallback, useRef, useState } from "react";
import { explainPages } from "@/lib/explainClient";
import { processImage, type Page } from "@/lib/image";
import { saveReport } from "@/lib/storage";
import type { DocType } from "@/lib/types";
import { useApp } from "./AppProvider";
import CameraCapture from "./CameraCapture";
import { IconAlert, IconCamera, IconImage, IconPlus, IconX } from "./Icons";

const MAX_PAGES = 4;

export default function ScanFlow({ initialType }: { initialType: DocType }) {
  const { t, lang, user } = useApp();
  const s = t.app.scan;
  const router = useRouter();
  const [docType, setDocType] = useState<DocType>(initialType);
  const [pages, setPages] = useState<Page[]>([]);
  const [review, setReview] = useState<Page | null>(null);
  const [camera, setCamera] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const captureInput = useRef<HTMLInputElement>(null);
  const pickInput = useRef<HTMLInputElement>(null);

  const full = pages.length >= MAX_PAGES;

  async function addBlob(blob: Blob, viaReview: boolean) {
    setError(null);
    try {
      const page = await processImage(blob);
      if (viaReview) setReview(page);
      else setPages((p) => [...p, page].slice(0, MAX_PAGES));
    } catch {
      setError(t.errors.bad_image);
    }
  }

  async function onFiles(e: React.ChangeEvent<HTMLInputElement>, viaReview: boolean) {
    const files = [...(e.target.files ?? [])];
    e.target.value = "";
    if (viaReview && files[0]) return addBlob(files[0], true);
    for (const f of files.slice(0, MAX_PAGES - pages.length)) await addBlob(f, false);
  }

  // Stable so the camera effect doesn't restart on every render.
  const fallbackToNative = useCallback(() => {
    setCamera(false);
    captureInput.current?.click();
  }, []);

  async function explain() {
    if (!pages.length) return;
    setBusy(true);
    setError(null);
    try {
      const { result, model } = await explainPages(pages, docType, lang);
      const saved = saveReport(user.id, result, { model, lang });
      setPages([]); // the photos are dropped as soon as the answer arrives
      router.push(`/report/${saved.id}`);
    } catch (e) {
      const key = e instanceof Error ? e.message : "generic";
      setError(t.errors[key as keyof typeof t.errors] ?? t.errors.generic);
      setBusy(false);
    }
  }

  if (busy) {
    return (
      <section className="card center" aria-live="polite" aria-busy="true">
        <div className="spinner" />
        <h1 className="section-title">{s.reading}</h1>
        <p className="muted" style={{ margin: 0 }}>{s.readingHint}</p>
      </section>
    );
  }

  return (
    <div className="scan">
      <h1 className="page-title">{s.titles[docType]}</h1>

      <input ref={captureInput} type="file" accept="image/*" capture="environment" hidden onChange={(e) => onFiles(e, true)} />
      <input ref={pickInput} type="file" accept="image/jpeg,image/png,image/webp" multiple hidden onChange={(e) => onFiles(e, false)} />

      {camera && (
        <CameraCapture
          t={t}
          onCapture={(blob) => {
            setCamera(false);
            addBlob(blob, true);
          }}
          onClose={() => setCamera(false)}
          onFallback={fallbackToNative}
        />
      )}

      {error && <div className="error" role="alert">{error}</div>}

      {review ? (
        <section className="card stack" aria-label={s.page}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={review.dataUrl} alt="" className="preview" />
          <QualityNotes page={review} />
          <div className="btn-row">
            <button className="btn btn-secondary" onClick={() => { setReview(null); setCamera(true); }}>
              {t.app.camera.retake}
            </button>
            <button className="btn btn-primary" onClick={() => { setPages((p) => [...p, review].slice(0, MAX_PAGES)); setReview(null); }}>
              {t.app.camera.use}
            </button>
          </div>
        </section>
      ) : (
        <>
          <section className="card">
            <h2 className="field-label field-label-h">{s.docType.label}</h2>
            <div className="segmented" role="radiogroup" aria-label={s.docType.label}>
              {(["prescription", "lab_report", "auto"] as DocType[]).map((d) => (
                <button key={d} type="button" role="radio" aria-checked={docType === d} onClick={() => setDocType(d)}>
                  {s.docType[d]}
                </button>
              ))}
            </div>
            <p className="muted" style={{ marginBottom: 0 }}>{s.hint}</p>
          </section>

          {pages.length > 0 && (
            <section className="card">
              <h2 className="section-title">{s.pages} ({pages.length}/{MAX_PAGES})</h2>
              <ul className="thumbs">
                {pages.map((p, i) => (
                  <li key={p.id}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p.dataUrl} alt={`${s.page} ${i + 1}`} />
                    <button className="thumb-remove" onClick={() => setPages((ps) => ps.filter((x) => x.id !== p.id))} aria-label={`${s.remove} ${i + 1}`}>
                      <IconX size={18} />
                    </button>
                    {p.warnings.length > 0 && <span className="thumb-warn" aria-label={s.warnings[p.warnings[0]]}><IconAlert size={16} /></span>}
                  </li>
                ))}
              </ul>
              {pages.some((p) => p.warnings.length) && <QualityNotes page={pages.find((p) => p.warnings.length) as Page} />}
            </section>
          )}

          <div className="stack">
            {!full && (
              <>
                <button className={`btn ${pages.length ? "btn-secondary" : "btn-accent"}`} onClick={() => setCamera(true)}>
                  {pages.length ? <IconPlus /> : <IconCamera />} {pages.length ? s.addPage : s.takePhoto}
                </button>
                <button className="btn btn-secondary" onClick={() => pickInput.current?.click()}>
                  <IconImage /> {s.choosePhoto}
                </button>
              </>
            )}
            {pages.length > 0 && (
              <button className="btn btn-accent" onClick={explain}>
                {s.explain}
              </button>
            )}
            <p className="muted center" style={{ margin: 0 }}>{s.maxPages} {t.app.privacyLine}</p>
          </div>
        </>
      )}
    </div>
  );

  function QualityNotes({ page }: { page: Page }) {
    if (!page.warnings.length) return null;
    return (
      <div className="alert alert-check" role="status">
        {page.warnings.map((w) => (
          <p key={w} style={{ margin: 0 }}>{s.warnings[w]}</p>
        ))}
        <p className="muted" style={{ margin: "4px 0 0" }}>{s.continueAnyway}</p>
      </div>
    );
  }
}
